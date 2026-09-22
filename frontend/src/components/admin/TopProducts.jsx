import React from "react";

export default function TopProducts({
  products = [],
}) {
  const defaultProducts = [
    {
      productName: "Samsung Galaxy S26 Ultra",
      category: "Mobile Phones",
      sellingUnits: 2,
    },
    {
      productName: "Samsung Soft Silicone Back Cover",
      category: "Mobile Accessories",
      sellingUnits: 2,
    },
    {
      productName: "asian sneakers",
      category: "Sneakers",
      sellingUnits: 1,
    },
  ];

  const productList =
    products?.length > 0
      ? products
      : defaultProducts;

  const colors = [
    "bg-[var(--admin-stat-purple-icon)] text-[var(--admin-stat-purple-text)]",
    "bg-[var(--admin-stat-blue-icon)] text-[var(--admin-stat-blue-text)]",
    "bg-[var(--admin-stat-orange-icon)] text-[var(--admin-stat-orange-text)]",
    "bg-[var(--admin-stat-green-icon)] text-[var(--admin-stat-green-text)]",
  ];

  const maxSales = Math.max(
    ...productList.map((product) =>
      Number(product.sellingUnits || 0)
    ),
    1
  );

  return (
    <section
      className="
        flex
        h-full
        min-h-0
        flex-col
        rounded-xl
        border
        border-(--admin-border)
        bg-(--admin-surface)
        p-5
        shadow-(--admin-card-shadow)
        transition-colors
        duration-200
      "
    >
      {/* Header */}
      <div className="mb-5 flex shrink-0 items-start justify-between">
        <div>
          <h2
            className="
              text-base
              font-bold
              text-(--admin-text)
            "
          >
            Top Products
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-(--admin-text-muted)
            "
          >
            Best selling products
          </p>
        </div>

        <button
          className="
            text-[11px]
            font-semibold
            text-(--admin-primary)
            transition
            hover:text-(--admin-primary-hover)
          "
        >
          View All
        </button>
      </div>

      {/* Products Scroll Container */}
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          pr-1

          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-(--admin-border)
          hover:scrollbar-thumb-(--admin-text-muted)
        "
      >
        <div className="space-y-1">
          {productList.map((product, index) => {
            const units = Number(
              product.sellingUnits || 0
            );

            const percentage =
              (units / maxSales) * 100;

            return (
              <div
                key={
                  product._id ||
                  product.productName
                }
                className="
                  rounded-xl
                  px-2
                  py-3
                  transition
                  hover:bg-(--admin-surface-soft)
                "
              >
                {/* Main row */}
                <div className="flex items-center gap-3">

                  {/* Rank */}
                  <span
                    className="
                      w-4
                      text-center
                      text-[10px]
                      font-bold
                      text-(--admin-text-muted)
                    "
                  >
                    {index + 1}
                  </span>

                  {/* Icon */}
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${colors[index % colors.length]}
                    `}
                  >
                    <ProductIcon />
                  </div>

                  {/* Product */}
                  <div className="min-w-0 flex-1">
                    <p
                      title={product.productName}
                      className="
                        truncate
                        text-[11px]
                        font-semibold
                        text-(--admin-text)
                      "
                    >
                      {product.productName}
                    </p>

                    <p
                      className="
                        mt-1
                        truncate
                        text-[10px]
                        text-(--admin-text-muted)
                      "
                    >
                      {product.category}
                    </p>
                  </div>

                  {/* Units */}
                  <div className="text-right">
                    <p
                      className="
                        text-[11px]
                        font-bold
                        text-(--admin-text)
                      "
                    >
                      {units}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-(--admin-text-muted)
                      "
                    >
                      sold
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div
                  className="
                    ml-17
                    mt-2
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-(--admin-chart-track)
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-(--admin-primary)
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
