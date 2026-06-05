import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, configureAuth } from '../../api/client';
import { normalizeRecord } from '../../utils/resourceUtils.jsx';

const authStorageKey = 'intent-agent-auth-session';

function userFromLogin(payload) {
  return payload?.user || normalizeRecord(payload);
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: '',
      user: null,
      initialized: false,
      loading: false,
      error: '',

      login: async ({ username, password }) => {
        set({ loading: true, error: '' });
        try {
          const payload = await api.login({ username, password });
          if (!payload?.token) throw new Error('Response login tidak berisi token.');
          set({ token: payload.token, user: userFromLogin(payload), loading: true, initialized: true, error: '' });
          const profile = await api.me().then(normalizeRecord).catch(() => null);
          set({ user: profile || userFromLogin(payload), loading: false, initialized: true, error: '' });
          return payload;
        } catch (error) {
          set({ loading: false, error: error.message || 'Login gagal.' });
          throw error;
        }
      },

      loadProfile: async () => {
        if (!get().token) {
          set({ initialized: true, user: null });
          return null;
        }

        set({ loading: true, error: '' });
        try {
          const user = normalizeRecord(await api.me());
          set({ user, loading: false, initialized: true, error: '' });
          return user;
        } catch (error) {
          set({ token: '', user: null, loading: false, initialized: true, error: error.message || 'Session berakhir.' });
          return null;
        }
      },

      logout: () => set({ token: '', user: null, initialized: true, loading: false, error: '' }),

      handleUnauthorized: () => {
        if (get().token) set({ token: '', user: null, initialized: true, loading: false, error: 'Session berakhir. Silakan login lagi.' });
      },
    }),
    {
      name: authStorageKey,
      partialize: ({ token, user }) => ({ token, user }),
      merge: (persistedState, currentState) => ({ ...currentState, ...persistedState, initialized: false, loading: false, error: '' }),
    },
  ),
);

configureAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().handleUnauthorized(),
});

export const authStore = {
  loadProfile: () => useAuthStore.getState().loadProfile(),
  login: (payload) => useAuthStore.getState().login(payload),
  logout: () => useAuthStore.getState().logout(),
};
