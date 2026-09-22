import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-16">

      {/* ================= MAIN FOOTER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-10
        ">

          {/* ================= BRAND ================= */}
          <div>

            <h2 className="text-2xl font-black tracking-tight">
              <span className="text-white">E</span>
              <span className="text-blue-500">shop</span>
            </h2>

            <p className="
              mt-4
              max-w-sm
              text-sm
              leading-6
              text-gray-400
            ">
              Discover quality products, amazing deals, and
              a simple shopping experience designed for everyone.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-3 mt-6">

              <div className="
                flex items-center gap-2
                rounded-xl
                bg-white/5
                px-3 py-2
                text-xs
                text-gray-400
              ">
                <ShieldCheck
                  size={16}
                  className="text-blue-500"
                />

                Secure
              </div>

              <div className="
                flex items-center gap-2
                rounded-xl
                bg-white/5
                px-3 py-2
                text-xs
                text-gray-400
              ">
                <Truck
                  size={16}
                  className="text-blue-500"
                />

                Fast Delivery
              </div>

            </div>

          </div>


          {/* ================= SHOP ================= */}
          <div>

            <h3 className="font-semibold text-white">
              Shop
            </h3>

            <ul className="mt-5 space-y-3 text-sm">

              <li>
                <a
                  href="/products"
                  className="text-gray-400 hover:text-white transition"
                >
                  All Products
                </a>
              </li>

              <li>
                <a
                  href="/categories"
                  className="text-gray-400 hover:text-white transition"
                >
                  Categories
                </a>
              </li>

              <li>
                <a
                  href="/deals"
                  className="text-gray-400 hover:text-white transition"
                >
                  Best Deals
                </a>
              </li>

              <li>
                <a
                  href="/trending"
                  className="text-gray-400 hover:text-white transition"
                >
                  Trending
                </a>
              </li>

              <li>
                <a
                  href="/wishlist"
                  className="text-gray-400 hover:text-white transition"
                >
                  Wishlist
                </a>
              </li>

            </ul>

          </div>


          {/* ================= CUSTOMER SERVICE ================= */}
          <div>

            <h3 className="font-semibold text-white">
              Customer Service
            </h3>

            <ul className="mt-5 space-y-3 text-sm">

              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact Us
                </a>
              </li>

              <li>
                <a
                  href="/shipping"
                  className="text-gray-400 hover:text-white transition"
                >
                  Shipping Information
                </a>
              </li>

              <li>
                <a
                  href="/returns"
                  className="text-gray-400 hover:text-white transition"
                >
                  Returns & Refunds
                </a>
              </li>

              <li>
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition"
                >
                  Terms & Conditions
                </a>
              </li>

            </ul>

          </div>


          {/* ================= CONTACT ================= */}
          <div>

            <h3 className="font-semibold text-white">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4">

              {/* Email */}
              <div className="flex items-start gap-3">

                <div className="
                  h-9 w-9
                  shrink-0
                  rounded-lg
                  bg-white/5
                  flex items-center justify-center
                  text-blue-500
                ">
                  <Mail size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Email
                  </p>

                  <p className="text-sm text-gray-300">
                    support@eshop.com
                  </p>
                </div>

              </div>


              {/* Phone */}
              <div className="flex items-start gap-3">

                <div className="
                  h-9 w-9
                  shrink-0
                  rounded-lg
                  bg-white/5
                  flex items-center justify-center
                  text-blue-500
                ">
                  <Phone size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  <p className="text-sm text-gray-300">
                    +91 98765 43210
                  </p>
                </div>

              </div>


              {/* Location */}
              <div className="flex items-start gap-3">

                <div className="
                  h-9 w-9
                  shrink-0
                  rounded-lg
                  bg-white/5
                  flex items-center justify-center
                  text-blue-500
                ">
                  <MapPin size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Location
                  </p>

                  <p className="text-sm text-gray-300">
                    India
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================= NEWSLETTER ================= */}
        <div className="
          mt-12
          rounded-2xl
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
          p-6
          sm:p-8
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-6
        ">

          <div>

            <h3 className="text-xl font-bold">
              Get the latest deals
            </h3>

            <p className="
              mt-1
              text-sm
              text-blue-100
            ">
              Subscribe for exclusive offers and new products.
            </p>

          </div>


          <div className="
            flex
            w-full
            lg:w-auto
            lg:min-w-[360px]
          ">

            <input
              type="email"
              placeholder="Enter your email"
              className="
                min-w-0
                flex-1
                h-11
                px-4
                rounded-l-xl
                bg-white
                text-gray-900
                outline-none
                placeholder:text-gray-400
              "
            />

            <button
              type="button"
              className="
                h-11
                px-4
                sm:px-5
                rounded-r-xl
                bg-gray-950
                text-white
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                hover:bg-gray-900
                transition
              "
            >
              Subscribe
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

      </div>


      {/* ================= BOTTOM ================= */}
      <div className="border-t border-white/10">

        <div className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-5
          flex
          flex-col
          sm:flex-row
          items-center
          justify-between
          gap-3
          text-xs
          text-gray-500
        ">

          <p>
            © {new Date().getFullYear()} Eshop. All rights reserved.
          </p>

          <div className="flex items-center gap-1">
            Made with
            <Heart
              size={13}
              className="mx-1 text-red-500 fill-red-500"
            />
            for our customers
          </div>

        </div>

      </div>

    </footer>
  );
}