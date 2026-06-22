// src/hooks/queries/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, UpdateProfilePayload, UpdatePasswordPayload } from '@/api/user';
import { useAuthStore } from '@/store/authStore';


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


export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userApi.updateProfile(payload),
    
    onSuccess: (serverReceipt, variables) => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

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

      queryClient.clear();
    },
  });
}