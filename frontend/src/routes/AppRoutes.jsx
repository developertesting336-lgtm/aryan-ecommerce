import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// ============================================
// ROUTE / LAYOUT COMPONENTS
// ============================================

import ScrollToTop from "../components/ScrollToTop";
import ProtectedRoute from "../components/ProtectedRoute";

import Layout from "../layouts/Layout";
import AdminLayout from "../layouts/AdminLayout";
import VendorLayout from "../layouts/VendorLayout";

// ============================================
// LAZY LOADED ROUTE PAGES
// ============================================

// Auth Pages
const Login = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));

// Customer Pages
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart"));
const Wishlist = lazy(() => import("../pages/WishList"));
const Profile = lazy(() => import("../pages/Profile"));
const Addresses = lazy(() => import("../pages/Addresses"));
const CategoriesPage = lazy(() => import("../pages/Categories"));
const SearchPage = lazy(() => import("../pages/SearchProducts"));
const CreateProduct = lazy(() => import("../pages/CreateProduct"));
const CreateOrder = lazy(() => import("../pages/CreateOrder"));
const Orders = lazy(() => import("../pages/Orders"));
const OrderDetails = lazy(() => import("../pages/OrderDetails"));
const OrderTracking = lazy(() => import("../pages/OrderTracking"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Contact = lazy(() => import("../components/Contact"));
const Help = lazy(() => import("../pages/Help"));

// Admin Pages (heavy components + charting)
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const CreateCategory = lazy(() => import("../pages/admin/CreateCategory"));
const Categories = lazy(() => import("../pages/admin/Categories"));
const CategoryDetails = lazy(() => import("../pages/admin/CategoryDetails"));
const EditProduct = lazy(() => import("../pages/EditProduct"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails"));
const AdminContent = lazy(() => import("../pages/admin/AdminContent"));

// Admin Homepage Content Management
const HeroManagement = lazy(() => import("../pages/admin/content/homepage/HeroManagement"));
const PromoCardsManagement = lazy(() => import("../pages/admin/content/homepage/PromoCardsManagement"));
const PromoGridManagement = lazy(() => import("../pages/admin/content/homepage/PromoGridManagement"));
const ShopByNeedManagement = lazy(() => import("../pages/admin/content/homepage/ShopByNeedManagement"));

// Vendor Pages
const VendorDashboard = lazy(() => import("../pages/vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("../pages/vendor/VendorProducts"));
const VendorOrders = lazy(() => import("../pages/vendor/VendorOrders"));
const Coupons = lazy(() => import("../pages/vendor/coupons/Coupons"));
const CreateCoupon = lazy(() => import("../pages/vendor/coupons/CreateCoupon"));
const EditCoupon = lazy(() => import("../pages/vendor/coupons/EditCoupon"));
const CouponDetails = lazy(() => import("../pages/vendor/coupons/CouponDetails"));

// ============================================
// REDUX
// ============================================

import { getCart } from "../redux/slices/cartSlice";
import { getWishlist } from "../redux/slices/wishlistSlice";
import { getRootCategories } from "../redux/slices/categorySlice";
import { mergeGuestCart, enrichGuestCart } from "../utils/guestCart";

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
    if (!token) {
      enrichGuestCart(dispatch);
      return;
    }

    mergeGuestCart(dispatch);
    dispatch(getCart());
    dispatch(getWishlist());
    dispatch(getRootCategories());
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      {/* Automatically smooth-scrolls to top on page navigation */}
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        }
      >
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
          <Route path="/privacy-policy" element={<PrivacyPolicy />}/>
          <Route path="/contact" element={<Contact />}/>
          <Route path="/help" element={<Help />} />
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
            <Route path="/orders/:orderId/tracking" element={<OrderTracking />}/>

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
             {/* ==================================================
                CONTENT MANAGEMENT
            ================================================== */}

            {/* --------------------------------
                /admin/content
                Content CMS Dashboard
            -------------------------------- */}

            <Route
              path="content"
              element={<AdminContent />}
            />

            {/* --------------------------------
                HOMEPAGE CONTENT
            -------------------------------- */}

            {/* /admin/content/hero */}
            <Route
              path="content/hero"
              element={<HeroManagement />}
            />

            {/* /admin/content/promo-cards */}
            <Route
              path="content/promo-cards"
              element={<PromoCardsManagement />}
            />

            {/* /admin/content/promo-grid */}
            <Route
              path="content/promo-grid"
              element={<PromoGridManagement />}
            />

            {/* /admin/content/shop-by-need */}
            <Route
              path="content/shop-by-need"
              element={<ShopByNeedManagement />}
            />
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

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
