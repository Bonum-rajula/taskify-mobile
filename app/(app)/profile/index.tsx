// app/(app)/profile/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { clearAuthTokens } from '@/utils/secureStore';
import { useQueryClient } from '@tanstack/react-query';
import { TASK_QUERY_KEY } from '@/hooks/queries/useTasks';
import { theme } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    // 1. Purge the secure tokens
    await clearAuthTokens();
    // 2. Wipe the TanStack Query cache so the next user doesn't see old data
    queryClient.removeQueries({ queryKey: TASK_QUERY_KEY });
    // 3. Trigger Zustand state change (Auth Guard will redirect to login)
    signOut();
  };

  return (
    <View style={styles.container}>
      <Typography variant="h1" style={styles.title}>Profile</Typography>
      <View style={styles.card}>
        <Typography variant="body" color={theme.colors.textMuted}>Logged in as:</Typography>
        <Typography variant="h2">{user?.name || 'User'}</Typography>
        <Typography variant="body">{user?.email || ''}</Typography>
      </View>
      <Button title="Log Out" onPress={handleLogout} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  title: {
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }
});