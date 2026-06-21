// src/api/client.ts
import axios from 'axios';
import { getSecureItem, clearAuthTokens, STORE_KEYS } from '@/utils/secureStore';
import { useAuthStore } from '@/store/authStore';

// Expo automatically injects variables prefixed with EXPO_PUBLIC_
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Automatically attach the token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getSecureItem(STORE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: The 401 Trap Door
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the backend rejects the token (expired, revoked, or invalid)
    if (error.response && error.response.status === 401) {
      console.warn('[API Client] 401 Unauthorized detected. Purging session.');
      
      // Clear the native encrypted keychain
      await clearAuthTokens();
      
      // Instantly wipe the global state. 
      // Because Expo Router can observe this state, this will automatically 
      // kick the user back to the Login screen.
      useAuthStore.getState().signOut();
    }
    
    return Promise.reject(error);
  }
);