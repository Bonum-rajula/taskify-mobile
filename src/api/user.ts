// src/api/user.ts
import { apiClient } from './client';
import { User } from '@/types/models';

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface UpdatePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

// ============================================================================
// API DRIVER
// ============================================================================

export const userApi = {
  /**
   * Retrieves the authenticated user's profile details.
   * Target: GET /api/user/profile
   */
  fetchProfile: async (): Promise<User> => {
    const response = await apiClient.get('/user/profile');
    return response.data.user || response.data;
  },

  /**
   * Modifies standard account metadata (Name, Email).
   * Target: PUT /api/user/profile
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put('/user/profile', payload);
    return response.data.user || response.data;
  },

  /**
   * Securely updates the password via the overloaded profile route.
   * Target: PUT /api/user/profile
   */
  updatePassword: async (payload: UpdatePasswordPayload): Promise<void> => {
    await apiClient.put('/user/profile', payload);
  },

  /**
   * Permanently deletes the account and purges historical task frames.
   * Target: DELETE /api/account
   */
  deleteAccount: async (password?: string): Promise<void> => {
    await apiClient.delete('/user/account', {
      data: password ? { password } : {},
    });
  },
};