import api from './axiosConfig';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllTransactions = async (page = 0, size = 10) => {
  const response = await api.get(`/admin/transactions?page=${page}&size=${size}`);
  return response.data;
};

export const adminAddBook = async (bookData) => {
  const response = await api.post('/admin/books', bookData);
  return response.data;
};

export const adminUpdateBook = async (id, bookData) => {
  const response = await api.put(`/admin/books/${id}`, bookData);
  return response.data;
};

export const adminDeleteBook = async (id) => {
  await api.delete(`/admin/books/${id}`);
};

export const getActivityChart = async (days = 30) => {
  const response = await api.get(`/admin/charts/activity?days=${days}`);
  return response.data;
};
