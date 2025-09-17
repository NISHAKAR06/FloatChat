import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (userData, token) => {
        set({
          isAuthenticated: true,
          user: userData,
          token: token,
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },
      initializeAuth: () => {
        // This will be handled by the persist middleware
      }
    }),
    {
      name: 'auth',
    }
  )
);

export default useAuthStore;
