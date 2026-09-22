import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function PromoBanner() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* =====================================================
            PROMO BANNER
        ====================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-gray-950
            px-5
            py-8
            sm:px-8
            sm:py-10
            lg:px-12
            lg:py-12
          "
        >

          {/* =====================================================
              BACKGROUND DECORATION
          ====================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-32
              h-80
              w-80
              rounded-full
              bg-blue-600/20
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              left-1/3
              h-72
              w-72
              rounded-full
              bg-indigo-500/10
              blur-3xl
            "
          />

          {/* Decorative circle */}
          <div
            className="
              pointer-events-none
              absolute
              right-10
              top-1/2
              hidden
              h-56
              w-56
              -translate-y-1/2
              rounded-full
              border
              border-white/5
              lg:block
            "
          />

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div
            className="
              relative
              z-10
              grid
              items-center
              gap-8
              lg:grid-cols-[1fr_auto]
            "
          >

            {/* LEFT CONTENT */}

            <div className="max-w-2xl">

              {/* Label */}

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-white/80
                  backdrop-blur
                "
              >
                <BadgePercent
                  size={15}
                  className="text-blue-400"
                />

                Limited-time offer
              </div>

              {/* Heading */}

              <h2
                className="
                  max-w-xl
                  text-3xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Upgrade your everyday
                <span className="text-blue-500">
                  {" "}for less.
                </span>
              </h2>

              {/* Description */}

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-gray-400
                  sm:text-base
                "
              >
                Save more on selected products while stocks last.
                Discover quality products at prices worth coming back for.
              </p>

              {/* =====================================================
                  BENEFITS
              ====================================================== */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-3
                "
              >

                {/* Benefit 1 */}

                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-blue-400"
                  />

                  <span className="text-xs font-medium text-gray-300 sm:text-sm">
                    Selected deals
                  </span>
                </div>

                {/* Benefit 2 */}

                <div className="flex items-center gap-2.5">
                  <Truck
                    size={17}
                    className="shrink-0 text-blue-400"
                  />

                  <span className="text-xs font-medium text-gray-300 sm:text-sm">
                    Fast delivery
                  </span>
                </div>

                {/* Benefit 3 */}

                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    size={17}
                    className="shrink-0 text-blue-400"
                  />

                  <span className="text-xs font-medium text-gray-300 sm:text-sm">
                    Secure checkout
                  </span>
                </div>

              </div>

              {/* =====================================================
                  CTA
              ====================================================== */}

              <div className="mt-7">

                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-gray-950
                    shadow-lg
                    shadow-black/10
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-blue-600
                    hover:text-white
                    active:translate-y-0
                    cursor-pointer
                  "
                >
                  Shop deals

                  <ArrowRight
                    size={17}
                    strokeWidth={2.3}
                  />
                </button>

              </div>

            </div>

            {/* =====================================================
                RIGHT OFFER CARD
            ====================================================== */}

            <div
              className="
                relative
                w-full
                max-w-sm
                lg:w-[300px]
              "
            >

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  p-5
                  backdrop-blur-md
                "
              >

                {/* Top */}

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Special savings
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Selected products
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-600
                      text-white
                    "
                  >
                    <BadgePercent size={21} />
                  </div>

                </div>

                {/* Discount */}

                <div className="mt-6 flex items-end gap-2">

                  <span
                    className="
                      text-5xl
                      font-black
                      leading-none
                      tracking-tight
                      text-white
                    "
                  >
                    50%
                  </span>

                  <span className="mb-1 text-sm font-semibold text-blue-400">
                    OFF
                  </span>

                </div>

                {/* Divider */}

                <div className="my-5 h-px bg-white/10" />

                {/* Offer info */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Clock3
                      size={15}
                      className="text-gray-400"
                    />

                    <span className="text-xs text-gray-400">
                      Limited availability
                    </span>

                  </div>

                  <span
                    className="
                      rounded-full
                      bg-green-400/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-green-400
                    "
                  >
                    Live
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
