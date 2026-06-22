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

  /**
   * COMPLIANCE HANDLER: Mock Social Login
   * As per assessment guidelines, this simulates an OAuth handshake to avoid 
   * live Google/Apple developer console provisioning delays during staging.
   */
  const handleMockSocialLogin = async (provider: 'Google' | 'Apple') => {
    setIsConnecting(true);
    
    try {
      // 1. Simulate the native OS browser redirect delay (AuthSession)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Transmit the simulated OAuth token to our Spearhead backend
      const response = await authApi.socialLogin({
        provider: provider.toLowerCase(),
        token: `mock_${provider.toLowerCase()}_oauth_token_8a9f2c`,
      });

      // 3. Securely lock the JWT in the native keychain
      await saveAuthTokens(response.token);

      // 4. Hydrate the global UI store (routes user automatically to Dashboard)
      signIn(response.user);

    } catch (error) {
      Alert.alert('OAuth Error', `Failed to connect to ${provider}.`);
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