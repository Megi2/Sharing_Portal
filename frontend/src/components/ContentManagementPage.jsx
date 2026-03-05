import React from "react";
import { Video, FileText, Edit3, Trash2 } from "lucide-react";

export default function ContentManagementPage({ contents, onEditContent, onDeleteContent }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">콘텐츠 관리</h2>
          <p className="text-sm text-slate-500 mt-1">콘텐츠 정보 수정, 삭제 및 권한 설정을 관리합니다.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500">
              <option>전체 타입</option>
              <option>영상</option>
              <option>제안서</option>
              <option>기타</option>
            </select>
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500">
              <option>전체 권한</option>
              <option>관리자만</option>
              <option>모든 사용자</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <th className="px-8 py-5">콘텐츠 제목</th>
              <th className="px-6 py-5">분류</th>
              <th className="px-6 py-5">등록일</th>
              <th className="px-6 py-5">열람 권한</th>
              <th className="px-6 py-5">다운로드</th>
              <th className="px-8 py-5 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contents.map((content) => (
              <tr key={content.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    {content.type === "video" ? <Video className="w-5 h-5 text-slate-400" /> : <FileText className="w-5 h-5 text-slate-400" />}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{content.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[300px]">{content.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded tracking-tight">{content.category}</span>
                </td>
                <td className="px-6 py-5 text-xs text-slate-500">{content.date}</td>
                <td className="px-6 py-5">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tight ${content.viewPermission === "admin-only" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {content.viewPermission === "admin-only" ? "관리자만" : "모든 사용자"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tight ${content.downloadAllowed ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"}`}>
                    {content.downloadAllowed ? "가능" : "불가능"}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEditContent(content)} className="text-slate-400 hover:text-orange-600 p-1 transition-colors" title="수정">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteContent(content.id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="삭제">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
