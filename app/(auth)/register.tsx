// app/(auth)/register.tsx
import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { DismissKeyboard } from '@/components/ui/DismissKeyboard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';
import { registerSchema } from '@/utils/validation';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { setSecureItem, STORE_KEYS } from '@/utils/secureStore';
import { SocialAuth } from '@/src/components/auth/SocialAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleRegister = async () => {
    // 1. Reset previous errors
    setApiError(null);
    setFieldErrors({});

    // 2. Strict Client-Side Validation (Zod)
    const validationResult = registerSchema.safeParse({ name, email, password });
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return; // Instantly block the network request if validation fails
    }

    // 3. Network Request
    setIsLoading(true);
    Keyboard.dismiss(); 

    try {
      const response = await authApi.register({ name, email, password });

      // Save encrypted tokens to the native keychain (or localStorage on web)
      await setSecureItem(STORE_KEYS.ACCESS_TOKEN, response.accessToken);
      await setSecureItem(STORE_KEYS.REFRESH_TOKEN, response.refreshToken);

      // Update global state
      signIn(response.user);
      
    } catch (error: any) {
      // Clean error mapping
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
        {/* We use a ScrollView here because 3 fields + keyboard can cramp smaller screens */}
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>Create Account</Typography>
            <Typography variant="body" color={theme.colors.textMuted}>
              Join Taskify to start organizing your life.
            </Typography>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={fieldErrors.name}
              editable={!isLoading}
            />

            <Input
              label="Email Address"
              placeholder="jane@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email}
              editable={!isLoading}
            />

            <Input
              label="Password"
              placeholder="Min. 8 characters, 1 uppercase, 1 number"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={fieldErrors.password}
              editable={!isLoading}
            />

            {/* Global API Error Display */}
            {apiError && (
              <View style={styles.errorBox}>
                <Typography variant="caption" color={theme.colors.error}>
                  {apiError}
                </Typography>
              </View>
            )}

            <Button
              title="Sign Up"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <Typography variant="caption" color={theme.colors.textMuted}>
              Already have an account?{' '}
            </Typography>
            <Link href="/login" asChild>
              <Typography variant="caption" color={theme.colors.primary} style={styles.link}>
                Log in here
              </Typography>
            </Link>
          </View>

          <SocialAuth />

        </ScrollView>
      </DismissKeyboard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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