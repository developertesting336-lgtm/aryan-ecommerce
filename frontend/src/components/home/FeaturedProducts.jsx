import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

export default function FeaturedProducts() {
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
  }, [dispatch, product.length]);

  // =====================================================
  // FEATURED PRODUCTS
  // =====================================================

  const featuredProducts = Array.isArray(product)
    ? product.slice(0, 10)
    : [];
console.log("featuredProducts",featuredProducts)
  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section
      className="
        w-full
        max-w-7xl
        mx-auto
        px-3
        min-[375px]:px-4
        sm:px-6
        lg:px-8
        py-7
        sm:py-10
        lg:py-12
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          items-end
          justify-between
          gap-3
          sm:gap-4
          mb-5
          sm:mb-8
        "
      >
        {/* LEFT */}

        <div className="min-w-0">
          <p
            className="
              text-xs
              min-[375px]:text-sm
              font-semibold
              text-blue-600
              mb-1
            "
          >
            Featured Products
          </p>

          <h2
            className="
              text-lg
              min-[375px]:text-xl
              sm:text-2xl
              lg:text-3xl
              font-bold
              text-gray-900
              leading-tight
            "
          >
            Today's Best Deals
          </h2>

          <p
            className="
              hidden
              sm:block
              mt-1
              text-sm
              text-gray-500
            "
          >
            Discover our most popular products
          </p>
        </div>

        {/* VIEW ALL */}

        <button
          type="button"
          onClick={() => navigate("/products")}
          className="
            shrink-0
            whitespace-nowrap
            text-xs
            min-[375px]:text-sm
            sm:text-base
            font-semibold
            text-blue-600
            hover:text-blue-700
            transition
          "
        >
          View All →
        </button>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div
          className="
            featured-products-scroll
            max-h-[70vh]
            overflow-y-auto
            overflow-x-hidden
            pr-1
          "
        >
          <div
            className="
              grid

              grid-cols-1

              min-[375px]:grid-cols-2

              sm:grid-cols-3

              md:grid-cols-4

              lg:grid-cols-5

              gap-3

              min-[375px]:gap-3

              sm:gap-4

              lg:gap-5
            "
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
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
            p-6
            sm:p-8
            text-center
          "
        >
          <p
            className="
              font-semibold
              text-red-600
            "
          >
            Unable to load products
          </p>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Please try again.
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
              hover:bg-red-600
              transition
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
        featuredProducts.length === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              py-10
              sm:py-12
              text-center
            "
          >
            <p className="text-sm sm:text-base text-gray-500">
              No products available right now.
            </p>
          </div>
        )}

      {/* =================================================
          PRODUCTS
      ================================================= */}

      {!loading &&
        !error &&
        featuredProducts.length > 0 && (
          <div
            className="
              featured-products-scroll

              max-h-[70vh]

              overflow-y-auto

              overflow-x-hidden

              pr-1

              sm:pr-2
            "
          >
            <div
              className="
                grid

                grid-cols-1

                min-[375px]:grid-cols-2

                sm:grid-cols-3

                md:grid-cols-4

                lg:grid-cols-5

                gap-3

                sm:gap-4

                lg:gap-5

                items-start
              "
            >
              {featuredProducts.map((item) => (
                <div
                  key={item._id}
                  className="
                    min-w-0
                    w-full
                  "
                >
                  <ProductCard {...item} rating={item?.rating?.average}/>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* =================================================
          VIEW ALL
      ================================================= */}

      {!loading &&
        !error &&
        product.length > 10 && (
          <div
            className="
              flex
              justify-center
              mt-6
              sm:mt-8
            "
          >
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                px-5
                sm:px-6
                py-2.5
                sm:py-3
                text-xs
                sm:text-sm
                font-semibold
                text-gray-700
                hover:border-blue-500
                hover:bg-blue-50
                hover:text-blue-600
                transition
              "
            >
              Explore All Products
            </button>
          </div>
        )}
    </section>
  );
}

/* =====================================================
   PRODUCT SKELETON
===================================================== */

function ProductSkeleton() {
  return (
    <div
      className="
        w-full
        overflow-hidden
        rounded-xl
        sm:rounded-2xl
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

      <div
        className="
          space-y-2.5
          sm:space-y-3
          p-3
          sm:p-4
        "
      >
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

        {/* PRODUCT NAME */}

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
