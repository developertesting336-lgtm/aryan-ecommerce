import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  Package,
  User,
  Calendar,
  Send,
  Paperclip,
  ExternalLink,
  Loader2,
  FileText,
  Lock,
  ChevronRight,
  Shield,
  HelpCircle,
  Tag,
} from "lucide-react";
import {
  getAdminComplaintById,
  adminUpdateComplaintStatus,
  adminUpdateComplaintPriority,
  adminAddInternalNote,
  addComplaintMessage,
} from "../../redux/slices/complaintSlice";
import { showSuccess, showError } from "../../utils/toast";

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    icon: Clock3,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    icon: Clock3,
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
    icon: XCircle,
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    icon: XCircle,
  },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  MEDIUM: { label: "Medium", bg: "bg-amber-500/10", text: "text-amber-400" },
  HIGH: { label: "High", bg: "bg-orange-500/10", text: "text-orange-400" },
  URGENT: { label: "Urgent", bg: "bg-rose-500/10", text: "text-rose-400" },
};

const ALLOWED_TRANSITIONS = {
  OPEN: ["IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "CLOSED", "REJECTED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  REJECTED: [],
};

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentComplaint: complaint,
    messages = [],
    loading,
    actionLoading,
  } = useSelector((state) => state.complaint);

  const [activeTab, setActiveTab] = useState("thread"); // 'thread' | 'notes' | 'timeline'
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);

  // Status transition modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    targetStatus: "",
    note: "",
  });

  // Internal note input
  const [newInternalNote, setNewInternalNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getAdminComplaintById(id));
    }
  }, [dispatch, id]);

  const handleOpenStatusModal = (status) => {
    setStatusModal({
      open: true,
      targetStatus: status,
      note: "",
    });
  };

  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (statusModal.targetStatus === "REJECTED" && !statusModal.note.trim()) {
      showError("Please enter a reason for rejecting this complaint");
      return;
    }

    try {
      await dispatch(
        adminUpdateComplaintStatus({
          id,
          status: statusModal.targetStatus,
          note: statusModal.note.trim() || undefined,
        })
      ).unwrap();

      showSuccess(`Complaint marked as ${statusModal.targetStatus.replace("_", " ")}`);
      setStatusModal({ open: false, targetStatus: "", note: "" });
      dispatch(getAdminComplaintById(id));
    } catch (err) {
      showError(err || "Failed to update complaint status");
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    if (!newPriority || newPriority === complaint.priority) return;

    try {
      await dispatch(
        adminUpdateComplaintPriority({
          id,
          priority: newPriority,
        })
      ).unwrap();
      showSuccess(`Priority updated to ${newPriority}`);
      dispatch(getAdminComplaintById(id));
    } catch (err) {
      showError(err || "Failed to update priority");
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!newInternalNote.trim()) return;

    setSubmittingNote(true);
    try {
      await dispatch(
        adminAddInternalNote({
          id,
          note: newInternalNote.trim(),
        })
      ).unwrap();
      showSuccess("Internal note added");
      setNewInternalNote("");
      dispatch(getAdminComplaintById(id));
    } catch (err) {
      showError(err || "Failed to add internal note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && replyFiles.length === 0) {
      showError("Please write a message or attach a file");
      return;
    }

    setSendingReply(true);
    try {
      const formData = new FormData();
      formData.append("message", replyText.trim());
      replyFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      await dispatch(
        addComplaintMessage({
          id,
          formData,
          isAdmin: true,
        })
      ).unwrap();

      showSuccess("Reply sent to customer");
      setReplyText("");
      setReplyFiles([]);
      dispatch(getAdminComplaintById(id));
    } catch (err) {
      showError(err || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (replyFiles.length + selected.length > 5) {
      showError("Maximum 5 attachments permitted");
      return;
    }
    setReplyFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading && !complaint) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm">Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Complaint Not Found</h2>
        <p className="text-zinc-400 mb-4 text-sm">
          The requested complaint ticket could not be found or may have been deleted.
        </p>
        <button
          onClick={() => navigate("/admin/complaints")}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
        >
          Back to Complaints
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN;
  const priorityCfg = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.MEDIUM;
  const availableTransitions = ALLOWED_TRANSITIONS[complaint.status] || [];
  const isTerminal = ["CLOSED", "REJECTED"].includes(complaint.status);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/complaints")}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-0.5">
              <Link to="/admin/complaints" className="hover:text-zinc-200 transition-colors">
                Complaints
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-amber-500 font-mono font-medium">#{complaint.ticketId}</span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{complaint.subject}</span>
            </h1>
          </div>
        </div>

        {/* Action Buttons for Allowed Transitions */}
        <div className="flex items-center gap-2 flex-wrap">
          {availableTransitions.map((targetStatus) => {
            const btnCfg = STATUS_CONFIG[targetStatus];
            return (
              <button
                key={targetStatus}
                onClick={() => handleOpenStatusModal(targetStatus)}
                disabled={actionLoading}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  targetStatus === "IN_PROGRESS"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30"
                    : targetStatus === "RESOLVED"
                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30"
                    : targetStatus === "CLOSED"
                    ? "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                    : "bg-rose-600/20 text-rose-400 border-rose-500/30 hover:bg-rose-600/30"
                }`}
              >
                Mark as {btnCfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Status Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-xs text-zinc-500 block mb-1">Status</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              <statusCfg.icon className="w-3.5 h-3.5" />
              {statusCfg.label}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block mb-1">Priority</span>
            <select
              value={complaint.priority}
              onChange={handlePriorityChange}
              disabled={isTerminal || actionLoading}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-amber-500 ${priorityCfg.text} cursor-pointer disabled:cursor-not-allowed`}
            >
              <option value="LOW" className="bg-zinc-900 text-emerald-400">Low Priority</option>
              <option value="MEDIUM" className="bg-zinc-900 text-amber-400">Medium Priority</option>
              <option value="HIGH" className="bg-zinc-900 text-orange-400">High Priority</option>
              <option value="URGENT" className="bg-zinc-900 text-rose-400">Urgent Priority</option>
            </select>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block mb-1">Category</span>
            <span className="text-xs font-medium text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700">
              {complaint.category.replace(/_/g, " ")}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block mb-1">Created At</span>
            <span className="text-xs text-zinc-300">
              {new Date(complaint.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {complaint.status === "CLOSED" && (
          <div className="text-xs text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            Closed ticket (archived)
          </div>
        )}
      </div>

      {/* Main Grid: Left (Thread & Content), Right (Info Cards & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab("thread")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === "thread"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              Conversation ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === "notes"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Internal Notes ({complaint.internalNotes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === "timeline"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              Audit Trail ({complaint.timeline?.length || 0})
            </button>
          </div>

          {/* TAB 1: THREAD */}
          {activeTab === "thread" && (
            <div className="space-y-6">
              {/* Initial Complaint Description */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-white">
                      {complaint.user?.name || "Customer"}
                    </span>
                    <span className="text-zinc-500">filed initial complaint</span>
                  </div>
                  <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                </div>

                <p className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </p>

                {/* Initial Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800/80">
                    <span className="text-xs text-zinc-400 block mb-2 font-medium">
                      Attachments ({complaint.attachments.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {complaint.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          onClick={() => att.url && setPreviewImage(att.url)}
                          className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:border-zinc-600 transition-colors cursor-pointer group"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                          <span className="truncate max-w-[140px]">{att.name || "Attachment"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message List */}
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">
                    No follow-up messages yet.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg._id}
                        className={`p-4 rounded-xl border text-sm space-y-2 ${
                          isAdmin
                            ? "bg-amber-500/5 border-amber-500/20 ml-6"
                            : "bg-zinc-900 border-zinc-800 mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            {isAdmin ? (
                              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                <Shield className="w-3.5 h-3.5" />
                                Support Team (Admin)
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-zinc-200 font-semibold">
                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                {msg.sender?.name || "Customer"}
                              </span>
                            )}
                          </div>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>

                        <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {msg.attachments.map((att, idx) => (
                              <button
                                key={idx}
                                onClick={() => att.url && setPreviewImage(att.url)}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                              >
                                <Paperclip className="w-3 h-3 text-zinc-500" />
                                <span className="truncate max-w-[140px]">{att.name || "File"}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Admin Reply Composer */}
              {!isTerminal ? (
                <form
                  onSubmit={handleSendReply}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      Reply as Support
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Customer will receive email notification
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official response to customer..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                  />

                  {/* Attachment Previews */}
                  {replyFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {replyFiles.map((file, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-lg"
                        >
                          <Paperclip className="w-3 h-3 text-zinc-500" />
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-zinc-500 hover:text-rose-400 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
                      <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                      Attach Files
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={sendingReply || (!replyText.trim() && replyFiles.length === 0)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {sendingReply ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
                  This complaint is {complaint.status.toLowerCase()} and closed for new replies.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERNAL NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form
                onSubmit={handleAddInternalNote}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Add Staff Note</span>
                  <span className="text-[11px] text-zinc-500">(Never visible to customer)</span>
                </div>

                <textarea
                  rows={3}
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="Record an internal assessment, phone summary, or resolution plan..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingNote || !newInternalNote.trim()}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {submittingNote ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Internal Note"
                    )}
                  </button>
                </div>
              </form>

              {/* List of Notes */}
              <div className="space-y-3">
                {(!complaint.internalNotes || complaint.internalNotes.length === 0) ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    No internal notes yet. Use the form above to add one.
                  </p>
                ) : (
                  complaint.internalNotes.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-400" />
                          {item.author?.name || "Admin Staff"}
                        </span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">{item.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL / TIMELINE */}
          {activeTab === "timeline" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-amber-400" />
                Audit Trail & Status History
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
                {complaint.timeline && complaint.timeline.length > 0 ? (
                  complaint.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            {event.action?.replace(/_/g, " ")}
                          </span>
                          <span className="text-zinc-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {event.performedBy && (
                          <p className="text-xs text-zinc-400">
                            By: {event.performedBy?.name || "System"} ({event.performedByRole || "admin"})
                          </p>
                        )}
                        {event.note && (
                          <p className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 mt-1">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">No events logged yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer Info & Linked Order/Product */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Customer Details
            </h3>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-zinc-500 block">Name</span>
                <span className="text-white font-medium">
                  {complaint.user?.name || "Anonymous User"}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Email</span>
                <span className="text-zinc-300 font-mono text-xs">
                  {complaint.user?.email || "—"}
                </span>
              </div>
              {complaint.user?.phone && (
                <div>
                  <span className="text-xs text-zinc-500 block">Phone</span>
                  <span className="text-zinc-300 text-xs">{complaint.user.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <Link
                to={`/admin/complaints?userId=${complaint.user?._id || ""}`}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View all complaints by this customer
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Linked Order Card (if any) */}
          {complaint.order && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Linked Order
                </h3>
                <Link
                  to={`/admin/orders/${complaint.order._id}`}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  View Order <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-zinc-500 block">Order ID</span>
                  <span className="text-zinc-200 font-mono text-xs">
                    {complaint.order._id}
                  </span>
                </div>
                {complaint.order.fulfillmentStatus && (
                  <div>
                    <span className="text-xs text-zinc-500 block">Status</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {complaint.order.fulfillmentStatus}
                    </span>
                  </div>
                )}
                {complaint.order.totalAmount && (
                  <div>
                    <span className="text-xs text-zinc-500 block">Order Amount</span>
                    <span className="text-xs font-semibold text-zinc-200">
                      ₹{complaint.order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Linked Product Card (if any) */}
          {complaint.product && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                Linked Product
              </h3>

              <div className="flex items-center gap-3">
                {complaint.product.images?.[0] ? (
                  <img
                    src={complaint.product.images[0]}
                    alt={complaint.product.name}
                    className="w-12 h-12 object-cover rounded-lg border border-zinc-800"
                  />
                ) : (
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                    <Package className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {complaint.product.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    ₹{complaint.product.price?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Transition Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmStatusChange}
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Confirm Status Change
            </h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to transition this complaint to{" "}
              <strong className="text-amber-400 font-semibold">
                {statusModal.targetStatus.replace("_", " ")}
              </strong>
              ?
            </p>

            <div>
              <label className="text-xs text-zinc-300 block mb-1">
                Resolution / Reason Note{" "}
                {statusModal.targetStatus === "REJECTED" ? "(Required)" : "(Optional)"}
              </label>
              <textarea
                rows={3}
                value={statusModal.note}
                onChange={(e) =>
                  setStatusModal({ ...statusModal, note: e.target.value })
                }
                placeholder={
                  statusModal.targetStatus === "REJECTED"
                    ? "Explain why this complaint is being rejected..."
                    : "Add any resolution details or internal context..."
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ open: false, targetStatus: "", note: "" })}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 text-black text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] relative">
            <img
              src={previewImage}
              alt="Attachment Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-zinc-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
