import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Percent,
  IndianRupee,
  Save,
} from "lucide-react";

const defaultValues = {
  code: "",
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  minOrderAmount: "",
  currency: "INR",
  startsAt: "",
  expiresAt: "",
  isActive: true,
  totalUsageLimit: "",
  usageLimitPerUser: "",
  eligibility: "all",
  applicability: "all_products",
};

export default function CouponForm({
  initialData,
  onSubmit,
  loading = false,
  submitText = "Create Coupon",
  title,
  subtitle,
  onCancel,
}) {
  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultValues,
        ...initialData,

        startsAt: initialData.startsAt
          ? formatDateTimeLocal(initialData.startsAt)
          : "",

        expiresAt: initialData.expiresAt
          ? formatDateTimeLocal(initialData.expiresAt)
          : "",

        maxDiscountAmount:
          initialData.maxDiscountAmount ?? "",

        minOrderAmount:
          initialData.minOrderAmount ?? "",

        discountValue:
          initialData.discountValue ?? "",

        totalUsageLimit:
          initialData.totalUsageLimit ?? "",

        usageLimitPerUser:
          initialData.usageLimitPerUser ?? "",
      });
    }
  }, [initialData]);

  function formatDateTimeLocal(date) {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const pad = (num) => String(num).padStart(2, "0");

    return `${d.getFullYear()}-${pad(
      d.getMonth() + 1
    )}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    // if (!formData.code.trim()) {
    //   newErrors.code = "Coupon code is required";
    // }

    if (!formData.name.trim()) {
      newErrors.name = "Coupon name is required";
    }

    if (!formData.discountValue) {
      newErrors.discountValue =
        "Discount value is required";
    }

    if (
      formData.discountType === "percentage" &&
      Number(formData.discountValue) > 100
    ) {
      newErrors.discountValue =
        "Percentage cannot be greater than 100";
    }

    if (!formData.startsAt) {
      newErrors.startsAt = "Start date is required";
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = "Expiry date is required";
    }

    if (
      formData.startsAt &&
      formData.expiresAt &&
      new Date(formData.expiresAt) <=
        new Date(formData.startsAt)
    ) {
      newErrors.expiresAt =
        "Expiry must be after start date";
    }

    if (
      formData.minOrderAmount &&
      Number(formData.minOrderAmount) < 0
    ) {
      newErrors.minOrderAmount =
        "Amount cannot be negative";
    }

    if (
      formData.totalUsageLimit &&
      Number(formData.totalUsageLimit) < 1
    ) {
      newErrors.totalUsageLimit =
        "Usage limit must be at least 1";
    }

    if (
      formData.usageLimitPerUser &&
      Number(formData.usageLimitPerUser) < 1
    ) {
      newErrors.usageLimitPerUser =
        "User limit must be at least 1";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      // code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),

      discountType: formData.discountType,

      discountValue: Number(formData.discountValue),

      maxDiscountAmount:
        formData.discountType === "percentage" &&
        formData.maxDiscountAmount !== ""
          ? Number(formData.maxDiscountAmount)
          : null,

      minOrderAmount:
        formData.minOrderAmount !== ""
          ? Number(formData.minOrderAmount)
          : 0,

      currency: formData.currency,

      startsAt: new Date(
        formData.startsAt
      ).toISOString(),

      expiresAt: new Date(
        formData.expiresAt
      ).toISOString(),

      isActive: formData.isActive,

      totalUsageLimit:
        formData.totalUsageLimit !== ""
          ? Number(formData.totalUsageLimit)
          : null,

      usageLimitPerUser:
        formData.usageLimitPerUser !== ""
          ? Number(formData.usageLimitPerUser)
          : null,

      eligibility: formData.eligibility,

      applicability: formData.applicability,
    };

    onSubmit(payload);
  };

  const inputClass = (field) =>
    `mt-2 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-300 focus:border-gray-900"
    }`;

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coupons
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* =====================================
            BASIC INFORMATION
        ====================================== */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the basic details of the coupon.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* <div>
              <label className="text-sm font-medium text-gray-700">
                Coupon Code *
              </label>

              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="SAVE20"
                className={inputClass("code")}
              />

              {errors.code && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.code}
                </p>
              )}
            </div> */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Coupon Name *
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="20% Off"
                className={inputClass("name")}
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Get 20% off on your order"
                className={inputClass("description")}
              />
            </div>
          </div>
        </section>

        {/* =====================================
            DISCOUNT
        ====================================== */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Discount
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure how much discount customers receive.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Discount Type *
              </label>

              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className={inputClass("discountType")}
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed Amount
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Discount Value *
              </label>

              <div className="relative">
                {formData.discountType ===
                "percentage" ? (
                  <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                ) : (
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                )}

                <input
                  type="number"
                  min="0"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  placeholder="20"
                  className={`${inputClass(
                    "discountValue"
                  )} pl-9`}
                />
              </div>

              {errors.discountValue && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.discountValue}
                </p>
              )}
            </div>

            {formData.discountType === "percentage" && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Maximum Discount Amount
                </label>

                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="number"
                    min="0"
                    name="maxDiscountAmount"
                    value={
                      formData.maxDiscountAmount
                    }
                    onChange={handleChange}
                    placeholder="500"
                    className={`${inputClass(
                      "maxDiscountAmount"
                    )} pl-9`}
                  />
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Maximum amount a customer can save.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Minimum Order Amount
              </label>

              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="number"
                  min="0"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  placeholder="1000"
                  className={`${inputClass(
                    "minOrderAmount"
                  )} pl-9`}
                />
              </div>

              {errors.minOrderAmount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.minOrderAmount}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Currency
              </label>

              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={inputClass("currency")}
              >
                <option value="INR">
                  INR - Indian Rupee
                </option>

                <option value="USD">
                  USD - US Dollar
                </option>

                <option value="EUR">
                  EUR - Euro
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================
            VALIDITY
        ====================================== */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Validity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set when the coupon becomes valid and expires.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="datetime-local"
                  name="startsAt"
                  value={formData.startsAt}
                  onChange={handleChange}
                  className={`${inputClass(
                    "startsAt"
                  )} pl-9`}
                />
              </div>

              {errors.startsAt && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.startsAt}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Expiry Date & Time *
              </label>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className={`${inputClass(
                    "expiresAt"
                  )} pl-9`}
                />
              </div>

              {errors.expiresAt && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.expiresAt}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            USAGE
        ====================================== */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Usage Limits
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control how many times this coupon can be used.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Total Usage Limit
              </label>

              <input
                type="number"
                min="1"
                name="totalUsageLimit"
                value={formData.totalUsageLimit}
                onChange={handleChange}
                placeholder="1000"
                className={inputClass(
                  "totalUsageLimit"
                )}
              />

              <p className="mt-1 text-xs text-gray-400">
                Leave empty for unlimited usage.
              </p>

              {errors.totalUsageLimit && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.totalUsageLimit}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Usage Limit Per User
              </label>

              <input
                type="number"
                min="1"
                name="usageLimitPerUser"
                value={formData.usageLimitPerUser}
                onChange={handleChange}
                placeholder="1"
                className={inputClass(
                  "usageLimitPerUser"
                )}
              />

              <p className="mt-1 text-xs text-gray-400">
                Leave empty for unlimited usage per user.
              </p>

              {errors.usageLimitPerUser && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.usageLimitPerUser}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            ELIGIBILITY
        ====================================== */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Eligibility & Applicability
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Decide who can use the coupon and where it applies.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Who Can Use This Coupon?
              </label>

              <select
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                className={inputClass("eligibility")}
              >
                <option value="all">
                  All Customers
                </option>

                <option value="new_users">
                  New Customers
                </option>

                <option value="existing_users">
                  Existing Customers
                </option>

                <option value="specific_users">
                  Specific Customers
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Where Can It Apply?
              </label>

              <select
                name="applicability"
                value={formData.applicability}
                onChange={handleChange}
                className={inputClass(
                  "applicability"
                )}
              >
                <option value="all_products">
                  All Products
                </option>

                <option value="specific_products">
                  Specific Products
                </option>

                <option value="specific_categories">
                  Specific Categories
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================
            STATUS
        ====================================== */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Coupon Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enable or disable this coupon.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: !prev.isActive,
                }))
              }
              className={`relative h-7 w-12 rounded-full transition ${
                formData.isActive
                  ? "bg-gray-900"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  formData.isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          <p className="mt-3 text-sm">
            Status:{" "}
            <span className="font-semibold">
              {formData.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </p>
        </section>

        {/* =====================================
            ACTIONS
        ====================================== */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {loading ? "Saving..." : submitText}
          </button>
        </div>
      </div>
    </form>
  );
}