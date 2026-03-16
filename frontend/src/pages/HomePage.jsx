import { useState, useEffect } from "react";
import { ShieldCheck, LayoutDashboard, Bell, Bot, BookOpen, HelpCircle, Settings, LogOut, ChevronRight } from "lucide-react";
import { MOCK_NOTICES } from "../constants/mockData";

const NAV_ITEMS = [
  { id:"dashboard", icon:LayoutDashboard, label:"대시보드" },
  { id:"notices",   icon:Bell,            label:"공지사항" },
  { id:"aichat",    icon:Bot,             label:"AI 챗봇" },
  { id:"knowledge", icon:BookOpen,        label:"Knowledge Base" },
  { id:"qna",       icon:HelpCircle,      label:"QnA" },
  { id:"admin",     icon:Settings,        label:"관리자홈" },
];

export default function HomePage({ user, onNavigate }) {
  const [aiMode, setAiMode] = useState(false);
  const [noticeIdx, setNoticeIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNoticeIdx(i => (i+1) % MOCK_NOTICES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight:"100vh", background:"#05101e",
      position:"relative", overflow:"hidden",
      fontFamily:"'Pretendard','Noto Sans KR',system-ui,sans-serif",
    }}>
      <style>{`
        @keyframes waveA{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes waveB{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        @keyframes twinkle2{0%,100%{opacity:.2}50%{opacity:.85}}
        @keyframes float2{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-11px) rotate(3deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bubblePop{0%{opacity:0;transform:scale(.8) translateY(10px)}100%{opacity:1;transform:scale(1) translateY(0)}}
        .h-nav:hover .h-circle{background:rgba(255,255,255,.18)!important;box-shadow:0 0 22px rgba(56,189,248,.35)!important;}
        .h-nav:hover{transform:translateY(-6px);}
        .h-nav{transition:all .22s cubic-bezier(.34,1.56,.64,1);cursor:pointer;}
        .h-search:focus-within{box-shadow:0 8px 48px rgba(0,0,0,.35),0 0 0 2px rgba(56,189,248,.3)!important;}
      `}</style>

      {/* Stars */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1 }}>
        {[...Array(70)].map((_,i) => (
          <div key={i} style={{
            position:"absolute",
            left:`${(i*41.7+7)%100}%`, top:`${(i*23.1+3)%100}%`,
            width:i%7===0?2.5:i%4===0?1.5:1, height:i%7===0?2.5:i%4===0?1.5:1,
            borderRadius:"50%", background:"rgba(148,210,255,.6)",
            animation:`twinkle2 ${2.5+i%4}s ease-in-out ${(i*.27)%3}s infinite`,
          }}/>
        ))}
      </div>

      {/* Waves */}
      <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none" }}>
        <div style={{ position:"absolute", bottom:"6%", left:0, width:"200%", height:270, animation:"waveA 18s linear infinite" }}>
          {[0,1].map(k => (
            <svg key={k} viewBox="0 0 1440 270" preserveAspectRatio="none"
              style={{ width:"50%", height:"100%", position:"absolute", left:`${k*50}%` }}>
              <defs><linearGradient id={`wg${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity=".22"/>
                <stop offset="100%" stopColor="#0369a1" stopOpacity=".03"/>
              </linearGradient></defs>
              <path d="M0,135 C180,40 360,230 540,135 C720,40 900,230 1080,135 C1260,40 1440,230 1440,135 L1440,270 L0,270 Z" fill={`url(#wg${k})`}/>
              <path d="M0,135 C180,40 360,230 540,135 C720,40 900,230 1080,135 C1260,40 1440,230 1440,135" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity=".9"/>
              <path d="M0,135 C180,40 360,230 540,135 C720,40 900,230 1080,135 C1260,40 1440,230 1440,135" fill="none" stroke="white" strokeWidth="1" strokeOpacity=".3"/>
            </svg>
          ))}
        </div>
        <div style={{ position:"absolute", bottom:"1%", left:0, width:"200%", height:170, animation:"waveB 24s linear infinite" }}>
          {[0,1].map(k => (
            <svg key={k} viewBox="0 0 1440 170" preserveAspectRatio="none"
              style={{ width:"50%", height:"100%", position:"absolute", left:`${k*50}%` }}>
              <path d="M0,85 C220,30 440,140 660,85 C880,30 1100,140 1320,85 L1440,85 L1440,170 L0,170 Z" fill="rgba(3,105,161,.08)"/>
              <path d="M0,85 C220,30 440,140 660,85 C880,30 1100,140 1320,85 L1440,85" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeOpacity=".4"/>
            </svg>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{ position:"relative", zIndex:10, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 44px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ background:"linear-gradient(135deg,#f97316,#ea580c)", borderRadius:12, padding:"7px 9px", boxShadow:"0 4px 14px rgba(249,115,22,.4)" }}>
            <ShieldCheck size={20} color="white"/>
          </div>
          <span style={{ color:"white", fontWeight:800, fontSize:21, letterSpacing:"-0.3px" }}>INTERX</span>
          <span style={{ color:"rgba(255,255,255,.35)", fontSize:14, marginLeft:4 }}>영업자료 포탈</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ color:"rgba(255,255,255,.6)", fontSize:13 }}>
            {user?.name} <span style={{ color:"rgba(255,255,255,.35)" }}>·</span> {user?.role}
          </span>
          <button onClick={() => onNavigate("__logout")} style={{
            background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)",
            borderRadius:10, color:"rgba(255,255,255,.7)", padding:"7px 16px",
            fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          }}>
            <LogOut size={14}/> 로그아웃
          </button>
        </div>
      </div>

      {/* Mascot + Bubble */}
      <div style={{
        position:"absolute", top:68, right:60, zIndex:10,
        display:"flex", alignItems:"flex-start", gap:14,
        animation:"bubblePop .6s cubic-bezier(.34,1.56,.64,1) .4s both",
      }}>
        <div style={{
          background:"linear-gradient(135deg,#1e4d8c,#1e3a6b)",
          borderRadius:"22px 22px 6px 22px", padding:"15px 20px", maxWidth:280,
          boxShadow:"0 8px 32px rgba(30,77,140,.5)", border:"1px solid rgba(255,255,255,.12)",
        }}>
          <p style={{ color:"white", fontSize:14, fontWeight:600, lineHeight:1.65, margin:0 }}>
            INTERX 영업자료 포탈에 오신 것을 환영합니다! 필요한 자료를 빠르게 찾아보세요.
          </p>
        </div>
        <div style={{ fontSize:70, lineHeight:1, animation:"float2 4s ease-in-out infinite", marginTop:-6 }}>🦊</div>
      </div>

      {/* Center: Search + Nav */}
      <div style={{
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column", alignItems:"center",
        marginTop:128, padding:"0 44px",
        animation:"slideUp .7s ease .2s both",
      }}>
        {/* Search bar */}
        <div className="h-search" style={{
          display:"flex", alignItems:"center",
          background:"white", borderRadius:60,
          padding:"5px 8px 5px 22px",
          width:"100%", maxWidth:660,
          boxShadow:"0 12px 48px rgba(0,0,0,.35)", transition:"box-shadow .2s",
        }}>
          <select style={{ border:"none", outline:"none", background:"transparent", color:"#374151", fontSize:14, fontWeight:700, padding:"6px 20px 6px 0", cursor:"pointer", borderRight:"1px solid #e5e7eb", marginRight:16 }}>
            {["전체","영상","제안서","기타"].map(o => <option key={o}>{o}</option>)}
          </select>
          <span style={{ color:"#9ca3af", marginRight:10, fontSize:16 }}>🔍</span>
          <input onKeyDown={e => e.key==="Enter" && onNavigate("dashboard")} placeholder="검색어를 입력하세요."
            style={{ flex:1, border:"none", outline:"none", fontSize:15, color:"#374151", background:"transparent" }}/>
          <div onClick={() => setAiMode(m => !m)} style={{
            display:"flex", alignItems:"center", gap:8, padding:"8px 16px", marginLeft:8,
            background:"rgba(0,0,0,.04)", borderRadius:40, cursor:"pointer", flexShrink:0,
          }}>
            <span style={{ color:"#6b7280", fontSize:12, fontWeight:700 }}>AI 모드</span>
            <div style={{ width:40, height:22, borderRadius:11, background:aiMode?"#3b82f6":"#d1d5db", position:"relative", transition:"background .25s" }}>
              <div style={{ position:"absolute", top:2, left:aiMode?20:3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.25)" }}/>
            </div>
          </div>
        </div>

        {/* Nav icons */}
        <div style={{ display:"flex", gap:32, marginTop:48, flexWrap:"wrap", justifyContent:"center" }}>
          {NAV_ITEMS.map(({ id, icon:Icon, label }) => (
            <div key={id} className="h-nav" onClick={() => onNavigate(id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div className="h-circle" style={{
                width:80, height:80, borderRadius:"50%",
                background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.18)",
                display:"flex", alignItems:"center", justifyContent:"center",
                backdropFilter:"blur(10px)", transition:"all .22s",
              }}>
                <Icon size={30} color="white"/>
              </div>
              <span style={{ color:"rgba(255,255,255,.82)", fontSize:11, fontWeight:600, textAlign:"center", lineHeight:1.4, maxWidth:88 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notice card (bottom-left) */}
      <div style={{
        position:"absolute", bottom:36, left:44, zIndex:10,
        background:"white", borderRadius:22, padding:"18px 24px", maxWidth:420,
        boxShadow:"0 12px 40px rgba(0,0,0,.22)",
        animation:"slideUp .7s ease .5s both",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ background:"#eff6ff", color:"#1d4ed8", fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:20 }}>공지사항</span>
          <div style={{ display:"flex", gap:3, marginLeft:"auto" }}>
            {MOCK_NOTICES.map((_,i) => (
              <div key={i} style={{ width:i===noticeIdx?18:6, height:6, borderRadius:3, background:i===noticeIdx?"#3b82f6":"#d1d5db", transition:"all .35s" }}/>
            ))}
          </div>
        </div>
        <p style={{ color:"#111827", fontSize:14, fontWeight:700, margin:"0 0 8px", lineHeight:1.45 }}>
          {MOCK_NOTICES[noticeIdx].title}
        </p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#9ca3af", fontSize:12 }}>📅 {MOCK_NOTICES[noticeIdx].date}</span>
          <button onClick={() => onNavigate("notices")} style={{ background:"none", border:"none", color:"#3b82f6", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
            바로 가기 <ChevronRight size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}
