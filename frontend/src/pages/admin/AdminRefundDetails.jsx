import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  IndianRupee,
  CreditCard,
  User,
  Calendar,
  AlertTriangle,
  Loader2,
  Check,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import {
  getAdminRefundById,
  adminUpdateRefundStatus,
  adminReceiveItems,
  adminProcessRefund,
} from "../../redux/slices/refundSlice";
import { showSuccess, showError } from "../../utils/toast";

export default function AdminRefundDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentRefund: refund,
    loading,
    adminActionLoading,
  } = useSelector((state) => state.refund);

  // Modals state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [restockDecisions, setRestockDecisions] = useState({});
  const [receiveNote, setReceiveNote] = useState("");

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("STRIPE");
  const [manualReference, setManualReference] = useState("");
  const [refundNote, setRefundNote] = useState("");

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getAdminRefundById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (refund?.items) {
      const initial = {};
      refund.items.forEach((item) => {
        initial[item._id] = item.restockItem !== false;
      });
      setRestockDecisions(initial);
    }
  }, [refund]);

  // Handle Approve
  const handleApprove = async () => {
    const confirmed = window.confirm(
      "Approve this return request? Customer will be notified to ship back item(s)."
    );
    if (!confirmed) return;

    try {
      await dispatch(
        adminUpdateRefundStatus({
          id,
          status: "APPROVED",
          adminNotes: "Approved by administrator",
        })
      ).unwrap();
      showSuccess("Refund request approved successfully");
      dispatch(getAdminRefundById(id));
    } catch (err) {
      showError(err || "Failed to approve refund request");
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showError("Please provide a reason for rejecting this return request");
      return;
    }

    try {
      await dispatch(
        adminUpdateRefundStatus({
          id,
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
          adminNotes: rejectNote.trim(),
        })
      ).unwrap();
      showSuccess("Refund request rejected");
      setRejectModalOpen(false);
      dispatch(getAdminRefundById(id));
    } catch (err) {
      showError(err || "Failed to reject refund request");
    }
  };

  // Handle Receive Items
  const handleReceiveSubmit = async (e) => {
    e.preventDefault();

    const itemsPayload = Object.keys(restockDecisions).map((itemId) => ({
      itemId,
      restockItem: Boolean(restockDecisions[itemId]),
    }));

    try {
      await dispatch(
        adminReceiveItems({
          id,
          items: itemsPayload,
          adminNotes: receiveNote.trim() || undefined,
        })
      ).unwrap();
      showSuccess("Items marked as received and eligible inventory restocked");
      setReceiveModalOpen(false);
      dispatch(getAdminRefundById(id));
    } catch (err) {
      showError(err || "Failed to mark items received");
    }
  };

  // Handle Process Refund
  const handleProcessRefundSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        adminProcessRefund({
          id,
          paymentGateway,
          manualReference: manualReference.trim() || undefined,
          adminNotes: refundNote.trim() || undefined,
        })
      ).unwrap();
      showSuccess("Refund successfully processed!");
      setRefundModalOpen(false);
      dispatch(getAdminRefundById(id));
    } catch (err) {
      showError(err || "Failed to process refund payment");
    }
  };

  if (loading || !refund) {
    return (
      <div className="min-h-screen bg-(--admin-bg) flex items-center justify-center p-8 text-(--admin-text)">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-(--admin-primary)" />
          <span className="text-sm font-semibold">Loading refund details...</span>
        </div>
      </div>
    );
  }

  const order = refund.order || {};
  const customer = refund.user || {};

  return (
    <div className="min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <main className="mx-auto w-full max-w-375 p-4 sm:p-5 lg:p-6 xl:p-7 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/refunds")}
              className="p-2 rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) hover:text-(--admin-primary) hover:border-(--admin-primary) transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-(--admin-text) sm:text-2xl">
                  Return Request #{refund.requestNumber}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    refund.status === "REFUNDED"
                      ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400"
                      : refund.status === "REJECTED"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                      : refund.status === "APPROVED"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                      : refund.status === "RETURN_RECEIVED"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}
                >
                  {refund.status}
                </span>
              </div>
              <p className="text-xs text-(--admin-text-muted) mt-0.5">
                Submitted on {new Date(refund.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {refund.status === "REQUESTED" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Request
                </button>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </button>
              </>
            )}

            {refund.status === "APPROVED" && (
              <>
                <button
                  onClick={() => setReceiveModalOpen(true)}
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Package className="h-4 w-4" />
                  Mark Item(s) Received
                </button>
                <button
                  onClick={() => setRefundModalOpen(true)}
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-(--admin-primary) hover:bg-(--admin-primary-hover) rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <IndianRupee className="h-4 w-4" />
                  Process Refund
                </button>
              </>
            )}

            {refund.status === "RETURN_RECEIVED" && (
              <button
                onClick={() => setRefundModalOpen(true)}
                disabled={adminActionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-(--admin-primary) hover:bg-(--admin-primary-hover) rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <IndianRupee className="h-4 w-4" />
                Process Refund Now
              </button>
            )}
          </div>
        </div>

        {/* ================= STATUS NOTICES ================= */}
        {refund.status === "REFUNDED" && (
          <div className="rounded-xl border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-950/30 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-900 dark:text-green-300">
                Refund Completed
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                Amount ₹{Number(refund.totalRefundAmount).toLocaleString("en-IN")} was refunded via{" "}
                <span className="font-semibold">{refund.paymentGateway}</span> (Gateway Ref:{" "}
                <span className="font-mono">{refund.gatewayRefundId || "N/A"}</span>).
              </p>
            </div>
          </div>
        )}

        {refund.status === "REJECTED" && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900 dark:text-red-300">
                Request Rejected
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Reason: {refund.rejectionReason || "Requirements not met."}
              </p>
            </div>
          </div>
        )}

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Order Details */}
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--admin-text-muted) mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-(--admin-primary)" />
              Order Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Order Number:</span>
                <span className="font-semibold text-(--admin-text)">
                  {order.orderNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Order Total:</span>
                <span className="font-semibold text-(--admin-text)">
                  ₹{Number(order.total || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Payment Status:</span>
                <span className="font-semibold text-(--admin-text)">
                  {order.paymentStatus || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Fulfillment Status:</span>
                <span className="font-semibold text-(--admin-text)">
                  {order.fulfillmentStatus || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--admin-text-muted) mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-(--admin-primary)" />
              Customer Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Name:</span>
                <span className="font-semibold text-(--admin-text)">
                  {`${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                    customer.fullName ||
                    "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Email:</span>
                <span className="font-semibold text-(--admin-text)">
                  {customer.email || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Phone:</span>
                <span className="font-semibold text-(--admin-text)">
                  {customer.phone || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Financials */}
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--admin-text-muted) mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-(--admin-primary)" />
              Refund Calculation
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Type:</span>
                <span className="font-semibold text-(--admin-text)">
                  {refund.refundType} RETURN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Total Approved Refund:</span>
                <span className="text-base font-bold text-(--admin-primary)">
                  ₹{Number(refund.totalRefundAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--admin-text-muted)">Gateway ID:</span>
                <span className="font-mono text-(--admin-text)">
                  {refund.gatewayRefundId || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RETURN ITEMS TABLE ================= */}
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) shadow-xs overflow-hidden">
          <div className="p-4 border-b border-(--admin-border)">
            <h2 className="text-sm font-bold text-(--admin-text)">
              Returned Items ({refund.items?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-(--admin-border) bg-(--admin-surface-soft) text-(--admin-text-muted) font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Return Qty</th>
                  <th className="px-5 py-3">Unit Price</th>
                  <th className="px-5 py-3">Calculated Refund</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Restock?</th>
                  <th className="px-5 py-3">Restock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--admin-border)">
                {refund.items?.map((item) => (
                  <tr key={item._id} className="hover:bg-(--admin-surface-soft) transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-(--admin-text)">
                        {item.productName}
                      </p>
                      {item.customerNote && (
                        <p className="text-[11px] text-(--admin-text-muted) mt-1 italic">
                          "{item.customerNote}"
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-(--admin-text)">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-4 text-(--admin-text-muted)">
                      ₹{item.unitPrice}
                    </td>
                    <td className="px-5 py-4 font-bold text-(--admin-primary)">
                      ₹{Number(item.itemRefundAmount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-(--admin-text)">
                        {item.reason}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {item.restockItem ? (
                        <span className="text-[var(--admin-primary)] font-semibold">Yes</span>
                      ) : (
                        <span className="text-red-500 font-semibold">No (Damaged)</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.restocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400">
                          Restocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Not Restocked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= PHOTO PROOFS GALLERY ================= */}
        {refund.items?.some((i) => i.images?.length > 0) && (
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-5 shadow-xs">
            <h3 className="text-sm font-bold text-(--admin-text) mb-3">
              Customer Photo Evidence
            </h3>
            <div className="flex flex-wrap gap-4">
              {refund.items.flatMap((item) =>
                (item.images || []).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(imgUrl)}
                    className="relative h-28 w-28 rounded-xl overflow-hidden border border-(--admin-control-border) cursor-pointer group shadow-xs hover:border-(--admin-primary) transition"
                  >
                    <img
                      src={imgUrl}
                      alt="Customer proof"
                      className="h-full w-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition">
                      Preview
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= CHRONOLOGICAL AUDIT TRAIL ================= */}
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-5 shadow-xs">
          <h3 className="text-sm font-bold text-(--admin-text) mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-(--admin-primary)" />
            Audit Trail & History
          </h3>

          <div className="space-y-4">
            {refund.auditTrail?.map((entry, idx) => (
              <div
                key={entry._id || idx}
                className="flex items-start gap-3.5 pb-4 border-b border-(--admin-border) last:border-b-0 last:pb-0"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--admin-stat-green-bg)] text-[var(--admin-stat-green-text)] font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-xs font-bold text-(--admin-text)">
                      {entry.action.replace(/_/g, " ")} &bull; Status:{" "}
                      <span className="font-semibold text-(--admin-primary)">
                        {entry.status}
                      </span>
                    </p>
                    <span className="text-[11px] text-(--admin-text-muted)">
                      {new Date(entry.timestamp).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-(--admin-text-muted) mt-1">
                      {entry.note}
                    </p>
                  )}
                  {entry.changedBy && (
                    <p className="text-[10px] text-(--admin-text-muted) mt-0.5 font-medium">
                      By: {entry.changedBy?.firstName || entry.changedBy?.email || "System"} (
                      {entry.changedBy?.role || "user"})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ================= REJECT MODAL ================= */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-(--admin-border) bg-(--admin-surface) p-6 shadow-2xl">
            <h3 className="text-base font-bold text-(--admin-text) mb-2">
              Reject Return Request
            </h3>
            <p className="text-xs text-(--admin-text-muted) mb-4">
              Please specify the reason for rejection. This reason will be emailed to the customer.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-(--admin-text) mb-1">
                  Rejection Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Return window expired or item shows user damage"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-2.5 text-(--admin-text) focus:border-(--admin-primary) outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--admin-text) mb-1">
                  Internal Admin Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal comments for records"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="w-full text-xs rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-2.5 text-(--admin-text) focus:border-(--admin-primary) outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-(--admin-surface-soft) text-(--admin-text)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= RECEIVE ITEMS MODAL ================= */}
      {receiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-(--admin-border) bg-(--admin-surface) p-6 shadow-2xl">
            <h3 className="text-base font-bold text-(--admin-text) mb-2">
              Mark Items Received & Restock
            </h3>
            <p className="text-xs text-(--admin-text-muted) mb-4">
              Inspect each received item and choose whether to return it to active warehouse stock.
            </p>

            <form onSubmit={handleReceiveSubmit} className="space-y-4">
              <div className="divide-y divide-(--admin-border) max-h-60 overflow-y-auto">
                {refund.items?.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-(--admin-text)">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-(--admin-text-muted)">
                        Qty: {item.quantity} &bull; Reason: {item.reason}
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(restockDecisions[item._id])}
                        onChange={(e) =>
                          setRestockDecisions((prev) => ({
                            ...prev,
                            [item._id]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded accent-(--admin-primary) text-(--admin-primary) focus:ring-(--admin-primary)"
                      />
                      <span className="text-xs font-semibold text-(--admin-text)">
                        Restock +{item.quantity} units
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--admin-text) mb-1">
                  Inspection Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Condition notes upon receipt"
                  value={receiveNote}
                  onChange={(e) => setReceiveNote(e.target.value)}
                  className="w-full text-xs rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-2.5 text-(--admin-text) focus:border-(--admin-primary) outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReceiveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-(--admin-surface-soft) text-(--admin-text)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                >
                  Confirm Items Received
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PROCESS REFUND MODAL ================= */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-(--admin-border) bg-(--admin-surface) p-6 shadow-2xl">
            <h3 className="text-base font-bold text-(--admin-text) mb-2">
              Process Gateway Refund
            </h3>
            <p className="text-xs text-(--admin-text-muted) mb-4">
              Refund of{" "}
              <span className="font-bold text-(--admin-primary)">
                ₹{Number(refund.totalRefundAmount).toLocaleString("en-IN")}
              </span>{" "}
              will be issued to the customer.
            </p>

            <form onSubmit={handleProcessRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-(--admin-text) mb-1">
                  Payment Method / Gateway
                </label>
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value)}
                  className="w-full text-xs rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-2.5 text-(--admin-text) focus:border-(--admin-primary) outline-none transition cursor-pointer"
                >
                  <option value="STRIPE">Stripe (Automatic Card Refund)</option>
                  <option value="COD_MANUAL">COD / Bank Transfer (Manual)</option>
                </select>
              </div>

              {paymentGateway === "COD_MANUAL" && (
                <div>
                  <label className="block text-xs font-semibold text-(--admin-text) mb-1">
                    Manual Reference / UPI / Bank Txn ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., UPI-123456789 or NEFT-REF-098"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    className="w-full text-xs rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-2.5 text-(--admin-text) focus:border-(--admin-primary) outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-(--admin-text) mb-1">
                  Admin Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Notes for records or customer email"
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  className="w-full text-xs rounded-lg border border-(--admin-control-border) bg-(--admin-control-bg) p-2.5 text-(--admin-text) focus:border-(--admin-primary) outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-(--admin-surface-soft) text-(--admin-text)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-(--admin-primary) hover:bg-(--admin-primary-hover) rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  {adminActionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Refund...
                    </>
                  ) : (
                    "Authorize & Complete Refund"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= IMAGE PREVIEW MODAL ================= */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
        >
          <img
            src={previewImage}
            alt="Enlarged Proof"
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
