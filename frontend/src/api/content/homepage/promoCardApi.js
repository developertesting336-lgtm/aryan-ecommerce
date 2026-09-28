import api from "../../axios";

// =====================================================
// GET ALL PROMO CARDS
// =====================================================

export const getPromoCardsApi = async () => {
  const response = await api.get(
    "/admin/homepage/promo-card"
  );

  return response.data;
};

// =====================================================
// GET PROMO CARD BY ID
// =====================================================

export const getPromoCardByIdApi = async (id) => {
  const response = await api.get(
    `/admin/homepage/promo-card/${id}`
  );

  return response.data;
};

// =====================================================
// CREATE PROMO CARD
// =====================================================

export const createPromoCardApi = async (data) => {
  const response = await api.post(
    "/admin/homepage/promo-card",
    data
  );

  return response.data;
};

// =====================================================
// UPDATE PROMO CARD
// =====================================================

export const updatePromoCardApi = async (id, data) => {
  const response = await api.put(
    `/admin/homepage/promo-card/${id}`,
    data
  );

  return response.data;
};

// =====================================================
// DELETE PROMO CARD
// =====================================================

export const deletePromoCardApi = async (id) => {
  const response = await api.delete(
    `/admin/homepage/promo-card/${id}`
  );

  return response.data;
};

// =====================================================
// TOGGLE STATUS
// =====================================================

export const togglePromoCardStatusApi = async (id) => {
  const response = await api.patch(
    `/admin/homepage/promo-card/${id}/status`
  );

  return response.data;
};