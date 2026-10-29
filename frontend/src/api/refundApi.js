import api from "./axios";

const customerRoute = "/refunds";
const adminRoute = "/admin/refunds";

// ==========================================
// CUSTOMER APIS
// ==========================================

export const checkOrderEligibilityApi = async (orderId) => {
  const response = await api.get(`${customerRoute}/eligibility/${orderId}`);
  return response.data;
};

export const createRefundRequestApi = async (data) => {
  // If data is FormData (with images), Axios automatically sets multipart/form-data
  const response = await api.post(`${customerRoute}`, data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const getUserRefundsApi = async () => {
  const response = await api.get(`${customerRoute}`);
  return response.data;
};

export const getRefundByIdApi = async (id) => {
  const response = await api.get(`${customerRoute}/${id}`);
  return response.data;
};

// ==========================================
// ADMIN APIS
// ==========================================

export const getAdminRefundsApi = async (params = {}) => {
  const response = await api.get(`${adminRoute}`, { params });
  return response.data;
};

export const getAdminRefundByIdApi = async (id) => {
  const response = await api.get(`${adminRoute}/${id}`);
  return response.data;
};

export const adminUpdateRefundStatusApi = async (id, data) => {
  const response = await api.patch(`${adminRoute}/${id}/status`, data);
  return response.data;
};

export const adminReceiveItemsApi = async (id, data) => {
  const response = await api.patch(`${adminRoute}/${id}/receive`, data);
  return response.data;
};

export const adminProcessRefundApi = async (id, data) => {
  const response = await api.post(`${adminRoute}/${id}/process`, data);
  return response.data;
};
