// src/store/authStore.ts
import { create } from 'zustand';
import { User } from '@/types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  user: null,
  isAuthenticated: false,

  // Mutations
  signIn: (user) => set({ user, isAuthenticated: true }),
  
  signOut: () => set({ user: null, isAuthenticated: false }),
}));