import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import ShopByNeed from "../components/home/ShopByNeed";
import PromoCards from "../components/home/PromoCards";
import PromoGrid from "../components/home/PromoGrid";
import CategorySection from "../components/home/CategorySection";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getHomepage } from "../redux/slices/content/homepage/homepageSlice";
import RecommendedProducts from "../components/products/RecommendedProducts";
export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getHomepage());
  }, [dispatch]);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <main>
        <Hero />
        <PromoCards />
        <CategorySection />
        <RecommendedProducts />
        <PromoGrid />
        <ShopByNeed />
        <FeaturedProducts />
      </main>
    </div>
  );
}










// import { useEffect, useState } from "react";
// import { useLoaderData } from "react-router";
// import { useDispatch, useStore } from "react-redux";

// import { getHomepage } from "../redux/slices/content/homepage/homepageSlice";
// import Hero from "../components/home/Hero";
// import FeaturedProducts from "../components/home/FeaturedProducts";
// import ShopByNeed from "../components/home/ShopByNeed";
// import PromoCards from "../components/home/PromoCards";
// import PromoGrid from "../components/home/PromoGrid";
// import CategorySection from "../components/home/CategorySection";
// import RecommendedProducts from "../components/products/RecommendedProducts";

// export async function loader() {
//   try {
//     const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/homepage`);
//     if (!res.ok) return { homepage: null };
//     const body = await res.json();
//     return { homepage: body.data ?? null }; // same shape your thunk returns
//   } catch {
//     return { homepage: null }; // API down: fall back to client fetch below
//   }
// }

// export function meta() {
//   return [
//     { title: "Online Shopping | Ecommerce Store" },
//     { name: "description", content: "Explore our latest products and offers." },
//   ];
// }

// export default function Home() {
//   const { homepage } = useLoaderData();
//   const store = useStore();
//   const dispatch = useDispatch();

//   // Seed Redux before children render so server HTML and first client render match.
//   useState(() => {
//     if (homepage) store.dispatch(getHomepage.fulfilled(homepage, "ssr", undefined));
//   });

//   // Fallback if the loader couldn't reach the API
//   useEffect(() => {
//     if (!homepage) dispatch(getHomepage());
//   }, [homepage, dispatch]);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
//       <main>
//         <Hero />
//         <PromoCards />
//         <CategorySection />
//         <RecommendedProducts />
//         <PromoGrid />
//         <ShopByNeed />
//         <FeaturedProducts />
//       </main>
//     </div>
//   );
// }