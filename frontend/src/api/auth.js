/**
 * src/api/auth.js
 * ─────────────────────────────────────────
 * POST /api/auth/login   → 로그인
 * GET  /api/auth/me      → 내 정보
 */
import api from './client';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  // data.data = { accessToken, refreshToken, user }
  const result = data.data;

  // 토큰 저장
  localStorage.setItem('accessToken', result.accessToken);
  localStorage.setItem('refreshToken', result.refreshToken);

  return result;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.data; // { id, name, email, roles, dept, position, status }
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}
