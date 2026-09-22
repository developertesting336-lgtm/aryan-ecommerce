import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess, showError } from "../utils/toast";

// ============================================
// ROUTE / LAYOUT COMPONENTS
// ============================================

import ProtectedRoute from "../components/ProtectedRoute";

import Layout from "../layouts/Layout";
import AdminLayout from "../layouts/AdminLayout";
import VendorLayout from "../layouts/VendorLayout";

// ============================================
// AUTH PAGES
// ============================================

import Login from "../pages/Login";
import RegisterPage from "../pages/register";

// ============================================
// CUSTOMER PAGES
// ============================================

import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Wishlist from "../pages/WishList";
import Profile from "../pages/Profile";
import Addresses from "../pages/Addresses";
import CategoriesPage from "../pages/Categories";
import SearchPage from "../pages/SearchProducts";
import CreateProduct from "../pages/CreateProduct";
import CreateOrder from "../pages/CreateOrder";

import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import PaymentSuccess from "../pages/PaymentSuccess";

// ============================================
// ADMIN PAGES
// ============================================

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminProducts from "../pages/admin/AdminProducts";

import CreateCategory from "../pages/admin/CreateCategory";
import Categories from "../pages/admin/Categories";
import CategoryDetails from "../pages/admin/CategoryDetails";

import EditProduct from "../pages/EditProduct";
import AdminOrderDetails from "../pages/admin/AdminOrderDetails";

// coupons
import Coupons from "../pages/vendor/coupons/Coupons";
import CreateCoupon from "../pages/vendor/coupons/CreateCoupon";
import EditCoupon from "../pages/vendor/coupons/EditCoupon";
import CouponDetails from "../pages/vendor/coupons/CouponDetails";
// ============================================
// VENDOR PAGES
// ============================================

import VendorDashboard from "../pages/vendor/VendorDashboard";
import VendorProducts from "../pages/vendor/VendorProducts";

// ============================================
// REDUX
// ============================================

import { getCart } from "../redux/slices/cartSlice";
import { getWishlist } from "../redux/slices/wishlistSlice";
import { getRootCategories } from "../redux/slices/categorySlice";

import { TestConnection } from "../App";
import VendorOrders from "../pages/vendor/VendorOrders";

// ============================================================
// APP ROUTES
// ============================================================

function AppRoutes() {
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  // ============================================================
  // INITIAL CUSTOMER DATA
  // ============================================================

  useEffect(() => {
    if (!token) return;

    dispatch(getCart());
    dispatch(getWishlist());
    dispatch(getRootCategories());
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================================
            AUTH ROUTES
        ====================================================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<RegisterPage />} />

        {/* ======================================================
            CUSTOMER / SHOP
        ====================================================== */}

        <Route element={<Layout />}>
          {/* -----------------------------
              PUBLIC CUSTOMER PAGES
          ----------------------------- */}

          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* -----------------------------
              PROTECTED CUSTOMER PAGES
          ----------------------------- */}

          <Route
            element={<ProtectedRoute isAuthenticated={!!token} user={user} />}
          >
            <Route path="/cart" element={<Cart />} />

            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/addresses" element={<Addresses />} />

            <Route path="/checkout/" element={<CreateOrder />} />

            <Route path="/orders" element={<Orders />} />

            <Route path="/orders/:orderId" element={<OrderDetails />} />

            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Route>
        </Route>

        {/* ======================================================
            ADMIN ROUTES
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={!!token}
              user={user}
              allowedRoles={["admin"]}
            />
          }
        >
          {/* -----------------------------
              ADMIN LAYOUT
          ----------------------------- */}

          <Route path="/admin" element={<AdminLayout />}>
            {/* /admin */}
            <Route index element={<AdminDashboard />} />

            {/* /admin/dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* /admin/users */}
            <Route path="users" element={<AdminUsers />} />

            {/* /admin/orders */}
            <Route path="orders" element={<AdminOrders />} />

            {/* /admin/orders/:orderId */}
            <Route path="orders/:orderId" element={<AdminOrderDetails />} />

            {/* /admin/products */}
            <Route path="products" element={<AdminProducts />} />

            {/* /admin/categories */}
            <Route path="categories" element={<Categories />} />
            {/* ADMIN COUPONS */}
            <Route path="coupons" element={<Coupons />} />

            <Route path="coupons/create" element={<CreateCoupon />} />

            <Route path="coupons/:id" element={<CouponDetails />} />

            <Route path="coupons/:id/edit" element={<EditCoupon />} />
          </Route>

          {/* -----------------------------
              ADMIN STANDALONE PAGES
          ----------------------------- */}

          <Route path="/create-category" element={<CreateCategory />} />
          <Route path="/categories/:id" element={<CategoryDetails />} />
        </Route>

        {/* ======================================================
            CREATE PRODUCT
            ADMIN + VENDOR
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={!!token}
              user={user}
              allowedRoles={["admin", "vendor"]}
            />
          }
        >
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="orders/:orderId" element={<AdminOrderDetails />} />
        </Route>

        {/* ======================================================
            VENDOR ROUTES
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={!!token}
              user={user}
              allowedRoles={["vendor"]}
            />
          }
        >
          {/* ====================================================
              VENDOR LAYOUT
          ==================================================== */}

          <Route path="/vendor" element={<VendorLayout />}>
            {/* --------------------------------
                /vendor
                Vendor Dashboard
            -------------------------------- */}

            <Route index element={<VendorDashboard />} />

            {/* --------------------------------
                /vendor/dashboard
            -------------------------------- */}

            <Route path="dashboard" element={<VendorDashboard />} />

            {/* --------------------------------
                /vendor/products
            -------------------------------- */}

            <Route path="products" element={<VendorProducts />} />

            {/* --------------------------------
                /vendor/orders
            -------------------------------- */}

            <Route path="orders" element={<VendorOrders />} />

            <Route path="orders/:orderId" element={<AdminOrderDetails />} />

            {/* --------------------------------
                /vendor/inventory
            -------------------------------- */}

            <Route
              path="inventory"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Inventory</h1>
                </div>
              }
            />

            {/* --------------------------------
                /vendor/customers
            -------------------------------- */}

            <Route
              path="customers"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Customers</h1>
                </div>
              }
            />

            {/* --------------------------------
                /vendor/analytics
            -------------------------------- */}

            <Route
              path="analytics"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Analytics</h1>
                </div>
              }
            />

            {/* --------------------------------
                /vendor/reviews
            -------------------------------- */}

            <Route
              path="reviews"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Reviews</h1>
                </div>
              }
            />

            {/* --------------------------------
                /vendor/payouts
            -------------------------------- */}

            <Route
              path="payouts"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Payouts</h1>
                </div>
              }
            />

            {/* --------------------------------
                /vendor/settings
            -------------------------------- */}

            <Route
              path="settings"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Settings</h1>
                </div>
              }
            />

            {/* --------------------------------
                /vendor/help
            -------------------------------- */}

            <Route
              path="help"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Help Center</h1>
                </div>
              }
            />

            <Route path="coupons" element={<Coupons />} />

            <Route path="coupons/create" element={<CreateCoupon />} />

            <Route path="coupons/:id" element={<CouponDetails />} />

            <Route path="coupons/:id/edit" element={<EditCoupon />} />
          </Route>
        </Route>

        {/* ======================================================
            HEALTH CHECK
        ====================================================== */}

        <Route path="/health" element={<TestConnection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
