import api from './axiosConfig';

export const reserveBook = async (bookId) => {
  const response = await api.post(`/reservations/${bookId}`);
  return response.data;
};

export const cancelReservation = async (reservationId) => {
  await api.delete(`/reservations/${reservationId}`);
};

export const getMyReservations = async () => {
  const response = await api.get('/reservations/my');
  return response.data;
};
