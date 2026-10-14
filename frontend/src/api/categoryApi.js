import api from "./axios";

// Create category
export const createCategoryApi = async (categoryData) => {
  const response = await api.post("/categories/", categoryData);
  return response.data;
};

// Get all categories
export const getCategoriesApi = async (params = {}) => {
  const response = await api.get("/categories/", {
    params,
  });

  return response.data;
};

// Get category by ID
export const getCategoryByIdApi = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

// Get root categories
export const getRootCategoriesApi = async () => {
  const response = await api.get("/categories/roots");
  return response.data;
};

// Get category children
export const getCategoryChildrenApi = async (categoryId) => {
  const response = await api.get(
    `/categories/${categoryId}/children`
  );

  return response.data;
};

// Update category
export const updateCategoryApi = async (
  categoryId,
  categoryData
) => {
  const response = await api.patch(
    `/categories/${categoryId}`,
    categoryData
  );

  return response.data;
};

// Delete category
export const deleteCategoryApi = async (categoryId) => {
  const response = await api.delete(
    `/categories/${categoryId}`
  );

  return response.data;
};


export const getStatsApi = async (params = {}) => {
  const response = await api.get("/categories/stats");

  return response.data;
};