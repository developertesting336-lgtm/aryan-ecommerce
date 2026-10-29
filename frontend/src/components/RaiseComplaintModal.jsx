import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  AlertCircle,
  Package,
  MessageSquare,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  createComplaint,
  getUserOrdersForComplaint,
} from "../redux/slices/complaintSlice";
import { showSuccess, showError } from "../utils/toast";

const CATEGORIES = [
  { value: "PRODUCT_QUALITY", label: "Product Quality Issue" },
  { value: "WRONG_ITEM", label: "Wrong Item Delivered" },
  { value: "DELIVERY_DELAY", label: "Delivery Delay / Tracking Problem" },
  { value: "PAYMENT_ISSUE", label: "Payment or Billing Issue" },
  { value: "SELLER_SERVICE", label: "Seller / Customer Service Issue" },
  { value: "OTHER", label: "Other Concern" },
];

export default function RaiseComplaintModal({
  isOpen,
  onClose,
  prefilledOrder = null,
  prefilledProduct = null,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { userOrders, actionLoading } = useSelector((state) => state.complaint);

  const [category, setCategory] = useState("PRODUCT_QUALITY");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (!userOrders || userOrders.length === 0) {
        dispatch(getUserOrdersForComplaint());
      }

      if (prefilledOrder) {
        setSelectedOrderId(prefilledOrder._id || prefilledOrder.id || "");
      }
      if (prefilledProduct) {
        setSelectedProductId(prefilledProduct._id || prefilledProduct.id || "");
      }
    }
  }, [isOpen, prefilledOrder, prefilledProduct, dispatch, userOrders]);

  if (!isOpen) return null;

  const currentOrder = userOrders.find((o) => String(o._id) === String(selectedOrderId)) || prefilledOrder;
  const availableItems = currentOrder?.items || [];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      showError("Maximum 5 images allowed per complaint.");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || subject.trim().length < 3) {
      showError("Please enter a subject (at least 3 characters).");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      showError("Please describe your issue in detail (at least 10 characters).");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("subject", subject.trim());
    formData.append("description", description.trim());

    if (selectedOrderId) {
      formData.append("orderId", selectedOrderId);
    }
    if (selectedProductId) {
      formData.append("productId", selectedProductId);
    }

    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const res = await dispatch(createComplaint(formData)).unwrap();
      showSuccess(`Complaint #${res.ticketId} raised successfully!`);
      // Cleanup previews
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      onClose();
      if (onSuccess) onSuccess(res);
    } catch (err) {
      showError(err || "Failed to submit complaint.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Raise a Complaint
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Submit your issue to our customer care team for prompt assistance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Complaint Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Linked Order (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Linked Order <span className="text-gray-400 text-[10px] font-normal">(Optional)</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedProductId("");
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600 transition"
              >
                <option value="">-- No Order Linked --</option>
                {userOrders.map((ord) => (
                  <option key={ord._id} value={ord._id}>
                    Order #{ord.orderNumber || ord._id.slice(-6)} (₹{ord.total || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Product (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Specific Product <span className="text-gray-400 text-[10px] font-normal">(Optional)</span>
              </label>
              <select
                value={selectedProductId}
                disabled={!selectedOrderId || availableItems.length === 0}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600 disabled:opacity-50 transition"
              >
                <option value="">-- Entire Order / Not Applicable --</option>
                {availableItems.map((item, idx) => (
                  <option key={item.productId || idx} value={item.productId}>
                    {item.productName || "Product"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="e.g. Package arrived damaged or item not working"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={3000}
              placeholder="Please provide details about what happened, steps you've taken, and your expected resolution..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-600 transition resize-none"
            />
            <p className="mt-1 text-right text-[10px] text-gray-400">
              {description.length} / 3000 characters
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Attachments (Images) <span className="text-gray-400 text-[10px] font-normal">(Max 5 images)</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={url} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition cursor-pointer bg-gray-50/50 dark:bg-gray-800/50">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 mt-1">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
          >
            {actionLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Complaint</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
