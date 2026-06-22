// app/(app)/profile/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { User, Key, LogOut, ShieldAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DismissKeyboard } from '@/components/ui/DismissKeyboard';

import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { clearAuthTokens } from '@/utils/secureStore';
import {
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useDeleteAccountMutation,
} from '@/hooks/queries/useProfile';
import { updateProfileSchema, updatePasswordSchema } from '@/utils/validation';
import { theme } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // ============================================================================
  // MUTATIONS
  // ============================================================================
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  // ============================================================================
  // UI STATES
  // ============================================================================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string; form?: string }>({});

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; form?: string }>({});

  // Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ============================================================================
  // STORE DRIFT PROTECTOR (Senior Fix)
  // ============================================================================
  // Keeps local form state strictly locked to the global Zustand store changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const isLocalAuth = user?.authProvider === 'local';

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  // ACTION 4.1: Profile Update
  const handleUpdateProfile = async () => {
    setProfileErrors({});
    const validation = updateProfileSchema.safeParse({ name, email });
    
    if (!validation.success) {
      const fieldErrors: any = {};
      validation.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setProfileErrors(fieldErrors);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ name, email });
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileErrors({ form: err.response?.data?.error || 'Failed to update profile.' });
    }
  };

  // ACTION 4.1: Password Update
  const handleUpdatePassword = async () => {
    setPasswordErrors({});
    const validation = updatePasswordSchema.safeParse({ currentPassword, newPassword });

    if (!validation.success) {
      const fieldErrors: any = {};
      validation.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setIsEditingPassword(false);
    } catch (err: any) {
      setPasswordErrors({ form: err.response?.data?.error || 'Failed to update password.' });
    }
  };

  // ACTION 4.2: The Absolute Logout Sequence
  const handleLogout = async () => {
    try {
      await authApi.logout().catch(() => console.log('Backend session already invalid.'));
    } finally {
      await clearAuthTokens();
      queryClient.clear();
      signOut();
    }
  };

  // ACTION 4.3: Deletion Flow
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    
    if (isLocalAuth && !deleteInput.trim()) {
      setDeleteError('Password is required to delete your account.');
      return;
    }
    
    if (!isLocalAuth && deleteInput !== 'DELETE') {
      setDeleteError('Type DELETE exactly to confirm.');
      return;
    }

    try {
      const payload = isLocalAuth ? deleteInput : undefined;
      await deleteAccountMutation.mutateAsync(payload);
      
      await clearAuthTokens();
      queryClient.clear();
      signOut();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, theme.spacing.xl) }]}
      keyboardShouldPersistTaps="handled"
    >
      
      {/* 1. METADATA READOUT & AVATAR */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarFallback}>
            <Typography variant="h1" color={theme.colors.primary}>
              {getInitials(user?.name)}
            </Typography>
          </View>
        </View>
        <Typography variant="h1">{user?.name}</Typography>
        <Typography variant="body" color={theme.colors.textMuted}>{user?.email}</Typography>
        
        <View style={styles.authBadge}>
          <User color={theme.colors.primary} size={14} />
          <Typography variant="caption" color={theme.colors.primary} style={styles.badgeText}>
            {user?.authProvider || 'Local'} Account
          </Typography>
        </View>
      </View>

      {/* 2. EDIT PROFILE ACCORDION */}
      <View style={styles.section}>
        <Button 
          title="Edit Profile" 
          variant="secondary" 
          icon={<User size={18} color={theme.colors.primary} />}
          onPress={() => setIsEditingProfile(!isEditingProfile)}
        />
        {isEditingProfile && (
          <View style={styles.accordionContent}>
            <Input 
              label="Full Name" 
              value={name} 
              onChangeText={setName} 
              error={profileErrors.name} 
              editable={!updateProfileMutation.isPending}
            />
            <Input 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
              error={profileErrors.email} 
              editable={!updateProfileMutation.isPending}
            />
            {profileErrors.form && <Typography variant="caption" color={theme.colors.error}>{profileErrors.form}</Typography>}
            <Button 
              title="Save Profile" 
              onPress={handleUpdateProfile} 
              isLoading={updateProfileMutation.isPending} 
            />
          </View>
        )}
      </View>

      {/* 3. SECURE PASSWORD ACCORDION (YAGNI Protected) */}
      {isLocalAuth && (
        <View style={styles.section}>
          <Button 
            title="Update Password" 
            variant="secondary" 
            icon={<Key size={18} color={theme.colors.primary} />}
            onPress={() => setIsEditingPassword(!isEditingPassword)}
          />
          {isEditingPassword && (
            <View style={styles.accordionContent}>
              <Input 
                label="Current Password" 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                secureTextEntry 
                error={passwordErrors.currentPassword}
                editable={!updatePasswordMutation.isPending}
              />
              <Input 
                label="New Password" 
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry 
                error={passwordErrors.newPassword}
                editable={!updatePasswordMutation.isPending}
              />
              {passwordErrors.form && <Typography variant="caption" color={theme.colors.error}>{passwordErrors.form}</Typography>}
              <Button 
                title="Save Password" 
                onPress={handleUpdatePassword} 
                isLoading={updatePasswordMutation.isPending} 
              />
            </View>
          )}
        </View>
      )}

      {/* 4. DANGER ZONE */}
      <View style={styles.dangerZone}>
        <Button 
          title="Log Out" 
          variant="outline" 
          icon={<LogOut size={18} color={theme.colors.primary} />}
          onPress={handleLogout} 
        />
        <Button 
          title="Delete Account" 
          onPress={() => {
            setDeleteInput('');
            setDeleteError(null);
            setIsDeleteModalOpen(true);
          }} 
          style={styles.deleteButton}
        />
      </View>

      {/* 5. SECURE DELETION MODAL */}
      <Modal visible={isDeleteModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <DismissKeyboard>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ShieldAlert color={theme.colors.error} size={32} />
                <Typography variant="h2" style={{ marginTop: theme.spacing.sm }}>Are you absolutely sure?</Typography>
              </View>
              
              <Typography variant="body" color={theme.colors.textMuted} style={styles.modalWarning}>
                This action cannot be undone. All your pending and completed tasks will be permanently erased.
              </Typography>

              <Input 
                label={isLocalAuth ? "Confirm your password to proceed:" : "Type 'DELETE' to confirm:"}
                value={deleteInput}
                onChangeText={setDeleteInput}
                secureTextEntry={isLocalAuth}
                error={deleteError || undefined}
                autoCapitalize={isLocalAuth ? "none" : "characters"}
              />

              <View style={styles.modalActions}>
                <Button 
                  title="Cancel" 
                  variant="ghost" 
                  onPress={() => setIsDeleteModalOpen(false)} 
                  style={{ flex: 1 }}
                />
                <Button 
                  title="Permanently Delete" 
                  onPress={handleDeleteAccount} 
                  isLoading={deleteAccountMutation.isPending}
                  style={[styles.deleteButton, { flex: 1 }]} 
                />
              </View>
            </View>
          </DismissKeyboard>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  authBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    marginTop: theme.spacing.sm,
  },
  badgeText: {
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  accordionContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  dangerZone: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalWarning: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
});