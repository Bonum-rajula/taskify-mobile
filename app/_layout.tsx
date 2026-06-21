// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

// Initialize the TanStack Query Client outside the component
const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Determine if the user is currently inside the (auth) route group
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // If they are NOT logged in and try to access a protected route,
      // instantly kick them back to the login screen.
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // If they ARE logged in but somehow sitting on the login/register screen,
      // push them seamlessly into the main application.
      router.replace('/(app)/tasks');
    }
  }, [isAuthenticated, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* We let Expo Router automatically discover the (auth) and (app) groups */}
      </Stack>
    </QueryClientProvider>
  );
}