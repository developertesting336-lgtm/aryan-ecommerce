import {
  ArrowUpRight,
  Gamepad2,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  ShoppingBag,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function ShopByNeed() {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | SHOP COLLECTIONS
  |--------------------------------------------------------------------------
  |
  | For now videos are loaded from /public.
  |
  | Example:
  | frontend/public/4523109-hd_1920_1080_25fps.mp4
  |
  | Later these values can come directly from your backend/API.
  |
  */

  const collections = [
    {
      id: 1,
      title: "Fashion & Style",
      description:
        "Discover clothing, footwear, and everyday styles made for you.",
      icon: Shirt,
      query: "fashion",
      eyebrow: "FASHION",
      video: "/9594846-uhd_4096_2160_25fps.mp4",
      fallbackImage:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85",
    },

    {
      id: 2,
      title: "Gaming Setup",
      description:
        "Level up your gaming experience with gear built for better sessions.",
      icon: Gamepad2,
      query: "gaming",
      eyebrow: "GAMING",
      video: "/4523109-hd_1920_1080_25fps.mp4",
      fallbackImage:
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1600&q=85",
    },

    {
      id: 3,
      title: "Home & Living",
      description:
        "Make your space comfortable, beautiful, and better for everyday life.",
      icon: Home,
      query: "home",
      eyebrow: "HOME & LIVING",
      video: "/4109575-uhd_2160_4096_25fps.mp4",
      fallbackImage:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
    },

    {
      id: 4,
      title: "Beauty & Care",
      description:
        "Explore beauty, skincare, personal care, and everyday essentials.",
      icon: Sparkles,
      query: "beauty",
      eyebrow: "BEAUTY & CARE",
      video: "/5205798-hd_1080_1916_25fps.mp4",
      fallbackImage:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=85",
    },

    {
      id: 5,
      title: "Sports & Fitness",
      description:
        "Find products that keep you active, comfortable, and ready to move.",
      icon: Dumbbell,
      query: "sports",
      eyebrow: "SPORTS & FITNESS",
      video: "/4383403-hd_1920_1080_30fps.mp4",
      fallbackImage:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85",
    },

    {
      id: 6,
      title: "Bags & Accessories",
      description:
        "Complete your everyday look with stylish bags and accessories.",
      icon: ShoppingBag,
      query: "accessories",
      eyebrow: "ACCESSORIES",
      video: "/9595334-uhd_2160_4096_25fps.mp4",
      fallbackImage:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=85",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const handleNavigate = (query) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="w-full bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]
          px-4
          py-10
          sm:px-6
          sm:py-12
          lg:px-8
          lg:py-16
        "
      >
        {/* =========================================================
            SECTION HEADER
        ========================================================== */}

        <div className="mb-7 sm:mb-9 lg:mb-10">
          <div className="flex items-center gap-2">
            <span
              className="
                h-1.5
                w-7
                rounded-full
                bg-app-primary
              "
            />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-app-primary
                sm:text-[11px]
              "
            >
              Curated for you
            </p>
          </div>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-[-0.035em]
              text-gray-950
              sm:text-3xl
              lg:text-4xl
            "
          >
            Shop by your lifestyle
          </h2>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-gray-500
              sm:text-base
            "
          >
            Explore products around the things you love, wear, use, and do
            every day.
          </p>
        </div>

        {/* =========================================================
            COLLECTION GRID
        ========================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            sm:gap-5
            lg:grid-cols-3
            lg:gap-6
          "
        >
          {collections.map((item) => (
            <CollectionCard
              key={item.id}
              item={item}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| COLLECTION CARD
|--------------------------------------------------------------------------
*/

function CollectionCard({ item, onNavigate }) {
  const videoRef = useRef(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | AUTOPLAY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    const startVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log("Autoplay waiting:", error);
      }
    };

    startVideo();
  }, [item.video]);

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.query)}
      className="
        group
        relative
        min-h-[310px]
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-gray-950
        text-left
        shadow-sm
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-app-primary/30
        hover:shadow-xl

        focus:outline-none
        focus:ring-2
        focus:ring-app-primary
        focus:ring-offset-2

        sm:min-h-[340px]
        sm:rounded-2xl

        lg:min-h-[360px]
      "
    >
      {/* =========================================================
          FALLBACK IMAGE
      ========================================================== */}

      <img
        src={item.fallbackImage}
        alt=""
        aria-hidden="true"
        className={`
          absolute
          inset-0
          h-full
          w-full
          object-cover
          transition-opacity
          duration-500
          ${
            videoLoaded && !videoError
              ? "opacity-0"
              : "opacity-100"
          }
        `}
      />

      {/* =========================================================
          VIDEO
      ========================================================== */}

      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-100
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.025]
          "
        >
          <source
            src={item.video}
            type="video/mp4"
          />

          Your browser does not support the video tag.
        </video>
      )}

      {/* =========================================================
          VERY LIGHT THEME OVERLAY
          
          Uses your primary blue very subtly.
          It does NOT make the video look faded.
      ========================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gray-950/10
        "
      />

      {/* =========================================================
          BOTTOM CONTENT GRADIENT
      ========================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[55%]
          bg-gradient-to-t
          from-gray-950/90
          via-gray-950/45
          to-transparent
        "
      />

      {/* =========================================================
          TOP SUBTLE GRADIENT
      ========================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-20
          bg-gradient-to-b
          from-gray-950/25
          to-transparent
        "
      />

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[310px]
          flex-col
          p-5

          sm:min-h-[340px]
          sm:p-6

          lg:min-h-[360px]
          lg:p-7
        "
      >
        {/* =======================================================
            TOP ROW
        ======================================================== */}

        <div className="flex items-start justify-between">
          {/* ICON */}

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-white/20
              bg-white/15
              text-white
              backdrop-blur-sm
              transition-all
              duration-300

              group-hover:border-app-primary
              group-hover:bg-app-primary
              group-hover:text-white
            "
          >
            <item.icon
              size={21}
              strokeWidth={1.8}
            />
          </div>

          {/* ARROW */}

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-white/15
              text-white
              backdrop-blur-sm
              transition-all
              duration-300

              group-hover:border-app-primary
              group-hover:bg-app-primary
              group-hover:text-white
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
            "
          >
            <ArrowUpRight size={17} />
          </div>
        </div>

        {/* =======================================================
            TEXT
        ======================================================== */}

        <div className="mt-auto pt-10">
          {/* EYEBROW */}

          <div className="flex items-center gap-2">
            <span
              className="
                h-1
                w-4
                rounded-full
                bg-app-primary
              "
            />

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/90
                sm:text-[10px]
              "
            >
              {item.eyebrow}
            </p>
          </div>

          {/* TITLE */}

          <h3
            className="
              mt-2
              max-w-[95%]
              text-xl
              font-black
              leading-tight
              tracking-[-0.03em]
              text-white
              sm:text-2xl
            "
          >
            {item.title}
          </h3>

          {/* DESCRIPTION */}

          <p
            className="
              mt-2
              max-w-[95%]
              text-xs
              leading-5
              text-white/80
              sm:text-sm
              sm:leading-6
            "
          >
            {item.description}
          </p>

          {/* CTA */}

          <span
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-bold
              text-white
              transition-colors
              duration-300
              group-hover:text-blue-200
              sm:text-sm
            "
          >
            Explore collection

            <ArrowUpRight
              size={14}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </span>
        </div>
      </div>

      {/* =========================================================
          THEME BORDER
      ========================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl
          border
          border-white/10
          transition-all
          duration-300

          group-hover:border-app-primary/50
        "
      />

      {/* =========================================================
          BLUE HOVER LINE
      ========================================================== */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-0
          bg-app-primary
          transition-all
          duration-500
          group-hover:w-full
        "
      />
    </button>
  );
}
