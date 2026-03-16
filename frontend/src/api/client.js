import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request: JWT 토큰 자동 첨부
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: ApiRenderer { success, data, message } 언래핑
// 성공 → response.data.data 반환
// 실패 → message 꺼내서 throw
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.success === false) {
      const msg =
        typeof body.message === "string"
          ? body.message
          : body.message
          ? Object.values(body.message).flat().join(" / ")
          : "알 수 없는 오류";
      throw new Error(msg);
    }
    // 언래핑된 data 반환 (없으면 원본 body)
    response.data = body?.data ?? body;
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("interx_user");
      window.location.href = "/";
    }
    const body = error.response?.data;
    const msg =
      typeof body?.message === "string"
        ? body.message
        : body?.message
        ? Object.values(body.message).flat().join(" / ")
        : error.message || "서버 오류가 발생했습니다.";
    return Promise.reject(new Error(msg));
  }
);

export default client;
