/**
 * src/stores/authStore.js
 * ─────────────────────────────────────────
 * Zustand 전역 인증 상태
 * 
 * 사용법:
 * const { user, isLoggedIn, setUser, logout } = useAuthStore();
 */
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,            // { id, name, email, roles, dept, position }
  isLoggedIn: false,

  setUser: (user) => set({ user, isLoggedIn: true }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isLoggedIn: false });
  },
}));

export default useAuthStore;
