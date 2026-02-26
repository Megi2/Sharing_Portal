/**
 * src/api/shareRequests.js
 */
import api from './client';

export async function getShareRequests(params = {}) {
  const { data } = await api.get('/share-requests/', { params });
  return data.data;
}

export async function createShareRequest(assetId, reason) {
  const { data } = await api.post('/share-requests/', { assetId, reason });
  return data.data;
}

export async function approveRequest(id, comment = '') {
  const { data } = await api.post(`/share-requests/${id}/approve`, { comment });
  return data.data;
}

export async function rejectRequest(id, comment = '') {
  const { data } = await api.post(`/share-requests/${id}/reject`, { comment });
  return data.data;
}
