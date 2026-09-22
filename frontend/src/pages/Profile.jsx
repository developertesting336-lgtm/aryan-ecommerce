import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
// import { useTheme } from "../context/ThemeContext";

import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Truck,
} from "lucide-react";

import {
  getOrders,
  getOrderItems,
} from "../redux/slices/orderSlice";

import { logout } from "../redux/slices/authSlice";

import {
  getAddresses,
} from "../redux/slices/addressSlice";
import { updateUser } from "../redux/slices/userSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {  wishlist } = useSelector(
    (state) => state.wishlist
  );
  // const { darkMode, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
console.log("wishlist pro",wishlist)
  // =====================================================
  // AUTH
  // =====================================================

  const { user } = useSelector((state) => state.auth);
const [showProfileForm, setShowProfileForm] = useState(false);
console.log("usrpro",user)
const [userDetails, setUserDetails] = useState({
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  firstName:user.firstName,
  lastName:user.lastName,
});

  // =====================================================
  // ORDERS
  // =====================================================

  const {
    orders = [],
    orderDetails = {
      orderItem: [],
      orderAddress: null,
    },
    loading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.order);

  // =====================================================
  // ADDRESSES
  // IMPORTANT: use "addresses", not "address"
  // =====================================================

  const {
    addresses = [],
    loading: addressLoading,
    error: addressError,
  } = useSelector((state) => state.address);

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  // =====================================================
  // LOAD ADDRESSES
  //
  // IMPORTANT:
  // Your previous code had:
  //
  // if (address.length) {
  //    dispatch(getAddresses())
  // }
  //
  // That is backwards.
  //
  // This effect always loads addresses when Profile mounts.
  // =====================================================

  useEffect(() => {
    dispatch(getAddresses());
  }, [dispatch]);

  // =====================================================
  // LOAD LATEST ORDER DETAILS
  // =====================================================

  useEffect(() => {
    if (!orders.length) {
      return;
    }

    // If address is already available from order details,
    // don't request it again.
    if (orderDetails?.orderAddress) {
      return;
    }

    const latestOrder = orders[0];

    const orderId =
      latestOrder?._id ||
      latestOrder?.id;

    if (orderId) {
      dispatch(getOrderItems(orderId));
    }
  }, [
    dispatch,
    orders,
    orderDetails?.orderAddress,
  ]);

const handleSaveUser = async (e) => {
  e.preventDefault();

  try {
    await dispatch(updateUser(userDetails)).unwrap();

    setShowProfileForm(false);
  } catch (error) {
    console.error("Update user failed:", error);
  }
};


  // =====================================================
  // USER
  // =====================================================

  const userName =
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "User";

  const userEmail =
    user?.email ||
    "No email available";

  const userPhone =
    user?.phone ||
    user?.phoneNumber ||
    "No phone number";

  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  // =====================================================
  // ORDER STATS
  // =====================================================

  const deliveredOrders = orders.filter(
    (order) =>
      order?.fulfillmentStatus?.toLowerCase() === "delivered"
  );

  const processingOrders = orders.filter(
    (order) =>
      order?.fulfillmentStatus?.toLowerCase() === "processing"
  );

  const shippedOrders = orders.filter(
    (order) =>
      order?.fulfillmentStatus?.toLowerCase() === "shipped"
  );

  const recentOrders = orders.slice(0, 3);

  // =====================================================
  // DEFAULT ADDRESS
  // =====================================================

  /*
    Your address objects from the checkout component look
    like this:

    {
      _id,
      fullName,
      phoneNumber,
      addressLine,
      city,
      state,
      pincode,
      country
    }

    Therefore the old rendering:

      defaultAddress.name
      defaultAddress.address
      defaultAddress.zipCode

    would not display your data.

    Use the actual address field names.
  */

  const defaultAddress =
    addresses.length > 0
      ? addresses[0]
      : orderDetails?.orderAddress || null;

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    const normalizedStatus =
      status?.toLowerCase();

    if (normalizedStatus === "delivered") {
      return {
        className:
          "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
        icon: CheckCircle2,
      };
    }

    if (normalizedStatus === "shipped") {
      return {
        className:
          "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        icon: Truck,
      };
    }

    return {
      className:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
      icon: Clock3,
    };
  };

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
    },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
      badge: orders.length,
      path: "/orders",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      path: "/wishlist",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      path: "/addresses",
    },
    {
      id: "payments",
      label: "Payment Methods",
      icon: CreditCard,
      path: "/payments",
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    orderLoading &&
    orders.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading profile...
          </p>

        </div>
      </main>
    );
  }

  // =====================================================
  // ORDER ERROR
  // =====================================================

  if (
    orderError &&
    orders.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">

        <div className="text-center">

          <p className="text-red-500">
            Failed to load orders.
          </p>

          <button
            type="button"
            onClick={() =>
              dispatch(getOrders())
            }
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-app-bg text-app-text transition-colors duration-300">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

          <h1 className="text-2xl font-bold sm:text-3xl">
            My Account
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage your profile, orders, wishlist and account settings.
          </p>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="lg:col-span-3">

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              {/* USER */}

              <div className="border-b border-gray-100 p-5 dark:border-gray-800">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                    {userInitials}
                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate font-semibold">
                      {userName}
                    </h2>

                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {userEmail}
                    </p>

                  </div>

                </div>

              </div>

              {/* NAVIGATION */}

              <nav className="p-3">

                {menuItems.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    location.pathname === item.path;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        navigate(item.path)
                      }
                      className={`group mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      }`}
                    >

                      <span className="flex items-center gap-3">

                        <Icon
                          size={18}
                          className={
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        />

                        {item.label}

                      </span>

                      <span className="flex items-center gap-2">

                        {item.badge > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              isActive
                                ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        <ChevronRight
                          size={16}
                          className={`transition-transform ${
                            isActive
                              ? "translate-x-0.5"
                              : "group-hover:translate-x-0.5"
                          }`}
                        />

                      </span>

                    </button>
                  );
                })}

                <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

                {/* THEME */}

                {/* <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${
                    darkMode ? "light" : "dark"
                  } mode`}
                  className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >

                  <span className="flex items-center gap-3">

                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                        darkMode
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-orange-50 text-orange-500"
                      }`}
                    >
                      {darkMode ? (
                        <Moon size={17} />
                      ) : (
                        <Sun size={17} />
                      )}
                    </span>

                    <span>
                      {darkMode
                        ? "Dark Mode"
                        : "Light Mode"}
                    </span>

                  </span>

                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                      darkMode
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >

                    <span
                      className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
                        darkMode
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    >

                      {darkMode ? (
                        <Moon
                          size={11}
                          className="text-blue-600"
                        />
                      ) : (
                        <Sun
                          size={11}
                          className="text-orange-500"
                        />
                      )}

                    </span>

                  </span>

                </button> */}

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={() => {
                    dispatch(logout());
                    navigate("/login");
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  Logout
                </button>

              </nav>

            </div>

          </aside>

          {/* =================================================
              MAIN
          ================================================= */}

          <div className="space-y-6 lg:col-span-9">

            {/* =================================================
                PROFILE
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                    {userInitials}
                  </div>

                  <div>

                    <h2 className="text-xl font-bold">
                      {userName}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {userEmail}
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Member since{" "}
                      {formatDate(
                        user?.createdAt
                      )}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                      setShowProfileForm(true)
                  }
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >

                  <Settings
                    size={16}
                    className="mr-2"
                  />

                  Edit Profile

                </button>

              </div>

            </div>

            {/* =================================================
                QUICK STATS
            ================================================= */}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

              {/* TOTAL */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <ShoppingBag size={19} />
                </div>

                <p className="mt-4 text-2xl font-bold">
                  {orders.length}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Total Orders
                </p>

              </div>

              {/* DELIVERED */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle2 size={19} />
                </div>

                <p className="mt-4 text-2xl font-bold">
                  {deliveredOrders.length}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Delivered
                </p>

              </div>

              {/* PROCESSING */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
                  <Clock3 size={19} />
                </div>

                <p className="mt-4 text-2xl font-bold">
                  {processingOrders.length}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Processing
                </p>

              </div>

              {/* WISHLIST */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                  <Heart size={19} />
                </div>

                <p className="mt-4 text-2xl font-bold">
                  {wishlist?.products?.length||0}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Wishlist
                </p>

              </div>

            </div>

            {/* =================================================
                RECENT ORDERS
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">

                <div>

                  <h2 className="font-bold sm:text-lg">
                    Recent Orders
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Track and manage your recent purchases.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/orders")
                  }
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View All
                </button>

              </div>

              {recentOrders.length === 0 ? (

                <div className="p-10 text-center">

                  <Package
                    size={35}
                    className="mx-auto text-gray-400"
                  />

                  <p className="mt-3 font-medium">
                    No orders yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Your recent orders will appear here.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-gray-100 dark:divide-gray-800">

                  {recentOrders.map((order) => {

                    const status =
                      getStatusStyle(
                        order.status
                      );

                    const StatusIcon =
                      status.icon;

                    return (
                      <div
                        key={order._id}
                        className="p-5 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:px-6"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              <Package size={18} />
                            </div>

                            <div>

                              <p className="font-semibold">
                                {order.orderNumber ||
                                  order._id}
                              </p>

                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">

                                {formatDate(
                                  order.createdAt ||
                                    order.date
                                )}

                                {" · "}

                                {order.items?.length ||
                                  order.orderItems?.length ||
                                  0}

                                {" items"}

                              </p>

                            </div>

                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">

                            <div className="text-left sm:text-right">

                              <p className="font-bold">

                                ₹
                                {Number(
                                  order.total ||
                                    order.amount ||
                                    order.totalAmount ||
                                    0
                                ).toFixed(2)}

                              </p>

                              <div
                                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                              >

                                <StatusIcon size={13} />

                                {order.status ||
                                  "Processing"}

                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/orders/${order._id}`
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:text-blue-400"
                            >
                              <ChevronRight size={17} />
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>

            {/* =================================================
                ACCOUNT INFORMATION
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* PERSONAL INFORMATION */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">

                <div className="flex items-center justify-between">

                  <h2 className="font-bold sm:text-lg">
                    Personal Information
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                       setShowProfileForm(true)
                    }
                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    Edit
                  </button>

                </div>

                <div className="mt-5 space-y-4">

                  <div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Full Name
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {userName}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email Address
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {userEmail}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone Number
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {userPhone}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  DEFAULT ADDRESS
              ================================================= */}

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="font-bold sm:text-lg">
                      Default Address
                    </h2>

                    {addressLoading && (
                      <p className="mt-1 text-xs text-blue-500">
                        Loading address...
                      </p>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/addresses")
                    }
                    className="text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    Manage
                  </button>

                </div>

                {/* ADDRESS ERROR */}

                {addressError && (
                  <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    {typeof addressError === "string"
                      ? addressError
                      : "Failed to load addresses."}
                  </div>
                )}

                {/* ADDRESS */}

                {defaultAddress ? (

                  <div className="mt-5 flex gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">

                      <MapPin size={18} />

                    </div>

                    <div className="min-w-0">

                      <p className="font-medium">

                        {defaultAddress.fullName ||
                          defaultAddress.name ||
                          userName}

                      </p>

                      {defaultAddress.phoneNumber && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {defaultAddress.phoneNumber}
                        </p>
                      )}

                      <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">

                        {defaultAddress.addressLine ||
                          defaultAddress.address ||
                          defaultAddress.addressLine1 ||
                          defaultAddress.street ||
                          ""}

                        <br />

                        {defaultAddress.city || ""}

                        {defaultAddress.state
                          ? `, ${defaultAddress.state}`
                          : ""}

                        {" "}

                        {defaultAddress.pincode ||
                          defaultAddress.zipCode ||
                          defaultAddress.postalCode ||
                          ""}

                        <br />

                        {defaultAddress.country ||
                          "India"}

                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="mt-5">

                    {addressLoading ? (

                      <div className="flex items-center gap-3">

                        <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />

                        <div className="space-y-2">

                          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                          <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                          <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                        </div>

                      </div>

                    ) : (

                      <>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No address available.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate("/addresses")
                          }
                          className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400"
                        >
                          Add an address
                        </button>

                      </>

                    )}

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </section>
{/* edit user  */}

{showProfileForm && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
    <div
      className="
        w-full
        max-w-lg
        overflow-hidden
        rounded-t-2xl
        bg-white
        shadow-2xl
        dark:bg-gray-900

        sm:rounded-2xl
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5 dark:border-gray-800">
        <div className="min-w-0 pr-4">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
            Edit Profile
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Update your personal information
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileForm(false)}
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-lg
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-gray-700
            dark:hover:bg-gray-800
          "
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Form Area */}
      <div className="max-h-[75vh] overflow-y-auto px-4 py-5 sm:max-h-[80vh] sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();

            console.log("Updated details:", userDetails);

            setShowProfileForm(false);
          }}
          className="space-y-4"
        >
          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>

              <input
                type="text"
                value={userDetails.firstName}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    firstName: e.target.value,
                  })
                }
                className="
                  w-full rounded-xl
                  border border-gray-200
                  bg-white px-4 py-2.5
                  text-sm text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                  dark:border-gray-700
                  dark:bg-gray-800
                  dark:text-white
                "
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>

              <input
                type="text"
                value={userDetails.lastName}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    lastName: e.target.value,
                  })
                }
                className="
                  w-full rounded-xl
                  border border-gray-200
                  bg-white px-4 py-2.5
                  text-sm text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                  dark:border-gray-700
                  dark:bg-gray-800
                  dark:text-white
                "
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              value={userDetails.fullName}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  fullName: e.target.value,
                })
              }
              className="
                w-full rounded-xl
                border border-gray-200
                bg-white px-4 py-2.5
                text-sm text-gray-900
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
                dark:border-gray-700
                dark:bg-gray-800
                dark:text-white
              "
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  email: e.target.value,
                })
              }
              className="
                w-full rounded-xl
                border border-gray-200
                bg-white px-4 py-2.5
                text-sm text-gray-900
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
                dark:border-gray-700
                dark:bg-gray-800
                dark:text-white
              "
              placeholder="Enter email"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>

            <input
              type="tel"
              value={userDetails.phone}
              onChange={(e) =>
                setUserDetails({
                  ...userDetails,
                  phone: e.target.value,
                })
              }
              className="
                w-full rounded-xl
                border border-gray-200
                bg-white px-4 py-2.5
                text-sm text-gray-900
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/20
                dark:border-gray-700
                dark:bg-gray-800
                dark:text-white
              "
              placeholder="Enter phone number"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowProfileForm(false)}
              className="
                w-full rounded-xl
                border border-gray-200
                px-5 py-2.5
                text-sm font-medium
                text-gray-700
                transition
                hover:bg-gray-50
                dark:border-gray-700
                dark:text-gray-300
                dark:hover:bg-gray-800
                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                w-full rounded-xl
                bg-blue-600
                px-5 py-2.5
                text-sm font-medium
                text-white
                transition
                hover:bg-blue-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/50
                sm:w-auto
              "
              onClick={handleSaveUser}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

    </main>
  );
}







