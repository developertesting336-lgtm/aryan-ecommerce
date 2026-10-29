import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  Package,
  RotateCcw,
  IndianRupee,
  Loader2,
  Trash2,
} from "lucide-react";
import { createRefundRequest } from "../redux/slices/refundSlice";
import { showSuccess, showError } from "../utils/toast";

const REASONS = [
  { value: "DEFECTIVE", label: "Defective or not functioning properly" },
  { value: "DAMAGED_IN_TRANSIT", label: "Damaged during delivery/shipping" },
  { value: "WRONG_ITEM", label: "Received wrong item or variant" },
  { value: "SIZE_FIT_ISSUE", label: "Size or fit does not match expectations" },
  { value: "NOT_AS_DESCRIBED", label: "Item differs from website description" },
  { value: "CHANGED_MIND", label: "Changed my mind / No longer needed" },
  { value: "OTHER", label: "Other reason" },
];

export default function RefundRequestModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  eligibilityData,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((state) => state.refund);

  // Selected items: map of orderItemId -> { quantity, reason, customerNote }
  const [selectedItems, setSelectedItems] = useState({});
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const items = eligibilityData?.items || [];

  const handleToggleItem = (item) => {
    const id = item.orderItemId;
    setSelectedItems((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: {
          quantity: 1,
          reason: "DEFECTIVE",
          customerNote: "",
        },
      };
    });
  };

  const handleQuantityChange = (orderItemId, maxQty, delta) => {
    setSelectedItems((prev) => {
      const current = prev[orderItemId];
      if (!current) return prev;
      const newQty = Math.max(1, Math.min(maxQty, current.quantity + delta));
      return {
        ...prev,
        [orderItemId]: { ...current, quantity: newQty },
      };
    });
  };

  const handleReasonChange = (orderItemId, reason) => {
    setSelectedItems((prev) => {
      const current = prev[orderItemId];
      if (!current) return prev;
      return {
        ...prev,
        [orderItemId]: { ...current, reason },
      };
    });
  };

  const handleNoteChange = (orderItemId, note) => {
    setSelectedItems((prev) => {
      const current = prev[orderItemId];
      if (!current) return prev;
      return {
        ...prev,
        [orderItemId]: { ...current, customerNote: note },
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      showError("Maximum 5 proof images allowed");
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

  // Estimated refund total
  const estimatedRefundAmount = useMemo(() => {
    let sum = 0;
    for (const [orderItemId, data] of Object.entries(selectedItems)) {
      const matched = items.find((i) => i.orderItemId === orderItemId);
      if (matched) {
        sum += (matched.unitRefundAmount || 0) * data.quantity;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [selectedItems, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedKeys = Object.keys(selectedItems);
    if (selectedKeys.length === 0) {
      showError("Please select at least one item to return");
      return;
    }

    try {
      const requestItemsPayload = selectedKeys.map((id) => ({
        orderItemId: id,
        quantity: selectedItems[id].quantity,
        reason: selectedItems[id].reason,
        customerNote: selectedItems[id].customerNote || "",
      }));

      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("items", JSON.stringify(requestItemsPayload));
      formData.append(
        "idempotencyKey",
        `refund_user_${orderId}_${Date.now()}`
      );

      images.forEach((img) => {
        formData.append("images", img);
      });

      await dispatch(createRefundRequest(formData)).unwrap();
      showSuccess("Return request submitted successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showError(err || "Failed to submit return request");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Request Return / Refund
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Order #{orderNumber} &bull; Window: {eligibilityData?.daysRemaining} days remaining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Items to Return */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Select items you want to return
            </label>

            <div className="space-y-3">
              {items.map((item) => {
                const isSelected = Boolean(selectedItems[item.orderItemId]);
                const itemData = selectedItems[item.orderItemId];
                const canReturn = item.returnableQuantity > 0;

                return (
                  <div
                    key={item.orderItemId}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850"
                    } ${!canReturn ? "opacity-60 bg-gray-50 dark:bg-gray-900" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        disabled={!canReturn}
                        checked={isSelected}
                        onChange={() => handleToggleItem(item)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Purchased: {item.purchasedQuantity} &bull; Refundable:{" "}
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {item.returnableQuantity}
                              </span>
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {item.unitRefundAmount} / unit
                          </p>
                        </div>

                        {/* If Selected: Qty + Reason + Note */}
                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-800 space-y-3">
                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Return Quantity:
                              </span>
                              <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.orderItemId,
                                      item.returnableQuantity,
                                      -1
                                    )
                                  }
                                  className="px-2.5 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 text-xs font-bold text-gray-900 dark:text-white min-w-8 text-center">
                                  {itemData.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.orderItemId,
                                      item.returnableQuantity,
                                      1
                                    )
                                  }
                                  className="px-2.5 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Reason Select */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reason for return:
                              </label>
                              <select
                                value={itemData.reason}
                                onChange={(e) =>
                                  handleReasonChange(
                                    item.orderItemId,
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {REASONS.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Note */}
                            <div>
                              <input
                                type="text"
                                placeholder="Additional details or description (optional)"
                                value={itemData.customerNote}
                                onChange={(e) =>
                                  handleNoteChange(
                                    item.orderItemId,
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Upload Proof Images (Optional, max 5)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Help us process your return faster by uploading photos of any defect or item condition.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group"
                >
                  <img
                    src={src}
                    alt={`Proof ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500/80 cursor-pointer transition bg-gray-50 dark:bg-gray-800/50">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-[10px] text-gray-500 mt-1 font-medium">Add Photo</span>
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

          {/* Refund Summary Bar */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Estimated Refund Amount
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Calculated based on net item price paid after discounts
              </p>
            </div>
            <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center">
              <IndianRupee className="h-5 w-5" />
              {estimatedRefundAmount.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Object.keys(selectedItems).length === 0}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit Return Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
