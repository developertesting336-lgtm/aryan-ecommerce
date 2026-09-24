import React from "react";
import { motion } from "motion/react";

import iphoneCard from "../../assets/6768d33b-e2a1-4100-b1a6-b3a74dcfc530.jpg";
import watchCard from "../../assets/smart-watch.jpg";
import vrImage from "../../assets/gaming.webp";

/*
|--------------------------------------------------------------------------
| Card Data
|--------------------------------------------------------------------------
| Change images/content here without touching the component.
|--------------------------------------------------------------------------
*/

const promoCards = [
  {
    id: 1,
    eyebrow: "APPLE DEALS",
    title: "Shop all Apple",
    description: "Explore our range of Apple devices.",
    buttonText: "Shop Now",
    image: iphoneCard,
    imagePosition: "center",
    overlay:
      "bg-gradient-to-r from-black/60 via-black/20 to-black/5",
  },

  {
    id: 2,
    eyebrow: "TRADE-IN",
    title: "Sell your Tech",
    description: "Get the best value, fast and hassle-free.",
    buttonText: "Sell Now",
    image: vrImage,
    imagePosition: "center",
    overlay:
      "bg-gradient-to-r from-black/75 via-black/25 to-black/10",
  },
];

/*
|--------------------------------------------------------------------------
| Animation Variants
|--------------------------------------------------------------------------
*/

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: (index) => ({
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.65,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/*
|--------------------------------------------------------------------------
| Single Promo Card
|--------------------------------------------------------------------------
*/

function PromoCard({
  eyebrow,
  title,
  description,
  buttonText,
  image,
  imagePosition = "center",
  overlay = "bg-gradient-to-r from-black/60 to-transparent",
  index,
}) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.25,
      }}
      className="
        group
        relative
        isolate
        min-h-[320px]
        overflow-hidden
        rounded-[10px]
        bg-neutral-900
        shadow-[0_8px_30px_rgba(0,0,0,0.08)]

        sm:min-h-[350px]
      "
      whileHover={{
        y: -3,
        transition: {
          duration: 0.25,
          ease: "easeOut",
        },
      }}
    >
      {/* ---------------------------------------------------------------
          Background Image
      ---------------------------------------------------------------- */}

      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        style={{
          objectPosition: imagePosition,
        }}
        className="
          absolute
          inset-0
          -z-20
          h-full
          w-full
          object-cover
        "
        initial={{
          scale: 1.04,
        }}
        whileInView={{
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{
          scale: 1.045,
          transition: {
            duration: 0.7,
            ease: "easeOut",
          },
        }}
      />

      {/* ---------------------------------------------------------------
          Main Gradient
      ---------------------------------------------------------------- */}

      <div
        className={`
          absolute
          inset-0
          -z-10
          ${overlay}
        `}
      />

      {/* ---------------------------------------------------------------
          Bottom Vignette
      ---------------------------------------------------------------- */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          -z-10
          h-1/2
          bg-gradient-to-t
          from-black/30
          to-transparent
        "
      />

      {/* ---------------------------------------------------------------
          Content
      ---------------------------------------------------------------- */}

      <motion.div
        variants={contentVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.25,
        }}
        className="
          flex
          min-h-[320px]
          flex-col
          items-start
          justify-end
          p-6
          text-white

          sm:min-h-[350px]
          sm:p-7

          md:p-8
        "
      >
        {/* Eyebrow */}

        <motion.p
          initial={{
            opacity: 0,
            y: 8,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.45,
            delay: 0.25,
          }}
          className="
            mb-2
            text-[9px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-white/80

            sm:text-[10px]
          "
        >
          {eyebrow}
        </motion.p>

        {/* Title */}

        <motion.h2
          initial={{
            opacity: 0,
            y: 12,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
            delay: 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            text-[28px]
            font-medium
            leading-[1.05]
            tracking-[-0.035em]

            sm:text-[31px]

            md:text-[34px]
          "
        >
          {title}
        </motion.h2>

        {/* Description */}

        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.45,
            delay: 0.4,
          }}
          className="
            mt-2
            max-w-[270px]
            text-[12px]
            leading-5
            text-white/85

            sm:text-[13px]
          "
        >
          {description}
        </motion.p>

        {/* Button */}

        <motion.button
          type="button"
          initial={{
            opacity: 0,
            y: 10,
            scale: 0.96,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.45,
            delay: 0.48,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -2,
            scale: 1.025,
          }}
          whileTap={{
            scale: 0.97,
          }}
          className="
            mt-4
            rounded-full
            bg-white
            px-5
            py-2.5
            text-[11px]
            font-medium
            text-neutral-900
            shadow-sm

            transition-colors
            duration-200

            hover:bg-white/90

            focus:outline-none
            focus:ring-2
            focus:ring-white/70
            focus:ring-offset-2

            active:translate-y-0
          "
        >
          {buttonText}
        </motion.button>
      </motion.div>
    </motion.article>
  );
}

/*
|--------------------------------------------------------------------------
| Promo Cards Component
|--------------------------------------------------------------------------
*/

export default function PromoCards({
  items = promoCards,
  className = "",
}) {
  return (
    <section
      className={`
        w-full
        ${className}
      `}
    >
      <div
        className="
          mx-auto
          mt-9
          grid
          w-full
          max-w-[1100px]
          grid-cols-1
          gap-4
          px-4

          sm:px-6

          md:grid-cols-2
        "
      >
        {items.map((card, index) => (
          <PromoCard
            key={card.id}
            index={index}
            eyebrow={card.eyebrow}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            image={card.image}
            imagePosition={card.imagePosition}
            overlay={card.overlay}
          />
        ))}
      </div>
    </section>
  );
}
