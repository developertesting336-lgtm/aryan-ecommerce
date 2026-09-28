import api from "../../axios";

// GET ALL
export const getShopByNeedItemsApi = async () => {
  const response = await api.get(
    "/admin/homepage/shop-by-need"
  );

  return response.data;
};

// GET BY ID
export const getShopByNeedItemByIdApi = async (id) => {
  const response = await api.get(
    `/admin/homepage/shop-by-need/${id}`
  );

  return response.data;
};

// CREATE
export const createShopByNeedItemApi = async (data) => {
  const response = await api.post(
    "/admin/homepage/shop-by-need",
    data
  );

  return response.data;
};

// UPDATE
export const updateShopByNeedItemApi = async (id, data) => {
  const response = await api.put(
    `/admin/homepage/shop-by-need/${id}`,
    data
  );

  return response.data;
};

// DELETE
export const deleteShopByNeedItemApi = async (id) => {
  const response = await api.delete(
    `/admin/homepage/shop-by-need/${id}`
  );

  return response.data;
};

// STATUS
export const toggleShopByNeedItemStatusApi = async (
  id
) => {
  const response = await api.patch(
    `/admin/homepage/shop-by-need/${id}/status`
  );

  return response.data;
};