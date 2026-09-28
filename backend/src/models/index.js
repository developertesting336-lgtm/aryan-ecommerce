import User from "./user.model.js";
import { Product } from "./product.model.js";
import { Wishlist } from "./wishlist.model.js";
import { Cart } from "./cart.model.js";
import { ProductRelation } from "./ProductRelation.model.js";
import { Category } from "./category.model.js";
import { Order,OrderItem,OrderAddress } from "./orders.model.js";
import { Coupon,CouponUsage } from "./coupon.model.js";

// Homepage Content Models
import HeroSlide from "./content/homePage/HeroSlide.model.js";
import PromoCard from "./content/homePage/promoCard.model.js";
import PromoGridItem from "./content/homePage/PromoGridItem.model.js";
import ShopByNeed from "./content/homePage/ShopByNeed.model.js";

export{
    User,Product,Cart,Wishlist,ProductRelation,Category,Order,OrderItem,OrderAddress, Coupon,CouponUsage,
      // Homepage Content
  HeroSlide,
  PromoCard,
  PromoGridItem,
  ShopByNeed,
}