// src/api/auth.ts
import { apiClient } from './client';
import { AuthResponse } from '@/types/models';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: { email: string; password: string; name: string }) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  socialLogin: async (payload: { provider: string; token: string }) => {
    const response = await apiClient.post<AuthResponse>('/auth/social', payload);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};