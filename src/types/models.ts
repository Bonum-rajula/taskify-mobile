// src/types/models.ts

/**
 * Supported authentication providers mapped directly from the backend database schema.
 */
export type AuthProvider = 'local' | 'google' | 'apple'| 'github';

/**
 * The core User entity as returned by the backend's `sanitizeUser` utility.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standardized response for /register, /login, and /social endpoints.
 */
export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Standardized error structure returned by `src/middleware/errorHandler.js`
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * The Task entity as returned by `formatTask` in the backend.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}