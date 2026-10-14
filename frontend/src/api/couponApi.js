import api from "./axios";

const API_URL = "/coupon";

// GET admin dashboard
export const getCouponsApi = () => {
  return api.get(`${API_URL}/`);
};
// export const getCouponById = (page = 1, limit = 4) => {
//   return api.get(`${API_URL}/`,
//     {  params: {
//       page,
//       limit,
//     },}
//   );
// };
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

export const getCouponByIdApi = (id) => {
  return api.get(`${API_URL}/${id}`);
};

export const adminEditProductsApi = (id, data) => { 
  return api.put(`${API_URL}/products/${id}`,
     data, { headers: { "Content-Type": "multipart/form-data", }, }); };

export const createCouponAPI = (couponData) => { 
  return api.post(`${API_URL}/`,couponData)
     };


     export const applyCouponAPI = ({ code,  productIds }) => { 
  return api.post(`${API_URL}/apply`,{ code,  productIds })
     };