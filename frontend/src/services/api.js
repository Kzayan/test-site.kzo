import axios from 'axios';

const API = 'http://localhost:5000/api';

export const getQuizzes = async (category) => {
  const res = await axios.get(`${API}/quiz${category ? `?category=${category}` : ''}`);
  return res.data;
};

export const getQuiz = async (id) => {
  const res = await axios.get(`${API}/quiz/${id}`);
  return res.data;
};

export const submitQuiz = async (quizId, answers) => {
  const res = await axios.post(`${API}/quiz/submit`, { quizId, answers });
  return res.data;
};

export const getLeaderboard = async () => {
  const res = await axios.get(`${API}/user/leaderboard`);
  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get(`${API}/auth/profile`);
  return res.data;
};

export const claimDailyBonus = async () => {
  const res = await axios.post(`${API}/auth/daily-bonus`);
  return res.data;
};

export const getAdminStats = async () => {
  const res = await axios.get(`${API}/admin/stats`);
  return res.data;
};

export const createQuiz = async (data) => {
  const res = await axios.post(`${API}/admin/quiz`, data);
  return res.data;
};

export const deleteQuiz = async (id) => {
  const res = await axios.delete(`${API}/admin/quiz/${id}`);
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await axios.get(`${API}/admin/users`);
  return res.data;
};