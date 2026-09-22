import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  getCoupons,
  deleteCoupon,
  toggleCouponStatus,
  clearCouponSuccess,
} from "../../../redux/slices/couponSlice";

import CouponStats from "../../../components/admin/coupons/CouponStats";
import CouponFilters from "../../../components/admin/coupons/CouponFilters";
import CouponTable from "../../../components/admin/coupons/CouponTable";
import DeleteCouponModal from "../../../components/admin/coupons/DeleteCouponModal";

export default function Coupons() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const { user } = useSelector((state) => state.auth);
  const {
    coupons,
    loading,
    deleteLoading,
    error,
    success,
  } = useSelector((state) => state.coupon);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [discountType, setDiscountType] =
    useState("all");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  useEffect(() => {
    dispatch(getCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearCouponSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const filteredCoupons = useMemo(() => {
    const now = new Date();

    return coupons.filter((coupon) => {
      // Search
      const searchMatch =
        !search ||
        coupon.code
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        coupon.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      // Discount type
      const discountMatch =
        discountType === "all" ||
        coupon.discountType === discountType;

      // Status
      let statusMatch = true;

      if (status === "active") {
        statusMatch =
          coupon.isActive !== false &&
          (!coupon.startsAt ||
            new Date(coupon.startsAt) <= now) &&
          (!coupon.expiresAt ||
            new Date(coupon.expiresAt) >= now);
      }

      if (status === "inactive") {
        statusMatch = coupon.isActive === false;
      }

      if (status === "upcoming") {
        statusMatch =
          coupon.startsAt &&
          new Date(coupon.startsAt) > now;
      }

      if (status === "expired") {
        statusMatch =
          coupon.expiresAt &&
          new Date(coupon.expiresAt) < now;
      }

      return (
        searchMatch &&
        discountMatch &&
        statusMatch
      );
    });
  }, [
    coupons,
    search,
    status,
    discountType,
  ]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await dispatch(
      deleteCoupon(deleteTarget._id)
    );

    if (!result.error) {
      setDeleteTarget(null);
    }
  };

  const handleToggle = (coupon) => {
    dispatch(
      toggleCouponStatus({
        id: coupon._id,
        isActive: !coupon.isActive,
      })
    );
  };
const couponBasePath =
  user?.role === "admin"
    ? "/admin/coupons"
    : "/vendor/coupons";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Coupons
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage discount coupons.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => dispatch(getCoupons())}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

          <button
            onClick={() =>
              // navigate("/vendor/coupons/create")
              navigate(`${couponBasePath}/create`)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6">
        <CouponStats coupons={coupons} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CouponFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          discountType={discountType}
          setDiscountType={setDiscountType}
        />
      </div>

      {/* Result count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredCoupons.length}
          </span>{" "}
          coupon
          {filteredCoupons.length !== 1
            ? "s"
            : ""}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-gray-400" />

          <p className="mt-3 text-sm text-gray-500">
            Loading coupons...
          </p>
        </div>
      ) : (
        <CouponTable
          coupons={filteredCoupons}
          onView={(coupon) =>
            navigate(
              `${couponBasePath}/${coupon._id}`
            )
            // navigate(
            //   `/vendor/coupons/${coupon._id}`
            // )
          }
          onEdit={(coupon) =>
            navigate(
              `${couponBasePath}/${coupon._id}/edit`
            )
          }
          onDelete={(coupon) =>
            setDeleteTarget(coupon)
          }
          onToggle={handleToggle}
        />
      )}

      {/* Delete Modal */}
      <DeleteCouponModal
        coupon={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}