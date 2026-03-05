/**
 * useAuth — 인증 상태 관리
 * POST /api/auth/login → JWT 발급 → localStorage 저장
 * GET  /api/auth/me    → 현재 유저 정보 복원
 */
import { useState, useCallback, useEffect } from "react";
import api from "../api/client";

/**
 * 백엔드 에러 응답에서 사람이 읽을 수 있는 문자열 추출
 *
 * ApiRenderer가 에러를 다음처럼 감싸서 보냄:
 *   { success: false, data: null, message: { non_field_errors: ["..."] } }
 *                                           ↑ 이게 문자열이 아니라 객체일 수 있음
 */
function extractErrorMessage(err) {
  const resData = err?.response?.data;
  if (!resData) return "이메일 또는 비밀번호가 올바르지 않습니다.";

  // ApiRenderer 래핑 구조: resData.message 가 객체이거나 문자열
  const msgPayload = resData.message;

  if (typeof msgPayload === "string") return msgPayload;

  if (msgPayload && typeof msgPayload === "object") {
    // { non_field_errors: ["..."] } 형태
    if (Array.isArray(msgPayload.non_field_errors)) {
      return msgPayload.non_field_errors[0];
    }
    // { detail: "..." } 형태
    if (typeof msgPayload.detail === "string") return msgPayload.detail;
  }

  // ApiRenderer 없이 DRF 기본 응답이 그대로 오는 경우 (fallback)
  if (Array.isArray(resData.non_field_errors)) return resData.non_field_errors[0];
  if (typeof resData.detail === "string") return resData.detail;

  return "이메일 또는 비밀번호가 올바르지 않습니다.";
}

export function useAuth() {
  const [user, setUser] = useState(null);      // { id, name, email, roles, dept, status }
  const [loading, setLoading] = useState(true); // 초기 토큰 검증 중
  const [error, setError] = useState("");       // 항상 문자열

  /** 앱 시작 시: 토큰이 있으면 /api/auth/me 로 유저 복원 */
  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
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

  /**
   * 로그인
   * - 성공: user 객체 반환
   * - 실패: null 반환 + error state 에 문자열 설정 (throw 하지 않음)
   */
  async function login(email, password) {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const payload = data.data ?? data;

      localStorage.setItem("accessToken", payload.accessToken);
      if (payload.refreshToken) {
        localStorage.setItem("refreshToken", payload.refreshToken);
      }

      setUser(payload.user);
      return payload.user;
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg); // 항상 문자열
      return null;
    }
  }

  /** 로그아웃 */
  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setError("");
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