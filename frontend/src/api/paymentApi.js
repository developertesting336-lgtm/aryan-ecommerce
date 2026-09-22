import api from "./axios";

export const createPaymentApi = (data) => {
  return api.post("/payment", data);
};