import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Change this import to your actual vendor redux slice/action.
import { getVendorProducts } from "../../redux/slices/vendorSlice";

export default function VendorProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 6;

  /* =====================================================
     REDUX
  ===================================================== */

  const vendorState = useSelector(
    (state) => state.vendor || {}
  );

  const products = vendorState.products || [];

  const stats = vendorState.stats || {};

  const loading = vendorState.loading || false;

  const error = vendorState.error || null;

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {
    dispatch(
      getVendorProducts({
        page: currentPage,
        limit,
      })
    );
  }, [dispatch, currentPage]);
console.log("stats",stats)
  /* =====================================================
     NORMALIZE PRODUCTS
  ===================================================== */

  const productList = useMemo(() => {
    return products.map((product) => {
      const stock = Number(
        product.stock ??
          product.quantity ??
          product.inventory ??
          0
      );

      const price = Number(
        product.price ??
          product.sellingPrice ??
          product.amount ??
          0
      );

      const sold = Number(
        product.sellingUnits ??
          product.sold ??
          product.totalSold ??
          0
      );

      let productStatus =
        product.status ||
        "";

      /*
       * If backend doesn't provide status,
       * calculate it from stock.
       */

      if (!productStatus) {
        productStatus =
          stock === 0
            ? "Out of Stock"
            : "Active";
      }

      return {
        ...product,

        id:
          product._id ||
          product.id,

        name:
          product.name ||
          product.title ||
          "Unnamed Product",

        category:
          typeof product.category === "object"
            ? product.category?.name || "Uncategorized"
            : product.category || "Uncategorized",

        price,

        stock,

        sold,

        status: normalizeStatus(
          productStatus,
          stock
        ),

        image:
          product.image ||
          product.imageUrl ||
          product.thumbnail ||
          product.images?.[0] ||
          "",
      };
    });
  }, [products]);

  /* =====================================================
     CATEGORY OPTIONS
  ===================================================== */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        productList
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return uniqueCategories;
  }, [productList]);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return productList.filter((product) => {
      const productName =
        String(product.name || "").toLowerCase();

      const productCategory =
        String(
          product.category || ""
        ).toLowerCase();

      const matchesSearch =
        !searchTerm ||
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
  }, [
    productList,
    search,
    category,
    status,
  ]);
console.log("productList",productList)
  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalProducts =
    stats.totalProducts ??
    productList.length;

  const activeProducts =
    stats.activeProducts ??
    productList.filter(
      (product) =>
        product.status === "Active"
    ).length;

  const lowStockProducts =
    stats.lowStockProducts ??
    productList.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 10
    ).length;

  const outOfStockProducts =
    stats.outofStocksProducts ??
    stats.outOfStockProducts ??
    productList.filter(
      (product) =>
        product.stock === 0
    ).length;

  /* =====================================================
     HANDLERS
  ===================================================== */

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategory = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleStatus = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleEdit = (product) => {
    navigate(
      `/products/${product._id}/edit`
    );
  };

  const handleDelete = (product) => {
    /*
     * Connect your deleteVendorProduct thunk here.
     *
     * Example:
     *
     * dispatch(
     *   deleteVendorProduct(product.id)
     * );
     */

    console.log(
      "Delete vendor product:",
      product.id
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f7faff]">

      <main className="p-4 sm:p-6 lg:p-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-linear-to-r from-[#4779F5] to-[#24B9E8]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Vendor Panel
              </p>

            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your store products and inventory
            </p>

          </div>

          {/* ADD PRODUCT */}

          <button
            onClick={() =>
              navigate("/create-product")
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-linear-to-r
              from-[#4779F5]
              to-[#24B9E8]
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-blue-100
              transition
              hover:-translate-y-0.5
              hover:shadow-xl
            "
          >
            <span className="text-base">
              +
            </span>

            Add Product
          </button>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <ProductStat
            title="Total Products"
            value={totalProducts}
            icon="📦"
            iconClass="bg-blue-50 text-[#4779F5]"
          />

          <ProductStat
            title="Active Products"
            value={activeProducts}
            icon="✓"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <ProductStat
            title="Low Stock"
            value={lowStockProducts}
            icon="!"
            iconClass="bg-amber-50 text-amber-600"
          />

          <ProductStat
            title="Out of Stock"
            value={outOfStockProducts}
            icon="×"
            iconClass="bg-pink-50 text-pink-500"
          />

        </div>

        {/* =================================================
            PRODUCTS CARD
        ================================================= */}

        <div className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        ">

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="
            border-b
            border-slate-100
            p-5
            sm:p-6
          ">

            <div className="
              flex
              flex-col
              gap-5
              xl:flex-row
              xl:items-center
              xl:justify-between
            ">

              {/* TITLE */}

              <div>

                <div className="flex items-center gap-2">

                  <span className="
                    h-2
                    w-2
                    rounded-full
                    bg-linear-to-r
                    from-[#4779F5]
                    to-[#7C5CFC]
                  " />

                  <h2 className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                    All Products
                  </h2>

                </div>

                <p className="
                  mt-1
                  text-xs
                  text-slate-400
                ">
                  {filteredProducts.length} products found
                </p>

              </div>

              {/* FILTERS */}

              <div className="
                flex
                flex-col
                gap-3
                sm:flex-row
              ">

                {/* SEARCH */}

                <div className="
                  group
                  flex
                  h-10
                  w-full
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  transition
                  focus-within:border-[#4779F5]
                  focus-within:bg-white
                  focus-within:ring-4
                  focus-within:ring-blue-50
                  sm:w-64
                ">

                  <SearchIcon />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      handleSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search products..."
                    className="
                      w-full
                      bg-transparent
                      text-sm
                      text-slate-700
                      outline-none
                      placeholder:text-slate-400
                    "
                  />

                </div>

                {/* CATEGORY */}

                <select
                  value={category}
                  onChange={(e) =>
                    handleCategory(
                      e.target.value
                    )
                  }
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-xs
                    font-semibold
                    text-slate-600
                    outline-none
                    transition
                    hover:bg-white
                    focus:border-[#4779F5]
                    focus:ring-4
                    focus:ring-blue-50
                  "
                >

                  <option value="All">
                    All Categories
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

                {/* STATUS */}

                <select
                  value={status}
                  onChange={(e) =>
                    handleStatus(
                      e.target.value
                    )
                  }
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    text-xs
                    font-semibold
                    text-slate-600
                    outline-none
                    transition
                    hover:bg-white
                    focus:border-[#4779F5]
                    focus:ring-4
                    focus:ring-blue-50
                  "
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="p-10 text-center">

              <div className="
                mx-auto
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-[#4779F5]
              " />

              <p className="
                mt-3
                text-sm
                font-medium
                text-slate-500
              ">
                Loading products...
              </p>

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="m-5 rounded-2xl border border-red-100 bg-red-50 p-4">

              <div className="flex items-center gap-3">

                <div className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-100
                  text-red-600
                ">
                  !
                </div>

                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-red-700
                  ">
                    Unable to load products
                  </p>

                  <p className="
                    mt-0.5
                    text-xs
                    text-red-500
                  ">
                    {error}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              TABLE
          ================================================= */}

          {!loading &&
            !error &&
            filteredProducts.length > 0 && (
              <div className="overflow-x-auto">

                <table className="
                  w-full
                  min-w-262.5
                ">

                  {/* TABLE HEAD */}

                  <thead>

                    <tr className="
                      border-b
                      border-slate-100
                      bg-slate-50/70
                    ">

                      <TableHead>
                        Product
                      </TableHead>

                      <TableHead>
                        Category
                      </TableHead>

                      <TableHead>
                        Price
                      </TableHead>

                      <TableHead>
                        Stock
                      </TableHead>

                      <TableHead>
                        Sold
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead align="right">
                        Action
                      </TableHead>

                    </tr>

                  </thead>

                  {/* TABLE BODY */}

                  <tbody>

                    {filteredProducts.map(
                      (product) => (
                        <tr
                          key={product._id}
                          className="
                            border-b
                            border-slate-50
                            transition
                            hover:bg-blue-50/30
                          "
                        >

                          {/* PRODUCT */}

                          <td className="px-5 py-4">

                            <div className="
                              flex
                              items-center
                              gap-3
                            ">

                              <ProductImage
                                product={product}
                              />

                              <div className="
                                max-w-60
                                min-w-0
                              ">

                                <p className="
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-slate-800
                                ">
                                  {product.name}
                                </p>

                                <p className="
                                  mt-0.5
                                  truncate
                                  text-[10px]
                                  text-slate-400
                                ">
                                  ID: {product.id}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-5 py-4">

                            <span className="
                              inline-flex
                              rounded-lg
                              bg-blue-50
                              px-2.5
                              py-1
                              text-[10px]
                              font-semibold
                              text-[#4779F5]
                            ">
                              {product.category}
                            </span>

                          </td>

                          {/* PRICE */}

                          <td className="px-5 py-4">

                            <span className="
                              text-sm
                              font-bold
                              text-slate-800
                            ">
                              ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </td>

                          {/* STOCK */}

                          <td className="px-5 py-4">

                            <StockStatus
                              stock={
                                product.stock
                              }
                            />

                          </td>

                          {/* SOLD */}

                          <td className="px-5 py-4">

                            <div>

                              <p className="
                                text-sm
                                font-semibold
                                text-slate-700
                              ">
                                {product.sold.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                              ">
                                units sold
                              </p>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <ProductStatus
                              status={
                                product.status
                              }
                            />

                          </td>

                          {/* ACTION */}

                          <td className="
                            px-5
                            py-4
                            text-right
                          ">

                            <div className="
                              flex
                              justify-end
                              gap-1
                            ">

                              {/* EDIT */}

                              <button
                                title="Edit product"
                                onClick={() =>
                                  handleEdit(
                                    product
                                  )
                                }
                                className="
                                  rounded-xl
                                  p-2
                                  text-slate-400
                                  transition
                                  hover:bg-blue-50
                                  hover:text-[#4779F5]
                                "
                              >
                                <EditIcon />
                              </button>

                              {/* DELETE */}

                              <button
                                title="Delete product"
                                onClick={() =>
                                  handleDelete(
                                    product
                                  )
                                }
                                className="
                                  rounded-xl
                                  p-2
                                  text-slate-400
                                  transition
                                  hover:bg-red-50
                                  hover:text-red-500
                                "
                              >
                                <TrashIcon />
                              </button>

                              {/* MORE */}

                              <button
                                title="More"
                                className="
                                  rounded-xl
                                  p-2
                                  text-slate-400
                                  transition
                                  hover:bg-slate-100
                                  hover:text-slate-700
                                "
                              >
                                <MoreIcon />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            !error &&
            filteredProducts.length === 0 && (
              <div className="px-5 py-16 text-center">

                <div className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-linear-to-br
                  from-blue-50
                  to-cyan-50
                  text-3xl
                ">
                  📦
                </div>

                <h3 className="
                  mt-4
                  text-sm
                  font-bold
                  text-slate-800
                ">
                  No products found
                </h3>

                <p className="
                  mx-auto
                  mt-1
                  max-w-sm
                  text-xs
                  text-slate-400
                ">
                  Try changing your search or filters,
                  or add your first product.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      "/create-product"
                    )
                  }
                  className="
                    mt-5
                    rounded-xl
                    bg-linear-to-r
                    from-[#4779F5]
                    to-[#24B9E8]
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    shadow-md
                    shadow-blue-100
                    transition
                    hover:-translate-y-0.5
                  "
                >
                  + Add Product
                </button>

              </div>
            )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            filteredProducts.length > 0 && (
              <div className="
                flex
                flex-col
                gap-3
                border-t
                border-slate-100
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              ">

                <p className="
                  text-xs
                  text-slate-400
                ">

                  Showing{" "}

                  <span className="
                    font-semibold
                    text-slate-600
                  ">
                    {filteredProducts.length}
                  </span>

                  {" "}products

                </p>

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <button
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-slate-500
                      transition
                      hover:border-blue-200
                      hover:bg-blue-50
                      hover:text-[#4779F5]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Previous
                  </button>

                  <span className="
                    flex
                    h-8
                    min-w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-linear-to-r
                    from-[#4779F5]
                    to-[#24B9E8]
                    px-2
                    text-xs
                    font-bold
                    text-white
                  ">
                    {currentPage}
                  </span>

                  <button
                    // disabled={
                    //   products.length > limit
                    // }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1
                      )
                    }
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-slate-500
                      transition
                      hover:border-blue-200
                      hover:bg-blue-50
                      hover:text-[#4779F5]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
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

/* =========================================================
   PRODUCT STAT
========================================================= */

function ProductStat({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      transition
      hover:-translate-y-0.5
      hover:shadow-md
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          text-lg
          font-bold
          ${iconClass}
        `}>
          {icon}
        </div>

        <span className="
          rounded-full
          bg-slate-50
          px-2
          py-1
          text-[9px]
          font-semibold
          uppercase
          tracking-wide
          text-slate-400
        ">
          Overview
        </span>

      </div>

      <p className="
        mt-4
        text-xs
        font-medium
        text-slate-500
      ">
        {title}
      </p>

      <h2 className="
        mt-1
        text-2xl
        font-bold
        tracking-tight
        text-slate-900
      ">
        {Number(value || 0).toLocaleString(
          "en-IN"
        )}
      </h2>

    </div>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  children,
  align = "left",
}) {
  return (
    <th
      className={`
        px-5
        py-4
        text-${align}
        text-[10px]
        font-bold
        uppercase
        tracking-[0.12em]
        text-slate-400
      `}
    >
      {children}
    </th>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

function ProductImage({ product }) {
  return (
    <div className="
      flex
      h-12
      w-12
      shrink-0
      items-center
      justify-center
      overflow-hidden
      rounded-xl
      border
      border-slate-100
      bg-linear-to-br
      from-slate-50
      to-blue-50
    ">

      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="
            h-full
            w-full
            object-cover
          "
          onError={(e) => {
            e.currentTarget.style.display =
              "none";
          }}
        />
      ) : (
        <span className="text-xl">
          📦
        </span>
      )}

    </div>
  );
}

/* =========================================================
   STOCK STATUS
========================================================= */

function StockStatus({ stock }) {
  const quantity = Number(stock || 0);

  if (quantity === 0) {
    return (
      <div>

        <span className="
          inline-flex
          rounded-full
          bg-red-50
          px-2.5
          py-1
          text-[10px]
          font-bold
          text-red-600
        ">
          Out of stock
        </span>

      </div>
    );
  }

  if (quantity <= 10) {
    return (
      <div>

        <span className="
          inline-flex
          rounded-full
          bg-amber-50
          px-2.5
          py-1
          text-[10px]
          font-bold
          text-amber-600
        ">
          Low stock
        </span>

        <p className="
          mt-1
          text-[10px]
          text-slate-400
        ">
          {quantity} left
        </p>

      </div>
    );
  }

  return (
    <div>

      <span className="
        inline-flex
        rounded-full
        bg-emerald-50
        px-2.5
        py-1
        text-[10px]
        font-bold
        text-emerald-600
      ">
        In stock
      </span>

      <p className="
        mt-1
        text-[10px]
        text-slate-400
      ">
        {quantity} available
      </p>

    </div>
  );
}

/* =========================================================
   PRODUCT STATUS
========================================================= */

function ProductStatus({ status }) {
  const normalized =
    String(status || "")
      .toLowerCase()
      .replace(/_/g, " ");

  if (
    normalized === "active"
  ) {
    return (
      <span className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-emerald-50
        px-2.5
        py-1
        text-[10px]
        font-bold
        text-emerald-600
      ">
        <span className="
          h-1.5
          w-1.5
          rounded-full
          bg-emerald-500"
        />
        Active
      </span>
    );
  }

  if (
    normalized === "out of stock" ||
    normalized === "outofstock"
  ) {
    return (
      <span className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-red-50
        px-2.5
        py-1
        text-[10px]
        font-bold
        text-red-600
      ">
        <span className="
          h-1.5
          w-1.5
          rounded-full
          bg-red-500"
        />
        Out of Stock
      </span>
    );
  }

  return (
    <span className="
      inline-flex
      rounded-full
      bg-slate-100
      px-2.5
      py-1
      text-[10px]
      font-bold
      text-slate-500
    ">
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status, stock) {
  const value = String(
    status || ""
  )
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();

  if (
    value === "active" ||
    value === "published"
  ) {
    return "Active";
  }

  if (
    value === "out of stock" ||
    value === "outofstock"
  ) {
    return "Out of Stock";
  }

  if (!value) {
    return stock === 0
      ? "Out of Stock"
      : "Active";
  }

  return status;
}

/* =========================================================
   SEARCH ICON
========================================================= */

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
      />

      <path d="m16 16 4 4" />
    </svg>
  );
}

/* =========================================================
   EDIT ICON
========================================================= */

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

/* =========================================================
   TRASH ICON
========================================================= */

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />

      <path d="M8 6V4h8v2" />

      <path d="M19 6l-1 15H6L5 6" />

      <path d="M10 11v6" />

      <path d="M14 11v6" />
    </svg>
  );
}

/* =========================================================
   MORE ICON
========================================================= */

function MoreIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle
        cx="5"
        cy="12"
        r="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="1.5"
      />

      <circle
        cx="19"
        cy="12"
        r="1.5"
      />
    </svg>
  );
}
