import api from './axiosConfig';

export const getAllBooks = async (page = 0, size = 20) => {
  const response = await api.get(`/books?page=${page}&size=${size}`);
  return response.data;
};

export const searchBooks = async (query, page = 0, size = 20) => {
  const response = await api.get(`/books/search?query=${query}&page=${page}&size=${size}`);
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

export const addBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};

export const getAllGenres = async () => {
  const response = await api.get('/books/genres');
  return response.data;
};

export const getBooksByGenre = async (genre, page = 0, size = 12) => {
  const response = await api.get(`/books/genre/${encodeURIComponent(genre)}?page=${page}&size=${size}`);
  return response.data;
};
