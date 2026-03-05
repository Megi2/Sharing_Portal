/**
 * useMembers — 사용자 목록 CRUD 커스텀 훅
 * GET/POST/PATCH /api/users/ 백엔드 연동
 */
import { useState, useCallback, useEffect } from "react";
import { getUsers, createUser, updateUser } from "../api/users";
import { mapMemberFromApi, ROLE_LABEL_TO_CODES } from "../utils/helpers";

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      const mapped = (Array.isArray(data) ? data : []).map(mapMemberFromApi);
      setMembers(mapped);
    } catch (err) {
      console.error("사용자 목록 로드 실패:", err);
      setError("사용자 목록을 불러올 수 없습니다. 백엔드 연결을 확인하세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /** 사용자 생성 (POST /api/users/) */
  async function inviteMember({ name, email, password, position, role }) {
    const roleCodes = ROLE_LABEL_TO_CODES[role] || ["USER"];
    await createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      position: position.trim(),
      roleCodes,
      status: "ACTIVE",
      deptId: null,
    });
    await fetchMembers();
  }

  /** 사용자 수정 (PATCH /api/users/{id}) */
  async function editMember(id, { role, status }) {
    const roleCodes = ROLE_LABEL_TO_CODES[role] || ["USER"];
    const apiStatus = status === "활성" ? "ACTIVE" : "INACTIVE";
    await updateUser(id, { roleCodes, status: apiStatus });
    await fetchMembers();
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    inviteMember,
    editMember,
  };
}
