import { ArrowRight, Heart } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../../redux/slices/productSlice";
import ProductCard from "../products/ProductCard";

export default function CustomerFavorites() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    product = [],
    loading,
  } = useSelector((state) => state.product);

  useEffect(() => {
    if (!Array.isArray(product) || product.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch, product.length]);

  /*
   * Until the backend exposes a dedicated recommendation/favorites
   * endpoint, we use the first available products.
   *
   * Later this can become:
   * GET /api/products/customer-favorites
   */
  const favorites = Array.isArray(product)
    ? product.slice(0, 8)
    : [];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heart size={17} className="text-blue-600" />

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Loved by shoppers
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
              Customer favorites
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              A selection worth taking a closer look at.
            </p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="hidden cursor-pointer items-center gap-1 text-sm font-bold text-gray-900 hover:text-blue-600 sm:flex"
          >
            See everything
            <ArrowRight size={15} />
          </button>
        </div>

        {loading && favorites.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse rounded-2xl bg-gray-50 p-3">
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {favorites.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/products")}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-950 hover:text-white sm:hidden"
        >
          Browse all products
          <ArrowRight size={16} />
        </button>

      </div>
    </section>
  );
}
