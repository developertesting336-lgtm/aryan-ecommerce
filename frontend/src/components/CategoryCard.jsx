export default function CategoryCard({
  category,
  onSelect,
}) {
  const title = Array.isArray(category.title)
    ? category.title
    : [category.title];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open ${title.join(" ")}`}
      className="
        category-card
        group
        relative
        flex
        h-[154px]
        w-[148px]
        shrink-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[#e7e7e7]
        bg-white
        text-left
        shadow-[0_2px_10px_rgba(0,0,0,0.05)]
        transition-all
        duration-300
        ease-out

        hover:-translate-y-0.5
        hover:shadow-[0_8px_22px_rgba(0,0,0,0.09)]

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-black/50
        focus-visible:ring-offset-2
        cursor-pointer
        sm:h-[164px]
        sm:w-[158px]
      "
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div
        className="
          flex
          h-[118px]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-white
          px-4
          pt-2

          sm:h-[125px]
          sm:px-5
        "
      >
        <img
          src={category.image}
          alt=""
          aria-hidden="true"
          draggable="false"
          loading="lazy"
          className={`
            relative
            max-h-[105px]
            w-auto
            max-w-[135px]
            object-contain
            transition-transform
            duration-500
            ease-out
            group-hover:scale-[1.05]

            ${
              category.id === "gaming"
                ? "max-h-[100px] max-w-[138px]"
                : ""
            }

            ${
              category.id === "phones"
                ? "max-h-[102px]"
                : ""
            }
          `}
        />
      </div>

      {/* =====================================================
          TITLE
      ====================================================== */}

      <div
        className="
          flex
          min-h-[46px]
          flex-1
          items-center
          justify-center
          bg-white
          px-3
          pb-3
          pt-1

          sm:px-4
        "
      >
        <span
          className="
            text-center
            text-[11px]
            font-semibold
            leading-[14px]
            tracking-[-0.1px]
            text-[#171717]

            sm:text-[11.5px]
            sm:leading-[15px]
          "
        >
          {title.map((line, index) => (
            <span
              key={`${line}-${index}`}
              className="block"
            >
              {line}
            </span>
          ))}
        </span>
      </div>
    </button>
  );
}
