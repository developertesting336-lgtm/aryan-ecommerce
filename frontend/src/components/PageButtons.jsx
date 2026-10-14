import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageButtons({
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pagesPerGroup = 3;

  // Find which group the current page belongs to
  const currentGroup = Math.floor((page - 1) / pagesPerGroup);

  const startPage = currentGroup * pagesPerGroup + 1;

  const endPage = Math.min(
    startPage + pagesPerGroup - 1,
    totalPages
  );

  const pages = [];

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const hasPreviousGroup = startPage > 1;
  const hasNextGroup = endPage < totalPages;

  return (
    <div className="mt-8 flex w-full items-center justify-center">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Group */}
        <button
          type="button"
          disabled={!hasPreviousGroup}
          onClick={() => {
            if (hasPreviousGroup) {
              onPageChange(startPage - 1);
            }
          }}
          aria-label="Previous pages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
        >
          <ChevronLeft size={17} />
        </button>

        {/* First Page */}
        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm"
            >
              1
            </button>

            {startPage > 2 && (
              <span className="flex h-9 w-6 items-center justify-center text-sm font-semibold text-slate-400 sm:h-10 sm:w-7">
                ...
              </span>
            )}
          </>
        )}

        {/* Current Group */}
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={
              page === pageNumber ? "page" : undefined
            }
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm ${
              page === pageNumber
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {/* Last Page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex h-9 w-6 items-center justify-center text-sm font-semibold text-slate-400 sm:h-10 sm:w-7">
                ...
              </span>
            )}

            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Group */}
        <button
          type="button"
          disabled={!hasNextGroup}
          onClick={() => {
            if (hasNextGroup) {
              onPageChange(endPage + 1);
            }
          }}
          aria-label="Next pages"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
