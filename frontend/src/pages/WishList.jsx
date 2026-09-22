import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import ProductCard from "../components/products/ProductCard";
import { deleteProducts } from "../redux/slices/wishlistSlice";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, wishlist } = useSelector(
    (state) => state.wishlist
  );

  const products = wishlist?.products ?? [];
  const isEmpty = products.length === 0;

  const handleRemove = (productId) => {
    dispatch(deleteProducts(productId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">
          {error?.message || error || "Failed to load wishlist"}
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-10 sm:p-16 text-center">
            <div className="text-6xl mb-5">❤️</div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Your wishlist is empty
            </h2>

            <p className="text-gray-500 mb-6">
              Looks like you haven't added anything to your wishlist yet.
            </p>

            <button
              onClick={() => navigate("/")}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          My Wishlist ❤️
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              {...product}
              onRemove={() => handleRemove(product._id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}