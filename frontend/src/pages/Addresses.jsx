import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  Home,
} from "lucide-react";

import { logout } from "../redux/slices/authSlice";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  clearAddAddressStatus,
  clearUpdateAddressStatus,
} from "../redux/slices/addressSlice";

import { indianStates } from "../constants/indianStates";
  const emptyAddress = {
    fullName: "",
    phoneNumber: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  };
  const AddressForm = ({
  data,
  onChange,
  onSubmit,
  submitText,
  loading: formLoading,
  onCancel,
  isEdit = false,
  updateError,
  addError,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* FULL NAME + PHONE */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        {/* FULL NAME */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            value={data.fullName}
            onChange={onChange}
            placeholder="Enter full name"
            required
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-600"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone Number
          </label>

          <div className="relative">
            <Phone
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="tel"
              name="phoneNumber"
              value={data.phoneNumber}
              onChange={onChange}
              placeholder="9876543210"
              required
              maxLength={10}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* ADDRESS */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Address
        </label>

        <input
          type="text"
          name="addressLine"
          value={data.addressLine}
          onChange={onChange}
          placeholder="House no., street, area"
          required
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-600"
        />
      </div>

      {/* CITY + STATE */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        {/* CITY */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            City
          </label>

          <input
            type="text"
            name="city"
            value={data.city}
            onChange={onChange}
            placeholder="Enter city"
            required
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-600"
          />
        </div>

        {/* STATE */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            State
          </label>

          <select
            name="state"
            value={data.state}
            onChange={onChange}
            required
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950"
          >
            <option value="">
              Select state
            </option>

            {indianStates.map((state) => (
              <option
                key={state}
                value={state}
              >
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PINCODE + COUNTRY */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        {/* PINCODE */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Pincode
          </label>

          <input
            type="text"
            name="pincode"
            value={data.pincode}
            onChange={onChange}
            placeholder="000000"
            required
            maxLength={6}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-600"
          />
        </div>

        {/* COUNTRY */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Country
          </label>

          <input
            type="text"
            name="country"
            value={data.country}
            disabled
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 text-sm text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          />
        </div>
      </div>

      {/* ERRORS */}
      {isEdit && updateError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {updateError}
        </div>
      )}

      {!isEdit && addError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {addError}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <X size={16} className="mr-2" />
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={formLoading}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {formLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              {isEdit ? (
                <Save size={16} className="mr-2" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}

              {submitText}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
export default function Addresses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // THEME
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // =====================================================
  // REDUX
  // =====================================================

  const {
    addresses = [],
    loading,
    error,

    addLoading,
    addError,
    addSuccess,

    updateLoading,
    updateError,
    updateSuccess,

    deleteLoading,
    deleteError,
  } = useSelector((state) => state.address);

  const { user } = useSelector((state) => state.auth);

  // =====================================================
  // LOCAL STATE
  // =====================================================



  const [formData, setFormData] = useState(emptyAddress);

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState(emptyAddress);

  const [showAddForm, setShowAddForm] = useState(false);

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  useEffect(() => {
    dispatch(getAddresses());
  }, [dispatch]);

  // =====================================================
  // THEME
  // =====================================================

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // =====================================================
  // CLEAR SUCCESS
  // =====================================================

  useEffect(() => {
    if (addSuccess) {
      setFormData(emptyAddress);
      setShowAddForm(false);

      const timer = setTimeout(() => {
        dispatch(clearAddAddressStatus());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [addSuccess, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setEditingId(null);

      const timer = setTimeout(() => {
        dispatch(clearUpdateAddressStatus());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  // =====================================================
  // USER
  // =====================================================

  const userName =
    user?.name ||
    `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim() ||
    "User";

  const userEmail =
    user?.email || "No email available";

  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();

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
      badge: addresses.length,
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
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD ADDRESS
  // =====================================================

  const handleAddAddress = (e) => {
    e.preventDefault();

    dispatch(addAddress(formData));
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const handleStartEdit = (address) => {
    setEditingId(address._id);

    setEditForm({
      fullName: address.fullName || "",
      phoneNumber: address.phoneNumber || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // UPDATE ADDRESS
  // =====================================================

  const handleUpdateAddress = (e, addressId) => {
    e.preventDefault();

    dispatch(
      updateAddress({
        addressId,
        addressData: editForm,
      })
    );
  };

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const handleDeleteAddress = (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    dispatch(deleteAddress(addressId));
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyAddress);
  };

  // =====================================================
  // FORM COMPONENT
  // =====================================================

 

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && addresses.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Loading addresses...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            My Addresses
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage your saved delivery addresses.
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

              {/* NAV */}

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

                <button
                  type="button"
                  onClick={() =>
                    setDarkMode((prev) => !prev)
                  }
                  className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-3">

                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
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
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      darkMode
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform ${
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
                          className="text-yellow-500"
                        />
                      )}
                    </span>
                  </span>
                </button>

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
                ADD ADDRESS
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="font-bold sm:text-lg">
                      Add New Address
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                      Save a new delivery address to your account.
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddForm((prev) => !prev)
                  }
                  className="flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {showAddForm ? (
                    <>
                      <X size={16} className="mr-2" />
                      Close
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Add Address
                    </>
                  )}
                </button>

              </div>

              {showAddForm && (
                <div className="p-5 sm:p-6">

                  {addSuccess && (
                    <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-500/10 dark:text-green-400">
                      Address added successfully.
                    </div>
                  )}

                 <AddressForm
  data={formData}
  onChange={handleInputChange}
  onSubmit={handleAddAddress}
  submitText="Save Address"
  loading={addLoading}
  addError={addError}
/>

                </div>
              )}

            </div>

            {/* =================================================
                ADDRESS HEADER
            ================================================= */}

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  Saved Addresses
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {addresses.length}{" "}
                  {addresses.length === 1
                    ? "address"
                    : "addresses"}{" "}
                  saved
                </p>
              </div>

              {loading && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              )}

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {/* =================================================
                DELETE ERROR
            ================================================= */}

            {deleteError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {deleteError}
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Home size={25} />
                </div>

                <h3 className="mt-4 font-semibold">
                  No saved addresses
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                  Add your first delivery address so you can check out faster.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddForm(true)
                  }
                  className="mt-5 inline-flex h-10 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Address
                </button>

              </div>
            ) : (

              /* =================================================
                 ADDRESS LIST
              ================================================= */

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                {addresses.map((address, index) => {

                  const isEditing =
                    editingId === address._id;

                  return (
                    <div
                      key={address._id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >

                      {isEditing ? (

                        /* =========================================
                           EDIT FORM
                        ========================================= */

                        <div>

                          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                <Pencil size={16} />
                              </div>

                              <h3 className="font-semibold">
                                Edit Address
                              </h3>

                            </div>

                            <button
                              type="button"
                              onClick={
                                handleCancelEdit
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                            >
                              <X size={17} />
                            </button>

                          </div>

                          <div className="p-5">

                            <AddressForm
  data={editForm}
  onChange={handleEditInputChange}
  onSubmit={(e) =>
    handleUpdateAddress(e, address._id)
  }
  submitText="Update Address"
  loading={updateLoading}
  onCancel={handleCancelEdit}
  isEdit
  updateError={updateError}
/>

                          </div>

                        </div>

                      ) : (

                        /* =========================================
                           ADDRESS VIEW
                        ========================================= */

                        <div>

                          {/* CARD HEADER */}

                          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                <MapPin size={18} />
                              </div>

                              <div>

                                <h3 className="font-semibold">
                                  Address{" "}
                                  {index + 1}
                                </h3>

                                {index === 0 && (
                                  <span className="mt-1 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:bg-green-500/10 dark:text-green-400">
                                    First saved address
                                  </span>
                                )}

                              </div>

                            </div>

                            <div className="flex items-center gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    address
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                title="Edit address"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAddress(
                                    address._id
                                  )
                                }
                                disabled={
                                  deleteLoading
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                title="Delete address"
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>

                          </div>

                          {/* ADDRESS CONTENT */}

                          <div className="p-5">

                            <h4 className="font-semibold">
                              {address.fullName}
                            </h4>

                            <div className="mt-3 space-y-2">

                              <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">

                                <Home
                                  size={16}
                                  className="mt-0.5 shrink-0"
                                />

                                <span className="leading-6">
                                  {address.addressLine}
                                  <br />

                                  {address.city},{" "}
                                  {address.state}{" "}
                                  {address.pincode}
                                  <br />

                                  {address.country}
                                </span>

                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">

                                <Phone
                                  size={16}
                                  className="shrink-0"
                                />

                                <span>
                                  {address.phoneNumber}
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}