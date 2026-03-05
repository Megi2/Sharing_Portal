import React from "react";
import { Bell, ChevronRight, FileText, Video, Eye } from "lucide-react";
import { statusColor } from "../utils/helpers";

export default function DashboardPage({ noticesData, contents, search, openModal }) {
  const q = search.trim().toLowerCase();
  const matchSearch = (item) =>
    q.length === 0 || item.title.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q));

  const docs = contents.filter((c) => c.type === "document" && matchSearch(c));
  const videos = contents.filter((c) => c.type === "video" && matchSearch(c));

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        <div className="xl:col-span-12" />

        {/* 공지사항 */}
        <div className="xl:col-span-5">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm h-full min-h-[320px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-black text-slate-800">공지사항</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {noticesData.length} 건
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {noticesData.map((notice) => {
                const typeColor = { 보안: "bg-red-50 text-red-600", 정책: "bg-orange-50 text-orange-600", 공지: "bg-slate-100 text-slate-500" }[notice.type] ?? "bg-slate-100 text-slate-500";
                return (
                  <div key={notice.id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${notice.important ? "bg-orange-500" : "bg-slate-300"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${typeColor}`}>{notice.type}</span>
                          <span className="text-[11px] text-slate-400">{notice.date}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors truncate">{notice.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notice.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 제안서 및 자료 */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-slate-800">제안서 및 자료</h3>
              <p className="text-xs text-slate-500">주요 문서 및 전략 기획안 자산</p>
            </div>
            <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase">
              Docs: {docs.length}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((item) => (
              <div key={item.id} onClick={() => openModal(item)} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50/50 transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6 text-orange-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-orange-600 uppercase mb-1">{item.category}</p>
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-orange-600 transition-colors">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 영상 라이브러리 */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">영상 라이브러리</h3>
            <p className="text-sm text-slate-500 mt-1">HLS 암호화가 적용된 고화질 영상 자산</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <div className="px-4 py-2 text-xs font-black text-orange-600 bg-white rounded-lg shadow-sm">전체 영상</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {videos.map((item) => (
            <div key={item.id} onClick={() => openModal(item)} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group hover:border-orange-400 hover:shadow-2xl transition-all duration-500 cursor-pointer">
              <div className="aspect-video bg-slate-50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-4 right-4 z-10">
                  <span className={`${statusColor(item.status)} text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg`}>{item.status}</span>
                </div>
                <Video className="w-12 h-12 text-slate-300 group-hover:scale-110 group-hover:text-orange-200 transition-all duration-700" />
                <div className="absolute inset-0 bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-white text-orange-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="p-7">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded">{item.category}</span>
                  <span className="text-[11px] text-slate-400 font-bold">{item.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2 truncate group-hover:text-orange-600 transition-colors">{item.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-400 font-medium">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
