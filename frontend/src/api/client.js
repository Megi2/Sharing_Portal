/**
 * src/api/client.js
 * ─────────────────────────────────────────
 * axios 인스턴스: JWT 자동 첨부 + 401 시 토큰 갱신
 * 
 * 모든 API 호출은 이 인스턴스를 통해야 합니다.
 * import api from '@/api/client';
 * const res = await api.get('/assets/');
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // vite proxy가 localhost:8000으로 전달
  headers: { 'Content-Type': 'application/json' },
});

// ── 요청 인터셉터: 매 요청마다 토큰 자동 첨부 ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 응답 인터셉터: 401이면 refreshToken으로 재시도 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // 리프레시 토큰도 없으면 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // SimpleJWT 토큰 갱신
        const res = await axios.post('/api/auth/token/refresh', {
          refresh: refreshToken,
        });
        const newAccess = res.data.access;
        localStorage.setItem('accessToken', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
