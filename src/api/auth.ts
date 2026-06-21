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

  logout: async () => {
    // The Spearhead backend requires this to invalidate the token version
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
};