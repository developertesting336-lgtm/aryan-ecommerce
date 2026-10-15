import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageButtons({
  page = 1,
  totalPages = 1,
  onPageChange,
  colorTheme = "blue", // NEW: choose blue, vendor, or admin
}) {
  if (totalPages <= 1) return null;

  // NEW: Dynamic colors for different pages
  const colors = {
    blue: {
      active: "bg-blue-600",
      hover: "hover:border-blue-300 hover:text-blue-600",
    },
    vendor: {
      active: "bg-[#4879f5]",
      hover: "hover:border-[#4879f5] hover:text-[#4879f5]",
    },
    admin: {
      active: "bg-[#10b981]",
      hover: "hover:border-[#10b981] hover:text-[#10b981]",
    },
  };

  // Fallback to blue if an invalid theme is provided
  const selectedColor = colors[colorTheme] || colors.blue;

  let pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const leftSibling = Math.max(page - 1, 1);
    const rightSibling = Math.min(page + 1, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      pages = [1, 2, 3, 4, "dots-right", totalPages];
    } else if (showLeftDots && !showRightDots) {
      pages = [
        1,
        "dots-left",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        "dots-left",
        leftSibling,
        page,
        rightSibling,
        "dots-right",
        totalPages,
      ];
    }
  }

  return (
    <div className="mt-8 flex w-full items-center justify-center">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => {
            if (page > 1) {
              onPageChange(page - 1);
            }
          }}
          aria-label="Previous page"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition ${selectedColor.hover} disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10`}
        >
          <ChevronLeft size={17} />
        </button>

        {/* Number Buttons & Dots */}
        {pages.map((item, index) => {
          if (item === "dots-left" || item === "dots-right") {
            return (
              <span
                key={`${item}-${index}`}
                className="flex h-9 w-6 items-center justify-center text-sm font-semibold text-slate-400 sm:h-10 sm:w-7"
              >
                ...
              </span>
            );
          }

          const pageNumber = item;
          const isActive = page === pageNumber;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm ${
                isActive
                  ? `${selectedColor.active} text-white shadow-sm`
                  : `border border-slate-200 bg-white text-slate-600 ${selectedColor.hover}`
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => {
            if (page < totalPages) {
              onPageChange(page + 1);
            }
          }}
          aria-label="Next page"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition ${selectedColor.hover} disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10`}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
