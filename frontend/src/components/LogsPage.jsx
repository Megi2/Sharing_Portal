import React from "react";
import { Download } from "lucide-react";
import { logStatusClass } from "../utils/helpers";

export default function LogsPage({ logs }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">열람 로그 및 보안 감사</h2>
          <p className="text-sm text-slate-500 mt-1">실시간 콘텐츠 접근 이력 및 비인가 시도를 감시합니다.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50">
          <Download className="w-4 h-4" /> 리포트 다운로드
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <th className="px-8 py-5">Event Time</th>
              <th className="px-6 py-5">User ID</th>
              <th className="px-6 py-5">Activity</th>
              <th className="px-6 py-5">Asset</th>
              <th className="px-6 py-5">IP Address</th>
              <th className="px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 text-xs font-mono text-slate-400">{log.time}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold">{log.user[0]}</div>
                    <span className="text-xs font-bold text-slate-700">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{log.action}</span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500 truncate max-w-[150px]">{log.asset}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ip}</td>
                <td className="px-8 py-4 text-right">
                  <span className={`text-[9px] font-black border px-1.5 py-0.5 rounded ${logStatusClass(log.status)}`}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 bg-slate-50/50 flex justify-center">
          <nav className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400">1</button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600">2</button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600">3</button>
          </nav>
        </div>
      </div>
    </div>
  );
}
