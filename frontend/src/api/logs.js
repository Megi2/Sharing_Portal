/**
 * src/api/logs.js
 */
import api from './client';

export async function getLogs(params = {}) {
  // params: { from, to, action, result, page }
  const { data } = await api.get('/logs/', { params });
  return data.data;
}

export function getExportUrl(params = {}) {
  const query = new URLSearchParams(params).toString();
  return `/api/logs/export?${query}`;
}
