import { useState, useCallback } from "react";
import { login as apiLogin, logout as apiLogout, getCachedUser } from "../api/auth";

export function useAuth() {
  const [user, setUser] = useState(() => getCachedUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const u = await apiLogin(email, password);
      // 정규화: roles 배열 → role 표시 문자열
      const normalized = {
        ...u,
        role: u.roles?.includes("SUPERADMIN")
          ? "최고 관리자"
          : u.roles?.includes("ADMIN")
          ? "관리인 (Admin)"
          : "사용자 (User)",
      };
      setUser(normalized);
      return normalized;
    } catch (err) {
      const msg = typeof err.message === "string" ? err.message : "로그인에 실패했습니다.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setError("");
  }, []);

  return { user, loading, error, login, logout, setUser };
}
