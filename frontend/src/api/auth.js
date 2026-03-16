import client from "./client";

/**
 * POST /api/auth/login
 * Response data: { accessToken, user: { id, name, email, roles, dept, status } }
 */
export async function login(email, password) {
  const res = await client.post("/api/auth/login", { email, password });
  const { accessToken, user } = res.data;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("interx_user", JSON.stringify(user));
  return user;
}

/**
 * GET /api/auth/me
 */
export async function getMe() {
  const res = await client.get("/api/auth/me");
  return res.data;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("interx_user");
}

export function getCachedUser() {
  try {
    const raw = localStorage.getItem("interx_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
