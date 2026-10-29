import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  Upload,
  Paperclip,
  Trash2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  getComplaintById,
  addComplaintMessage,
  closeComplaint,
} from "../redux/slices/complaintSlice";
import { showSuccess, showError } from "../utils/toast";

const API_URL = "http://localhost:3000";

const getImageUrl = (image) => {
  if (!image) return "/wmpj6_512.avif";
  if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
    return image;
  }
  return `${API_URL}/uploads/${image}`;
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentComplaint, messages, loading, actionLoading, error } = useSelector(
    (state) => state.complaint
  );

  const [replyMessage, setReplyMessage] = useState("");
  const [replyImages, setReplyImages] = useState([]);
  const [replyPreviews, setReplyPreviews] = useState([]);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closeNote, setCloseNote] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (id) {
      dispatch(getComplaintById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (replyImages.length + files.length > 5) {
      showError("Maximum 5 attachments allowed per reply.");
      return;
    }

    setReplyImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setReplyPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveReplyImage = (index) => {
    setReplyImages((prev) => prev.filter((_, i) => i !== index));
    setReplyPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    const formData = new FormData();
    formData.append("message", replyMessage.trim());
    replyImages.forEach((img) => formData.append("images", img));

    try {
      await dispatch(
        addComplaintMessage({
          id: currentComplaint?._id || id,
          formData,
          isAdmin: false,
        })
      ).unwrap();

      setReplyMessage("");
      replyPreviews.forEach((url) => URL.revokeObjectURL(url));
      setReplyImages([]);
      setReplyPreviews([]);
    } catch (err) {
      showError(err || "Failed to send message.");
    }
  };

  const handleCloseTicket = async () => {
    try {
      await dispatch(
        closeComplaint({
          id: currentComplaint?._id || id,
          note: closeNote.trim() || "Resolved/closed by customer",
        })
      ).unwrap();

      showSuccess("Complaint has been closed.");
      setCloseConfirmOpen(false);
    } catch (err) {
      showError(err || "Failed to close complaint.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock size={12} /> Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <AlertCircle size={12} /> In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={12} /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Closed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  if (loading && !currentComplaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !currentComplaint) {
    return (
      <div className="min-h-screen py-16 px-4 bg-gray-50 dark:bg-gray-950 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Unable to Load Complaint
        </h2>
        <p className="text-xs text-gray-500 mb-6">{error || "Complaint ticket not found."}</p>
        <Link
          to="/my-complaints"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft size={14} /> Back to My Complaints
        </Link>
      </div>
    );
  }

  const isTerminal = ["CLOSED", "REJECTED"].includes(currentComplaint.status);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/my-complaints"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Link to="/my-complaints" className="hover:text-blue-600">
                  Complaints
                </Link>
                <span>/</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  #{currentComplaint.ticketId}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mt-0.5">
                {currentComplaint.subject}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(currentComplaint.status)}

            {!isTerminal && (
              <button
                type="button"
                onClick={() => setCloseConfirmOpen(true)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
              >
                Close Ticket
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Conversation Column */}
          <div className="md:col-span-2 space-y-4">
            {/* Initial Complaint Description Card */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                    {currentComplaint.user?.firstName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {currentComplaint.user?.firstName || "Customer"} (Original Complaint)
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(currentComplaint.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {currentComplaint.category?.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {currentComplaint.description}
              </p>

              {/* Attachments */}
              {Array.isArray(currentComplaint.attachments) &&
                currentComplaint.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[11px] font-semibold text-gray-500 mb-2">
                      Attachments ({currentComplaint.attachments.length}):
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {currentComplaint.attachments.map((img, idx) => (
                        <img
                          key={idx}
                          src={getImageUrl(img)}
                          alt="Attachment"
                          onClick={() => setSelectedImage(getImageUrl(img))}
                          className="h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition"
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Conversation Thread Stream */}
            <div className="space-y-4">
              {messages.map((msg) => {
                const isCustomer = msg.senderRole === "user";

                return (
                  <div
                    key={msg._id}
                    className={`flex gap-3 ${isCustomer ? "justify-end" : "justify-start"}`}
                  >
                    {!isCustomer && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-xs font-bold">
                        <ShieldCheck size={16} />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-2xl p-4 shadow-sm ${
                        isCustomer
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <span
                          className={`text-[11px] font-bold ${
                            isCustomer ? "text-blue-100" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isCustomer ? "You" : msg.senderName || "Customer Support"}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isCustomer ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {/* Attachments */}
                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {msg.attachments.map((img, i) => (
                            <img
                              key={i}
                              src={getImageUrl(img)}
                              alt="Attachment"
                              onClick={() => setSelectedImage(getImageUrl(img))}
                              className="h-14 w-14 rounded-lg object-cover border border-white/20 cursor-pointer hover:opacity-85"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Composer */}
            {!isTerminal ? (
              <form
                onSubmit={handleSendMessage}
                className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 shadow-sm"
              >
                {/* Previews */}
                {replyPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {replyPreviews.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group h-14 w-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <img src={url} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveReplyImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  rows={3}
                  placeholder="Type your response to support..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-900 dark:text-white placeholder:text-gray-400 outline-none resize-none"
                />

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition cursor-pointer">
                    <Paperclip size={15} />
                    <span className="text-[11px]">Attach photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={actionLoading || !replyMessage.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <span>Send Reply</span>
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl bg-gray-100 dark:bg-gray-800/60 p-4 text-center text-xs text-gray-500">
                This complaint is closed. You can no longer send messages to this thread.
              </div>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-4">
            {/* Linked Order Card */}
            {currentComplaint.order && (
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                    Linked Order
                  </h3>
                  <Link
                    to={`/orders`}
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Order</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <p>
                    <span className="text-gray-400 text-[11px]">Order #: </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {currentComplaint.order.orderNumber || currentComplaint.orderNumber}
                    </span>
                  </p>
                  {currentComplaint.order.total !== undefined && (
                    <p>
                      <span className="text-gray-400 text-[11px]">Total: </span>
                      <span>₹{Number(currentComplaint.order.total).toLocaleString("en-IN")}</span>
                    </p>
                  )}
                  {currentComplaint.order.fulfillmentStatus && (
                    <p>
                      <span className="text-gray-400 text-[11px]">Status: </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {currentComplaint.order.fulfillmentStatus}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Linked Product Card */}
            {currentComplaint.product && (
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">
                  Linked Product
                </h3>
                <div className="flex items-center gap-3">
                  {currentComplaint.product.images?.[0] && (
                    <img
                      src={getImageUrl(currentComplaint.product.images[0])}
                      alt={currentComplaint.product.name}
                      className="h-12 w-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {currentComplaint.product.name || currentComplaint.productName}
                    </p>
                    {currentComplaint.product.price && (
                      <p className="text-xs text-gray-500">₹{currentComplaint.product.price}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3">
                Ticket Activity
              </h3>
              <div className="relative pl-4 space-y-4 border-l-2 border-gray-100 dark:border-gray-800 text-xs">
                {currentComplaint.timeline?.map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-gray-900" />
                    <p className="font-semibold text-gray-900 dark:text-white text-[11px]">
                      {entry.status}
                    </p>
                    {entry.note && (
                      <p className="text-[11px] text-gray-500 mt-0.5">{entry.note}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={selectedImage} alt="Full preview" className="max-h-[85vh] max-w-full rounded-2xl" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Close Confirm Modal */}
      {closeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-100 dark:border-gray-800 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Close this complaint?
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              If your issue has been resolved or you wish to withdraw this ticket, please confirm.
            </p>
            <textarea
              rows={2}
              placeholder="Optional closing reason..."
              value={closeNote}
              onChange={(e) => setCloseNote(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-900 dark:text-white outline-none mb-4 resize-none"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCloseConfirmOpen(false)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloseTicket}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                Yes, Close Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
