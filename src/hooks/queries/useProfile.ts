// src/hooks/queries/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UpdateProfilePayload, UpdatePasswordPayload } from '@/api/user';
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// SINGLE SOURCE OF TRUTH (SCR)
// ============================================================================
export const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * 1. Fetches the user profile from the server.
 */
export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: userApi.fetchProfile,
  });
}

/**
 * 2. Updates the profile and instantly syncs the new data into the global Zustand store.
 */

// Inside src/hooks/queries/useProfile.ts

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateProfile(payload),
    
    // Notice the 2nd parameter: 'variables' (The exact DTO the user just submitted)
    onSuccess: (serverReceipt, variables) => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

      // Forcibly stamp the submitted form variables over the existing user object
      const optimisticUser = {
        ...currentUser,
        ...variables, 
      };

      // 1. Instantly update the TanStack Query cache
      queryClient.setQueryData(PROFILE_QUERY_KEY, optimisticUser);
      
      // 2. Reach directly into Zustand's internal engine and overwrite the user object
      useAuthStore.setState({ user: optimisticUser });
    },
  });
}

/**
 * 3. Securely updates the password. 
 * Note: We do not need to invalidate the query cache here because passwords 
 * are not stored in the UI state.
 */
export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => userApi.updatePassword(payload),
  });
}

/**
 * 4. Permanently deletes the account.
 */
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password?: string) => userApi.deleteAccount(password),
    onSuccess: () => {
      // Security Polish: Wipe the ENTIRE TanStack Query cache (including all tasks and profiles)
      // to ensure no sensitive data remains in memory after deletion.
      queryClient.clear();
    },
  });
}