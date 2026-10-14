import api from "../../axios";

// =====================================================
// GET ALL HERO SLIDES
// =====================================================

export const getHeroSlidesApi = async () => {
  const response = await api.get("/admin/homepage/hero");

  return response.data;
};

// =====================================================
// GET HERO SLIDE BY ID
// =====================================================

export const getHeroSlideByIdApi = async (id) => {
  const response = await api.get(
    `/admin/homepage/hero/${id}`
  );

  return response.data;
};

// =====================================================
// CREATE HERO SLIDE
// =====================================================

export const createHeroSlideApi = async (heroData) => {
  const response = await api.post(
    "/admin/homepage/hero",
    heroData
  );

  return response.data;
};

// =====================================================
// UPDATE HERO SLIDE
// =====================================================

export const updateHeroSlideApi = async (
  id,
  heroData
) => {
  const response = await api.put(
    `/admin/homepage/hero/${id}`,
    heroData
  );

  return response.data;
};

// =====================================================
// DELETE HERO SLIDE
// =====================================================

export const deleteHeroSlideApi = async (id) => {
  const response = await api.delete(
    `/admin/homepage/hero/${id}`
  );

  return response.data;
};

// =====================================================
// TOGGLE HERO STATUS
// =====================================================

export const toggleHeroSlideStatusApi = async (id) => {
  const response = await api.patch(
    `/admin/homepage/hero/${id}/status`
  );

  return response.data;
};