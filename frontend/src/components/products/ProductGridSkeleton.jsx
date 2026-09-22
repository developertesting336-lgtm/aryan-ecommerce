export default function ProductGridSkeleton({ count = 10 }) {
  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        gap-3
        sm:gap-4
        lg:gap-5
      "
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
        >
          <div className="aspect-square w-full animate-pulse bg-gray-200" />

          <div className="space-y-3 p-3 sm:p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}