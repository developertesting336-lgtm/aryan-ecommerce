import api from "./axios";

const API_URL = "/user/address";

// GET all addresses
export const getAddressesApi = () => {
  return api.get(API_URL);
};

// ADD address
export const addAddressApi = (addressData) => {
  return api.post(API_URL, addressData);
};

// UPDATE address
export const updateAddressApi = (addressId, addressData) => {
  return api.put(`${API_URL}/${addressId}`, addressData);
};

// DELETE address
export const deleteAddressApi = (addressId) => {
  return api.delete(`${API_URL}/${addressId}`);
};