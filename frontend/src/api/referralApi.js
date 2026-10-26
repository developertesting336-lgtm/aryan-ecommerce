import api from "./axios";

const API_URL = "/referral";

export const createReferralLinkApi = (productId) => {
  return api.post(`${API_URL}/link`, { productId });
};

export const trackReferralClickApi = (code) => {
  return api.post(`${API_URL}/click`, { code });
};

export const getMyPointsApi = () => {
  return api.get(`${API_URL}/points`);
};

export const getMyReferralsApi = () => {
  return api.get(`${API_URL}/my-referrals`);
};

export const getMyLinksApi = () => {
  return api.get(`${API_URL}/my-links`);
};

export const getPointsHistoryApi = () => {
  return api.get(`${API_URL}/ledger`);
};