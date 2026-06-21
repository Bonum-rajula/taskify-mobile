// src/types/models.ts

/**
 * Supported authentication providers mapped directly from the backend database schema.
 */
export type AuthProvider = 'local' | 'google' | 'github';

/**
 * The core User entity as returned by the backend's `sanitizeUser` utility.
 * Notice the conversion from snake_case (backend DB) to camelCase (our frontend standard).
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
 * This ensures we never crash trying to read `error.message` when the backend sends `error.error`.
 */
export interface ApiErrorResponse {
  error: string;
}

/**
 * (Forward-thinking) The Task entity as returned by `formatTask` in the backend.
 * We include this now so we don't have to return to this file later.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null; // ISO 8601 string
  createdAt: string;
  updatedAt: string;
}