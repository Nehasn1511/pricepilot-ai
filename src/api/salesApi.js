import axiosClient from './axiosClient';

// Dashboard summary stats — used in StatCards
// GET /api/analytics/dashboard-stats
export const getDashboardStats = async () => {
  const response = await axiosClient.get('/analytics/dashboard-stats');
  return response.data;
};

// Recommendation performance stats — used in dashboard charts
// GET /api/analytics/recommendation-stats
export const getRecommendationStats = async () => {
  const response = await axiosClient.get('/analytics/recommendation-stats');
  return response.data;
};

// Sales trend data — used in line chart (Day 18)
// GET /api/analytics/sales-daily?days=7
export const getSalesTrend = async (days = 7) => {
  const response = await axiosClient.get(`/analytics/sales-daily?days=${days}`);
  return response.data;
};