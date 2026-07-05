import axiosClient from './axiosClient';

// GET /api/recommendations?productId=x
export const getRecommendationsByProduct = async (productId) => {
  const response = await axiosClient.get(`/recommendations?productId=${productId}`);
  return response.data.content ?? response.data;
};

// GET /api/recommendations
export const getRecommendations = async ({ status = '', type = '', page = 0, size = 10 } = {}) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type)   params.append('type', type);
  params.append('page', page);
  params.append('size', size);
  const response = await axiosClient.get(`/recommendations?${params.toString()}`);
  return response.data;
};

// GET /api/recommendations/:id
export const getRecommendationById = async (id) => {
  const response = await axiosClient.get(`/recommendations/${id}`);
  return response.data;
};

// PATCH /api/recommendations/:id/approve
export const approveRecommendation = async (id, comment = '') => {
  const response = await axiosClient.patch(`/recommendations/${id}/approve`, { comment });
  return response.data;
};

// PATCH /api/recommendations/:id/reject
export const rejectRecommendation = async (id, comment = '') => {
  const response = await axiosClient.patch(`/recommendations/${id}/reject`, { comment });
  return response.data;
};