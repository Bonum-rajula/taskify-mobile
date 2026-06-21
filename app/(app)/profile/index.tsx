// app/(app)/profile/index.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { User, LogOut, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react-native';

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
  // HELPER FUNCTIONS
  // ============================================================================
  const getInitials = (fullName: string) => {
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

  // ACTION 4.1: Password Update (YAGNI applied for OAuth)
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
      // Optional: Show a success toast here
    } catch (err: any) {
      setPasswordErrors({ form: err.response?.data?.error || 'Failed to update password.' });
    }
  };

  // ACTION 4.2: The Absolute Logout Sequence
  const handleLogout = async () => {
    try {
      // 1. Destroy backend Express session (fire and forget, even if network drops, we proceed to purge local)
      await authApi.logout().catch(() => console.log('Backend session already invalid or unreachable.'));
    } finally {
      // 2. Shred the native keychain
      await clearAuthTokens();
      // 3. Wipe global cache to prevent data bleeding
      queryClient.clear();
      // 4. Update Zustand (This triggers the Auth Guard to completely unmount the layout tree)
      signOut();
    }
  };

  // ACTION 4.3: The Critical Deletion Flow
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
      
      // Post-deletion Absolute Purge
      await clearAuthTokens();
      queryClient.clear();
      signOut();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* 1. METADATA READOUT & AVATAR */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.avatarUrl ? (
             // Replace with Next/Expo Image if available
            <View style={styles.avatarPlaceholder}>
               <Typography variant="h2" color={theme.colors.surface}>IMG</Typography>
            </View>
          ) : (
            <View style={styles.avatarFallback}>
              <Typography variant="h1" color={theme.colors.primary}>
                {getInitials(user?.name || '')}
              </Typography>
            </View>
          )}
        </View>
        <Typography variant="h1">{user?.name}</Typography>
        <Typography variant="body" color={theme.colors.textMuted}>{user?.email}</Typography>
        
        <View style={styles.authBadge}>
          <User color={theme.colors.primary} size={14} />
          <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4, textTransform: 'capitalize' }}>
            {user?.authProvider || user?.authProvider || 'Unknown'} Account
          </Typography>
        </View>
      </View>

      {/* 2. EDIT PROFILE ACCORDION */}
      <View style={styles.section}>
        <Button 
          title="Edit Profile" 
          variant="secondary" 
          onPress={() => setIsEditingProfile(!isEditingProfile)}
          style={styles.accordionToggle}
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
            onPress={() => setIsEditingPassword(!isEditingPassword)}
            style={styles.accordionToggle}
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
      <View style={[styles.section, styles.dangerZone]}>
        <Button 
          title="Log Out" 
          variant="ghost" 
          onPress={handleLogout} 
          style={styles.logoutButton}
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
                  style={{ ...styles.deleteButton, flex: 1 }} 
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
    paddingTop: Platform.OS === 'ios' ? 80 : theme.spacing.xl * 2,
    paddingBottom: 120, // Tab bar clearance
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
    backgroundColor: `${theme.colors.primary}20`, // 20% opacity of primary
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  accordionToggle: {
    justifyContent: 'space-between',
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
  logoutButton: {
    borderColor: theme.colors.border,
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