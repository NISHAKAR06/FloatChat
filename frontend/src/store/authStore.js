import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      login: (userData) => {
        set({
          isAuthenticated: true,
          user: userData
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null
        });
        localStorage.removeItem('auth');
      },
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }));
      },
      initializeAuth: () => {
        const authData = localStorage.getItem('auth');
        if (authData) {
          try {
            const { isAuthenticated, user } = JSON.parse(authData);
            if (isAuthenticated && user) {
              set({ isAuthenticated, user });
            }
          } catch (error) {
            console.error('Error parsing auth data:', error);
            localStorage.removeItem('auth');
          }
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;