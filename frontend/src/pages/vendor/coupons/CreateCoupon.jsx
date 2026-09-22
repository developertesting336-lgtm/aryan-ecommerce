import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import CouponForm from "../../../components/admin/coupons/CouponForm";

import {
  createCoupon,
  clearCouponError,
} from "../../../redux/slices/couponSlice";

export default function CreateCoupon() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const { user } = useSelector((state) => state.auth);

  const {
    createLoading,
    error,
  } = useSelector((state) => state.coupon);

  const handleSubmit = async (data) => {
    const result = await dispatch(
      createCoupon(data)
    );

    if (createCoupon.fulfilled.match(result)) {
      // navigate("/vendor/coupons");
      navigate(`${couponBasePath}/`)     
    }
  };
const couponBasePath =
  user?.role === "admin"
    ? "/admin/coupons"
    : "/vendor/coupons";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="mx-auto mb-5 max-w-5xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between gap-3">
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
          title="Create Coupon"
          subtitle="Create a new discount coupon for your customers."
          submitText="Create Coupon"
          loading={createLoading}
          onSubmit={handleSubmit}
          onCancel={() =>
            // navigate("/vendor/coupons")
            navigate(`${couponBasePath}/`)     
          }
        />
      </div>
    </div>
  );
}