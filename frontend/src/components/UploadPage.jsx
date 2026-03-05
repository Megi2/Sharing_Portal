import React from "react";
import { UploadCloud, ShieldCheck } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">신규 자료 업로드</h2>
        <p className="text-slate-500 mt-1 text-sm">관리자 계정으로 신규 콘텐츠를 등록합니다. 모든 업로드 행위는 감사 로그에 남습니다.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-700">여기로 파일을 끌어다 놓으세요</p>
          <p className="text-sm text-slate-400 mt-2">MP4, PDF, PPTX (최대 2.0GB)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">콘텐츠 제목</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="자료 명칭을 입력하세요" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">분류</label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
              <option>영상 자산</option>
              <option>제안서 및 기획안</option>
              <option>디자인 가이드라인</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-600" /> 보안 모드 설정
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-orange-600" />
              <div>
                <p className="text-sm font-bold">HLS 암호화 스트리밍</p>
                <p className="text-[11px] text-slate-500">네트워크 탭에서의 원본 소스 경로 숨김</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-orange-600" />
              <div>
                <p className="text-sm font-bold">다운로드 비활성화</p>
                <p className="text-[11px] text-slate-500">브라우저 내 저장 버튼 및 메뉴 차단</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-6 gap-3">
          <button className="px-6 py-3 font-bold text-slate-500">취소</button>
          <button className="px-10 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700">업로드 시작</button>
        </div>
      </div>
    </div>
  );
}
