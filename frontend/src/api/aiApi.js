import api from "./axios";

// Get AI recommended products for logged-in user
export const getRecommendationsApi = async () => {
  const response = await api.get("/ai/recommendations");
  return response.data;
};

// Generate product description with AI
export const generateDescriptionApi = async (payload) => {
  const response = await api.post("/ai/generate-description", payload);
  return response.data;
};

// Shopping chatbot
export const chatApi = async (payload) => {
  const response = await api.post("/ai/chat", payload);
  return response.data;
};

// Cart-based recommendations. Logged in: server reads the cart. Guest: pass ids.
export const getCartRecommendationsApi = async (ids) => {
  const response = await api.get("/ai/recommendations/cart", {
    params: ids?.length ? { ids: ids.join(",") } : {},
  });
  return response.data;
};