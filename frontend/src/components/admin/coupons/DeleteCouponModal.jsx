import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteCouponModal({
  coupon,
  open,
  loading,
  onClose,
  onConfirm,
}) {
  if (!open || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900">
            Delete Coupon
          </h2>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are you sure?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                You are about to delete coupon{" "}
                <span className="font-semibold text-gray-900">
                  {coupon.code}
                </span>
                . This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}