// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      
      signIn: (user) => set({ user, isAuthenticated: true }),
      
      signOut: () => set({ user: null, isAuthenticated: false }),
      
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'taskify-auth-storage',
      
      storage: createJSONStorage(() => AsyncStorage),
      
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);