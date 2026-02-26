/**
 * src/api/assets.js
 * ─────────────────────────────────────────
 * 자산 CRUD + 버전 + ACL
 */
import api from './client';

// ── 자산 목록 ──
export async function getAssets(params = {}) {
  // params: { type, categoryId, tag, q, sort, page }
  const { data } = await api.get('/assets/', { params });
  return data.data; // paginated list
}

// ── 자산 상세 ──
export async function getAsset(id) {
  const { data } = await api.get(`/assets/${id}`);
  return data.data;
}

// ── 자산 생성 ──
export async function createAsset(payload) {
  // payload: { type, categoryId, title, description, tags, viewScope, downloadAllowed, initialVersion }
  const { data } = await api.post('/assets/', payload);
  return data.data;
}

// ── 자산 수정 ──
export async function updateAsset(id, payload) {
  // payload: { title, description, viewScope, downloadAllowed, publishStatus, securityLabel }
  const { data } = await api.patch(`/assets/${id}`, payload);
  return data.data;
}

// ── 자산 삭제 ──
export async function deleteAsset(id) {
  await api.delete(`/assets/${id}`);
}

// ── 버전 목록 ──
export async function getVersions(assetId) {
  const { data } = await api.get(`/assets/${assetId}/versions`);
  return data.data;
}

// ── 새 버전 등록 ──
export async function createVersion(assetId, payload) {
  // payload: { sourceType, sourceUrl, sourceFileId, note }
  const { data } = await api.post(`/assets/${assetId}/versions`, payload);
  return data.data;
}

// ── ACL 조회 ──
export async function getPermissions(assetId) {
  const { data } = await api.get(`/assets/${assetId}/permissions`);
  return data.data;
}

// ── ACL 설정 (전체 교체) ──
export async function setPermissions(assetId, rules) {
  // rules: [{ subjectType, subjectId, canView, canDownload }]
  const { data } = await api.put(`/assets/${assetId}/permissions`, { rules });
  return data.data;
}
