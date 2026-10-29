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

export const sendRefundStatusEmail = async ({
  to,
  userName = "Valued Customer",
  requestNumber,
  orderNumber,
  status,
  amount,
  rejectionReason,
  note,
}) => {
  try {
    const client = getTransporter();
    if (!client || !to) {
      console.warn("⚠️ SMTP credentials not configured or recipient missing. Skipping refund email.");
      return { success: false, skipped: true };
    }

    let subject = `Update on your return request #${requestNumber}`;
    let messageBody = "";

    switch (status) {
      case "REQUESTED":
        subject = `Return Request Received: #${requestNumber}`;
        messageBody = `We have received your return request #${requestNumber} for order #${orderNumber}.\n\nOur team is reviewing the details and photos. We will notify you once your request has been reviewed.`;
        break;

      case "APPROVED":
        subject = `Return Request Approved: #${requestNumber}`;
        messageBody = `Good news! Your return request #${requestNumber} for order #${orderNumber} has been approved.\n\nPlease package the items securely. Once our warehouse receives and inspects the item(s), your refund of ₹${Number(amount || 0).toLocaleString("en-IN")} will be processed.`;
        break;

      case "REJECTED":
        subject = `Update on Return Request: #${requestNumber}`;
        messageBody = `Your return request #${requestNumber} for order #${orderNumber} could not be approved.\n\nReason: ${rejectionReason || "Requirements not met."}\n${note ? `Note: ${note}` : ""}`;
        break;

      case "RETURN_RECEIVED":
        subject = `Returned Items Received: #${requestNumber}`;
        messageBody = `We have received your returned item(s) for request #${requestNumber} (Order #${orderNumber}).\n\nInspection is complete, and your refund of ₹${Number(amount || 0).toLocaleString("en-IN")} is being finalized.`;
        break;

      case "REFUNDED":
        subject = `Refund Processed: #${requestNumber} (₹${Number(amount || 0).toLocaleString("en-IN")})`;
        messageBody = `Your refund of ₹${Number(amount || 0).toLocaleString("en-IN")} for request #${requestNumber} (Order #${orderNumber}) has been successfully processed.\n\nIf you paid via card, funds typically appear in your account within 5-7 business days depending on your bank.`;
        break;

      default:
        messageBody = `Your return request #${requestNumber} has been updated to: ${status}.`;
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text: `Hello ${userName},\n\n${messageBody}\n\nThank you for shopping with us.\nCustomer Support Team`,
    };

    const info = await client.sendMail(mailOptions);
    console.log(`✉️ Refund email sent to ${to} [status: ${status}]:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("🔴 Failed to send refund email (non-fatal):", error.message);
    return { success: false, error: error.message };
  }
};
