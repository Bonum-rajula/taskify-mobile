// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { DismissKeyboard } from '@/components/ui/DismissKeyboard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';
import { loginSchema } from '@/utils/validation';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { setSecureItem, STORE_KEYS } from '@/utils/secureStore';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    // 1. Reset previous errors
    setApiError(null);
    setFieldErrors({});

    // 2. Client-Side Validation (Zod)
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return; 
    }

    // 3. Network Request
    setIsLoading(true);
    Keyboard.dismiss(); // Keep this to explicitly drop the keyboard on submit

    try {
      const response = await authApi.login({ email, password });

      // Save encrypted tokens to the native keychain
      await setSecureItem(STORE_KEYS.ACCESS_TOKEN, response.accessToken);
      await setSecureItem(STORE_KEYS.REFRESH_TOKEN, response.refreshToken);

      // Update global state
      signIn(response.user);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An unexpected network error occurred.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DismissKeyboard>
        <View style={styles.inner}>
          
          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>Welcome Back</Typography>
            <Typography variant="body" color={theme.colors.textMuted}>
              Log in to manage your tasks efficiently.
            </Typography>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="alice@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email}
              editable={!isLoading}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={fieldErrors.password}
              editable={!isLoading}
            />

            {apiError && (
              <View style={styles.errorBox}>
                <Typography variant="caption" color={theme.colors.error}>
                  {apiError}
                </Typography>
              </View>
            )}

            <Button
              title="Log In"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <Typography variant="caption" color={theme.colors.textMuted}>
              Don't have an account?{' '}
            </Typography>
            <Link href="/register" asChild>
              <Typography variant="caption" color={theme.colors.primary} style={styles.link}>
                Sign up here
              </Typography>
            </Link>
          </View>

        </View>
      </DismissKeyboard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inner: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  errorBox: {
    backgroundColor: theme.colors.errorBackground,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontWeight: '600',
  },
});