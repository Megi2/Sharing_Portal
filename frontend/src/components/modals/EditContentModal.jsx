import React, { useState } from "react";
import { X } from "lucide-react";

export default function EditContentModal({ content, onClose, onSave }) {
  const [form, setForm] = useState({
    title: content.title,
    category: content.category,
    desc: content.desc,
    tags: content.tags.join(", "),
    viewPermission: content.viewPermission || "all-users",
    downloadAllowed: content.downloadAllowed || false,
  });

  function handleSave() {
    onSave(content.id, {
      title: form.title,
      category: form.category,
      desc: form.desc,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      viewPermission: form.viewPermission,
      downloadAllowed: form.downloadAllowed,
    });
  }

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">콘텐츠 수정</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">제목</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">분류</label>
            <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">설명</label>
            <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">태그 (쉼표 구분)</label>
            <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="예: 브랜딩, 2026, 전략" />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-3">열람 권한</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="perm" checked={form.viewPermission === "all-users"} onChange={() => set("viewPermission", "all-users")} className="w-4 h-4 accent-orange-600" />
                <span className="text-sm text-slate-700">모든 사용자</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="perm" checked={form.viewPermission === "admin-only"} onChange={() => set("viewPermission", "admin-only")} className="w-4 h-4 accent-orange-600" />
                <span className="text-sm text-slate-700">관리자만</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">다운로드 허용</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors flex-1">
                <input type="radio" name="dl" checked={form.downloadAllowed === true} onChange={() => set("downloadAllowed", true)} className="w-4 h-4 accent-orange-600" />
                <div><p className="text-sm font-bold text-slate-700">다운로드 가능</p><p className="text-xs text-slate-500">파일 다운로드가 허용됩니다</p></div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors flex-1">
                <input type="radio" name="dl" checked={form.downloadAllowed === false} onChange={() => set("downloadAllowed", false)} className="w-4 h-4 accent-orange-600" />
                <div><p className="text-sm font-bold text-slate-700">다운로드 불가능</p><p className="text-xs text-slate-500">다운로드가 제한됩니다</p></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">취소</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100">저장</button>
        </div>
      </div>
    </div>
  );
}
