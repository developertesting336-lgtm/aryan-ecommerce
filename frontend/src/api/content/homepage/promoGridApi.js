import api from "../../axios";

// GET ALL
export const getPromoGridItemsApi = async () => {
  const response = await api.get(
    "/admin/homepage/promo-grid"
  );

  return response.data;
};

// GET BY ID
export const getPromoGridItemByIdApi = async (id) => {
  const response = await api.get(
    `/admin/homepage/promo-grid/${id}`
  );

  return response.data;
};

// CREATE
export const createPromoGridItemApi = async (data) => {
  const response = await api.post(
    "/admin/homepage/promo-grid",
    data
  );

  return response.data;
};

// UPDATE
export const updatePromoGridItemApi = async (id, data) => {
  const response = await api.put(
    `/admin/homepage/promo-grid/${id}`,
    data
  );

  return response.data;
};

// DELETE
export const deletePromoGridItemApi = async (id) => {
  const response = await api.delete(
    `/admin/homepage/promo-grid/${id}`
  );

  return response.data;
};

// STATUS
export const togglePromoGridItemStatusApi = async (
  id
) => {
  const response = await api.patch(
    `/admin/homepage/promo-grid/${id}/status`
  );

  return response.data;
};