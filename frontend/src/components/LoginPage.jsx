/**
 * LoginPage — InterX Content Secure System 로그인
 */
import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";

export default function LoginPage({ onLogin, error: externalError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const error = localError || externalError;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setLocalError("이메일을 입력해주세요."); return; }
    if (!password) { setLocalError("비밀번호를 입력해주세요."); return; }

    setLocalError("");
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch {
      // error는 useAuth에서 설정됨
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-[0.03]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-white rounded-full"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* 상단 로고 */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-600/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">InterX</span>
          </div>
          <p className="text-slate-500 text-sm ml-1">Content Secure System</p>
        </div>

        {/* 중앙 메시지 */}
        <div className="relative z-10 -mt-12">
          <h1 className="text-white text-4xl xl:text-5xl font-black leading-[1.15] mb-6 tracking-tight">
            보안 콘텐츠를<br />
            <span className="text-orange-500">안전하게</span> 관리하세요
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            HLS 암호화 스트리밍, 실시간 워터마크, 감사 로그로
            기업의 핵심 자산을 보호합니다.
          </p>

          {/* 기능 포인트 */}
          <div className="mt-10 space-y-4">
            {[
              { label: "암호화 스트리밍", desc: "영상 원본 유출 차단" },
              { label: "실시간 감사", desc: "모든 접근 이력 추적" },
              { label: "역할 기반 접근 제어", desc: "세분화된 권한 관리" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-600/10 border border-orange-600/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 */}
        <div className="relative z-10">
          <p className="text-slate-600 text-xs">&copy; 2026 InterX. All rights reserved.</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9fb]">
        <div className="w-full max-w-md">
          {/* 모바일 로고 */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="bg-orange-600 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">InterX</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">로그인</h2>
            <p className="text-slate-500 text-sm">시스템에 접근하려면 관리자 계정으로 로그인하세요.</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">인증 실패</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLocalError(""); }}
                placeholder="admin@company.com"
                disabled={loading}
                autoFocus
                autoComplete="email"
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all
                  placeholder:text-slate-300 disabled:opacity-50"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError(""); }}
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-5 py-3.5 pr-12 bg-white border border-slate-200 rounded-2xl text-sm outline-none
                    focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all
                    placeholder:text-slate-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-2xl
                hover:bg-orange-700 active:scale-[0.98] transition-all
                shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* 힌트 (개발용) */}
          <div className="mt-8 p-4 bg-slate-100 border border-slate-200 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">개발용 테스트 계정</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Email:</span> admin@company.com
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Password:</span> admin1234
              </p>
            </div>
          </div>

          {/* 보안 안내 */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL 암호화로 보호됩니다</span>
          </div>
        </div>
      </div>

      {/* shake 애니메이션 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
