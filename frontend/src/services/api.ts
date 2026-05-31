import axios from 'axios';
import Cookies from 'js-cookie';
import { TOKEN_KEY } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const message = data?.message || data?.errors?.[0] || 'Something went wrong';
    const err = new Error(message) as Error & { errors?: string[] };
    if (data?.errors) err.errors = data.errors;
    return Promise.reject(err);
  }
);
