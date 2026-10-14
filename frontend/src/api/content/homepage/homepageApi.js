import api from "../../axios";

// =====================================================
// GET COMPLETE HOMEPAGE
// =====================================================

export const getHomepageApi = async () => {
  const response = await api.get("/homepage");

  return response.data;
};