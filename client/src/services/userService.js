import api from './api';

export const getUsers = async (params = {}) => {
  const res = await api.get('/users', { params });
  return res.data.users;
};

export const getUser = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const getProductivityStats = async () => {
  const res = await api.get('/users/productivity');
  return res.data.stats;
};
