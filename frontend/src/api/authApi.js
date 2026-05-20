import axiosClient from './axiosClient';

// Called when user submits the login form
// Returns: { token: "eyJ...", user: { id, name, email, role } }
export const loginApi = async (email, password) => {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
};

// Called on app startup to verify the stored token is still valid
// Returns: { id, name, email, role, tenantId }
export const getMeApi = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};