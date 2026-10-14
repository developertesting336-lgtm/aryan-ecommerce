import React from "react";

import {
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";

import StatusBadge from "./StatusBadge";

export default function RecentOrders({
  orders = [],
  onViewAll,
}) {
  const fallbackOrders = [
    {
      _id: "ORD-1024",
      customerName: "Rahul Sharma",
      productName: "Nike Air Max",
      amount: 2500,
      status: "Delivered",
    },
    {
      _id: "ORD-1023",
      customerName: "Amit Kumar",
      productName: "Sony Headphones",
      amount: 1200,
      status: "Pending",
    },
    {
      _id: "ORD-1022",
      customerName: "Priya Singh",
      productName: "Smart Watch",
      amount: 3499,
      status: "Shipped",
    },
    {
      _id: "ORD-1021",
      customerName: "Arjun Patel",
      productName: "Wireless Keyboard",
      amount: 1799,
      status: "Processing",
    },
  ];


  const list =
    orders.length > 0
      ? orders
      : fallbackOrders;


  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">

        <div>

          <div className="flex items-center gap-2">

            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

            <h2 className="text-base font-bold text-slate-900">
              Recent Orders
            </h2>

          </div>

          <p className="mt-1 text-xs text-slate-400">
            Your latest customer orders
          </p>

        </div>


        <button
          onClick={onViewAll}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
        >
          View All
          <ArrowUpRight size={13} />
        </button>

      </div>


      {/* =================================
          DESKTOP TABLE
      ================================= */}

      <div className="hidden overflow-x-auto md:block">

        <table className="w-full">

          <thead>

            <tr className="bg-slate-50/70">

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Order
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Product
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Amount
              </th>

              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            {list.slice(0, 5).map(
              (order) => (
                <tr
                  key={order._id}
                  className="border-t border-slate-100 transition hover:bg-indigo-50/30"
                >

                  <td className="px-6 py-4">

                    <span className="text-xs font-bold text-indigo-600">
                      #
                      {String(
                        order.orderNumber
                      ).slice(-6)}
                    </span>

                  </td>


                  <td className="px-6 py-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-100 text-[10px] font-bold text-indigo-600">
                        {getInitials(
                          order.user ||
                            order.customer?.name ||
                            "Customer"
                        )}
                      </div>

                      <span className="text-xs font-medium text-slate-700">
                        {order.user ||
                          order.customer?.name ||
                          "Customer"}
                      </span>

                    </div>

                  </td>


                  <td className="max-w-[180px] px-6 py-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <ShoppingBag size={14} />
                      </div>

                      <span className="truncate text-xs text-slate-600">
                        {order.productName ||
                          order.product?.name ||
                          "Product"}
                      </span>

                    </div>

                  </td>


                  <td className="px-6 py-4 text-xs font-bold text-slate-800">
                    ₹
                    {Number(
                      order.amount ||
                        order.totalAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>


                  <td className="px-6 py-4">
                    <StatusBadge
                      status={
                        order.status
                      }
                    />
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>


      {/* =================================
          MOBILE
      ================================= */}

      <div className="divide-y divide-slate-100 md:hidden">

        {list.slice(0, 5).map(
          (order) => (
            <div
              key={order._id}
              className="p-4"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex min-w-0 items-center gap-2">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                    {getInitials(
                      order.customerName ||
                        "Customer"
                    )}
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-bold text-slate-800">
                      #
                      {String(
                        order._id
                      ).slice(-6)}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {order.user ||
                        "Customer"}
                    </p>

                  </div>

                </div>

                <StatusBadge
                  status={
                    order.status
                  }
                />

              </div>


              <div className="mt-3 flex items-center justify-between">

                <span className="max-w-[180px] truncate text-[11px] text-slate-500">
                  {order.productName ||
                    order.product?.name ||
                    "Product"}
                </span>

                <span className="text-xs font-bold text-slate-800">
                  ₹
                  {Number(
                    order.amount ||
                      order.totalAmount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}


/* ============================================
   HELPERS
============================================ */

function getInitials(name) {
  return String(name)
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
