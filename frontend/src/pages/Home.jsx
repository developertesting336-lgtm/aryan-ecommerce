import Hero from "../components/home/Hero";
import Features from "../components/Features";
import FeaturedProducts from "../components/home/FeaturedProducts";
import PromoBanner from "../components/home/PromoBanner";
import NewArrivals from "../components/home/NewArrivals";
import ShoppingIntent from "../components/home/ShoppingIntent";
import TrendingProducts from "../components/home/TrendingProducts";
import ShopByNeed from "../components/home/ShopByNeed";
import PromoCards from "../components/home/PromoCards";
import PromoGrid from "../components/home/PromoGrid";
import CategorySection from "../components/home/CategorySection";
import CustomerFavorites from "../components/home/CustomerFavorites";
import TrustStrip from "../components/home/TrustStrip";
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      <main>
        {/* Hero */}
        <Hero />
        <PromoCards />
        <CategorySection />
        <PromoGrid />
{/* <ShoppingIntent/>
<TrendingProducts /> */}
{/* <CustomerFavorites /> */}
{/* <TrustStrip /> */}
        {/* Store Benefits */}
        {/* <Features /> */}
        {/* Featured Products */}
<ShopByNeed />
        <FeaturedProducts />
        {/* <PromoBanner /> */}
        {/* <NewArrivals /> */}
      </main>
    </div>
  );
}