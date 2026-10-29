import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export const sendComplaintCreatedEmail = async ({
  to,
  userName = "Valued Customer",
  ticketId,
  subject,
  category,
}) => {
  try {
    const client = getTransporter();
    if (!client || !to) {
      console.warn("⚠️ SMTP credentials not configured or recipient missing. Skipping complaint created email.");
      return { success: false, skipped: true };
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: `Complaint Ticket Created: #${ticketId}`,
      text: `Hello ${userName},

We have received your complaint ticket #${ticketId}.

Ticket Details:
-------------------------
Ticket ID: #${ticketId}
Category: ${category}
Subject: ${subject}

Our support team has been notified and is looking into your issue. You can reply directly through your "My Complaints" portal in your account.

Thank you for your patience,
Customer Support Team`,
    };

    const info = await client.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendComplaintCreatedEmail error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendComplaintStatusEmail = async ({
  to,
  userName = "Valued Customer",
  ticketId,
  status,
  note = "",
}) => {
  try {
    const client = getTransporter();
    if (!client || !to) {
      return { success: false, skipped: true };
    }

    let statusDisplay = status;
    let messageBody = `The status of your complaint #${ticketId} has been updated to "${status}".`;

    if (status === "IN_PROGRESS") {
      messageBody = `Our support team has begun investigating your complaint #${ticketId}. We will update you with our progress shortly.`;
    } else if (status === "RESOLVED") {
      messageBody = `Good news! Your complaint #${ticketId} has been marked as RESOLVED. If you have any further questions, you can continue the conversation in your portal.`;
    } else if (status === "CLOSED") {
      messageBody = `Your complaint #${ticketId} has been closed. Thank you for your cooperation.`;
    } else if (status === "REJECTED") {
      messageBody = `Your complaint #${ticketId} could not be processed at this time.`;
    }

    if (note) {
      messageBody += `\n\nNote from support: ${note}`;
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: `Update on Complaint #${ticketId} [${statusDisplay}]`,
      text: `Hello ${userName},

${messageBody}

You can view the full ticket timeline and conversation thread in your "My Complaints" page.

Best regards,
Customer Support Team`,
    };

    const info = await client.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendComplaintStatusEmail error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendComplaintReplyEmail = async ({
  to,
  userName = "Valued Customer",
  ticketId,
  senderRole,
  messagePreview,
}) => {
  try {
    const client = getTransporter();
    if (!client || !to) {
      return { success: false, skipped: true };
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: `New Message on Ticket #${ticketId}`,
      text: `Hello ${userName},

A new response has been posted to your complaint #${ticketId} by ${
        senderRole === "admin" ? "our Support Team" : "the customer"
      }:

"${messagePreview.slice(0, 300)}${messagePreview.length > 300 ? "..." : ""}"

Please log in to your account to view the full conversation thread and respond.

Best regards,
Customer Support Team`,
    };

    const info = await client.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendComplaintReplyEmail error:", error.message);
    return { success: false, error: error.message };
  }
};
