/**
 * src/api/users.js
 * ─────────────────────────────────────────
 * 사용자 관리 (관리자 기능)
 */
import api from './client';

export async function getUsers(params = {}) {
  // params: { status, dept, role, search, page }
  const { data } = await api.get('/users/', { params });
  return data.data;
}

export async function createUser(payload) {
  // payload: { name, email, deptId, position, roleCodes, status }
  const { data } = await api.post('/users/', payload);
  return data.data;
}

export async function updateUser(id, payload) {
  // payload: { name, position, status, roleCodes }
  const { data } = await api.patch(`/users/${id}`, payload);
  return data.data;
}
