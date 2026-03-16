import client from "./client";

/** GET /api/users?dept=&role=&status=&q= */
export async function getUsers(params = {}) {
  const res = await client.get("/api/users", { params });
  const data = res.data;
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** POST /api/users */
export async function createUser(payload) {
  const res = await client.post("/api/users", payload);
  return res.data;
}

/** PATCH /api/users/:id  — roleCodes, status */
export async function updateUser(id, payload) {
  const res = await client.patch(`/api/users/${id}`, payload);
  return res.data;
}
