import api from "./axios";

// Register user
export const createProductApi = async (productData) => {
  const response = await api.post("/product/", productData);
  return response.data;
};


// Login user
export const myProductsApi = async (productData) => {
  const response = await api.post("/product/login", productData);
  return response.data;
};


// Get user by ID
export const getProductsApi = async (page = 1, limit = 4) => {
  const response = await api.get(`/product/`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};


export const getRealtedProductsApi = async (product) => {
  const response = await api.get(`/productRelation/${product}`, product);
  return response.data;
};


export const getProductByIdApi = (id) => {
  return api.get(`product/${id}`);
};
export const searchProductsApi = async (search, page = 1, limit = 10) => {
  const response = await api.get(
    `product/search?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
  );

  return response.data;
};

export const editProductApi = async (id,productData) => {
  const response = await api.patch(`/product/${id}`, productData);
  return response.data;
};