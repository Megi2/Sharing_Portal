import React, { useState } from "react";
import { X, UserPlus, ShieldAlert, Settings, Loader2 } from "lucide-react";

export default function InviteMemberModal({ onClose, onInvite }) {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", position: "", role: "사용자 (User)",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!formData.name.trim()) { setError("이름을 입력해주세요."); return; }
    if (!formData.email.trim()) { setError("아이디(이메일)를 입력해주세요."); return; }
    if (!formData.password.trim()) { setError("비밀번호를 입력해주세요."); return; }
    if (formData.password.length < 4) { setError("비밀번호는 최소 4자 이상이어야 합니다."); return; }
    if (formData.password !== formData.confirmPassword) { setError("비밀번호가 일치하지 않습니다."); return; }

    setLoading(true);
    setError("");
    try {
      await onInvite(formData);
      onClose();
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.email?.[0] || err?.response?.data?.detail || "사용자 생성에 실패했습니다. 입력값을 확인해주세요.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  }

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2.5 rounded-xl"><UserPlus className="w-5 h-5 text-orange-600" /></div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">사용자 초대</h3>
              <p className="text-sm text-slate-500">새로운 사용자를 시스템에 추가합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">이름 <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="예: 홍길동" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">아이디 (이메일) <span className="text-red-500">*</span></label>
            <input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="예: hong@interxlab.com" disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호 <span className="text-red-500">*</span></label>
              <input type="password" value={formData.password} onChange={(e) => set("password", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="비밀번호 입력" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호 확인 <span className="text-red-500">*</span></label>
              <input type="password" value={formData.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="비밀번호 재입력" disabled={loading} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-orange-600" /> 추가 정보 (선택)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">직급</label>
                <input type="text" value={formData.position} onChange={(e) => set("position", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="예: 매니저" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">권한</label>
                <select value={formData.role} onChange={(e) => set("role", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" disabled={loading}>
                  <option value="사용자 (User)">사용자 (User)</option>
                  <option value="관리인 (Admin)">관리인 (Admin)</option>
                  <option value="최고 관리자">최고 관리자</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button onClick={onClose} disabled={loading} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">취소</button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 처리 중...</> : <><UserPlus className="w-4 h-4" /> 사용자 추가</>}
          </button>
        </div>
      </div>
    </div>
  );
}
