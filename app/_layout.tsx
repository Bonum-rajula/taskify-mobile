// app/_layout.tsx
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Alert } from 'react-native';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { setSecureItem, STORE_KEYS } from '@/utils/secureStore';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';

// Initialize the TanStack Query Client outside the component
// to prevent recreation on every render.
const queryClient = new QueryClient();

export default function RootLayout() {
  const { user, isAuthenticated, signIn } = useAuthStore();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestLogin = async () => {
    setIsTesting(true);
    try {
      // Hardcoded seeded user from the Spearhead API setup
      const response = await authApi.login({
        email: 'alice@example.com',
        password: 'Password123!',
      });

      // 1. Save tokens securely to the native keychain
      await setSecureItem(STORE_KEYS.ACCESS_TOKEN, response.accessToken);
      await setSecureItem(STORE_KEYS.REFRESH_TOKEN, response.refreshToken);

      // 2. Update the Zustand global state
      signIn(response.user);

      Alert.alert('API Connection Successful!', `Logged in as ${response.user.name}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      Alert.alert('Connection Failed', errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      
      {/* TEMPORARY PHASE 2 TEST BLOCK 
        This renders a banner at the top of the screen if the user is not authenticated.
        We will delete this block entirely in Phase 3 once we build the real Auth UI.
      */}
      {!isAuthenticated && (
        <View 
          style={{ 
            paddingTop: 60, 
            paddingBottom: theme.spacing.md, 
            paddingHorizontal: theme.spacing.md, 
            backgroundColor: theme.colors.errorBackground,
            borderBottomWidth: 1,
            borderColor: theme.colors.border
          }}
        >
          <Typography variant="h2" style={{ marginBottom: theme.spacing.sm }}>
            Phase 2: Network Test
          </Typography>
          <Typography variant="caption" style={{ marginBottom: theme.spacing.md }}>
            Ensure your backend is running on {process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}
          </Typography>
          <Button 
            title="Log in as Alice (Seed Data)" 
            onPress={handleTestLogin} 
            isLoading={isTesting} 
          />
        </View>
      )}

      {/* MAIN APP ROUTING 
        Expo Router handles the navigation tree here. 
      */}
      <Stack screenOptions={{ headerShown: false }} />
      
    </QueryClientProvider>
  );
}