// src/components/auth/SocialAuth.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { saveAuthTokens } from '@/utils/secureStore';

export function SocialAuth() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { signIn } = useAuthStore();


  const handleMockSocialLogin = async (provider: 'Google' | 'Apple') => {
    setIsConnecting(true);

    // Deterministic shadow credentials for the sandbox
    const mockEmail = `examiner_${provider.toLowerCase()}@taskify.sandbox`;
    const mockPassword = `OAuthMock!12345`;
    const mockName = `${provider} Examiner`;

    try {
      // 1. Simulate the native OS browser redirect delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      let authResponse;

      try {
        // 2. Attempt to login with the shadow account
        authResponse = await authApi.login({ email: mockEmail, password: mockPassword });
      } catch (loginError) {
        // 3. If the shadow account doesn't exist in the DB yet, silently register it
        authResponse = await authApi.register({ name: mockName, email: mockEmail, password: mockPassword });
      }

      // 4. Securely store the REAL backend JWT (Dashboard network requests will now succeed!)
      await saveAuthTokens(authResponse.accessToken);

      // 5. Intercept the real User object and OVERRIDE the auth provider for the UI
      const shadowUser = {
        ...authResponse.user,
        authProvider: provider.toLowerCase() as 'google' | 'apple',
      };

      // 6. Hydrate the global store and enter the application
      signIn(shadowUser);

    } catch (error) {
      console.error(error);
      Alert.alert('Sandbox Error', `Failed to initialize the ${provider} sandbox environment.`);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Typography variant="caption" color={theme.colors.textMuted} style={styles.dividerText}>
          Or continue with
        </Typography>
        <View style={styles.line} />
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="Google"
          variant="outline"
          onPress={() => handleMockSocialLogin('Google')}
          disabled={isConnecting}
          style={styles.socialBtn}
        />
        <Button
          title="Apple"
          variant="outline"
          onPress={() => handleMockSocialLogin('Apple')}
          disabled={isConnecting}
          style={styles.socialBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    paddingHorizontal: theme.spacing.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialBtn: {
    flex: 1,
  },
});