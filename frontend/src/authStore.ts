import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginRequest } from './services/api';

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      isAuthenticated: false,
      login: async (username, password) => {
        const response = await loginRequest(username, password);
        set({
          token: response.accessToken,
          role: response.role,
          isAuthenticated: true,
        });
      },
      logout: () => set({ token: null, role: null, isAuthenticated: false }),
    }),
    { name: 'printmis-auth' },
  ),
);
