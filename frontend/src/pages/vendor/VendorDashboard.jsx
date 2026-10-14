import React, { useEffect,useState } from "react";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Wallet,
  Plus,
  Eye,
  Boxes,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  getVendorDashboard,
} from "../../redux/slices/vendorSlice";

import VendorStatCard from "../../components/vendor/VendorStatCard";
import QuickAction from "../../components/vendor/QuickActions";
import SalesOverview from "../../components/vendor/SalesOverview";
import OrderSummary from "../../components/vendor/OrderSummary";
import RecentOrders from "../../components/vendor/RecentOrders";
import InventoryAlerts from "../../components/vendor/InventoryAlerts";


export default function VendorDashboard() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
const [filter, setFilter] = useState("7days");


  const {
    stats,
    sales,
    recentOrders,
    inventoryAlerts,
    orderSummary,
    loading,
    error,
  } = useSelector(
    (state) => state.vendor
  );
console.log("inventoryAlerts",inventoryAlerts)


  /* ==========================================
      LOAD DASHBOARD
  ========================================== */

  useEffect(() => {
    dispatch(
      getVendorDashboard(filter)
    );
  }, [dispatch,filter]);


  /* ==========================================
      SAFE DATA
  ========================================== */

  const dashboardStats = {
    totalSales:
      stats?.totalSales ?? 0,

    totalOrders:
      stats?.totalOrders ?? 0,

    totalProducts:
      stats?.totalProducts ?? 0,

    netEarnings:
      stats?.netEarnings ?? 0,
  };


  const dashboardSales =
    sales || [];


  const dashboardOrders =
    recentOrders || [];
console.log("recentdashvemnd",dashboardOrders)

  const dashboardInventory =
    inventoryAlerts || [];


  const dashboardOrderSummary = {
    delivered:
      orderSummary?.delivered ?? 0,

    processing:
      orderSummary?.processing ?? 0,

      shipped:
      orderSummary?.shipped ?? 0,

    pending:
      orderSummary?.pending ?? 0,

    cancelled:
      orderSummary?.cancelled ?? 0,
  };


  /* ==========================================
      REFRESH
  ========================================== */

  const handleRefresh = () => {
    dispatch(
      getVendorDashboard()
    );
  };
console.log("dasbird invent",dashboardInventory)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7fc]">

      {/* Background decoration */}

      <div className="pointer-events-none absolute left-0 top-0 z-0 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-24 z-0 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />


      <main className="relative z-10 mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">


        {/* =========================================
            HEADER
        ========================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
              Vendor Panel
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor your store performance,
              sales and inventory.
            </p>

          </div>


          <button
            onClick={handleRefresh}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-xs
              font-bold
              text-slate-600
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:bg-indigo-50
              hover:text-indigo-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Data

          </button>

        </div>


        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-600">

            <RefreshCw
              size={17}
              className="animate-spin"
            />

            Loading dashboard data...

          </div>
        )}


        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <AlertTriangle size={17} />
              </div>

              <p className="text-xs font-medium text-red-600">
                {error}
              </p>

            </div>


            <button
              onClick={handleRefresh}
              className="text-left text-xs font-bold text-red-600 hover:text-red-700"
            >
              Try Again
            </button>

          </div>
        )}


        {/* =========================================
            STAT CARDS
        ========================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <VendorStatCard
            title="Total Sales"
            value={formatCurrency(
              dashboardStats.totalSales
            )}
            change="12.5%"
            trend="up"
            icon={
              <DollarSign size={20} />
            }
            gradient="from-[#4779F5] to-[#9B5DE5]"
          />


          <VendorStatCard
            title="Total Orders"
            value={dashboardStats.totalOrders.toLocaleString()}
            change="8.2%"
            trend="up"
            icon={
              <ShoppingCart size={20} />
            }
            gradient="from-[#24B9E8] to-[#4779F5]"
          />


          <VendorStatCard
            title="Total Products"
            value={dashboardStats.totalProducts.toLocaleString()}
            change="4 new"
            trend="up"
            icon={
              <Package size={20} />
            }
            gradient="from-[#EC5C8D] to-[#F49B58]"
          />


          <VendorStatCard
            title="Net Earnings"
            value={formatCurrency(
              dashboardStats.netEarnings
            )}
            change="10.4%"
            trend="up"
            icon={
              <Wallet size={20} />
            }
            gradient="from-[#3ED6A4] to-[#8DDC4D]"
          />

        </div>


        {/* =========================================
            QUICK ACTIONS
        ========================================= */}

        <div className="mb-6">

          <div className="mb-3">

            <h2 className="text-sm font-bold text-slate-800">
              Quick Actions
            </h2>

          </div>


          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <QuickAction
              icon={<Plus size={18} />}
              title="Add Product"
              color="indigo"
              onClick={() =>
                navigate(
                  "/create-product"
                )
              }
            />


            <QuickAction
              icon={
                <Eye size={18} />
              }
              title="View Orders"
              color="blue"
              onClick={() =>
                navigate(
                  "/vendor/orders"
                )
              }
            />


            <QuickAction
              icon={
                <Package size={18} />
              }
              title="Manage Products"
              color="violet"
              onClick={() =>
                navigate(
                  "/vendor/products"
                )
              }
            />


            <QuickAction
              icon={
                <Boxes size={18} />
              }
              title="Inventory"
              color="emerald"
              onClick={() =>
                navigate(
                  "/vendor/inventory"
                )
              }
            />

          </div>

        </div>


        {/* =========================================
            SALES + ORDER SUMMARY
        ========================================= */}

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

          <div className="xl:col-span-2">

            <SalesOverview
              data={
                dashboardSales
              }
               period={filter} setPeriod={setFilter}
            />

          </div>


          <OrderSummary
            summary={
              dashboardOrderSummary
            }
          />

        </div>


        {/* =========================================
            ORDERS + INVENTORY
        ========================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          <div className="xl:col-span-2">

            <RecentOrders
              orders={
                dashboardOrders
              }
              onViewAll={() =>
                navigate(
                  "/vendor/orders"
                )
              }
            />

          </div>


          <InventoryAlerts
            inventoryAlerts={
              dashboardInventory
            }
            onViewAll={() =>
              navigate(
                "/vendor/inventory"
              )
            }
          />

        </div>


        {/* =========================================
            FOOTER
        ========================================= */}

        <div className="mt-8 pb-4 text-center">

          <p className="text-[10px] text-slate-400">
            VendorHub Seller Dashboard
            • Store Management
          </p>

        </div>

      </main>

    </div>
  );
}


/* ============================================
   CURRENCY
============================================ */

function formatCurrency(value) {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN")}`;
}
