import { fetchApi } from './api';
import { UserRole } from '../types/permissions';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export interface User {
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

const AuthApi = {
  login() {
    window.location.href = `${API_URL}/v1/auth/login`;
  },

  logout: () => fetchApi<void>('/auth/logout', { method: 'POST' }),

  getMe: () => fetchApi<{ user: User }>('/auth/me'),
};

export default AuthApi;
