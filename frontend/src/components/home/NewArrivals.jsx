import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

export default function NewArrivals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =====================================================
  // PRODUCTS FROM REDUX
  // =====================================================

  const {
    product = [],
    loading,
    error,
  } = useSelector((state) => state.product);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    if (!Array.isArray(product) || product.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch]);

  // =====================================================
  // NEW ARRIVALS
  // =====================================================
  /*
   * Currently using the first 10 products.
   *
   * If your backend has createdAt:
   *
   * const newArrivals = [...product]
   *   .sort(
   *     (a, b) =>
   *       new Date(b.createdAt) -
   *       new Date(a.createdAt)
   *   )
   *   .slice(0, 10);
   *
   * We can switch to that later.
   */

  const newArrivals = Array.isArray(product)
    ? [...product]
        .sort((a, b) => {
          if (!a?.createdAt || !b?.createdAt) {
            return 0;
          }

          return (
            new Date(b.createdAt) -
            new Date(a.createdAt)
          );
        })
        .slice(0, 10)
    : [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="w-full bg-gray-50">
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
          lg:py-12
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-6
            flex
            items-end
            justify-between
            gap-4
            sm:mb-8
          "
        >

          {/* LEFT */}

          <div>

            <div
              className="
                mb-1
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
              "
            >
              <Sparkles size={16} />

              New Arrivals
            </div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-gray-950
                sm:text-3xl
              "
            >
              Fresh from the store
            </h2>

            <p
              className="
                mt-2
                hidden
                text-sm
                text-gray-500
                sm:block
              "
            >
              Discover the latest products added to our collection.
            </p>

          </div>

          {/* VIEW ALL */}

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="
              inline-flex
              shrink-0
              items-center
              gap-1.5
              text-sm
              font-semibold
              text-blue-600
              transition
              hover:text-blue-700
              cursor-pointer
            "
          >
            View all

            <ArrowRight size={16} />
          </button>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              sm:gap-4
              md:grid-cols-4
              lg:grid-cols-5
              lg:gap-5
            "
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <NewArrivalSkeleton key={index} />
            ))}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              px-5
              py-10
              text-center
            "
          >
            <p className="font-semibold text-red-600">
              Unable to load new arrivals
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Something went wrong while loading products.
            </p>

            <button
              type="button"
              onClick={() => dispatch(getProducts())}
              className="
                mt-4
                rounded-xl
                bg-red-500
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-600
                cursor-pointer
              "
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          newArrivals.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                px-5
                py-12
                text-center
              "
            >
              <Clock3
                size={30}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm text-gray-500">
                No new products available right now.
              </p>
            </div>
          )}

        {/* =================================================
            PRODUCTS
        ================================================= */}

        {!loading &&
          !error &&
          newArrivals.length > 0 && (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                sm:gap-4
                md:grid-cols-4
                lg:grid-cols-5
                lg:gap-5
              "
            >
              {newArrivals.map((item) => (
                <ProductCard
                  key={item._id}
                  {...item}
                />
              ))}
            </div>
          )}

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        {!loading &&
          !error &&
          product.length > 10 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  shadow-sm
                  transition-all
                  duration-200
                  hover:border-blue-200
                  hover:bg-blue-50
                  hover:text-blue-600
                  hover:shadow-md
                  cursor-pointer
                "
              >
                Explore all products

                <ArrowRight size={16} />
              </button>
            </div>
          )}

      </div>
    </section>
  );
}


/* =====================================================
   NEW ARRIVAL SKELETON
===================================================== */

function NewArrivalSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-gray-100
        bg-white
      "
    >
      {/* IMAGE */}

      <div
        className="
          aspect-square
          w-full
          animate-pulse
          bg-gray-200
        "
      />

      {/* CONTENT */}

      <div className="space-y-3 p-3 sm:p-4">

        {/* CATEGORY */}

        <div
          className="
            h-3
            w-1/3
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        {/* NAME */}

        <div
          className="
            h-4
            w-full
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        <div
          className="
            h-4
            w-2/3
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        {/* PRICE */}

        <div
          className="
            h-5
            w-1/2
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        {/* BUTTON */}

        <div
          className="
            h-10
            w-full
            animate-pulse
            rounded-xl
            bg-gray-200
          "
        />

      </div>
    </div>
  );
}
