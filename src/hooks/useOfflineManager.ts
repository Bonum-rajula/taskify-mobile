// src/hooks/useOfflineManager.ts
import { useEffect } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Listens to physical network connectivity and syncs state to TanStack Query.
 */
export function useOfflineManager() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const setOnline = () => onlineManager.setOnline(true);
      const setOffline = () => onlineManager.setOnline(false);

      window.addEventListener('online', setOnline);
      window.addEventListener('offline', setOffline);

      return () => {
        window.removeEventListener('online', setOnline);
        window.removeEventListener('offline', setOffline);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected && !!state.isInternetReachable;
      onlineManager.setOnline(isConnected);
    });

    return () => unsubscribe();
  }, []);
}