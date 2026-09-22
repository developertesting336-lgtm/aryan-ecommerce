import api from "./axios";

// Register user
export const addProductApi = async (cartData) => {
    console.log("Sending:", cartData);

  const response = await api.post("/cart", cartData);
  return response.data;
};


export const decreaseQuantityApi = async (productId) => {
    console.log("decreaseQuantity:", productId);

  const response = await api.patch(`/cart/${productId}`);
  return response.data;
};





// Get user by ID
export const getCartApi = async () => {

  const response = await api.get(`/cart`,{
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }});
  return response.data;
};