import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js"
import authRoutes from "./auth.routes.js";
import cartRoutes from "./cart.routes.js";
import wishlistRoutes from  "./wishlist.routes.js";
import categoryRoutes from "./category.routes.js"
import productRelationRoutes from "./productRelation.routes.js"
import ordersRoutes from "./orders.routes.js"
import paymentRoutes from "./payment.routes.js";
import adminRoutes from "./admin.routes.js";
import vendorRoutes from "./vendor.routes.js"
import couponRoutes from "./coupon.routes.js"

// ============================================================
// HOMEPAGE CONTENT ROUTES
// ============================================================
import homepageRoutes from "./content/homepage/homepage.routes.js";
import heroRoutes from "./content/homepage/hero.routes.js";
import promoCardRoutes from "./content/homepage/promoCard.routes.js";
import promoGridRoutes from "./content/homepage/promoGrid.routes.js";
import shopByNeedRoutes from "./content/homepage/shopByNeed.routes.js";
const api="/api"

const routes = [
    {
        path: `${api}/auth/`,
        route:  authRoutes
    },
    {
        path: `${api}/user/`,
        route: userRoutes
    },
    {
        path: `${api}/product/`,
        route: productRoutes
    },
    {
        path: `${api}/productRelation/`,
        route: productRelationRoutes
    },
    {
        path: `${api}/cart/`,
        route: cartRoutes
    },
    {
        path: `${api}/wishlist/`,
        route: wishlistRoutes
    },
    {
        path: `${api}/categories/`,
        route: categoryRoutes
    },
    {
        path: `${api}/orders/`,
        route: ordersRoutes
    },
    {
        path: `${api}/payment/`,
        route: paymentRoutes
    },
    {
        path: `${api}/admin/`,
        route: adminRoutes
    },
     // ==========================================================
  // ADMIN HOMEPAGE CONTENT
  // ==========================================================
{
  path: `${api}/homepage/`,
  route: homepageRoutes,
},
  {
    path: `${api}/admin/homepage/hero/`,
    route: heroRoutes,
  },

  {
    path: `${api}/admin/homepage/promo-card/`,
    route: promoCardRoutes,
  },

  {
    path: `${api}/admin/homepage/promo-grid/`,
    route: promoGridRoutes,
  },

  {
    path: `${api}/admin/homepage/shop-by-need/`,
    route: shopByNeedRoutes,
  },
    {
        path: `${api}/vendor/`,
        route: vendorRoutes
    },
    {
        path: `${api}/coupon/`,
        route: couponRoutes
    },
];


export default function loadRoutes(app) {
    for (const item of routes) {
        app.use(item.path, item.route);
    }

}