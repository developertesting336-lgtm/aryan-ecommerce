import ProductCard from "./products/ProductCard";
import { getProducts } from '../redux/slices/productSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


export default function ProductGrid() {
     const dispatch = useDispatch();
    //   const navigate = useNavigate();
const { loading, error ,product} = useSelector((state) => state.product);
console.log("pro1",product)
useEffect(()=>{
    // getProducts()
    dispatch(getProducts())
},[dispatch])
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Today's Best Deals
        </h2>

        <button className="text-blue-600 font-semibold hover:underline">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {product?.map((pro, index) => (
          <ProductCard key={pro._id} {...pro}   />
        ))}

        
      </div>

    </section>
  );
}