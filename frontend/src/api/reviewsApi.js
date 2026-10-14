import api from "./axios";

// Create Review
export const createReviewApi = async (productId, reviewData) => {
  const response = await api.post(`/review/${productId}`, reviewData);

  return response.data;
};

// Get Reviews by Product
export const getProductReviewsApi = async (
  productId,
  page = 1,
  limit = 10
) => {
  const response = await api.get(`/review/product/${productId}`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

// Get Review by ID
export const getReviewByIdApi = async (id) => {
  const response = await api.get(`/review/${id}`);

  return response.data;
};

// Update Review
export const updateReviewApi = async (id, reviewData) => {
  const response = await api.patch(`/review/${id}`, reviewData);

  return response.data;
};

// Delete Review
export const deleteReviewApi = async (id) => {
  const response = await api.delete(`/review/${id}`);

  return response.data;
};