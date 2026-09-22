import React, { useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Edit,
  IndianRupee,
  TicketPercent,
  Users,
  Package,
  Power,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  getCouponById,
  toggleCouponStatus,
  clearSelectedCoupon,
} from "../../../redux/slices/couponSlice";

import CouponStatusBadge from "../../../components/admin/coupons/CouponStatusBadge";

const formatCurrency = (
  value,
  currency = "INR"
) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default function CouponDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
const { user } = useSelector((state) => state.auth);

  const {
    selectedCoupon,
    detailsLoading,
    error,
  } = useSelector((state) => state.coupon);

  useEffect(() => {
    dispatch(getCouponById(id));

    return () => {
      dispatch(clearSelectedCoupon());
    };
  }, [dispatch, id]);

const couponBasePath =
  user?.role === "admin"
    ? "/admin/coupons"
    : "/vendor/coupons";

  if (detailsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="mt-3 text-sm text-gray-500">
            Loading coupon...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedCoupon) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Coupon not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={() =>
              // navigate("/vendor/coupons")
              navigate(`${couponBasePath}/`)
            }
            className="mt-5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Coupons
          </button>
        </div>
      </div>
    );
  }

  const coupon = selectedCoupon;
console.log("seletcou",coupon.coupon)
  const usedCount = Number(
    coupon.usedCount || coupon.usageCount || 0
  );

  const usageLimit = coupon.totalUsageLimit;

  const usagePercentage =
    usageLimit && usageLimit > 0
      ? Math.min(
          100,
          Math.round(
            (usedCount / usageLimit) * 100
          )
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() =>
                // navigate("/vendor/coupons")
                navigate(`${couponBasePath}/`)
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Coupons
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Coupon Details
            </h1>
          </div>

          <button
            onClick={() =>
              // navigate(
              //   `/vendor/coupons/${id}/edit`
              // )

              navigate(`${couponBasePath}/${id}/edit`)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Edit className="h-4 w-4" />
            Edit Coupon
          </button>
        </div>

        {/* Main coupon card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
                    <TicketPercent className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {coupon.code}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {coupon.name}
                    </p>
                  </div>
                </div>

                {coupon.description && (
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-gray-600">
                    {coupon.description}
                  </p>
                )}
              </div>

              <CouponStatusBadge
                isActive={coupon.isActive}
                startsAt={coupon.startsAt}
                expiresAt={coupon.expiresAt}
              />
            </div>
          </div>

          {/* Discount */}
          <div className="grid grid-cols-1 gap-4 border-b border-gray-200 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Discount
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {coupon.discountType ===
                "percentage"
                  ? `${coupon.discountValue}%`
                  : formatCurrency(
                      coupon.discountValue,
                      coupon.currency
                    )}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Maximum Discount
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {coupon.maxDiscountAmount
                  ? formatCurrency(
                      coupon.maxDiscountAmount,
                      coupon.currency
                    )
                  : "No limit"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Minimum Order
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatCurrency(
                  coupon.minOrderAmount,
                  coupon.currency
                )}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">
                Currency
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {coupon.currency || "INR"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
            {/* Validity */}
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-600" />

                <h3 className="font-bold text-gray-900">
                  Validity
                </h3>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Starts At
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {formatDateTime(
                      coupon.startsAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Expires At
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {formatDateTime(
                      coupon.expiresAt
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage */}
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />

                <h3 className="font-bold text-gray-900">
                  Usage
                </h3>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Used
                  </span>

                  <span className="font-semibold text-gray-900">
                    {usedCount} /{" "}
                    {usageLimit || "Unlimited"}
                  </span>
                </div>

                {usageLimit && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-all"
                      style={{
                        width: `${usagePercentage}%`,
                      }}
                    />
                  </div>
                )}

                <div className="mt-5">
                  <p className="text-xs text-gray-400">
                    Usage Limit Per User
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {coupon.usageLimitPerUser ||
                      "Unlimited"}
                  </p>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />

                <h3 className="font-bold text-gray-900">
                  Eligibility
                </h3>
              </div>

              <p className="mt-5 text-sm font-medium capitalize text-gray-800">
                {formatLabel(
                  coupon.eligibility
                )}
              </p>
            </div>

            {/* Applicability */}
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-600" />

                <h3 className="font-bold text-gray-900">
                  Applicability
                </h3>
              </div>

              <p className="mt-5 text-sm font-medium capitalize text-gray-800">
                {formatLabel(
                  coupon.applicability
                )}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={() =>
                dispatch(
                  toggleCouponStatus({
                    id: coupon._id,
                    isActive: !coupon.isActive,
                  })
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Power className="h-4 w-4" />

              {coupon.isActive
                ? "Deactivate Coupon"
                : "Activate Coupon"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatLabel(value) {
  if (!value) return "Not specified";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}