import api from "./axios";

// Register user
export const addProductApi = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};


export const deleteProductsApi = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}`);
  return response.data;
};


// Get user by ID
export const getWishlistIdApi = async () => {
  const response = await api.get(`/wishlist/`);
  return response.data;
};