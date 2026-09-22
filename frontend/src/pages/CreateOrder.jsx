import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { createOrder } from "../redux/slices/orderSlice";
import { getCart } from "../redux/slices/cartSlice";
import { createPayment } from "../redux/slices/paymentSlice";
import { getAddresses } from "../redux/slices/addressSlice";

import {
  applyCoupon,
  clearAppliedCoupon,
} from "../redux/slices/couponSlice";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// =====================================================
// IMAGE URL
// =====================================================

  const getImageUrl = (image) => {
  if (!image) {
    return "/1786052049893.webp";
  }

  // Already a complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  // Already starts with /uploads/
  if (image.startsWith("/uploads/")) {
    return `http://localhost:3000${image}`;
  }

  // Starts with uploads/
  if (image.startsWith("uploads/")) {
    return `http://localhost:3000/${image}`;
  }

  // Normal filename
  return `${BASE_URL}${image}`;
};
// =====================================================
// COMPONENT
// =====================================================

export default function CreateOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // =====================================================
  // BUY THIS PARAMETERS
  // =====================================================

  const productId = searchParams.get("productId");

  const quantityParam = searchParams.get("quantity");

  const quantity = quantityParam
    ? Number(quantityParam)
    : null;

  // =====================================================
  // REDUX
  // =====================================================

  const {
    cart,
    loading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);

  const {
    loading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.order);

  const {
    addresses = [],
    loading: addressLoading,
    error: addressError,
  } = useSelector((state) => state.address);

  const {
    appliedCoupon,
    couponLoading,
    couponError,
  } = useSelector((state) => state.coupon);
console.log("coupon state", {
  appliedCoupon,
  couponLoading,
  couponError,
});
  // =====================================================
  // FORM
  // =====================================================

  const emptyForm = {
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // =====================================================
  // ADDRESS
  // =====================================================

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  // =====================================================
  // COUPON
  // =====================================================

  const [couponCode, setCouponCode] =
    useState("");

  // =====================================================
  // FETCH CART
  // =====================================================

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  useEffect(() => {
    dispatch(getAddresses());
  }, [dispatch]);

  // =====================================================
  // AUTO SELECT FIRST ADDRESS
  // =====================================================

  useEffect(() => {
    if (
      addresses.length > 0 &&
      !selectedAddressId
    ) {
      const firstAddress = addresses[0];

      setSelectedAddressId(
        firstAddress._id
      );

      setFormData({
        name:
          firstAddress.fullName || "",

        phone:
          firstAddress.phoneNumber || "",

        addressLine1:
          firstAddress.addressLine || "",

        city:
          firstAddress.city || "",

        state:
          firstAddress.state || "",

        postalCode:
          firstAddress.pincode || "",

        country:
          firstAddress.country || "India",
      });
    }
  }, [
    addresses,
    selectedAddressId,
  ]);

  // =====================================================
  // SELECT SAVED ADDRESS
  // =====================================================

  const handleSelectAddress = (
    addressId
  ) => {
    const selectedAddress =
      addresses.find(
        (address) =>
          address._id === addressId
      );

    if (!selectedAddress) {
      return;
    }

    setSelectedAddressId(
      addressId
    );

    setFormData({
      name:
        selectedAddress.fullName || "",

      phone:
        selectedAddress.phoneNumber || "",

      addressLine1:
        selectedAddress.addressLine || "",

      city:
        selectedAddress.city || "",

      state:
        selectedAddress.state || "",

      postalCode:
        selectedAddress.pincode || "",

      country:
        selectedAddress.country ||
        "India",
    });
  };

  // =====================================================
  // MANUAL INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setSelectedAddressId("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


// =====================================================
// ITEMS TO ORDER
// =====================================================

const selectedItems = useMemo(() => {
  if (!cart?.items?.length) {
    return [];
  }

  // BUY THIS PRODUCT
  if (productId) {
    return cart.items.filter(
      (item) =>
        item?.product?._id?.toString() === productId
    );
  }

  // BUY ALL
  return cart.items;
}, [cart, productId]);


// =====================================================
// SELECTED PRODUCT
// =====================================================

const selectedProduct = selectedItems[0]?.product;


// =====================================================
// SELECTED ITEMS FOR API
// =====================================================

// const couponItems = useMemo(() => {
//   return selectedItems
//     .map((item) => {
//       const itemProductId = item?.product?._id;

//       if (!itemProductId) {
//         return null;
//       }

//       const itemQuantity =
//         productId && quantity
//           ? quantity
//           : Number(item?.quantity || 0);

//       if (itemQuantity <= 0) {
//         return null;
//       }

//       return {
//         productId: itemProductId,
//         quantity: itemQuantity,
//       };
//     })
//     .filter(Boolean);
// }, [
//   selectedItems,
//   productId,
//   quantity,
// ]);

  // =====================================================
  // VENDOR
  // =====================================================

  const vendorId =
    selectedProduct?.vendor?._id ||
    selectedProduct?.vendor ||
    selectedProduct?.createdBy?._id ||
    selectedProduct?.createdBy ||
    "";

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = useMemo(() => {
    return selectedItems.reduce(
      (total, item) => {
        const price = Number(
          item?.product?.price || 0
        );

        const itemQuantity =
          productId && quantity
            ? quantity
            : Number(
                item?.quantity || 0
              );

        return (
          total +
          price * itemQuantity
        );
      },
      0
    );
  }, [
    selectedItems,
    productId,
    quantity,
  ]);

  // =====================================================
  // COUPON DISCOUNT
  // =====================================================

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) {
      return 0;
    }

    return Math.min(
      Number(
        appliedCoupon.discountAmount || 0
      ),
      subtotal
    );
  }, [
    appliedCoupon,
    subtotal,
  ]);

  // =====================================================
  // DISCOUNTED SUBTOTAL
  // =====================================================

  const discountedSubtotal =
    Math.max(
      0,
      subtotal - discountAmount
    );

  // =====================================================
  // SHIPPING
  // =====================================================

  const shippingCharge =
    discountedSubtotal > 500
      ? 0
      : 150;

  // =====================================================
  // FINAL TOTAL
  // =====================================================

  const total =
    discountedSubtotal +
    shippingCharge;

  // =====================================================
  // APPLY COUPON
  // =====================================================

  // const handleApplyCoupon =
  //   async () => {
  //     const code =
  //       couponCode.trim();

  //     if (!code) {
  //       return;
  //     }

  //     // if (!productId) {
  //     //   alert(
  //     //     "Coupon application currently requires a selected product."
  //     //   );
  //     //   return;
  //     // }

  //     if (!selectedProduct?._id) {
  //       alert(
  //         "Product information is not available."
  //       );
  //       return;
  //     }
  //       const productIds = selectedItems
  //   .map((item) => item?.product?._id)
  //   .filter(Boolean);

    
  // if (!productIds.length) {
  //   alert("Product information is not available.");
  //   return;
  // }

  //     try {
  //       await dispatch(
  //         applyCoupon({
  //           code,
  //           // vendor: vendorId,  
  //           productIds: productIds
  //             // selectedProduct._id,
  //         })
  //       ).unwrap();
  //     } catch (error) {
  //       console.error(
  //         "Coupon error:",
  //         error
  //       );
  //     }
  //   };

//   const handleApplyCoupon = async () => {
//   const code = couponCode.trim().toUpperCase();

//   if (!code) {
//     return;
//   }

//   if (!couponItems.length) {
//     alert("No products available for coupon.");
//     return;
//   }

//   try {
//     await dispatch(
//       applyCoupon({
//         code,
//         items: couponItems,
//       })
//     ).unwrap();
//   } catch (error) {
//     console.error("Coupon error:", error);
//   }
// };


const handleApplyCoupon = async () => {
  const code = couponCode.trim().toUpperCase();

  if (!code) {
    return;
  }

  const productIds = selectedItems
    .map((item) => item?.product?._id)
    .filter(Boolean);

  if (!productIds.length) {
    alert("No products available for coupon.");
    return;
  }

  console.log("Applying coupon:", {
    code,
    productIds,
  });

  try {
    await dispatch(
      applyCoupon({
        code,
        productIds,
      })
    ).unwrap();
  } catch (error) {
    console.error("Coupon error:", error);
  }
}


  // =====================================================
  // REMOVE COUPON
  // =====================================================

  const handleRemoveCoupon =
    () => {
      dispatch(
        clearAppliedCoupon()
      );

      setCouponCode("");
    };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // =================================================
    // CHECK PRODUCT
    // =================================================

    if (!selectedItems.length) {
      alert(
        "No product selected for order."
      );

      return;
    }

    // =================================================
    // VALIDATE ADDRESS
    // =================================================

    if (
      !formData.name ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode
    ) {
      alert(
        "Please enter/select a complete shipping address."
      );

      return;
    }

    try {
      // ===============================================
      // ORDER DATA
      // ===============================================

      // const orderData = {
      //   ...formData,

      //   productId:
      //     productId || undefined,

      //   quantity:
      //     productId
      //       ? quantity
      //       : undefined,

      //   // Send coupon code to backend.
      //   // Backend MUST validate it again.
      //   code:
      //     appliedCoupon?.couponCode || couponCode || 
      //     undefined,
      // };

      // console.log(
      //   "Sending order:",
      //   orderData
      // );

      const orderData = {
  ...formData,

  ...(productId
    ? {
        productId,
        quantity: quantity || 1,
      }
    : {}),

  ...(appliedCoupon?.couponCode
    ? {
        code: appliedCoupon.couponCode,
      }
    : couponCode.trim()
      ? {
          code: couponCode.trim(),
        }
      : {}),
};

console.log("🔥 SENDING ORDER:", orderData);


      // ===============================================
      // CREATE ORDER
      // ===============================================

      const createdOrder =
        await dispatch(
          createOrder(orderData)
        ).unwrap();

      console.log(
        "Order created:",
        createdOrder
      );

      if (!createdOrder?._id) {
        throw new Error(
          "Order was not created"
        );
      }

      // ===============================================
      // CREATE PAYMENT
      // ===============================================

      const paymentResult =
        await dispatch(
          createPayment({
            orderId:
              createdOrder._id,
          })
        ).unwrap();

      console.log(
        "Payment result:",
        paymentResult
      );

      // ===============================================
      // REDIRECT PAYMENT
      // ===============================================

      if (paymentResult?.url) {
        window.location.href =
          paymentResult.url;

        return;
      }

      throw new Error(
        "Payment URL was not received"
      );
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-20">
          <Loader2
            size={28}
            className="animate-spin text-blue-600"
          />
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="
              mb-4
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              transition
              hover:text-blue-600
            "
          >
            <ArrowLeft
              size={17}
            />

            Back to cart
          </button>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Select a saved address or
            enter a new shipping
            address.
          </p>

        </div>

      </section>

      {/* =================================================
          CHECKOUT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <form
          onSubmit={handleSubmit}
        >

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-6 lg:col-span-2">

              {/* =================================================
                  SHIPPING ADDRESS
              ================================================= */}

              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

                {/* HEADER */}

                <div className="border-b border-gray-100 p-5 sm:p-6">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                      "
                    >
                      <MapPin
                        size={20}
                      />
                    </div>

                    <div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        Shipping Address
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Where should we deliver your order?
                      </p>

                    </div>

                  </div>

                </div>

                {/* CONTENT */}

                <div className="p-5 sm:p-6">

                  {/* =================================================
                      SAVED ADDRESSES
                  ================================================= */}

                  <div className="mb-6">

                    <div className="mb-3 flex items-center justify-between">

                      <div>

                        <h3 className="text-sm font-semibold text-gray-900">
                          Saved Addresses
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Select an address to use
                          for this order.
                        </p>

                      </div>

                      {addressLoading && (
                        <Loader2
                          size={18}
                          className="animate-spin text-blue-600"
                        />
                      )}

                    </div>

                    {/* ADDRESS ERROR */}

                    {addressError && (
                      <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                        {addressError}
                      </div>
                    )}

                    {/* SAVED ADDRESS LIST */}

                    {addresses.length >
                    0 ? (
                      <div className="grid grid-cols-1 gap-3">

                        {addresses.map(
                          (
                            address
                          ) => {
                            const isSelected =
                              selectedAddressId ===
                              address._id;

                            return (
                              <button
                                key={
                                  address._id
                                }
                                type="button"
                                onClick={() =>
                                  handleSelectAddress(
                                    address._id
                                  )
                                }
                                className={`
                                  w-full
                                  rounded-xl
                                  border
                                  p-4
                                  text-left
                                  transition
                                  ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                                  }
                                `}
                              >

                                <div className="flex items-start gap-3">

                                  {/* ICON */}

                                  <div
                                    className={`
                                      mt-0.5
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      ${
                                        isSelected
                                          ? "bg-blue-600 text-white"
                                          : "bg-gray-100 text-gray-500"
                                      }
                                    `}
                                  >
                                    {isSelected ? (
                                      <CheckCircle2
                                        size={
                                          18
                                        }
                                      />
                                    ) : (
                                      <MapPin
                                        size={
                                          18
                                        }
                                      />
                                    )}
                                  </div>

                                  {/* INFO */}

                                  <div className="min-w-0 flex-1">

                                    <div className="flex items-center justify-between gap-3">

                                      <h4 className="font-semibold text-gray-900">
                                        {
                                          address.fullName
                                        }
                                      </h4>

                                      {isSelected && (
                                        <span className="shrink-0 text-xs font-semibold text-blue-600">
                                          Selected
                                        </span>
                                      )}

                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                      {
                                        address.addressLine
                                      }
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {
                                        address.city
                                      }
                                      ,{" "}
                                      {
                                        address.state
                                      }{" "}
                                      {
                                        address.pincode
                                      }
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                      {
                                        address.country
                                      }
                                    </p>

                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">

                                      <Phone
                                        size={
                                          13
                                        }
                                      />

                                      {
                                        address.phoneNumber
                                      }

                                    </div>

                                  </div>

                                </div>

                              </button>
                            );
                          }
                        )}

                      </div>
                    ) : (
                      !addressLoading && (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">

                          <MapPin
                            size={22}
                            className="mx-auto text-gray-400"
                          />

                          <p className="mt-2 text-sm font-medium text-gray-600">
                            No saved addresses
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Enter your address manually below.
                          </p>

                        </div>
                      )
                    )}

                  </div>

                  {/* =================================================
                      DIVIDER
                  ================================================= */}

                  {addresses.length >
                    0 && (
                    <div className="my-6 flex items-center gap-3">

                      <div className="h-px flex-1 bg-gray-200" />

                      <span className="text-xs font-medium text-gray-400">
                        OR ENTER A DIFFERENT ADDRESS
                      </span>

                      <div className="h-px flex-1 bg-gray-200" />

                    </div>
                  )}

                  {/* =================================================
                      FORM
                  ================================================= */}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    {/* NAME */}

                    <div className="sm:col-span-2">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Full Name
                      </label>

                      <div className="relative">

                        <User
                          size={18}
                          className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                          "
                        />

                        <input
                          type="text"
                          name="name"
                          value={
                            formData.name
                          }
                          onChange={
                            handleChange
                          }
                          required
                          placeholder="Enter your full name"
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            pl-10
                            pr-4
                            text-sm
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        />

                      </div>

                    </div>

                    {/* PHONE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>

                      <div className="relative">

                        <Phone
                          size={18}
                          className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                          "
                        />

                        <input
                          type="tel"
                          name="phone"
                          value={
                            formData.phone
                          }
                          onChange={
                            handleChange
                          }
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            pl-10
                            pr-4
                            text-sm
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        />

                      </div>

                    </div>

                    {/* COUNTRY */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Country
                      </label>

                      <input
                        type="text"
                        name="country"
                        value={
                          formData.country
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          px-4
                          text-sm
                          outline-none
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />

                    </div>

                    {/* ADDRESS */}

                    <div className="sm:col-span-2">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Address
                      </label>

                      <input
                        type="text"
                        name="addressLine1"
                        value={
                          formData.addressLine1
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="House number, street, area"
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          px-4
                          text-sm
                          outline-none
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />

                    </div>

                    {/* CITY */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={
                          formData.city
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="Enter city"
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          px-4
                          text-sm
                          outline-none
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />

                    </div>

                    {/* STATE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={
                          formData.state
                        }
                        onChange={
                          handleChange
                        }
                        required
                        placeholder="Enter state"
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          px-4
                          text-sm
                          outline-none
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />

                    </div>

                    {/* POSTAL CODE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>

                      <input
                        type="text"
                        name="postalCode"
                        value={
                          formData.postalCode
                        }
                        onChange={
                          handleChange
                        }
                        required
                        maxLength={6}
                        placeholder="Enter postal code"
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          px-4
                          text-sm
                          outline-none
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />

                    </div>

                  </div>

                  {/* SELECTED ADDRESS INFO */}

                  {selectedAddressId && (
                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">

                      <CheckCircle2
                        size={17}
                      />

                      <span>
                        Saved address selected.
                        You can still edit the
                        fields above if needed.
                      </span>

                    </div>
                  )}

                </div>

              </div>

              {/* =================================================
                  DELIVERY
              ================================================= */}

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-green-50
                      text-green-600
                    "
                  >
                    <Truck
                      size={21}
                    />
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Standard Delivery
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Your order will be delivered
                      to the address provided above.
                    </p>

                    {discountedSubtotal >
                    500 ? (
                      <p className="mt-2 text-sm font-medium text-green-600">
                        ✓ You qualify for free
                        shipping
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">
                        Add ₹
                        {Math.max(
                          0,
                          500 -
                            discountedSubtotal
                        ).toFixed(2)}{" "}
                        more to get free shipping.
                      </p>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT - ORDER SUMMARY
            ================================================= */}

            <div className="lg:col-span-1">

              <div
                className="
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  shadow-sm
                  lg:sticky
                  lg:top-6
                "
              >

                {/* =================================================
                    SUMMARY HEADER
                ================================================= */}

                <div className="border-b border-gray-100 p-5">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                      "
                    >
                      <ShoppingBag
                        size={20}
                      />
                    </div>

                    <div>

                      <h2 className="font-semibold text-gray-900">
                        Order Summary
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        {productId
                          ? "Selected product"
                          : "All cart products"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    SUMMARY CONTENT
                ================================================= */}

                <div className="p-5">

                  {/* =================================================
                      ITEMS
                  ================================================= */}

                  {selectedItems.length >
                  0 ? (
                    <div className="space-y-4">

                      {selectedItems.map(
                        (item) => {
                          const product =
                            item.product;

                          const itemQuantity =
                            productId &&
                            quantity
                              ? quantity
                              : item.quantity;

                          return (
                            <div
                              key={
                                item._id ||
                                product?._id
                              }
                              className="flex gap-3"
                            >

                              {/* IMAGE */}

                              <div
                                className="
                                  h-16
                                  w-16
                                  shrink-0
                                  overflow-hidden
                                  rounded-xl
                                  border
                                  border-gray-100
                                  bg-gray-50
                                "
                              >

                                {product
                                  ?.images
                                  ?.[0] ? (
                                  <img
                                    src={getImageUrl(
                                      product
                                        .images[0]
                                    )}
                                    alt={
                                      product.name
                                    }
                                    className="
                                      h-full
                                      w-full
                                      object-cover
                                    "
                                  />
                                ) : (
                                  <div
                                    className="
                                      flex
                                      h-full
                                      w-full
                                      items-center
                                      justify-center
                                      text-gray-400
                                    "
                                  >
                                    <ShoppingBag
                                      size={
                                        20
                                      }
                                    />
                                  </div>
                                )}

                              </div>

                              {/* INFO */}

                              <div className="min-w-0 flex-1">

                                <h3 className="truncate text-sm font-medium text-gray-900">
                                  {
                                    product?.name
                                  }
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                  Qty:{" "}
                                  {
                                    itemQuantity
                                  }
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  ₹
                                  {(
                                    Number(
                                      product?.price ||
                                        0
                                    ) *
                                    itemQuantity
                                  ).toFixed(
                                    2
                                  )}
                                </p>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  ) : (
                    <div className="py-8 text-center">

                      <ShoppingBag
                        size={30}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 text-sm text-gray-500">
                        Product not found.
                      </p>

                    </div>
                  )}

                  {/* =================================================
                      COUPON
                  ================================================= */}

                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <div className="mb-3 flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">

                        <Tag
                          size={17}
                        />

                      </div>

                      <div>

                        <h3 className="text-sm font-semibold text-gray-900">
                          Apply Coupon
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Enter a coupon code to
                          get a discount.
                        </p>

                      </div>

                    </div>

                    {/* APPLIED COUPON */}

                    {appliedCoupon ? (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-3">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <CheckCircle2
                                size={17}
                                className="shrink-0 text-green-600"
                              />

                              <span className="truncate text-sm font-bold text-green-700">
                                {
                                  appliedCoupon.couponCode
                                }
                              </span>

                            </div>

                            {appliedCoupon.name && (
                              <p className="mt-1 text-xs text-green-600">
                                {
                                  appliedCoupon.name
                                }
                              </p>
                            )}

                            <p className="mt-2 text-sm font-semibold text-green-700">
                              You saved ₹
                              {Number(
                                appliedCoupon.discountAmount ||
                                  0
                              ).toFixed(
                                2
                              )}
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={
                              handleRemoveCoupon
                            }
                            className="
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              text-gray-400
                              transition
                              hover:bg-red-100
                              hover:text-red-600
                            "
                            title="Remove coupon"
                          >
                            <X
                              size={16}
                            />
                          </button>

                        </div>

                      </div>
                    ) : (
                      <>
                        {/* INPUT */}

                        <div className="flex gap-2">

                          <input
                            type="text"
                            value={
                              couponCode
                            }
                            onChange={(
                              e
                            ) =>
                              setCouponCode(
                                e.target.value.toUpperCase()
                              )
                            }
                            onKeyDown={(
                              e
                            ) => {
                              if (
                                e.key ===
                                "Enter"
                              ) {
                                e.preventDefault();

                                handleApplyCoupon();
                              }
                            }}
                            placeholder="Enter coupon code"
                            disabled={
                              couponLoading
                            }
                            className="
                              h-11
                              min-w-0
                              flex-1
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              px-3
                              text-sm
                              uppercase
                              outline-none
                              transition
                              focus:border-blue-500
                              focus:ring-2
                              focus:ring-blue-100
                              disabled:bg-gray-100
                            "
                          />

                          <button
                            type="button"
                            onClick={
                              handleApplyCoupon
                            }
                            disabled={
                              couponLoading ||
                              !couponCode.trim() ||
                              !selectedProduct?._id
                            }
                            className="
                              h-11
                              rounded-xl
                              bg-gray-900
                              px-4
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-gray-800
                              disabled:cursor-not-allowed
                              disabled:bg-gray-300
                            "
                          >
                            {couponLoading ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              "Apply"
                            )}
                          </button>

                        </div>

                        {/* ERROR */}

                        {couponError && (
                          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                            {couponError}
                          </div>
                        )}

                        {/* HELPER */}

                        {!productId && (
                          <p className="mt-2 text-xs text-amber-600">
                            Coupons can currently be
                            applied when purchasing a
                            specific product.
                          </p>
                        )}

                      </>
                    )}

                  </div>

                  {/* =================================================
                      PRICE
                  ================================================= */}

                  <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">

                    {/* SUBTOTAL */}

                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-gray-900">
                        ₹
                        {subtotal.toFixed(
                          2
                        )}
                      </span>

                    </div>

                    {/* COUPON DISCOUNT */}

                    {discountAmount >
                      0 && (
                      <div className="flex justify-between text-sm">

                        <span className="text-green-600">
                          Coupon Discount
                        </span>

                        <span className="font-medium text-green-600">
                          -₹
                          {discountAmount.toFixed(
                            2
                          )}
                        </span>

                      </div>
                    )}

                    {/* SHIPPING */}

                    <div className="flex justify-between text-sm">

                      <span className="text-gray-500">
                        Shipping
                      </span>

                      <span
                        className={
                          shippingCharge ===
                          0
                            ? "font-medium text-green-600"
                            : "font-medium text-gray-900"
                        }
                      >
                        {shippingCharge ===
                        0
                          ? "Free"
                          : `₹${shippingCharge.toFixed(
                              2
                            )}`}
                      </span>

                    </div>

                    {/* TOTAL */}

                    <div className="flex justify-between border-t border-gray-100 pt-4">

                      <span className="font-semibold text-gray-900">
                        Total
                      </span>

                      <span className="text-xl font-bold text-gray-900">
                        ₹
                        {total.toFixed(
                          2
                        )}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      SAVINGS
                  ================================================= */}

                  {discountAmount >
                    0 && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3">

                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-green-600"
                      />

                      <p className="text-xs font-medium text-green-700">
                        You saved ₹
                        {discountAmount.toFixed(
                          2
                        )}{" "}
                        with this coupon.
                      </p>

                    </div>
                  )}

                  {/* =================================================
                      ERRORS
                  ================================================= */}

                  {(cartError ||
                    orderError ||
                    addressError) && (
                    <div
                      className="
                        mt-5
                        rounded-xl
                        border
                        border-red-100
                        bg-red-50
                        p-3
                        text-sm
                        text-red-600
                      "
                    >
                      {cartError ||
                        orderError ||
                        addressError ||
                        "Unable to place order."}
                    </div>
                  )}

                  {/* =================================================
                      PLACE ORDER
                  ================================================= */}

                  <button
                    type="submit"
                    disabled={
                      orderLoading ||
                      !selectedItems.length
                    }
                    className="
                      mt-5
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                      disabled:cursor-not-allowed
                      disabled:bg-gray-300
                    "
                  >

                    {orderLoading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CreditCard
                          size={18}
                        />

                        Place Order · ₹
                        {total.toFixed(
                          2
                        )}
                      </>
                    )}

                  </button>

                  {/* =================================================
                      SECURE CHECKOUT
                  ================================================= */}

                  <div className="mt-4 flex items-center justify-center gap-2">

                    <CheckCircle2
                      size={15}
                      className="text-green-500"
                    />

                    <p className="text-xs text-gray-500">
                      Secure checkout
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </form>

      </section>

    </main>
  );
}
