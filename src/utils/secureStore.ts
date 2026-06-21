// src/utils/secureStore.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const STORE_KEYS = {
  ACCESS_TOKEN: 'taskify_access_token',
  REFRESH_TOKEN: 'taskify_refresh_token',
} as const;

type StoreKey = typeof STORE_KEYS[keyof typeof STORE_KEYS];

export async function setSecureItem(key: StoreKey, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Use standard browser storage for web testing
      localStorage.setItem(key, value);
    } else {
      // Use encrypted native storage for iOS/Android
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`[SecureStore] Failed to save item for key: ${key}`, error);
  }
}

export async function getSecureItem(key: StoreKey): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStore] Failed to retrieve item for key: ${key}`, error);
    return null;
  }
}

export async function removeSecureItem(key: StoreKey): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`[SecureStore] Failed to remove item for key: ${key}`, error);
  }
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    removeSecureItem(STORE_KEYS.ACCESS_TOKEN),
    removeSecureItem(STORE_KEYS.REFRESH_TOKEN),
  ]);
}