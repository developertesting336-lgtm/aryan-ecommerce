import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

export default function TrendingProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const {
    product = [],
    loading,
    error,
  } = useSelector((state) => state.product);

  useEffect(() => {
    if (!Array.isArray(product) || product.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch, product.length]);

  const trendingProducts = Array.isArray(product)
    ? product.slice(0, 10)
    : [];

  const scroll = (direction) => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={17} className="text-blue-600" />

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Trending
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
              Trending right now
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Products people are checking out today.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => scroll("right")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
              aria-label="Next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="hidden cursor-pointer items-center gap-1 text-sm font-bold text-gray-900 hover:text-blue-600 sm:flex"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {loading && trendingProducts.length === 0 ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="min-w-[230px] animate-pulse rounded-2xl bg-white p-3 sm:min-w-[250px]"
              >
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              onClick={() => dispatch(getProducts())}
              className="mt-4 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Products will appear here soon.
            </p>
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {trendingProducts.map((item) => (
              <div
                key={item._id}
                className="w-[76vw] shrink-0 snap-start sm:w-[250px] lg:w-[270px]"
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/products")}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-900 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white sm:hidden"
        >
          View all products
          <ArrowRight size={16} />
        </button>

      </div>
    </section>
  );
}
