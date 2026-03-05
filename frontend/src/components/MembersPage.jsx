import React, { useMemo, useState } from "react";
import { UserPlus, Loader2, AlertCircle, Users, RefreshCw, Edit3, ShieldOff } from "lucide-react";
import { roleBadgeClass, memberStatusBadgeClass } from "../utils/helpers";

export default function MembersPage({
  members, membersLoading, membersError,
  fetchMembers, onInvite, onEditMember,
}) {
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(
    () => members.filter((m) => {
      const deptOk = deptFilter === "all" || m.dept === deptFilter;
      const roleOk = roleFilter === "all" || m.role === roleFilter;
      return deptOk && roleOk;
    }),
    [members, deptFilter, roleFilter]
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">사용자 권한 관리</h2>
          <p className="text-sm text-slate-500 mt-1">시스템 접근 권한을 가진 인원을 관리하고 역할을 부여합니다.</p>
        </div>
        <button onClick={onInvite} className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95">
          <UserPlus className="w-4 h-4" /> 사용자 초대
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">전체 사용자</p>
          <h4 className="text-3xl font-black text-slate-900">
            {members.length} <span className="text-sm font-medium text-slate-400 ml-1 uppercase">명</span>
          </h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">관리자 그룹</p>
          <h4 className="text-3xl font-black text-slate-900">
            {members.filter((m) => m.role.includes("관리")).length} <span className="text-sm font-medium text-slate-400 ml-1 uppercase">명</span>
          </h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">활성 사용자</p>
          <h4 className="text-3xl font-black text-green-500">
            {members.filter((m) => m.status === "활성").length} <span className="text-sm font-medium text-slate-400 ml-1 uppercase">명</span>
          </h4>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">전체 부서</option>
              {[...new Set(members.map((m) => m.dept))].filter(Boolean).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">전체 권한</option>
              <option value="최고 관리자">최고 관리자</option>
              <option value="관리인 (Admin)">관리인 (Admin)</option>
              <option value="사용자 (User)">사용자 (User)</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <th className="px-8 py-5">사용자명 / 부서</th>
              <th className="px-6 py-5">역할 및 권한</th>
              <th className="px-6 py-5">이메일</th>
              <th className="px-6 py-5">최근 접속일</th>
              <th className="px-6 py-5 text-center">계정 상태</th>
              <th className="px-8 py-5 text-right">관리</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {membersLoading ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">사용자 목록을 불러오는 중...</p>
              </td></tr>
            ) : membersError ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-500 font-medium mb-3">{membersError}</p>
                <button onClick={fetchMembers} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-colors">
                  <RefreshCw className="w-4 h-4" /> 다시 시도
                </button>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">등록된 사용자가 없습니다.</p>
                <button onClick={onInvite} className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-colors">
                  <UserPlus className="w-4 h-4" /> 사용자 초대
                </button>
              </td></tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">{m.name[0]}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{m.name} {m.position}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{m.dept}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tight ${roleBadgeClass(m.role)}`}>{m.role}</span>
                  </td>
                  <td className="px-6 py-5 text-xs text-slate-500">{m.email}</td>
                  <td className="px-6 py-5 text-xs text-slate-400">{m.lastLogin}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[10px] font-black border px-2 py-0.5 rounded-full ${memberStatusBadgeClass(m.status)}`}>{m.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => onEditMember(m)} className="text-slate-400 hover:text-orange-600 p-1 transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="text-slate-400 hover:text-red-500 p-1" title="Disable">
                      <ShieldOff className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
