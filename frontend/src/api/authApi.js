import api from "./axios";

// Register user
export const registerApi = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};


// Login user
export const loginApi = async (loginData) => {
  const response = await api.post("/auth/login", loginData);
  return response.data;
};


// Get user by ID
export const getUserByIdApi = async (id) => {
  const response = await api.get(`/auth/${id}`);
  return response.data;
};

