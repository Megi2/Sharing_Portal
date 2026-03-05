import React from "react";
import {
  ShieldCheck, LayoutDashboard, Upload, Users, History, FolderOpen, LogOut,
} from "lucide-react";
import { NavButton } from "./ui";
import { ROLE_CODE_TO_LABEL } from "../utils/helpers";

export default function Sidebar({ menu, setMenu, user, onLogout }) {
  // 유저 역할 표시
  const roleLabel = (() => {
    if (!user?.roles?.length) return "사용자";
    for (const code of ["SUPER_ADMIN", "ADMIN", "USER"]) {
      if (user.roles.includes(code)) return ROLE_CODE_TO_LABEL[code] || code;
    }
    return "사용자";
  })();

  const initial = user?.name?.[0] || "?";
  const displayName = user?.name || "Unknown";
  const isAdmin = user?.roles?.some((r) => r === "SUPER_ADMIN" || r === "ADMIN");

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-30 shadow-2xl hidden lg:block">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-orange-600 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">InterX</span>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        <NavButton active={menu === "dashboard"} icon={LayoutDashboard} onClick={() => setMenu("dashboard")}>
          대시보드
        </NavButton>
        <NavButton active={menu === "upload"} icon={Upload} onClick={() => setMenu("upload")}>
          자료 업로드
        </NavButton>

        {isAdmin && (
          <div className="pt-6 pb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2 tracking-widest">보안 및 감사</p>
            <NavButton active={menu === "members"} icon={Users} onClick={() => setMenu("members")}>
              사용자 권한 관리
            </NavButton>
            <NavButton active={menu === "logs"} icon={History} onClick={() => setMenu("logs")}>
              열람 로그 관리
            </NavButton>
            <NavButton active={menu === "content-management"} icon={FolderOpen} onClick={() => setMenu("content-management")}>
              콘텐츠 관리
            </NavButton>
          </div>
        )}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
          </div>
          <button
            onClick={onLogout}
            title="로그아웃"
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}