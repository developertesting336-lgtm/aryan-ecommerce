import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Headphones,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gray-950 text-white">
      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-10
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {/* =================================================
              BRAND
          ================================================== */}

          <div>
            {/* Logo */}

            <Link
              to="/"
              className="inline-flex items-center gap-2"
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-app-primary
                  text-lg
                  font-black
                  text-white
                  shadow-sm
                "
              >
                N
              </span>

              <span className="text-2xl font-black tracking-[-0.05em]">
                Nova
                <span className="text-app-primary">
                  Cart
                </span>
              </span>
            </Link>

            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-6
                text-gray-400
              "
            >
              Discover quality products, smart
              deals, and everyday essentials with
              a simple and reliable shopping
              experience.
            </p>

            {/* Trust badges */}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white/5
                  px-3
                  py-2
                  text-xs
                  text-gray-400
                "
              >
                <ShieldCheck
                  size={16}
                  className="text-app-primary"
                />

                Secure Shopping
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white/5
                  px-3
                  py-2
                  text-xs
                  text-gray-400
                "
              >
                <Truck
                  size={16}
                  className="text-app-primary"
                />

                Fast Delivery
              </div>
            </div>
          </div>

          {/* =================================================
              SHOP
          ================================================== */}

          <div>
            <h3 className="font-semibold text-white">
              Shop
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/products"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  to="/categories"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Shopping Cart
                </Link>
              </li>

              <li>
                <Link
                  to="/wishlist"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  to="/orders"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  My Orders
                </Link>
              </li>

              <li>
                <Link
                  to="/products"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Latest Products
                </Link>
              </li>
            </ul>
          </div>

          {/* =================================================
              CUSTOMER SERVICE
          ================================================== */}

          <div>
            <h3 className="font-semibold text-white">
              Customer Service
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/profile"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  My Account
                </Link>
              </li>

              <li>
                <Link
                  to="/orders"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Order Tracking
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/shipping"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Shipping Information
                </Link>
              </li>

              <li>
                <Link
                  to="/returns"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Returns & Refunds
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* =================================================
              CONTACT
          ================================================== */}

          <div>
            <h3 className="font-semibold text-white">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4">
              {/* Email */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                    text-app-primary
                  "
                >
                  <Mail size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    Support through your
                    customer service page
                  </p>
                </div>
              </div>

              {/* Phone */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                    text-app-primary
                  "
                >
                  <Phone size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Support
                  </p>

                  <Link
                    to="/contact"
                    className="
                      mt-1
                      block
                      text-sm
                      text-gray-300
                      transition
                      hover:text-white
                    "
                  >
                    Contact our support team
                  </Link>
                </div>
              </div>

              {/* Location */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                    text-app-primary
                  "
                >
                  <MapPin size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Service Area
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    India
                  </p>
                </div>
              </div>

              {/* Help */}

              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/5
                    text-app-primary
                  "
                >
                  <Headphones size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Customer Care
                  </p>

                  <Link
                    to="/contact"
                    className="
                      mt-1
                      block
                      text-sm
                      text-gray-300
                      transition
                      hover:text-white
                    "
                  >
                    Get help with your order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            NEWSLETTER
        ====================================================== */}

        <div
          className="
            mt-12
            flex
            flex-col
            gap-6
            rounded-2xl
            bg-gradient-to-r
            from-blue-600
            to-indigo-600
            p-6
            sm:p-8
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <h3 className="text-xl font-bold">
              Get the latest from NovaCart
            </h3>

            <p className="mt-1 text-sm text-blue-100">
              Stay updated with new products,
              offers, and exclusive deals.
            </p>
          </div>

          <form
            className="
              flex
              w-full
              lg:w-auto
              lg:min-w-[360px]
            "
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="
                min-w-0
                flex-1
                h-11
                rounded-l-xl
                bg-white
                px-4
                text-gray-900
                outline-none
                placeholder:text-gray-400
                focus:ring-2
                focus:ring-white/40
              "
            />

            <button
              type="submit"
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-r-xl
                bg-gray-950
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-gray-900
                sm:px-5
              "
            >
              Subscribe

              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* =====================================================
          BOTTOM FOOTER
      ====================================================== */}

      <div className="border-t border-white/10">
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            items-center
            justify-between
            gap-3
            px-4
            py-5
            text-xs
            text-gray-500
            sm:flex-row
            sm:px-6
            lg:px-8
          "
        >
          <p>
            © {new Date().getFullYear()} NovaCart.
            All rights reserved.
          </p>

          <div className="flex items-center gap-1">
            Made with

            <Heart
              size={13}
              className="mx-1 fill-current text-red-500"
            />

            for our customers
          </div>
        </div>
      </div>
    </footer>
  );
}
