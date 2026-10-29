import mongoose from "mongoose";
import {
  Complaint,
  ComplaintMessage,
  User,
} from "../models/index.js";
import {
  ComplaintStatus,
  ComplaintPriority,
  complaintTransitions,
} from "../config/constants.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import {
  updateStatusSchema,
  updatePrioritySchema,
  internalNoteSchema,
} from "../utils/complaintValidation.js";
import { sendComplaintStatusEmail } from "../utils/complaintMail.js";

export const getAdminComplaints = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status
    if (req.query.status && Object.values(ComplaintStatus).includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by priority
    if (req.query.priority && Object.values(ComplaintPriority).includes(req.query.priority)) {
      filter.priority = req.query.priority;
    }

    // Filter by user if userId provided (e.g. from Admin Customers page)
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
      filter.user = req.query.userId;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search by Ticket ID, subject, orderNumber
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { orderNumber: searchRegex },
      ];
    }

    // Run stats queries in parallel
    const [
      totalComplaints,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      filteredTotal,
      complaints,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: ComplaintStatus.OPEN }),
      Complaint.countDocuments({ status: ComplaintStatus.IN_PROGRESS }),
      Complaint.countDocuments({ status: ComplaintStatus.RESOLVED }),
      Complaint.countDocuments({ status: ComplaintStatus.CLOSED }),
      Complaint.countDocuments(filter),
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "firstName lastName email phone")
        .populate("product", "name images price slug")
        .populate("order", "orderNumber total paymentStatus fulfillmentStatus")
        .lean(),
    ]);

    const stats = {
      totalComplaints,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats,
          complaints,
          pagination: {
            totalComplaints: filteredTotal,
            page,
            limit,
            totalPages: Math.ceil(filteredTotal / limit) || 1,
          },
        },
        "Admin complaints retrieved successfully"
      )
    );
  } catch (error) {
    console.error("getAdminComplaints error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch admin complaints",
    });
  }
};

export const getAdminComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = { _id: id };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      query = { ticketId: id.toUpperCase() };
    }

    const complaint = await Complaint.findOne(query)
      .populate("user", "firstName lastName email phone role status createdAt")
      .populate("product", "name images price stock slug")
      .populate("order", "orderNumber total paymentStatus fulfillmentStatus createdAt subtotal")
      .populate("timeline.changedBy", "firstName lastName email role");

    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    // Fetch conversation thread messages
    const messages = await ComplaintMessage.find({ complaint: complaint._id })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(
      new ApiResponse(200, { complaint, messages }, "Admin complaint retrieved successfully")
    );
  } catch (error) {
    console.error("getAdminComplaintById error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch complaint details",
    });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = updateStatusSchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { status: targetStatus, note } = req.body;

    const complaint = await Complaint.findById(id).populate("user", "firstName lastName email");
    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    const currentStatus = complaint.status;

    if (currentStatus === targetStatus) {
      return res.status(200).json(
        new ApiResponse(200, { complaint }, `Complaint status is already ${targetStatus}`)
      );
    }

    // Validate transition
    const allowedTransitions = complaintTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new ApiError(
        400,
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${allowedTransitions.join(", ")}]`
      );
    }

    complaint.status = targetStatus;

    if (targetStatus === ComplaintStatus.RESOLVED) {
      complaint.resolvedAt = new Date();
    } else if (targetStatus === ComplaintStatus.CLOSED) {
      complaint.closedAt = new Date();
    }

    const adminName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Admin";

    complaint.timeline.push({
      status: targetStatus,
      changedBy: req.user._id,
      role: "admin",
      note: note?.trim() || `Status changed from ${currentStatus} to ${targetStatus} by ${adminName}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Send email notification to customer asynchronously
    if (complaint.user?.email) {
      sendComplaintStatusEmail({
        to: complaint.user.email,
        userName: `${complaint.user.firstName || ""} ${complaint.user.lastName || ""}`.trim() || "Customer",
        ticketId: complaint.ticketId,
        status: targetStatus,
        note: note || "",
      }).catch(() => {});
    }

    return res.status(200).json(
      new ApiResponse(200, { complaint }, `Complaint status updated to ${targetStatus}`)
    );
  } catch (error) {
    console.error("updateComplaintStatus error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update complaint status",
    });
  }
};

export const updateComplaintPriority = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = updatePrioritySchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { priority } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    const previousPriority = complaint.priority;
    complaint.priority = priority;

    const adminName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Admin";
    complaint.timeline.push({
      status: complaint.status,
      changedBy: req.user._id,
      role: "admin",
      note: `Priority changed from ${previousPriority} to ${priority} by ${adminName}`,
      timestamp: new Date(),
    });

    await complaint.save();

    return res.status(200).json(
      new ApiResponse(200, { complaint }, `Priority updated to ${priority}`)
    );
  } catch (error) {
    console.error("updateComplaintPriority error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update complaint priority",
    });
  }
};

export const addAdminInternalNote = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = internalNoteSchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    const adminName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Admin";

    const noteEntry = {
      note: req.body.note.trim(),
      admin: req.user._id,
      adminName,
      createdAt: new Date(),
    };

    complaint.internalNotes.push(noteEntry);
    await complaint.save();

    return res.status(201).json(
      new ApiResponse(201, { internalNotes: complaint.internalNotes }, "Internal note added successfully")
    );
  } catch (error) {
    console.error("addAdminInternalNote error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add internal note",
    });
  }
};
