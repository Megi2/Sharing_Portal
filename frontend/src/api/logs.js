import client from "./client";

/** GET /api/logs?from=&to=&action=&result= */
export async function getLogs(params = {}) {
  const res = await client.get("/api/logs", { params });
  const data = res.data;
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** GET /api/logs/export → CSV 다운로드 */
export function exportLogsUrl(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `/api/logs/export${qs ? "?" + qs : ""}`;
}
