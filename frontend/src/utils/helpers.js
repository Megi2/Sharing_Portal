/**
 * 공통 헬퍼 함수 & 상수
 */

// ── 역할 코드 ↔ 표시명 매핑 ──
export const ROLE_CODE_TO_LABEL = {
  SUPER_ADMIN: "최고 관리자",
  ADMIN: "관리인 (Admin)",
  USER: "사용자 (User)",
};

export const ROLE_LABEL_TO_CODES = {
  "최고 관리자": ["SUPER_ADMIN"],
  "관리인 (Admin)": ["ADMIN"],
  "사용자 (User)": ["USER"],
};

export function statusColor(status) {
  if (status === "보안재생") return "bg-red-500";
  if (status === "열람제한") return "bg-amber-500";
  return "bg-green-500";
}

export function roleBadgeClass(role) {
  return role.includes("관리") ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-600";
}

export function memberStatusBadgeClass(status) {
  return status === "활성"
    ? "text-green-500 border-green-200 bg-green-50"
    : "text-slate-400 border-slate-200 bg-slate-50";
}

export function logStatusClass(status) {
  return status === "SUCCESS" ? "text-green-500 border-green-100" : "text-red-500 border-red-100";
}

export function mapMemberFromApi(u) {
  const roleCodes = u.roles || [];
  let roleLabel = "사용자 (User)";
  if (roleCodes.includes("SUPER_ADMIN")) roleLabel = "최고 관리자";
  else if (roleCodes.includes("ADMIN")) roleLabel = "관리인 (Admin)";

  return {
    id: u.id,
    name: u.name,
    position: u.position || "",
    dept: u.dept || "",
    role: roleLabel,
    email: u.email,
    lastLogin: u.lastLoginAt || "없음",
    status: u.status === "ACTIVE" ? "활성" : "비활성",
  };
}
