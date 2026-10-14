import api from "./axios";

const API_URL = "/admin";

// GET admin dashboard
export const getAdminDashboardApi = (filter = "7days") => {
  return api.get(`${API_URL}/dashboard/?filter=${filter}`);
};

export const getAdminProductsApi = (page = 1, limit = 4) => {
  return api.get(`${API_URL}/products`,
    {  params: {
      page,
      limit,
    },}
  );
};
export const getAdminUsersApi = (page = 1, limit = 4) => {
  return api.get(`${API_URL}/users`,
    {  params: {
      page,
      limit,
    },}
  );
};
export const getAdminOrdersApi = (page = 1, limit = 4) => {
  return api.get(`${API_URL}/orders`,
    {  params: {
      page,
      limit,
    },}
  );
};

export const getProductByIdApi = (id) => {
  return api.get(`${API_URL}/products/${id}`);
};

export const adminEditProductsApi = (id, data) => { 
  return api.put(`${API_URL}/products/${id}`,
     data, { headers: { "Content-Type": "multipart/form-data", }, }); };