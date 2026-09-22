import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminProducts } from "../../redux/slices/adminSlice";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.admin.products || []
  );

  const stats = useSelector(
    (state) => state.admin.stats || {}
  );

  const loading = useSelector(
    (state) => state.admin.loading
  );

  const error = useSelector(
    (state) => state.admin.error
  );

  const productList = products;

  const filteredProducts = productList.filter((product) => {
    const searchTerm = search.toLowerCase();

    const productName = String(
      product.name || ""
    ).toLowerCase();

    const productCategory = String(
      product.category || ""
    ).toLowerCase();

    const matchesSearch =
      productName.includes(searchTerm) ||
      productCategory.includes(searchTerm);

    const matchesCategory =
      category === "All" ||
      product.category === category;

    const matchesStatus =
      status === "All" ||
      product.status === status;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });

  const totalProducts = stats.totalProducts || 0;
  const activeProducts = stats.activeProducts || 0;
  const outOfStockProducts =
    stats.outofStocksProducts || 0;
  const lowStockProducts =
    stats.lowStockProducts || 0;

  useEffect(() => {
    dispatch(
      getAdminProducts({
        page: currentPage,
        limit: 4,
      })
    );
  }, [dispatch, currentPage]);

  return (
    <div
      className="
        min-h-screen
        bg-(--admin-bg)
        text-(--admin-text)
      "
    >
      <main
        className="
          mx-auto
          w-full
          max-w-375
          p-4
          sm:p-6
          lg:p-8
        "
      >
        {/* Header */}
        <div
          className="
            mb-6
            flex flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-(--admin-text)
              "
            >
              Products
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-(--admin-text-muted)
              "
            >
              Manage your ecommerce products
            </p>
          </div>

          <button
            onClick={() => navigate("/create-product")}
            className="
              rounded-lg
              bg-(--admin-primary)
              px-4 py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-(--admin-primary-hover)
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            + Add Product
          </button>
        </div>

        {/* Stats */}
        <div
          className="
            mb-6
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <ProductStat
            title="Total Products"
            value={totalProducts}
            icon="📦"
            color="purple"
          />

          <ProductStat
            title="Active Products"
            value={activeProducts}
            icon="🟢"
            color="green"
          />

          <ProductStat
            title="Low Stock"
            value={lowStockProducts}
            icon="⚠️"
            color="orange"
          />

          <ProductStat
            title="Out of Stock"
            value={outOfStockProducts}
            icon="🚫"
            color="red"
          />
        </div>

        {/* Products Card */}
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-(--admin-border)
            bg-(--admin-surface)
            shadow-(--admin-card-shadow)
          "
        >
          {/* Toolbar */}
          <div
            className="
              flex flex-col gap-4
              border-b
              border-(--admin-border)
              p-5
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div>
              <h2
                className="
                  font-semibold
                  text-(--admin-text)
                "
              >
                All Products
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-(--admin-text-muted)
                "
              >
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div
                className="
                  flex h-10
                  w-full
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  transition
                  focus-within:border-(--admin-primary)
                  sm:w-64
                "
              >
                <span
                  className="
                    text-sm
                    text-(--admin-text-muted)
                  "
                >
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-(--admin-text)
                    outline-none
                    placeholder:text-(--admin-text-muted)
                  "
                />
              </div>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  h-10
                  rounded-lg
                  border
                  border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  text-sm
                  text-(--admin-text-secondary)
                  outline-none
                  transition
                  focus:border-(--admin-primary)
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]
                "
              >
                <option>All</option>
                <option>Shoes</option>
                <option>Electronics</option>
                <option>Laptops</option>
                <option>Headphones</option>
                <option>Wearables</option>
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  h-10
                  rounded-lg
                  border
                  border-(--admin-control-border)
                  bg-(--admin-control-bg)
                  px-3
                  text-sm
                  text-(--admin-text-secondary)
                  outline-none
                  transition
                  focus:border-(--admin-primary)
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--admin-primary)_15%,transparent)]
                "
              >
                <option>All</option>
                <option>Active</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div
              className="
                flex items-center gap-3
                px-5 py-8
                text-sm
                font-medium
                text-(--admin-primary)
              "
            >
              <span
                className="
                  h-4 w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-[color-mix(in_srgb,var(--admin-primary)_20%,transparent)]
                  border-t-(--admin-primary)
                "
              />

              Loading products...
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="
                m-5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4 py-3
                text-sm
                font-medium
                text-red-600
                dark:border-red-900/50
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-250">
                <thead>
                  <tr
                    className="
                      border-b
                      border-(--admin-border)
                      bg-(--admin-surface-soft)
                    "
                  >
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Status</TableHead>

                    <th
                      className="
                        px-5 py-4
                        text-right
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-(--admin-text-muted)
                      "
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="
                        border-b
                        border-(--admin-border)
                        transition-colors
                        duration-150
                        last:border-0
                        hover:bg-(--admin-surface-soft)
                      "
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex h-12 w-12
                              shrink-0
                              items-center justify-center
                              overflow-hidden
                              rounded-xl
                              border
                              border-(--admin-border)
                              bg-(--admin-surface-soft)
                            "
                          >
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">
                                📦
                              </span>
                            )}
                          </div>

                          <div className="max-w-55">
                            <p
                              title={product.name}
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-(--admin-text)
                              "
                            >
                              {product.name}
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-xs
                                text-(--admin-text-muted)
                              "
                            >
                              ID:{" "}
                              {product.id ||
                                product._id ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span
                          className="
                            text-sm
                            text-(--admin-text-secondary)
                          "
                        >
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span
                          className="
                            text-sm
                            font-semibold
                            text-(--admin-text)
                          "
                        >
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString()}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <StockStatus
                          stock={product.stock}
                        />
                      </td>

                      {/* Sold */}
                      <td className="px-5 py-4">
                        <span
                          className="
                            text-sm
                            text-(--admin-text-secondary)
                          "
                        >
                          {product.sellingUnits || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <ProductStatus
                          status={product.status}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            title="Edit"
                            onClick={() =>
                              navigate(
                                `/products/${product._id}/edit`
                              )
                            }
                            className="
                              rounded-lg
                              p-2
                              text-(--admin-text-muted)
                              transition
                              hover:bg-[color-mix(in_srgb,var(--admin-primary)_10%,transparent)]
                              hover:text-(--admin-primary)
                            "
                          >
                            ✏️
                          </button>

                          <button
                            title="Delete"
                            className="
                              rounded-lg
                              p-2
                              text-(--admin-text-muted)
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                              dark:hover:bg-red-950/30
                              dark:hover:text-red-400
                            "
                          >
                            🗑️
                          </button>

                          <button
                            title="More"
                            className="
                              rounded-lg
                              p-2
                              text-(--admin-text-muted)
                              transition
                              hover:bg-(--admin-surface-soft)
                              hover:text-(--admin-text)
                            "
                          >
                            ⋮
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            filteredProducts.length === 0 && (
              <div
                className="
                  px-5 py-16
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex h-14 w-14
                    items-center justify-center
                    rounded-2xl
                    bg-(--admin-surface-soft)
                    text-3xl
                  "
                >
                  📦
                </div>

                <h3
                  className="
                    mt-4
                    font-semibold
                    text-(--admin-text)
                  "
                >
                  No products found
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-(--admin-text-muted)
                  "
                >
                  Try changing your search or filters.
                </p>
              </div>
            )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div
              className="
                flex flex-col gap-3
                border-t
                border-(--admin-border)
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p
                className="
                  text-xs
                  text-(--admin-text-muted)
                "
              >
                Showing{" "}
                <span
                  className="
                    font-semibold
                    text-(--admin-text-secondary)
                  "
                >
                  1
                </span>{" "}
                to{" "}
                <span
                  className="
                    font-semibold
                    text-(--admin-text-secondary)
                  "
                >
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span
                  className="
                    font-semibold
                    text-(--admin-text-secondary)
                  "
                >
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-(--admin-control-border)
                    bg-(--admin-control-bg)
                    px-3 py-2
                    text-xs
                    font-medium
                    text-(--admin-text-secondary)
                    transition
                    hover:bg-(--admin-surface-soft)
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Previous
                </button>

                <button
                  className="
                    rounded-lg
                    bg-(--admin-primary)
                    px-3 py-2
                    text-xs
                    font-semibold
                    text-white
                  "
                >
                  {currentPage}
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      page + 1
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-(--admin-control-border)
                    bg-(--admin-control-bg)
                    px-3 py-2
                    text-xs
                    font-medium
                    text-(--admin-text-secondary)
                    transition
                    hover:bg-(--admin-surface-soft)
                  "
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
   TABLE HEAD
========================= */

function TableHead({ children }) {
  return (
    <th
      className="
        px-5 py-4
        text-left
        text-[11px]
        font-semibold
        uppercase
        tracking-wide
        text-(--admin-text-muted)
      "
    >
      {children}
    </th>
  );
}

/* =========================
   PRODUCT STAT
========================= */

function ProductStat({
  title,
  value,
  icon,
  color = "purple",
}) {
  const colors = {
    purple: {
      bg: "var(--admin-stat-purple-bg)",
      iconBg: "var(--admin-stat-purple-icon)",
      iconText: "var(--admin-stat-purple-text)",
    },

    green: {
      bg: "var(--admin-stat-green-bg)",
      iconBg: "var(--admin-stat-green-icon)",
      iconText: "var(--admin-stat-green-text)",
    },

    orange: {
      bg: "var(--admin-stat-orange-bg)",
      iconBg: "var(--admin-stat-orange-icon)",
      iconText: "var(--admin-stat-orange-text)",
    },

    red: {
      bg: "color-mix(in srgb, #ef4444 8%, var(--admin-surface))",
      iconBg: "color-mix(in srgb, #ef4444 12%, transparent)",
      iconText: "#ef4444",
    },
  };

  const theme = colors[color];

  return (
    <div
      className="
        rounded-2xl
        border
        border-(--admin-border)
        p-5
        shadow-(--admin-card-shadow)
        transition-all
        duration-200
        hover:-translate-y-0.5
      "
      style={{
        backgroundColor: theme.bg,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            text-xl
          "
          style={{
            backgroundColor: theme.iconBg,
            color: theme.iconText,
          }}
        >
          {icon}
        </div>

        <span
          className="
            text-xs
            text-(--admin-text-muted)
          "
        >
          This month
        </span>
      </div>

      <p
        className="
          mt-4
          text-sm
          text-(--admin-text-secondary)
        "
      >
        {title}
      </p>

      <h2
        className="
          mt-1
          text-2xl
          font-bold
          text-(--admin-text)
        "
      >
        {value}
      </h2>
    </div>
  );
}

/* =========================
   STOCK STATUS
========================= */

function StockStatus({ stock }) {
  const value = Number(stock || 0);

  if (value === 0) {
    return (
      <span
        className="
          inline-flex
          rounded-full
          bg-red-50
          px-2.5 py-1
          text-[10px]
          font-semibold
          text-red-600
          dark:bg-red-950/40
          dark:text-red-400
        "
      >
        Out of stock
      </span>
    );
  }

  if (value <= 10) {
    return (
      <div>
        <span
          className="
            inline-flex
            rounded-full
            bg-amber-50
            px-2.5 py-1
            text-[10px]
            font-semibold
            text-amber-600
            dark:bg-amber-950/40
            dark:text-amber-400
          "
        >
          Low stock
        </span>

        <p
          className="
            mt-1
            text-[10px]
            text-(--admin-text-muted)
          "
        >
          {value} left
        </p>
      </div>
    );
  }

  return (
    <div>
      <span
        className="
          inline-flex
          rounded-full
          bg-emerald-50
          px-2.5 py-1
          text-[10px]
          font-semibold
          text-emerald-600
          dark:bg-emerald-950/40
          dark:text-emerald-400
        "
      >
        In stock
      </span>

      <p
        className="
          mt-1
          text-[10px]
          text-(--admin-text-muted)
        "
      >
        {value} available
      </p>
    </div>
  );
}

/* =========================
   PRODUCT STATUS
========================= */

function ProductStatus({ status }) {
  const styles = {
    Active: `
      bg-emerald-50
      text-emerald-600
      dark:bg-emerald-950/40
      dark:text-emerald-400
    `,

    "Out of Stock": `
      bg-red-50
      text-red-600
      dark:bg-red-950/40
      dark:text-red-400
    `,
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5 py-1
        text-[10px]
        font-semibold
        ${styles[status] || `
          bg-(--admin-surface-soft)
          text-(--admin-text-muted)
        `}
      `}
    >
      {status || "Unknown"}
    </span>
  );
}
