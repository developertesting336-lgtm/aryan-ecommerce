import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import { getVendorOrders } from "../../redux/slices/vendorSlice";

export default function VendorOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const limit = 6;

  /* =====================================================
     REDUX
  ===================================================== */

  const vendorState = useSelector(
    (state) => state.vendor || {}
  );

  const orders = vendorState.orders || [];

  const stats = vendorState.stats || {};

  const loading =
    vendorState.loading || false;

  const error =
    vendorState.error || null;

  /* =====================================================
     FETCH ORDERS
  ===================================================== */

  useEffect(() => {
    dispatch(
      getVendorOrders({
        page: currentPage,
        limit,
      })
    );
  }, [dispatch, currentPage]);

  /* =====================================================
     NORMALIZE ORDERS
  ===================================================== */

  const orderList = useMemo(() => {
    return orders.map((order) => {
      const customerName =
        order.name ||
        order.customerName ||
        order.customer?.name ||
        order.user?.name ||
        "Unknown Customer";

      const customerEmail =
        order.email ||
        order.customerEmail ||
        order.customer?.email ||
        order.user?.email ||
        "";

      const orderNumber =
        order.orderNumber ||
        order.orderId ||
        order.order_id ||
        order._id ||
        "N/A";

      const amount = Number(
        order.amount ??
          order.totalAmount ??
          order.total ??
          order.finalAmount ??
          order.grandTotal ??
          0
      );

      const items = Number(
        order.items ??
          order.itemCount ??
          order.productsCount ??
          order.products?.length ??
          order.orderItems?.length ??
          0
      );

      const rawStatus =
        order.status ||
        order.orderStatus ||
        "Pending";

      const rawPayment =
        order.paymentStatus ||
        order.payment ||
        "Pending";

      return {
        ...order,

        id: order._id || order.id,

        orderNumber,

        customer: customerName,

        email: customerEmail,

        items,

        amount,

        status:
          normalizeOrderStatus(
            rawStatus
          ),

        paymentStatus:
          normalizePaymentStatus(
            rawPayment
          ),

        date:
          order.createdAt ||
          order.date ||
          order.updatedAt ||
          null,
      };
    });
  }, [orders]);

  /* =====================================================
     FILTER ORDERS
  ===================================================== */

  const filteredOrders = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    return orderList.filter((order) => {
      const orderNumber =
        String(
          order.orderNumber || ""
        ).toLowerCase();

      const customer =
        String(
          order.customer || ""
        ).toLowerCase();

      const email =
        String(
          order.email || ""
        ).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        orderNumber.includes(searchTerm) ||
        customer.includes(searchTerm) ||
        email.includes(searchTerm);

      const matchesStatus =
        status === "All" ||
        order.status === status;

      const matchesPayment =
        payment === "All" ||
        order.paymentStatus === payment;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orderList,
    search,
    status,
    payment,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalOrders =
    stats.totalOrders ??
    stats.orders ??
    orderList.length;

  const totalRevenue =
    stats.totalSales ??
    stats.Revenue ??
    stats.revenue ??
    stats.totalRevenue ??
    0;

  const deliveredOrders =
    stats.deliveredOrders ??
    stats.delivered ??
    orderList.filter(
      (order) =>
        order.status === "Delivered"
    ).length;

  const pendingOrders =
    stats.pendingOrders ??
    stats.pending ??
    orderList.filter(
      (order) =>
        order.status === "Pending"
    ).length;

  /* =====================================================
     HANDLERS
  ===================================================== */

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatus = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handlePayment = (value) => {
    setPayment(value);
    setCurrentPage(1);
  };

  const handleViewOrder = (order) => {
    navigate(
      `${order.id}`
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f7faff]">

      <main className="p-4 sm:p-6 lg:p-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="
          mb-6
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <div className="
              flex
              items-center
              gap-2
            ">

              <span className="
                h-2.5
                w-2.5
                rounded-full
                bg-linear-to-r
                from-[#4779F5]
                to-[#24B9E8]
              " />

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-400
              ">
                Vendor Panel
              </p>

            </div>

            <h1 className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
            ">
              Orders
            </h1>

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Manage and track orders for your store
            </p>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="
          mb-6
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        ">

          <OrderStat
            title="Total Orders"
            value={totalOrders}
            icon="🛒"
            iconClass="bg-blue-50 text-[#4779F5]"
          />

          <OrderStat
            title="Total Revenue"
            value={`₹${Number(
              totalRevenue || 0
            ).toLocaleString("en-IN")}`}
            icon="₹"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <OrderStat
            title="Delivered"
            value={deliveredOrders}
            icon="✓"
            iconClass="bg-cyan-50 text-cyan-600"
          />

          <OrderStat
            title="Pending"
            value={pendingOrders}
            icon="!"
            iconClass="bg-amber-50 text-amber-600"
          />

        </div>

        {/* =================================================
            ORDERS CARD
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

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <span className="
                    h-2
                    w-2
                    rounded-full
                    bg-linear-to-r
                    from-[#4779F5]
                    to-[#7C5CFC]"
                  />

                  <h2 className="
                    text-base
                    font-bold
                    text-slate-900
                  ">
                    All Orders
                  </h2>

                </div>

                <p className="
                  mt-1
                  text-xs
                  text-slate-400
                ">
                  {filteredOrders.length} orders found
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
                    placeholder="Search orders..."
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

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Shipped">
                    Shipped
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

                {/* PAYMENT */}

                <select
                  value={payment}
                  onChange={(e) =>
                    handlePayment(
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
                    All Payment
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Failed">
                    Failed
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="
              p-10
              text-center
            ">

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
                Loading orders...
              </p>

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="
              m-5
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-4
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  flex
                  h-9
                  w-9
                  shrink-0
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
                    Unable to load orders
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
            filteredOrders.length > 0 && (

              <div className="overflow-x-auto">

                <table className="
                  w-full
                  min-w-275
                ">

                  <thead>

                    <tr className="
                      border-b
                      border-slate-100
                      bg-slate-50/70
                    ">

                      <TableHead>
                        Order
                      </TableHead>

                      <TableHead>
                        Customer
                      </TableHead>

                      <TableHead>
                        Products
                      </TableHead>

                      <TableHead>
                        Amount
                      </TableHead>

                      <TableHead>
                        Payment
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Date
                      </TableHead>

                      <TableHead align="right">
                        Action
                      </TableHead>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredOrders.map(
                      (order) => (

                        <tr
                          key={order.id}
                          className="
                            border-b
                            border-slate-50
                            transition
                            hover:bg-blue-50/30
                          "
                        >

                          {/* ORDER */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div>

                              <p className="
                                text-sm
                                font-bold
                                text-[#4779F5]
                              ">
                                {order.orderNumber}
                              </p>

                              <p className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                              ">
                                Order ID
                              </p>

                            </div>

                          </td>

                          {/* CUSTOMER */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div className="
                              flex
                              items-center
                              gap-3
                            ">

                              <div className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-linear-to-br
                                from-blue-50
                                to-cyan-50
                                text-sm
                                font-bold
                                text-[#4779F5]
                              ">
                                {getInitial(
                                  order.customer
                                )}
                              </div>

                              <div className="
                                min-w-0
                              ">

                                <p className="
                                  max-w-45
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-slate-800
                                ">
                                  {order.customer}
                                </p>

                                <p className="
                                  max-w-45
                                  truncate
                                  text-[10px]
                                  text-slate-400
                                ">
                                  {order.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* PRODUCTS */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div>

                              <p className="
                                text-sm
                                font-semibold
                                text-slate-700
                              ">
                                {order.items}
                              </p>

                              <p className="
                                mt-0.5
                                text-[10px]
                                text-slate-400
                              ">
                                {order.items === 1
                                  ? "item"
                                  : "items"}
                              </p>

                            </div>

                          </td>

                          {/* AMOUNT */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <span className="
                              text-sm
                              font-bold
                              text-slate-800
                            ">
                              ₹
                              {Number(
                                order.amount || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </td>

                          {/* PAYMENT */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <PaymentStatus
                              status={
                                order.paymentStatus
                              }
                            />

                          </td>

                          {/* STATUS */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <OrderStatus
                              status={
                                order.status
                              }
                            />

                          </td>

                          {/* DATE */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div>

                              <p className="
                                text-xs
                                font-medium
                                text-slate-600
                              ">
                                {formatDate(
                                  order.date
                                )}
                              </p>

                              {order.date && (
                                <p className="
                                  mt-0.5
                                  text-[10px]
                                  text-slate-400
                                ">
                                  {formatTime(
                                    order.date
                                  )}
                                </p>
                              )}

                            </div>

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

                              <button
                                title="View order"
                                onClick={() =>
                                  handleViewOrder(
                                    order
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
                                <ViewIcon />
                              </button>

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
            filteredOrders.length === 0 && (

              <div className="
                px-5
                py-16
                text-center
              ">

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
                  🛒
                </div>

                <h3 className="
                  mt-4
                  text-sm
                  font-bold
                  text-slate-800
                ">
                  No orders found
                </h3>

                <p className="
                  mx-auto
                  mt-1
                  max-w-sm
                  text-xs
                  text-slate-400
                ">
                  Try changing your search or filters.
                </p>

              </div>
            )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            !error &&
            filteredOrders.length > 0 && (

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
                    {filteredOrders.length}
                  </span>

                  {" "}orders on page{" "}

                  <span className="
                    font-semibold
                    text-slate-600
                  ">
                    {currentPage}
                  </span>

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
                    //   orders.length < limit
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
   ORDER STAT
========================================================= */

function OrderStat({
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
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
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
   ORDER STATUS
========================================================= */

function OrderStatus({ status }) {
  const normalized =
    String(status || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .trim();

  const styles = {
    pending:
      "bg-amber-50 text-amber-600",

    processing:
      "bg-indigo-50 text-indigo-600",

    shipped:
      "bg-blue-50 text-blue-600",

    delivered:
      "bg-emerald-50 text-emerald-600",

    cancelled:
      "bg-red-50 text-red-600",

    canceled:
      "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-bold
        ${
          styles[normalized] ||
          "bg-slate-100 text-slate-500"
        }
      `}
    >

      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            normalized === "delivered"
              ? "bg-emerald-500"
              : normalized === "cancelled" ||
                normalized === "canceled"
              ? "bg-red-500"
              : normalized === "shipped"
              ? "bg-blue-500"
              : normalized === "processing"
              ? "bg-indigo-500"
              : "bg-amber-500"
          }
        `}
      />

      {status || "Unknown"}

    </span>
  );
}

/* =========================================================
   PAYMENT STATUS
========================================================= */

function PaymentStatus({ status }) {
  const normalized =
    String(status || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .trim();

  const styles = {
    paid:
      "bg-emerald-50 text-emerald-600",

    pending:
      "bg-amber-50 text-amber-600",

    failed:
      "bg-red-50 text-red-600",

    refunded:
      "bg-purple-50 text-purple-600",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-bold
        ${
          styles[normalized] ||
          "bg-slate-100 text-slate-500"
        }
      `}
    >
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   NORMALIZE ORDER STATUS
========================================================= */

function normalizeOrderStatus(status) {
  const value =
    String(status || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .trim();

  if (
    value === "pending" ||
    value === "unfulfilled"
  ) {
    return "Pending";
  }

  if (
    value === "processing"
  ) {
    return "Processing";
  }

  if (
    value === "shipped" ||
    value === "shipping"
  ) {
    return "Shipped";
  }

  if (
    value === "delivered" ||
    value === "completed"
  ) {
    return "Delivered";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "Cancelled";
  }

  return status || "Pending";
}

/* =========================================================
   NORMALIZE PAYMENT
========================================================= */

function normalizePaymentStatus(status) {
  const value =
    String(status || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .trim();

  if (
    value === "paid" ||
    value === "success" ||
    value === "successful"
  ) {
    return "Paid";
  }

  if (
    value === "pending" ||
    value === "unpaid"
  ) {
    return "Pending";
  }

  if (
    value === "failed" ||
    value === "failure"
  ) {
    return "Failed";
  }

  if (
    value === "refunded"
  ) {
    return "Refunded";
  }

  return status || "Pending";
}

/* =========================================================
   INITIAL
========================================================= */

function getInitial(name) {
  return String(name || "U")
    .charAt(0)
    .toUpperCase();
}

/* =========================================================
   DATE
========================================================= */

function formatDate(date) {
  if (!date) {
    return "N/A";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   TIME
========================================================= */

function formatTime(date) {
  if (!date) {
    return "";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "";
  }

  return parsedDate.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
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
   VIEW ICON
========================================================= */

function ViewIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
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
