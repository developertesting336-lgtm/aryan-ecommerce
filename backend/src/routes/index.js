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