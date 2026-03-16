import client from "./client";

/**
 * GET /api/assets
 * Params: type(VIDEO|DOCUMENT|all), categoryId, tag, q, sort(latest|popular)
 * Response: paginated → .results 또는 array
 */
export async function getAssets(params = {}) {
  const res = await client.get("/api/assets", { params });
  // PageNumberPagination: { count, next, previous, results }
  const data = res.data;
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/**
 * GET /api/assets/:id
 */
export async function getAsset(id) {
  const res = await client.get(`/api/assets/${id}`);
  return res.data;
}

/**
 * POST /api/assets
 */
export async function createAsset(payload) {
  const res = await client.post("/api/assets", payload);
  return res.data;
}

/**
 * PATCH /api/assets/:id
 * Payload: { publishStatus, viewScope, downloadAllowed, title, description, ... }
 *
 * publishStatus 값: DRAFT | REVIEW | PUBLISHED | ARCHIVED
 * viewScope 값:     ALL_USERS | ADMIN_ONLY | CUSTOM
 */
export async function updateAsset(id, payload) {
  const res = await client.patch(`/api/assets/${id}`, payload);
  return res.data;
}

/**
 * DELETE /api/assets/:id
 */
export async function deleteAsset(id) {
  await client.delete(`/api/assets/${id}`);
}

// ────────────────────────────────────────────
// Status / scope 라벨 매핑 (UI ↔ API)
// ────────────────────────────────────────────
export const PUBLISH_STATUS_LABELS = {
  DRAFT:     "보안재생",
  REVIEW:    "검토중",
  PUBLISHED: "공유가능",
  ARCHIVED:  "열람제한",
};

export const PUBLISH_STATUS_REVERSE = Object.fromEntries(
  Object.entries(PUBLISH_STATUS_LABELS).map(([k, v]) => [v, k])
);

export const VIEW_SCOPE_LABELS = {
  ALL_USERS:  "all-users",
  ADMIN_ONLY: "admin-only",
  CUSTOM:     "custom",
};

/** API 자산 객체 → 기존 프론트엔드 형태로 정규화 */
export function normalizeAsset(a) {
  return {
    ...a,
    status: PUBLISH_STATUS_LABELS[a.publishStatus] ?? a.publishStatus ?? "공유가능",
    viewPermission: VIEW_SCOPE_LABELS[a.viewScope] ?? a.viewScope ?? "all-users",
    downloadAllowed: a.downloadAllowed ?? false,
    tags: a.tags ?? [],
    category: a.category ?? "기타",
    type: (a.type ?? "DOCUMENT").toLowerCase() === "video" ? "video" : "document",
  };
}
