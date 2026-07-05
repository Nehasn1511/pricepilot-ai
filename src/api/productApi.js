import axiosClient from './axiosClient';

// GET /api/products?search=x&marketplace=amazon&page=0&size=10
export const getProducts = async ({ search = '', marketplace = '', page = 0, size = 10 } = {}) => {
  const params = new URLSearchParams();
  if (search)      params.append('search', search);
  if (marketplace) params.append('marketplace', marketplace);
  params.append('page', page);
  params.append('size', size);

  const response = await axiosClient.get(`/products?${params.toString()}`);
  return response.data;
};

// GET /api/products/:id
export const getProductById = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response.data;
};

// POST /api/products/import-csv
export const uploadCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post('/products/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};