import api from "./axios";

export const createPaymentApi = (data) => {
  return api.post("/payment", data);
};

export const verifyPaymentApi = (sessionId) => {
  return api.get(`/payment/verify?session_id=${sessionId}`);
};