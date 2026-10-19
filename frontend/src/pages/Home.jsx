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
