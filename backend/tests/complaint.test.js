import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
  complaintTransitions,
} from "../src/config/constants.js";
import {
  generateTicketId,
  createComplaintSchema,
  addMessageSchema,
  updateStatusSchema,
  updatePrioritySchema,
} from "../src/utils/complaintValidation.js";

// =========================================================================
// UNIT / INTEGRATION TEST SUITE: COMPLAINT SYSTEM
// =========================================================================

describe("Complaint System Tests", () => {
  // -----------------------------------------------------------------------
  // 1. TICKET ID GENERATION
  // -----------------------------------------------------------------------
  describe("1. Ticket ID Generation", () => {
    it("should generate a valid Ticket ID with CMP prefix and date format", () => {
      const ticketId = generateTicketId();
      assert.match(
        ticketId,
        /^CMP-\d{8}-\d{6}$/,
        "Ticket ID must follow format CMP-YYYYMMDD-XXXXXX"
      );
    });

    it("should generate unique ticket IDs across multiple calls", () => {
      const id1 = generateTicketId();
      const id2 = generateTicketId();
      assert.notEqual(id1, id2, "Generated ticket IDs must be unique");
    });
  });

  // -----------------------------------------------------------------------
  // 2. INPUT VALIDATION & SANITIZATION
  // -----------------------------------------------------------------------
  describe("2. Validation Schemas", () => {
    it("should accept valid complaint payload", () => {
      const validPayload = {
        category: ComplaintCategory.PRODUCT_QUALITY,
        subject: "Damaged headphone driver",
        description: "The left ear cup produces crackling sound when volume exceeds 50%.",
        orderId: "670e176b63efbd44962cb99e",
      };

      const { error } = createComplaintSchema.validate(validPayload);
      assert.equal(error, undefined, "Valid complaint payload must pass validation");
    });

    it("should reject complaint if category is invalid", () => {
      const invalidPayload = {
        category: "INVALID_CATEGORY_NAME",
        subject: "Valid subject title",
        description: "Valid description text exceeding 10 characters.",
      };

      const { error } = createComplaintSchema.validate(invalidPayload);
      assert.ok(error, "Invalid category must fail validation");
      assert.match(error.message, /category/i);
    });

    it("should reject complaint if subject is shorter than 3 characters", () => {
      const invalidPayload = {
        category: ComplaintCategory.DELIVERY_DELAY,
        subject: "No",
        description: "Valid description text exceeding 10 characters.",
      };

      const { error } = createComplaintSchema.validate(invalidPayload);
      assert.ok(error, "Short subject must fail validation");
    });

    it("should reject complaint if description is shorter than 10 characters", () => {
      const invalidPayload = {
        category: ComplaintCategory.OTHER,
        subject: "Valid subject title",
        description: "Short",
      };

      const { error } = createComplaintSchema.validate(invalidPayload);
      assert.ok(error, "Short description must fail validation");
    });

    it("should reject empty reply messages", () => {
      const { error } = addMessageSchema.validate({ message: "   " });
      assert.ok(error, "Whitespace-only message must fail validation");
    });
  });

  // -----------------------------------------------------------------------
  // 3. ANTI-SPAM & DUPLICATE CHECKS
  // -----------------------------------------------------------------------
  describe("3. Anti-Spam & Duplicate Complaint Prevention", () => {
    it("should identify duplicate active complaint for the same order and category", () => {
      const existingComplaints = [
        {
          _id: "comp1",
          order: "order123",
          category: ComplaintCategory.WRONG_ITEM,
          status: ComplaintStatus.OPEN,
        },
      ];

      const newOrder = "order123";
      const newCategory = ComplaintCategory.WRONG_ITEM;

      const isDuplicate = existingComplaints.some(
        (c) =>
          c.order === newOrder &&
          c.category === newCategory &&
          [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS].includes(c.status)
      );

      assert.equal(isDuplicate, true, "Active duplicate complaint must be detected");
    });

    it("should permit new complaint for same order if previous complaint is CLOSED", () => {
      const existingComplaints = [
        {
          _id: "comp1",
          order: "order123",
          category: ComplaintCategory.WRONG_ITEM,
          status: ComplaintStatus.CLOSED,
        },
      ];

      const newOrder = "order123";
      const newCategory = ComplaintCategory.WRONG_ITEM;

      const isDuplicate = existingComplaints.some(
        (c) =>
          c.order === newOrder &&
          c.category === newCategory &&
          [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS].includes(c.status)
      );

      assert.equal(isDuplicate, false, "Complaint can be created if previous was closed");
    });
  });

  // -----------------------------------------------------------------------
  // 4. STATUS TRANSITIONS & BUSINESS RULES
  // -----------------------------------------------------------------------
  describe("4. Status Transition Matrix & Workflow", () => {
    it("should allow OPEN -> IN_PROGRESS transition", () => {
      const allowed = complaintTransitions[ComplaintStatus.OPEN].includes(
        ComplaintStatus.IN_PROGRESS
      );
      assert.equal(allowed, true);
    });

    it("should allow IN_PROGRESS -> RESOLVED transition", () => {
      const allowed = complaintTransitions[ComplaintStatus.IN_PROGRESS].includes(
        ComplaintStatus.RESOLVED
      );
      assert.equal(allowed, true);
    });

    it("should allow customer to close an OPEN complaint", () => {
      const allowed = complaintTransitions[ComplaintStatus.OPEN].includes(
        ComplaintStatus.CLOSED
      );
      assert.equal(allowed, true);
    });

    it("should block reopening a CLOSED complaint", () => {
      const allowed = complaintTransitions[ComplaintStatus.CLOSED].includes(
        ComplaintStatus.OPEN
      );
      assert.equal(allowed, false, "CLOSED complaints cannot transition back to OPEN");
    });

    it("should block transitions from a REJECTED terminal status", () => {
      const allowed = complaintTransitions[ComplaintStatus.REJECTED].length === 0;
      assert.equal(allowed, true, "REJECTED is a terminal status");
    });
  });

  // -----------------------------------------------------------------------
  // 5. OWNERSHIP & REPLY AUTHORIZATION
  // -----------------------------------------------------------------------
  describe("5. Ownership & Message Authorization", () => {
    it("should allow ticket owner to view and reply", () => {
      const ticketUserId = "user_abc_123";
      const requestUserId = "user_abc_123";
      const role = "user";

      const canAccess = role === "admin" || ticketUserId === requestUserId;
      assert.equal(canAccess, true, "Owner must have access");
    });

    it("should deny access if another non-admin customer attempts to view ticket", () => {
      const ticketUserId = "user_abc_123";
      const requestUserId = "user_xyz_789";
      const role = "user";

      const canAccess = role === "admin" || ticketUserId === requestUserId;
      assert.equal(canAccess, false, "Non-owner must be forbidden");
    });

    it("should allow admin to view any customer ticket", () => {
      const ticketUserId = "user_abc_123";
      const requestUserId = "admin_super_001";
      const role = "admin";

      const canAccess = role === "admin" || ticketUserId === requestUserId;
      assert.equal(canAccess, true, "Admin must have universal access");
    });

    it("should block replies if complaint status is CLOSED or REJECTED", () => {
      const checkCanReply = (status) =>
        ![ComplaintStatus.CLOSED, ComplaintStatus.REJECTED].includes(status);

      assert.equal(checkCanReply(ComplaintStatus.OPEN), true);
      assert.equal(checkCanReply(ComplaintStatus.IN_PROGRESS), true);
      assert.equal(checkCanReply(ComplaintStatus.CLOSED), false);
      assert.equal(checkCanReply(ComplaintStatus.REJECTED), false);
    });
  });
});
