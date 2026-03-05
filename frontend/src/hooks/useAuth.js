/**
 * useAuth — 인증 상태 관리
 * POST /api/auth/login → JWT 발급 → localStorage 저장
 * GET  /api/auth/me    → 현재 유저 정보 복원
 */
import { useState, useCallback, useEffect } from "react";
import api from "../api/client";

export function useAuth() {
  const [user, setUser] = useState(null);       // { id, name, email, roles, dept, status }
  const [loading, setLoading] = useState(true);  // 초기 토큰 검증 중
  const [error, setError] = useState("");

  /** 앱 시작 시: 토큰이 있으면 /api/auth/me 로 유저 복원 */
  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      // DRF 공통 응답: { success, data, message } 또는 직접 객체
      setUser(data.data ?? data);
    } catch (err) {
      console.warn("세션 복원 실패:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /** 로그인 */
  async function login(email, password) {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const payload = data.data ?? data;

      // 토큰 저장
      localStorage.setItem("accessToken", payload.accessToken);
      if (payload.refreshToken) {
        localStorage.setItem("refreshToken", payload.refreshToken);
      }

      // 유저 정보 저장
      setUser(payload.user);
      return payload.user;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        "이메일 또는 비밀번호가 올바르지 않습니다.";
      setError(msg);
      throw new Error(msg);
    }
  }

  /** 로그아웃 */
  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
  };
}
