import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import CouponForm from "../../../components/admin/coupons/CouponForm";

import {
  getCouponById,
  updateCoupon,
  clearCouponError,
  clearSelectedCoupon,
} from "../../../redux/slices/couponSlice";

export default function EditCoupon() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
const { user } = useSelector((state) => state.auth);

  const {
    selectedCoupon,
    detailsLoading,
    updateLoading,
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

  const handleSubmit = async (data) => {
    const result = await dispatch(
      updateCoupon({
        id,
        data,
      })
    );

    if (updateCoupon.fulfilled.match(result)) {
      // navigate(`/vendor/coupons/${id}`);
      navigate(`${couponBasePath}/${coupon._id}/edit`)      
    }
  };

  if (detailsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
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
          <h2 className="text-xl font-bold text-gray-900">
            Coupon not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Unable to load this coupon."}
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="mx-auto mb-5 max-w-5xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>

            <button
              onClick={() =>
                dispatch(clearCouponError())
              }
              className="font-semibold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <CouponForm
          initialData={selectedCoupon}
          title="Edit Coupon"
          subtitle={`Update ${selectedCoupon.code} coupon details.`}
          submitText="Update Coupon"
          loading={updateLoading}
          onSubmit={handleSubmit}
          onCancel={() =>
            // navigate(`/vendor/coupons/${id}`)
            navigate(`${couponBasePath}/${id}`)
          }
        />
      </div>
    </div>
  );
}