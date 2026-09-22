import { useMemo, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useDispatch,useSelector } from "react-redux";
import { addProduct } from "../../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AddonProducts({
  currentProduct,
  products,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([currentProduct._id]);
const {relatedProducts} = useSelector((state)=> state.product)
console.log("related",relatedProducts)
console.log("currentProduct",currentProduct)
console.log("products",products)

const addons = useMemo(() => {
  if (!Array.isArray(relatedProducts)) {
    return [];
  }

  return relatedProducts
    .filter(
      (item) =>
        item?.relatedProduct &&
        item.relatedProduct?._id &&
        String(item.relatedProduct._id) !==
          String(currentProduct?._id)
    )
    .slice(0, 3);
}, [relatedProducts, currentProduct]);
 useEffect(() => {
  setSelected([currentProduct?._id]);
}, [currentProduct?._id, relatedProducts]);
  const toggleProduct = (productId) => {
    setSelected((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedProducts = addons.filter((item) =>
    selected.includes(item.relatedProduct._id)
  );

  const total = selectedProducts.reduce(
    (sum, item) => sum + Number(item.relatedProduct.price || 0),
    Number(currentProduct.price)
  );

  const addSelectedToCart = async () => {
    await dispatch(addProduct({
      productId: currentProduct._id,
          price: currentProduct.price,
          quantity: 1,
    }))
    for (const item of selectedProducts) {
      await dispatch(
        addProduct({
          productId: item.relatedProduct._id,
          price: item.relatedProduct.price,
          quantity: 1,
        })
      );
    }

    navigate("/cart");
  };

  if (!addons.length) {
    return null;
  }

  return (
    <section className="mt-8">

      {/* Header */}

      <div className="mb-5">

        <p className="text-sm font-semibold text-blue-600">
          Complete Your Purchase
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-1">
          Frequently Bought Together
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Add accessories to complete your purchase
        </p>

      </div>

      {/* Products */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-4
      ">
{//selected product 
}
<div
              key={currentProduct._id}
              className={`
                relative
                bg-white
                rounded-2xl
                border-2
                p-4
                transition
                    "border-blue-600 shadow-md"                
              `}
            >

              {/* Checkbox */}

              <button
                type="button"
                // onClick={() =>
                //   toggleProduct(currentProduct._id)
                // }
                className={`
                  absolute
                  top-4
                  right-4
                  w-6
                  h-6
                  rounded-md
                  border
                  flex
                  items-center
                  justify-center
                 
                       "bg-blue-600 border-blue-600 text-white"
                  
                `}
              >
               
                  <Check size={15} />
              
              </button>

              {/* Image */}

              <div className="
                h-40
                bg-gray-50
                rounded-xl
                flex
                items-center
                justify-center
                overflow-hidden
              ">

                <img
                  src={`http://localhost:3000/uploads/${currentProduct.images?.[0]}`}
                  alt={currentProduct.name}
                  className="
                    w-full
                    h-full
                    object-contain
                    p-4
                  "
                />

              </div>

              {/* Info */}

              <div className="mt-4">

                <h3 className="
                  font-semibold
                  text-gray-900
                  line-clamp-2
                  min-h-12
                ">
                  {currentProduct.name}
                </h3>

                <p className="
                  mt-2
                  text-lg
                  font-bold
                  text-blue-600
                ">
                  ₹{Number(currentProduct?.price).toLocaleString("en-IN")}
                </p>

              </div>

            </div>

        {addons.map((item) => {

          const isSelected =
            selected.includes(item.relatedProduct._id);

          return (
            
            <div
             onClick={() =>
                  toggleProduct(item.relatedProduct._id)
                }
              key={item.relatedProduct._id}
              className={`
                relative
                bg-white
                rounded-2xl
                border-2
                p-4
                transition
                cursor-pointer
                ${
                  isSelected
                    ? "border-blue-600 shadow-md"
                    : "border-gray-100"
                }
              `}
            >

              {/* Checkbox */}

              <button
                type="button"
                // onClick={() =>
                //   toggleProduct(item.relatedProduct._id)
                // }
                className={`
                  absolute
                  top-4
                  right-4
                  w-6
                  h-6
                  rounded-md
                  border
                  flex
                  items-center
                  justify-center
                  ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300"
                  }
                `}
              >
                {isSelected && (
                  <Check size={15} />
                )}
              </button>

              {/* Image */}

              <div className="
                h-40
                bg-gray-50
                rounded-xl
                flex
                items-center
                justify-center
                overflow-hidden
              ">

                <img
                  src={`http://localhost:3000/uploads/${item.relatedProduct.images?.[0]}`}
                  alt={item.name}
                  className="
                    w-full
                    h-full
                    object-contain
                    p-4
                  "
                />

              </div>

              {/* Info */}

              <div className="mt-4">

                <h3 className="
                  font-semibold
                  text-gray-900
                  line-clamp-2
                  min-h-12
                ">
                  {item.relatedProduct.name}
                </h3>

                <p className="
                  mt-2
                  text-lg
                  font-bold
                  text-blue-600
                ">
                  ₹{Number(item.relatedProduct.price).toLocaleString("en-IN")}
                </p>

              </div>

            </div>
          );
        })}

      </div>

      {/* Bottom */}

      {selectedProducts.length > 0 && (
        <div className="
          mt-5
          bg-blue-50
          border
          border-blue-100
          rounded-2xl
          p-5
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        ">

          <div>

            <p className="text-sm text-gray-500">
              Selected addons
            </p>

            <p className="text-xl font-bold text-gray-900">
              ₹{total.toLocaleString("en-IN")}
            </p>

          </div>

          <button
            type="button"
            onClick={addSelectedToCart}
            className="
              flex
              items-center
              justify-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              px-6
              py-3
              rounded-xl
              transition
            "
          >
            <ShoppingCart size={18} />

            Add Selected Addons
          </button>

        </div>
      )}

    </section>
  );
}