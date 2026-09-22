import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  BarChart3,
  Star,
  Wallet,
  Settings,
  HelpCircle,
  PlusCircle,
  X,
  ChevronRight,
  TicketPercent 
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function VendorSidebar({
  isOpen,
  setIsOpen,
}) {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/vendor",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      path: "/vendor/products",
      icon: Package,
    },
    {
      label: "Orders",
      path: "/vendor/orders",
      icon: ShoppingCart,
    },
    // {
    //   label: "Inventory",
    //   path: "/vendor/inventory",
    //   icon: Boxes,
    // },
    // {
    //   label: "Customers",
    //   path: "/vendor/customers",
    //   icon: Users,
    // },
    // {
    //   label: "Analytics",
    //   path: "/vendor/analytics",
    //   icon: BarChart3,
    // },
    // {
    //   label: "Reviews",
    //   path: "/vendor/reviews",
    //   icon: Star,
    // },
      {
      label: "Coupons",
      icon: TicketPercent ,
      path: "/vendor/coupons",
    },
    {
      label: "Payouts",
      path: "/vendor/payouts",
      icon: Wallet,
    },
   
  ];

  const bottomItems = [
    {
      label: "Settings",
      path: "/vendor/settings",
      icon: Settings,
    },
    // {
    //   label: "Help Center",
    //   path: "/vendor/help",
    //   icon: HelpCircle,
    // },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          overflow-hidden
          bg-linear-to-b
          from-[#4779F5]
          via-[#4D78F4]
          to-[#5279EC]
          text-white
          shadow-2xl
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================
            LOGO
        ================================= */}

        <div className="flex h-19 shrink-0 items-center justify-between border-b border-white/10 px-6">

          <NavLink
            to="/vendor"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur">
              <Package size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                VendorHub
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-100">
                Seller Panel
              </p>
            </div>
          </NavLink>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* =================================
            STORE PROFILE
        ================================= */}

        <div className="mx-4 mt-5 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#4779F5]">
              VS
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                My Store
              </p>

              <p className="mt-0.5 text-[11px] text-blue-100">
                Verified Vendor
              </p>
            </div>

          </div>

        </div>


        {/* =================================
            NAVIGATION
        ================================= */}

        <div className="mt-6 flex-1  overflow-y-auto px-4
         [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-white/30
    [&::-webkit-scrollbar-thumb:hover]:bg-white/50
         ">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/70">
            Main Menu
          </p>

          <nav className="space-y-1 ">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/vendor"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    transition-all
                    ${
                      isActive
                        ? "bg-white text-[#4779F5] shadow-lg shadow-blue-900/10"
                        : "text-blue-50 hover:bg-white/10 hover:text-white"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          ${
                            isActive
                              ? "bg-blue-50"
                              : "bg-white/10 group-hover:bg-white/15"
                          }
                        `}
                      >
                        <Icon size={17} />
                      </span>

                      <span className="flex-1">
                        {item.label}
                      </span>

                      {isActive && (
                        <ChevronRight size={15} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

          </nav>


          <p className="mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/70">
            Support
          </p>

          <nav className="space-y-1">

            {bottomItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-white text-[#4779F5]"
                        : "text-blue-50 hover:bg-white/10 hover:text-white"
                    }
                    `
                  }
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon size={17} />
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              );
            })}

          </nav>

        </div>


        {/* =================================
            ADD PRODUCT
        ================================= */}

        <div className="shrink-0 p-4">

          <NavLink
            to="/create-product"
            onClick={() => setIsOpen(false)}
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-white
              p-3
              text-[#4779F5]
              shadow-lg
              transition
              hover:-translate-y-0.5
              hover:shadow-xl
            "
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <PlusCircle size={18} />
            </div>

            <div>
              <p className="text-xs font-bold">
                Add New Product
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Grow your store
              </p>
            </div>

          </NavLink>

        </div>

      </aside>
    </>
  );
}
