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

export const getAdminUserOrdersApi = (userId, page = 1, limit = 10) => {
  return api.get(`${API_URL}/users/${userId}/orders`, {
    params: { page, limit },
  });
};

export const getAdminUserReviewsApi = (userId, page = 1, limit = 10) => {
  return api.get(`${API_URL}/users/${userId}/reviews`, {
    params: { page, limit },
  });
};


// GET products by status (+ stats)
export const getProductsByStatusApi = (status = "pending", page = 1, limit = 5, search = "") => {
  return api.get(`${API_URL}/products/by-status`, {
    params: { status, page, limit, search },
  });
};

// PATCH product status (active | rejected | inactive)
export const updateProductStatusApi = (id, status, reason) => {
  return api.patch(`${API_URL}/products/${id}/status`, { status, reason });
};


export const searchAdminUsersApi = (
  page = 1,
  limit = 4,
  search = "",
  status = ""
) => {
  return api.get("/admin/users/search", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });
};