// app/_layout.tsx
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { asyncStoragePersister } from '@/utils/storagePersister';
import { useOfflineManager } from '@/hooks/useOfflineManager';
import { useAuthStore } from '@/store/authStore';

import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

// ============================================================================
// OFFLINE-FIRST QUERY CLIENT (Bonus 3)
// ============================================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 2,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst', 
    },
  },
});

// ============================================================================
// GLOBAL AUTH GUARD (SOC Principle)
// ============================================================================
function InitialLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize the offline network listener daemon
  useOfflineManager();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/tasks');
    }
  }, [isAuthenticated, isHydrated, segments]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

// ============================================================================
// ROOT APP EXPORT
// ============================================================================
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24,
        }}
      >
        <InitialLayout />
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}