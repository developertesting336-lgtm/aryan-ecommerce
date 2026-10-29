import api from "./axios";

const customerRoute = "/complaints";
const adminRoute = "/admin/complaints";

// ==========================================
// CUSTOMER APIS
// ==========================================

export const getUserOrdersForComplaintApi = async () => {
  const response = await api.get(`${customerRoute}/user-orders`);
  return response.data;
};

export const createComplaintApi = async (data) => {
  const response = await api.post(`${customerRoute}`, data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const getMyComplaintsApi = async (params = {}) => {
  const response = await api.get(`${customerRoute}`, { params });
  return response.data;
};

export const getComplaintByIdApi = async (id) => {
  const response = await api.get(`${customerRoute}/${id}`);
  return response.data;
};

export const addComplaintMessageApi = async (id, data) => {
  const response = await api.post(`${customerRoute}/${id}/messages`, data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const closeComplaintApi = async (id, data = {}) => {
  const response = await api.patch(`${customerRoute}/${id}/close`, data);
  return response.data;
};

// ==========================================
// ADMIN APIS
// ==========================================

export const getAdminComplaintsApi = async (params = {}) => {
  const response = await api.get(`${adminRoute}`, { params });
  return response.data;
};

export const getAdminComplaintByIdApi = async (id) => {
  const response = await api.get(`${adminRoute}/${id}`);
  return response.data;
};

export const adminUpdateComplaintStatusApi = async (id, data) => {
  const response = await api.patch(`${adminRoute}/${id}/status`, data);
  return response.data;
};

export const adminUpdateComplaintPriorityApi = async (id, data) => {
  const response = await api.patch(`${adminRoute}/${id}/priority`, data);
  return response.data;
};

export const adminAddComplaintMessageApi = async (id, data) => {
  const response = await api.post(`${adminRoute}/${id}/messages`, data, {
    headers:
      data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
  });
  return response.data;
};

export const adminAddInternalNoteApi = async (id, data) => {
  const response = await api.post(`${adminRoute}/${id}/internal-notes`, data);
  return response.data;
};
