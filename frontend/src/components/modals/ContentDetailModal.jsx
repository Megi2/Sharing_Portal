import React, { useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft, X, Download, Lock, ShieldAlert,
  CheckCircle, Layers, Image as ImageIcon,
} from "lucide-react";

export default function ContentDetailModal({ selected, onClose }) {
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const sectionsRef = useRef([]);

  const watermarkText = "전진하 매니저 (192.168.0.15)";
  const watermarkSpans = useMemo(() => Array.from({ length: 40 }, (_, i) => `${watermarkText}-${i}`), []);

  function preventContextMenu(e) { e.preventDefault(); }

  function handleClose() {
    if (videoRef.current) { try { videoRef.current.pause(); } catch {} }
    onClose();
  }

  // IntersectionObserver for animation
  useEffect(() => {
    const rootEl = modalRef.current;
    if (!rootEl) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("opacity-100", "translate-y-0"); }),
      { root: rootEl, threshold: 0.1 }
    );
    sectionsRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={modalRef} className="fixed inset-0 bg-white z-[100] overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-4">
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <h3 className="font-bold text-slate-800">{selected.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Active Security</span>
            <span className="text-[11px] text-slate-400">User: 전진하 매니저 (192.168.0.15)</span>
          </div>
          {selected.downloadAllowed && (
            <button onClick={() => alert("자료 호스트로부터 다운로드를 시작합니다...")} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
              <Download className="w-4 h-4" /> 다운로드
            </button>
          )}
          <button className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95">자산 공유 요청</button>
          <button onClick={handleClose} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pb-32">
        {/* 1. Hero / Player */}
        <section ref={(el) => (sectionsRef.current[0] = el)} className="mt-8 px-6 opacity-0 translate-y-5 transition-all duration-700">
          <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group">
            <div className="pointer-events-none absolute inset-0 flex flex-wrap justify-around items-center opacity-[0.05] z-50">
              {watermarkSpans.map((k) => (
                <span key={k} className="font-bold text-[14px] whitespace-nowrap" style={{ transform: "rotate(-30deg)" }}>{watermarkText}</span>
              ))}
            </div>
            {selected.type === "video" ? (
              <video ref={videoRef} className="w-full h-full" controls controlsList="nodownload" onContextMenu={preventContextMenu}>
                <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
              </video>
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full h-full bg-white rounded-xl shadow-inner relative overflow-hidden">
                  <iframe src="https://res.cloudinary.com/demo/image/upload/multi_page_pdf.pdf#toolbar=0&navpanes=0" className="w-full h-full border-none" title="Document Preview" />
                  <div className="absolute top-0 right-0 p-4 pointer-events-none">
                    <div className="bg-slate-900/10 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded border border-white/20 uppercase">Protected View</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Content Info */}
        <section ref={(el) => (sectionsRef.current[1] = el)} className="mt-12 px-8 opacity-0 translate-y-5 transition-all duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">{selected.category}</span>
                <span className="text-[10px] font-black text-white bg-red-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{selected.status}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">{selected.title}</h1>
              <p className="text-lg text-slate-500 leading-relaxed">{selected.desc}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[240px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">자산 메타데이터</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-400">등록일</span><span className="font-bold text-slate-700">{selected.date}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">등록자</span><span className="font-bold text-slate-700">전진하 매니저</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">파일 크기</span><span className="font-bold text-slate-700">425.2 MB</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Detail Grid */}
        <section ref={(el) => (sectionsRef.current[2] = el)} className="mt-20 px-8 grid grid-cols-1 md:grid-cols-2 gap-16 opacity-0 translate-y-5 transition-all duration-700">
          <div>
            <h4 className="text-2xl font-bold text-slate-800 mb-6">주요 특징 및 활용 가이드</h4>
            <p className="text-slate-600 leading-relaxed mb-8">본 콘텐츠는 브랜드 아이덴티티 강화를 목표로 제작되었습니다. 내부 보고서 및 공식 프레젠테이션 자산으로 활용 가능하며, 모든 편집본은 사전에 홍보팀의 검수를 거쳐야 합니다.</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5" /></div>
                <div><h6 className="font-bold text-slate-800">표준 컬러 가이드 준수</h6><p className="text-xs text-slate-500 mt-1">InterX 2026 브랜드 컬러 팔레트를 엄격히 준수하여 제작되었습니다.</p></div>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0"><Layers className="w-5 h-5" /></div>
                <div><h6 className="font-bold text-slate-800">다양한 해상도 최적화</h6><p className="text-xs text-slate-500 mt-1">4K, FHD, Mobile 등 모든 디바이스에서 최적의 가독성을 제공합니다.</p></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 flex items-center justify-center relative group">
              <ImageIcon className="w-12 h-12 text-slate-300" />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-white bg-black/40 px-3 py-1 rounded-full">이미지 자산 #1</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>
              <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>
            </div>
          </div>
        </section>

        {/* 4. Security Policy */}
        <section ref={(el) => (sectionsRef.current[3] = el)} className="mt-24 px-8 opacity-0 translate-y-5 transition-all duration-700">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h4 className="text-3xl font-bold mb-6 flex items-center gap-3"><ShieldAlert className="w-8 h-8 text-orange-500" /> 보안 및 준수 사항</h4>
              <div className="space-y-6">
                <div className="flex gap-4 items-start"><div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" /><p className="text-slate-300">본 자산은 <b>전진하 매니저</b>님의 권한 하에 열람되고 있습니다. 시스템은 현재 귀하의 IP(192.168.0.15)와 열람 시간을 초단위로 기록하고 있습니다.</p></div>
                <div className="flex gap-4 items-start"><div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" /><p className="text-slate-300">영상 녹화, 스크린샷 캡처 시 화면에 워터마크가 포함되며, 비인가 유출이 감지될 경우 즉시 보안 담당자에게 알림이 전송됩니다.</p></div>
                <div className="flex gap-4 items-start"><div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" /><p className="text-slate-300">{selected.downloadAllowed ? <>현재 정책상 본 자산은 <b>다운로드 허가</b>된 문서입니다. 상단 다운로드 버튼을 이용하십시오.</> : <>현재 정책상 본 자산의 <b>다운로드는 제한</b>되어 있습니다. 오프라인 사용이 필요한 경우 '자산 공유 요청' 기능을 이용하십시오.</>}</p></div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none"><Lock className="w-full h-full p-20" /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
