import React from "react";

import {
  AlertTriangle,
  Package,
  ArrowUpRight,
} from "lucide-react";

export default function InventoryAlerts({
  inventoryAlerts = [],
  onViewAll,
}) {
  const fallbackProducts = [
    {
      _id: "1",
      name: "iPhone 15",
      stock: 0,
    },
    {
      _id: "2",
      name: "Nike Air Max",
      stock: 3,
    },
    {
      _id: "3",
      name: "Sony Headphones",
      stock: 5,
    },
    {
      _id: "4",
      name: "Smart Watch",
      stock: 2,
    },
  ];


  const list = inventoryAlerts
    // inventoryAlerts.length > 0
    //   ? inventoryAlerts
    //   : fallbackProducts;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

      {/* =================================
          HEADER
      ================================= */}

      <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-gray-800">

        <div>

          <div className="flex items-center gap-2">

            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />

            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Inventory Alerts
            </h2>

          </div>

          <p className="mt-1 text-xs text-slate-400 dark:text-gray-400">
            Products requiring attention
          </p>

        </div>


        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View All
          <ArrowUpRight size={13} />
        </button>

      </div>


      {/* =================================
          PRODUCTS
      ================================= */}

      <div className="divide-y divide-slate-100 dark:divide-gray-800">

        {list.slice(0, 5).map(
          (product) => {

            const stock = Number(
              product.stock ?? 0
            );

            const outOfStock =
              stock === 0;

            const critical =
              stock > 0 && stock <= 3;


            return (
              <div
                key={product._id}
                className="flex items-center gap-3 p-4 transition hover:bg-slate-50 dark:hover:bg-gray-800/50"
              >

                {/* Icon */}

                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      outOfStock
                        ? "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400"
                    }
                  `}
                >
                  {outOfStock ? (
                    <AlertTriangle size={17} />
                  ) : (
                    <Package size={17} />
                  )}
                </div>


                {/* Product */}

                <div className="min-w-0 flex-1">

                  <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
                    {product.name}
                  </p>

                  <p
                    className={`
                      mt-1
                      text-[10px]
                      font-medium
                      ${
                        outOfStock
                          ? "text-red-500 dark:text-red-400"
                          : critical
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-emerald-500 dark:text-emerald-400"
                      }
                    `}
                  >
                    {outOfStock
                      ? "Out of stock"
                      : critical
                      ? "Low stock"
                      : "Available"}
                  </p>

                </div>


                {/* Stock */}

                <div className="text-right">

                  <p className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-gray-400">
                    Stock
                  </p>

                  <p
                    className={`
                      mt-0.5
                      text-sm
                      font-bold
                      ${
                        outOfStock
                          ? "text-red-500 dark:text-red-400"
                          : critical
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-slate-800 dark:text-white"
                      }
                    `}
                  >
                    {stock}
                  </p>

                </div>

              </div>
            );
          }
        )}

      </div>


      {/* =================================
          FOOTER
      ================================= */}

      <div className="border-t border-slate-100 p-4 dark:border-gray-800">

        <button
          onClick={onViewAll}
          className="
            w-full
            rounded-xl
            bg-gradient-to-r
            from-indigo-50
            to-violet-50
            py-2.5
            text-xs
            font-bold
            text-indigo-600
            transition
            hover:from-indigo-100
            hover:to-violet-100
            dark:from-indigo-950/50
            dark:to-violet-950/50
            dark:text-indigo-300
            dark:hover:from-indigo-900/50
            dark:hover:to-violet-900/50
          "
        >
          Manage Inventory
        </button>

      </div>

    </div>
  );
}
