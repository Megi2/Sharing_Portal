import client from "./client";

/** GET /api/announcements/latest */
export async function getLatestAnnouncements() {
  const res = await client.get("/api/announcements/latest");
  const data = res.data;
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** POST /api/announcements */
export async function createAnnouncement(payload) {
  const res = await client.post("/api/announcements", payload);
  return res.data;
}
