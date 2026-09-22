
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Gamepad2,
  Home,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ShopByNeed() {
  const navigate = useNavigate();

  const collections = [
    {
      title: "Work from anywhere",
      description:
        "Everything you need to build a productive workspace wherever you are.",
      icon: BriefcaseBusiness,
      query: "office",
      eyebrow: "PRODUCTIVITY",
      featured: true,
    },
    {
      title: "Gaming setup",
      description: "Gear built for better sessions.",
      icon: Gamepad2,
      query: "gaming",
      eyebrow: "GAMING",
    },
    {
      title: "Better home",
      description: "Smart products for your space.",
      icon: Home,
      query: "home",
      eyebrow: "HOME",
    },
    {
      title: "Stay connected",
      description: "Everyday tech that keeps you connected.",
      icon: Smartphone,
      query: "electronics",
      eyebrow: "TECH",
    },
  ];

  const handleNavigate = (query) => {
     window.scrollTo({
      top: 0,
      behavior: 'smooth' // 'auto' for an instant jump
    });
   navigate(`/search?q=${query}`);
  };

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

        {/* =========================================================
            HEADER
        ========================================================== */}
        <div className="mb-7 sm:mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-[11px]">
            Curated for you
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-gray-950 sm:text-3xl lg:text-4xl">
            Shop by your lifestyle
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Explore products around the things you do every day.
          </p>
        </div>

        {/* =========================================================
            COLLECTION GRID

            Mobile  : 1 column
            Tablet  : 2 columns
            Desktop : 2 columns

            Every card has exactly the same width and height.
        ========================================================== */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {collections.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handleNavigate(item.query)}
                className={`
                  group
                  relative
                  flex
                  min-h-[260px]
                  w-full
                  cursor-pointer
                  flex-col
                  overflow-hidden
                  rounded-[24px]
                  p-6
                  text-left
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  sm:min-h-[280px]
                  sm:p-7
                  lg:min-h-[300px]
                  lg:rounded-[26px]
                  lg:p-8

                  ${
                    item.featured
                      ? "bg-gray-950 text-white hover:shadow-2xl hover:shadow-gray-900/15"
                      : "border border-gray-200 bg-gray-50 text-gray-950 hover:border-gray-300 hover:bg-white hover:shadow-xl hover:shadow-gray-200/60"
                  }
                `}
              >
                {/* =================================================
                    BACKGROUND DECORATION
                ================================================== */}
                {item.featured ? (
                  <>
                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-20
                        -top-20
                        h-56
                        w-56
                        rounded-full
                        bg-blue-600/20
                        blur-3xl
                        transition-transform
                        duration-700
                        group-hover:scale-125
                      "
                    />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -bottom-24
                        -left-16
                        h-48
                        w-48
                        rounded-full
                        bg-indigo-500/10
                        blur-3xl
                      "
                    />

                    {/* Subtle grid pattern */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                          backgroundSize: "38px 38px",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-12
                      -top-12
                      h-32
                      w-32
                      rounded-full
                      bg-blue-100/60
                      blur-2xl
                      transition-transform
                      duration-500
                      group-hover:scale-125
                    "
                  />
                )}

                {/* =================================================
                    TOP ROW
                ================================================== */}
                <div className="relative z-10 flex items-start justify-between">
                  {/* ICON */}
                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      transition-all
                      duration-300
                      sm:h-[52px]
                      sm:w-[52px]

                      ${
                        item.featured
                          ? "bg-white/10 text-white ring-1 ring-white/10 backdrop-blur-sm group-hover:bg-white/15"
                          : "bg-white text-gray-800 shadow-sm ring-1 ring-gray-100 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600"
                      }
                    `}
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  {/* TOP RIGHT ARROW */}
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      transition-all
                      duration-300
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      sm:h-10
                      sm:w-10

                      ${
                        item.featured
                          ? "border border-white/10 bg-white/10 text-white backdrop-blur-sm group-hover:bg-white group-hover:text-gray-950"
                          : "border border-gray-200 bg-white text-gray-500 group-hover:border-gray-950 group-hover:bg-gray-950 group-hover:text-white"
                      }
                    `}
                  >
                    <ArrowUpRight size={17} />
                  </div>
                </div>

                {/* =================================================
                    CONTENT

                    No absolute positioning here.
                    flex + mt-auto keeps the content aligned
                    consistently regardless of text length.
                ================================================== */}
                <div className="relative z-10 mt-auto pt-8">
                  {/* EYEBROW */}
                  <p
                    className={`
                      text-[9px]
                      font-bold
                      tracking-[0.18em]
                      sm:text-[10px]

                      ${
                        item.featured
                          ? "text-blue-300"
                          : "text-blue-600"
                      }
                    `}
                  >
                    {item.eyebrow}
                  </p>

                  {/* TITLE */}
                  <h3
                    className={`
                      mt-1.5
                      text-xl
                      font-black
                      leading-tight
                      tracking-[-0.03em]
                      sm:text-2xl

                      ${
                        item.featured
                          ? "text-white"
                          : "text-gray-950"
                      }
                    `}
                  >
                    {item.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p
                    className={`
                      mt-2
                      max-w-lg
                      text-xs
                      leading-5
                      sm:text-sm
                      sm:leading-6

                      ${
                        item.featured
                          ? "text-white/60"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {item.description}
                  </p>

                  {/* BOTTOM CTA */}
                  <span
                    className={`
                      mt-3
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      font-bold
                      sm:mt-4
                      sm:text-sm

                      ${
                        item.featured
                          ? "text-white group-hover:text-blue-300"
                          : "text-gray-900 group-hover:text-blue-600"
                      }
                    `}
                  >
                    Explore collection

                    <ArrowUpRight
                      size={14}
                      className="
                        transition-transform
                        duration-300
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                      "
                    />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
