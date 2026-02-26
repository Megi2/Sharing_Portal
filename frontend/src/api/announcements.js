/**
 * src/api/announcements.js
 */
import api from './client';

export async function getLatestAnnouncement() {
  const { data } = await api.get('/announcements/latest');
  return data.data;
}

export async function createAnnouncement(payload) {
  const { data } = await api.post('/announcements/', payload);
  return data.data;
}
