// import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
// import iphone from "../../assets/iphone.webp";
// import second from "../../assets/493988652898829963.jfif";
// import { useNavigate } from "react-router-dom";

// export default function Hero() {
//   const navigate = useNavigate();

//   return (
//     <section className="w-full">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

//           {/* ================= MAIN BANNER ================= */}
//           <div
//             className="
//               relative
//               lg:col-span-2
//               overflow-hidden
//               rounded-2xl
//               min-h-[280px]
//               sm:min-h-[340px]
//               lg:min-h-[390px]
//               bg-gradient-to-br
//               from-[#0f2470]
//               via-[#254edb]
//               to-[#6d8cff]
//             "
//           >

//             {/* Image */}
//             <img
//               src={iphone}
//               alt="iPhone 16 Pro Max"
//               className="
//                 absolute
//                 right-[-30px]
//                 sm:right-0
//                 bottom-0
//                 h-[85%]
//                 sm:h-[90%]
//                 lg:h-full
//                 max-w-[55%]
//                 object-contain
//               "
//             />

//             {/* Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />

//             {/* Content */}
//             <div
//               className="
//                 relative
//                 z-10
//                 flex
//                 h-full
//                 items-center
//                 px-6
//                 sm:px-8
//                 lg:px-12
//                 py-10
//               "
//             >
//               <div className="max-w-[55%] sm:max-w-md text-white">

//                 <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-200">
//                   New Arrival
//                 </p>

//                 <h1
//                   className="
//                     mt-2
//                     text-2xl
//                     sm:text-4xl
//                     lg:text-5xl
//                     font-black
//                     leading-tight
//                   "
//                 >
//                  Discover Something

//                   <br />
//                    New
//                 </h1>

//                 <p className="mt-3 text-sm sm:text-base text-blue-100">
// Explore our latest collection and find something you’ll love.
//                 </p>

//                 <div className="mt-4">
//                   {/* <span className="text-xs text-blue-200">
//                     Starting from
//                   </span> */}

//                   {/* <div className="text-2xl sm:text-3xl font-black">
//                     $899
//                   </div> */}
//                 </div>

//                 <button
//                   onClick={() => navigate("/products")}
//                   className="
//                     mt-5
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-xl
//                     bg-white
//                     px-5
//                     py-2.5
//                     text-sm
//                     font-bold
//                     text-blue-700
//                     shadow-lg
//                     hover:bg-gray-100
//                     transition
//                     cursor-pointer
//                   "
//                 >
//                   Shop Now
//                   <ArrowRight size={16} />
//                 </button>

//               </div>
//             </div>

//             {/* Arrows */}
//             {/* <button
//               className="
//                 absolute
//                 left-3
//                 top-1/2
//                 -translate-y-1/2
//                 hidden
//                 sm:flex
//                 h-9
//                 w-9
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-white/20
//                 text-white
//                 backdrop-blur
//                 hover:bg-white/30
//               "
//             >
//               <ChevronLeft size={20} />
//             </button>

//             <button
//               className="
//                 absolute
//                 right-3
//                 top-1/2
//                 -translate-y-1/2
//                 hidden
//                 sm:flex
//                 h-9
//                 w-9
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-white/20
//                 text-white
//                 backdrop-blur
//                 hover:bg-white/30
//               "
//             >
//               <ChevronRight size={20} />
//             </button> */}

//             {/* Dots */}
//             {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
//               <span className="h-1.5 w-6 rounded-full bg-white" />
//               <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
//               <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
//             </div> */}

//           </div>

//           {/* ================= SIDE PROMO ================= */}
//           <div
//             className="
//               relative
//               overflow-hidden
//               rounded-2xl
//               min-h-[220px]
//               sm:min-h-[260px]
//               lg:min-h-[390px]
//               group
//             "
//           >

//             <img
//               src={second}
//               alt="Special offer"
//               className="
//                 absolute
//                 inset-0
//                 h-full
//                 w-full
//                 object-cover
//                 transition
//                 duration-700
//                 group-hover:scale-105
//               "
//             />

//             <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

//             <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">

//               <p className="text-sm font-medium text-gray-200">
//                 Limited Time Offer
//               </p>

//               <h2 className="mt-1 text-3xl sm:text-4xl font-black">
//                 50% OFF
//               </h2>

//               <p className="mt-1 text-sm text-gray-200">
//                 Grab your favorite products today.
//               </p>

//               <button
//                 onClick={() => navigate("/products")}
//                 className="
//                   mt-4
//                   rounded-xl
//                   bg-white
//                   px-5
//                   py-2.5
//                   text-sm
//                   font-bold
//                   text-gray-900
//                   hover:bg-gray-100
//                   transition
//                   cursor-pointer
//                 "
//               >
//                 Explore Deals
//               </button>

//             </div>

//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }





import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import iphone from "../../assets/iphone.webp";
import second from "../../assets/493988652898829963.jfif";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* =====================================================
            HERO
        ====================================================== */}
        <div className="grid gap-4 lg:grid-cols-[1.65fr_0.8fr]">

          {/* ================= MAIN HERO ================= */}
          <div
            className="
              group
              relative
              min-h-[500px]
              overflow-hidden
              rounded-[28px]
              bg-[#f3f6ff]
              sm:min-h-[540px]
              lg:min-h-[590px]
            "
          >

            {/* Decorative background */}
            <div
              className="
                absolute
                -right-32
                -top-32
                h-[420px]
                w-[420px]
                rounded-full
                bg-blue-200/40
                blur-3xl
              "
            />

            <div
              className="
                absolute
                bottom-[-180px]
                left-[20%]
                h-[400px]
                w-[400px]
                rounded-full
                bg-indigo-200/30
                blur-3xl
              "
            />

            {/* Small top label */}
            <div
              className="
                absolute
                left-6
                top-6
                z-20
                flex
                items-center
                gap-2
                rounded-full
                border
                border-gray-200/80
                bg-white/80
                px-3.5
                py-2
                text-xs
                font-semibold
                text-gray-700
                shadow-sm
                backdrop-blur
                sm:left-8
                sm:top-8
              "
            >
              <Sparkles size={14} className="text-blue-600" />
              New collection 2026
            </div>

            {/* Product image */}
            <div
              className="
                absolute
                right-[-5%]
                top-[16%]
                z-10
                flex
                w-[62%]
                justify-center
                transition-transform
                duration-700
                ease-out
                group-hover:translate-x-2
                sm:right-[0%]
                sm:w-[58%]
                lg:right-[-2%]
                lg:top-[8%]
                lg:w-[59%]
              "
            >
              <img
                src={iphone}
                alt="Latest smartphone"
                className="
                  h-auto
                  max-h-[390px]
                  w-full
                  object-contain
                  drop-shadow-[0_35px_35px_rgba(30,64,175,0.22)]
                  sm:max-h-[440px]
                  lg:max-h-[510px]
                "
              />
            </div>

            {/* Main content */}
            <div
              className="
                relative
                z-20
                flex
                min-h-[500px]
                w-full
                flex-col
                justify-end
                p-6
                sm:min-h-[540px]
                sm:p-9
                lg:min-h-[590px]
                lg:w-[57%]
                lg:justify-center
                lg:p-12
              "
            >

              <div className="max-w-[430px]">

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Technology, redefined
                </p>

                <h1
                  className="
                    text-[42px]
                    font-black
                    leading-[0.98]
                    tracking-[-0.04em]
                    text-gray-950
                    sm:text-5xl
                    lg:text-[64px]
                  "
                >
                  Find what
                  <br />
                  <span className="text-blue-600">
                    inspires you.
                  </span>
                </h1>

                <p
                  className="
                    mt-5
                    max-w-[380px]
                    text-sm
                    leading-6
                    text-gray-600
                    sm:text-base
                  "
                >
                  Discover carefully selected products designed to
                  make everyday life smarter, simpler, and better.
                </p>

                {/* CTA */}
                <div className="mt-7 flex flex-wrap items-center gap-3">

                  <button
                    onClick={() => navigate("/products")}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-gray-950
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      shadow-lg
                      shadow-gray-900/10
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:bg-blue-600
                      hover:shadow-blue-600/20
                      cursor-pointer
                    "
                  >
                    Explore products
                    <ArrowRight size={17} />
                  </button>

                  <button
                    onClick={() => navigate("/products")}
                    className="
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-gray-600
                      transition
                      hover:bg-white
                      hover:text-gray-950
                      cursor-pointer
                    "
                  >
                    View all
                  </button>

                </div>

              </div>
            </div>

            {/* Floating product card */}
            <div
              className="
                absolute
                bottom-6
                right-5
                z-30
                hidden
                w-[205px]
                rounded-2xl
                border
                border-white/80
                bg-white/90
                p-3
                shadow-xl
                shadow-blue-900/10
                backdrop-blur
                sm:block
                lg:right-8
              "
            >
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <img
                    src={iphone}
                    alt=""
                    className="h-9 w-9 object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-500">
                    Featured pick
                  </p>

                  <p className="truncate text-sm font-bold text-gray-900">
                    Latest Smartphone
                  </p>
                </div>

              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  New arrival
                </span>

                <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                  IN STOCK
                </span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT PROMOTION ================= */}
          <div
            className="
              relative
              min-h-[430px]
              overflow-hidden
              rounded-[28px]
              bg-[#111827]
              sm:min-h-[470px]
              lg:min-h-[590px]
            "
          >

            {/* Image */}
            <img
              src={second}
              alt="Featured offer"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                opacity-90
                transition
                duration-700
                hover:scale-105
              "
            />

            {/* Dark overlay */}
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-b
                from-black/10
                via-black/25
                to-black/90
              "
            />

            {/* Offer badge */}
            <div className="absolute left-5 top-5 z-10 sm:left-6 sm:top-6">
              <span
                className="
                  inline-flex
                  rounded-full
                  bg-white/95
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-gray-900
                  shadow-lg
                "
              >
                Limited offer
              </span>
            </div>

            {/* Promo content */}
            <div
              className="
                absolute
                inset-x-0
                bottom-0
                z-10
                p-5
                sm:p-6
                lg:p-7
              "
            >

              <p className="text-sm font-medium text-white/70">
                Selected products
              </p>

              <h2
                className="
                  mt-1
                  text-4xl
                  font-black
                  tracking-tight
                  text-white
                  sm:text-5xl
                "
              >
                50% OFF
              </h2>

              <p className="mt-2 max-w-[280px] text-sm leading-5 text-white/70">
                Refresh your setup with special prices for a limited time.
              </p>

              <button
                onClick={() => navigate("/products")}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-gray-950
                  transition
                  hover:bg-blue-600
                  hover:text-white
                  cursor-pointer
                "
              >
                Shop the sale
                <ArrowRight size={16} />
              </button>

            </div>

          </div>

        </div>
      </div> 
    </section>
  );
}





















// import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// import iphone from "../../assets/iphone.webp";
// import second from "../../assets/493988652898829963.jfif";

// export default function Hero() {
//   const navigate = useNavigate();

//   return (
//     <section className="bg-white">
//       <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
//         <div className="grid overflow-hidden rounded-[28px] bg-[#f4f7ff] lg:grid-cols-[1.2fr_0.8fr]">

//           {/* Main content */}
//           <div className="relative flex min-h-[500px] items-center overflow-hidden px-6 py-12 sm:px-10 lg:min-h-[570px] lg:px-14">

//             {/* Background decoration */}
//             <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
//             <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

//             <div className="relative z-10 max-w-xl">

//               <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
//                 <Sparkles size={14} />
//                 Discover something new
//               </div>

//               <h1 className="text-[44px] font-black leading-[0.98] tracking-[-0.045em] text-gray-950 sm:text-6xl lg:text-[70px]">
//                 Everything you
//                 <br />
//                 <span className="text-blue-600">
//                   actually want.
//                 </span>
//               </h1>

//               <p className="mt-6 max-w-lg text-sm leading-6 text-gray-600 sm:text-base">
//                 Explore products for work, home, entertainment and everyday
//                 life — all in one place.
//               </p>

//               <div className="mt-8 flex flex-wrap gap-3">
//                 <button
//                   onClick={() => navigate("/products")}
//                   className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600"
//                 >
//                   Start shopping
//                   <ArrowRight size={17} />
//                 </button>

//                 <button
//                   onClick={() => navigate("/products")}
//                   className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-950 hover:text-white"
//                 >
//                   Explore collection
//                   <ChevronRight size={16} />
//                 </button>
//               </div>

//               {/* Small trust information */}
//               <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-gray-500">
//                 <span>✓ Secure checkout</span>
//                 <span>✓ Easy returns</span>
//                 <span>✓ Fast delivery</span>
//               </div>
//             </div>

//             {/* Main product image */}
//             <div className="pointer-events-none absolute -right-10 bottom-0 hidden w-[48%] md:block lg:-right-4 lg:w-[45%]">
//               <img
//                 src={iphone}
//                 alt="Featured smartphone"
//                 className="w-full object-contain drop-shadow-[0_30px_30px_rgba(30,64,175,0.20)] transition-transform duration-700 hover:translate-y-[-8px]"
//               />
//             </div>
//           </div>

//           {/* Secondary campaign */}
//           <div className="relative min-h-[360px] overflow-hidden bg-gray-950 lg:min-h-[570px]">
//             <img
//               src={second}
//               alt="Featured collection"
//               className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 hover:scale-105"
//             />

//             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

//             <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
//               <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-900">
//                 Trending collection
//               </span>

//               <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
//                 Upgrade your
//                 <br />
//                 everyday.
//               </h2>

//               <p className="mt-3 max-w-xs text-sm leading-5 text-white/70">
//                 Discover products selected for the way you live, work and
//                 play.
//               </p>

//               <button
//                 onClick={() => navigate("/products")}
//                 className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-blue-600 hover:text-white"
//               >
//                 Explore now
//                 <ArrowRight size={16} />
//               </button>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }
