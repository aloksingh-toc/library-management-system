import api from './axiosConfig';

export const borrowBook = async (bookId) => {
  const response = await api.post(`/transactions/borrow/${bookId}`);
  return response.data;
};

export const returnBook = async (bookId) => {
  const response = await api.post(`/transactions/return/${bookId}`);
  return response.data;
};

export const getMyHistory = async (page = 0, size = 20) => {
  const response = await api.get(`/transactions/my-history?page=${page}&size=${size}`);
  return response.data;
};
