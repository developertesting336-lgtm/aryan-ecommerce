import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Hero from "../components/home/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";
import ShopByNeed from "../components/home/ShopByNeed";
import PromoCards from "../components/home/PromoCards";
import PromoGrid from "../components/home/PromoGrid";
import CategorySection from "../components/home/CategorySection";
import RecommendedProducts from "../components/products/RecommendedProducts";
import { getHomepage } from "../redux/slices/content/homepage/homepageSlice";

export default function Home() {
  const dispatch = useDispatch();
  const homepage = useSelector((state) => state.homepage);

  const hasData = Boolean(
    (homepage?.hero && homepage.hero.length > 0) ||
    (homepage?.featuredProducts && homepage.featuredProducts.length > 0) ||
    (homepage?.promoCards && homepage.promoCards.length > 0)
  );

  // Only fetch client-side if preloaded state is empty (e.g. client navigation)
  useEffect(() => {
    if (!hasData) {
      dispatch(getHomepage());
    }
  }, [dispatch, hasData]);

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
