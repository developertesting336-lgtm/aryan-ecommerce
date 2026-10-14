import api from "./axios";

const route = "/orders";


// ==========================================
// CREATE ORDER
// POST /orders
// ==========================================
export const createOrderApi = async (orderData) => {
  console.log("order/create:", orderData);

  const response = await api.post(`${route}`, orderData);

  return response.data;
};


// ==========================================
// GET ORDERS
// GET /orders
// ==========================================
export const getOrdersApi = async () => {
  console.log("order/get:");

  const response = await api.get(`${route}`);

  return response.data;
};


// ==========================================
// GET ORDER ITEMS + ADDRESS
// GET /orders/:id
// ==========================================
export const getOrderItemsApi = async (orderId) => {
  console.log("order/getOrderItems:", orderId);

  const response = await api.get(`${route}/${orderId}`);

  return response.data;
};


// ==========================================
// GET ORDER STATUS
// GET /orders/status
// ==========================================
export const getOrderStatusApi = async () => {
  console.log("order/getStatus:");

  const response = await api.get(`${route}/status`);

  return response.data;
};


// ==========================================
// UPDATE ORDER STATUS
// PATCH /orders/:id
// ==========================================
export const updateOrderStatusApi = async (orderId, status) => {
  console.log("order/updateStatus:", orderId, status);

  const response = await api.patch(
    `${route}/${orderId}`,
    {
      status,
    }
  );

  return response.data;
};


// ==========================================
// GET ORDERS BY STATUS
// GET /orders?status=CONFIRMED
// ==========================================
export const getOrderByStatusApi = async (status) => {
  console.log("order/getByStatus:", status);

  const response = await api.get(`${route}`, {
    params: {
      status,
    },
  });

  return response.data;
};


// ==========================================
// CANCEL ORDER
// PATCH /orders/cancel
// ==========================================
export const cancelOrderApi = async () => {
  console.log("order/cancel:");

  const response = await api.patch(`${route}/cancel`);

  return response.data;
};


export const getOrderByIdApi = (orderId) => {
  return api.get(`/admin/orders/${orderId}`);
};


export const adminUpdateOrderStatuApi = (
  orderId,
  fulfillmentStatus
) => {
  return api.patch(
    `/admin/orders/${orderId}/status`,
    {
      fulfillmentStatus,
    }
  );
};
