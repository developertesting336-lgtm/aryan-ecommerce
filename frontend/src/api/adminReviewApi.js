import api from "./axios";

const API_URL = "/admin/reviews";

// GET dashboard (stats, distribution, quickCounts, recent)
export const getReviewDashboardApi = () => {
  return api.get(`${API_URL}/dashboard`);
};

// GET reviews over time (range = 7 or 30 days)
export const getReviewTimelineApi = (range = 7) => {
  return api.get(`${API_URL}/timeline`, { params: { range } });
};

// GET reviews list with filters, sort and pagination
export const getAdminReviewsApi = (params = {}) => {
  // Drop empty values so the URL stays clean
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== null && v !== undefined && v !== "" && v !== "all" && v !== false
    )
  );
  return api.get(API_URL, { params: cleanParams });
};

// GET single review (for the detail modal)
export const getReviewByIdApi = (id) => {
  return api.get(`${API_URL}/${id}`);
};

// PATCH approve / hide one review
export const updateReviewApprovalApi = (id, isApproved) => {
  return api.patch(`${API_URL}/${id}/approval`, { isApproved });
};

// PATCH bulk action: "approve" | "hide" | "delete"
export const bulkReviewsApi = (ids, action) => {
  return api.patch(`${API_URL}/bulk`, { ids, action });
};

// DELETE one review
export const deleteReviewApi = (id) => {
  return api.delete(`${API_URL}/${id}`);
};