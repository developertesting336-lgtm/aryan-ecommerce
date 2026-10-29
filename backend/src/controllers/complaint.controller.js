import mongoose from "mongoose";
import {
  Complaint,
  ComplaintMessage,
  Order,
  OrderItem,
  Product,
} from "../models/index.js";
import {
  ComplaintStatus,
  ComplaintPriority,
  complaintTransitions,
  MAX_COMPLAINT_ATTACHMENTS,
} from "../config/constants.js";
import { ApiError, ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import {
  createComplaintSchema,
  addMessageSchema,
  generateTicketId,
} from "../utils/complaintValidation.js";
import {
  sendComplaintCreatedEmail,
  sendComplaintStatusEmail,
  sendComplaintReplyEmail,
} from "../utils/complaintMail.js";

export const createComplaint = async (req, res) => {
  try {
    let payload = req.body;

    const { error: validationError } = createComplaintSchema.validate(payload);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    const { category, subject, description, orderId, productId } = payload;
    const userId = req.user._id;

    let linkedOrder = null;
    let linkedProduct = null;

    // Validate order ownership if orderId provided
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      linkedOrder = await Order.findOne({ _id: orderId, user: userId });
      if (!linkedOrder) {
        throw new ApiError(404, "Selected order not found or does not belong to your account.");
      }
    }

    // Validate product if productId provided
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      linkedProduct = await Product.findById(productId);
    }

    // Anti-spam: Check for existing active complaint for same order & category
    if (linkedOrder) {
      const existingActiveComplaint = await Complaint.findOne({
        user: userId,
        order: linkedOrder._id,
        category,
        status: { $in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] },
      });

      if (existingActiveComplaint) {
        throw new ApiError(
          400,
          `You already have an active complaint (#${existingActiveComplaint.ticketId}) for this order under '${category}'. Please reply to the existing ticket instead.`
        );
      }
    }

    // Process file attachments if uploaded
    const attachments = [];
    if (req.files && Array.isArray(req.files)) {
      const filesToProcess = req.files.slice(0, MAX_COMPLAINT_ATTACHMENTS);
      for (const file of filesToProcess) {
        try {
          const uploadResult = await uploadOnCloudinary(file.path);
          if (uploadResult?.secure_url) {
            attachments.push(uploadResult.secure_url);
          } else {
            attachments.push(file.filename);
          }
        } catch (err) {
          attachments.push(file.filename);
        }
      }
    }

    // Generate unique Ticket ID safely
    let ticketId = generateTicketId();
    let collisionCheck = await Complaint.findOne({ ticketId });
    while (collisionCheck) {
      ticketId = generateTicketId();
      collisionCheck = await Complaint.findOne({ ticketId });
    }

    const complaint = await Complaint.create({
      ticketId,
      user: userId,
      order: linkedOrder?._id || null,
      orderNumber: linkedOrder?.orderNumber || null,
      product: linkedProduct?._id || null,
      productName: linkedProduct?.name || null,
      category,
      priority: ComplaintPriority.MEDIUM,
      status: ComplaintStatus.OPEN,
      subject,
      description,
      attachments,
      timeline: [
        {
          status: ComplaintStatus.OPEN,
          changedBy: userId,
          role: "user",
          note: "Complaint ticket created by customer",
          timestamp: new Date(),
        },
      ],
    });

    // Send confirmation email asynchronously
    sendComplaintCreatedEmail({
      to: req.user.email,
      userName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Customer",
      ticketId: complaint.ticketId,
      subject: complaint.subject,
      category: complaint.category,
    }).catch(() => {});

    return res.status(201).json(
      new ApiResponse(201, { complaint }, "Complaint ticket submitted successfully")
    );
  } catch (error) {
    console.error("createComplaint error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit complaint",
    });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { user: userId };

    if (req.query.status && Object.values(ComplaintStatus).includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { orderNumber: searchRegex },
      ];
    }

    const totalComplaints = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product", "name images price slug")
      .populate("order", "orderNumber total paymentStatus fulfillmentStatus")
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          complaints,
          pagination: {
            totalComplaints,
            page,
            limit,
            totalPages: Math.ceil(totalComplaints / limit) || 1,
          },
        },
        "My complaints fetched successfully"
      )
    );
  } catch (error) {
    console.error("getMyComplaints error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch complaints",
    });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let query = { _id: id };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      query = { ticketId: id.toUpperCase() };
    }

    const complaint = await Complaint.findOne(query)
      .populate("user", "firstName lastName email phone")
      .populate("product", "name images price slug")
      .populate("order", "orderNumber total paymentStatus fulfillmentStatus createdAt");

    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    // Ownership check (Customer can only view their own complaint, admin can view any)
    if (
      req.user.role !== "admin" &&
      complaint.user._id.toString() !== userId.toString()
    ) {
      throw new ApiError(403, "You do not have permission to view this complaint");
    }

    // Fetch conversation thread messages
    const messages = await ComplaintMessage.find({ complaint: complaint._id })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(
      new ApiResponse(200, { complaint, messages }, "Complaint details fetched successfully")
    );
  } catch (error) {
    console.error("getComplaintById error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch complaint details",
    });
  }
};

export const addComplaintMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const { error: validationError } = addMessageSchema.validate(req.body);
    if (validationError) {
      throw new ApiError(400, validationError.details[0].message);
    }

    let query = { _id: id };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      query = { ticketId: id.toUpperCase() };
    }

    const complaint = await Complaint.findOne(query).populate("user", "firstName lastName email");
    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    // Ownership check for customer
    if (
      req.user.role !== "admin" &&
      complaint.user._id.toString() !== userId.toString()
    ) {
      throw new ApiError(403, "You do not have permission to reply to this complaint");
    }

    // Check status: cannot message closed or rejected tickets
    if ([ComplaintStatus.CLOSED, ComplaintStatus.REJECTED].includes(complaint.status)) {
      throw new ApiError(400, `Cannot send messages to a ${complaint.status.toLowerCase()} complaint.`);
    }

    // Process attachments if any
    const attachments = [];
    if (req.files && Array.isArray(req.files)) {
      const filesToProcess = req.files.slice(0, MAX_COMPLAINT_ATTACHMENTS);
      for (const file of filesToProcess) {
        try {
          const uploadResult = await uploadOnCloudinary(file.path);
          if (uploadResult?.secure_url) {
            attachments.push(uploadResult.secure_url);
          } else {
            attachments.push(file.filename);
          }
        } catch {
          attachments.push(file.filename);
        }
      }
    }

    const senderRole = req.user.role === "admin" ? "admin" : "user";
    const senderName =
      req.user.role === "admin"
        ? "Customer Support"
        : `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Customer";

    const message = await ComplaintMessage.create({
      complaint: complaint._id,
      sender: userId,
      senderRole,
      senderName,
      message: req.body.message.trim(),
      attachments,
    });

    // Notify customer if admin replied, or notify admin if customer replied
    if (req.user.role === "admin" && complaint.user?.email) {
      sendComplaintReplyEmail({
        to: complaint.user.email,
        userName: `${complaint.user.firstName || ""} ${complaint.user.lastName || ""}`.trim() || "Customer",
        ticketId: complaint.ticketId,
        senderRole: "admin",
        messagePreview: message.message,
      }).catch(() => {});
    }

    return res.status(201).json(
      new ApiResponse(201, { message }, "Message sent successfully")
    );
  } catch (error) {
    console.error("addComplaintMessage error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to post message",
    });
  }
};

export const closeMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let query = { _id: id };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      query = { ticketId: id.toUpperCase() };
    }

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    if (complaint.user.toString() !== userId.toString()) {
      throw new ApiError(403, "You do not have permission to close this complaint");
    }

    if (complaint.status === ComplaintStatus.CLOSED) {
      return res.status(200).json(
        new ApiResponse(200, { complaint }, "Complaint is already closed")
      );
    }

    if (complaint.status === ComplaintStatus.REJECTED) {
      throw new ApiError(400, "Cannot close a rejected complaint.");
    }

    const previousStatus = complaint.status;
    complaint.status = ComplaintStatus.CLOSED;
    complaint.closedAt = new Date();
    complaint.timeline.push({
      status: ComplaintStatus.CLOSED,
      changedBy: userId,
      role: "user",
      note: req.body.note?.trim() || "Closed by customer",
      timestamp: new Date(),
    });

    await complaint.save();

    return res.status(200).json(
      new ApiResponse(200, { complaint }, "Complaint has been closed successfully")
    );
  } catch (error) {
    console.error("closeMyComplaint error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to close complaint",
    });
  }
};

export const getUserOrdersForComplaint = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("orderNumber total status fulfillmentStatus createdAt")
      .lean();

    const orderIds = orders.map((o) => o._id);
    const orderItems = await OrderItem.find({ order: { $in: orderIds } })
      .populate("product", "name images price")
      .lean();

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: orderItems
        .filter((item) => String(item.order) === String(order._id))
        .map((item) => ({
          orderItemId: item._id,
          productId: item.product?._id || item.product,
          productName: item.product?.name || "Product",
          productImage: Array.isArray(item.product?.images)
            ? item.product.images[0]
            : item.product?.images,
          quantity: item.quantity,
          price: item.price,
        })),
    }));

    return res.status(200).json(
      new ApiResponse(200, { orders: ordersWithItems }, "User orders fetched successfully")
    );
  } catch (error) {
    console.error("getUserOrdersForComplaint error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch user orders",
    });
  }
};
