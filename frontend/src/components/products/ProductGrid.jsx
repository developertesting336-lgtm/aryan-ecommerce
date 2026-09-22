import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  return (
    <div
      className="
        grid
        grid-cols-[repeat(auto-fill,minmax(250px,1fr))]
        gap-x-5
        gap-y-7
        sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]
        lg:gap-x-6
        lg:gap-y-8
        xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]
      "
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          {...product}
        />
      ))}
    </div>
  );
}
