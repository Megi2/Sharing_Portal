import { ShieldCheck, Home, LayoutDashboard, Bell, Bot, BookOpen, HelpCircle, Settings, LogOut, ChevronRight, ShieldAlert } from "lucide-react";

const SIDE_NAV = [
  { id:"home",      icon:Home,            label:"홈으로" },
  { id:"dashboard", icon:LayoutDashboard, label:"대시보드" },
  { id:"notices",   icon:Bell,            label:"공지사항" },
  { id:"aichat",    icon:Bot,             label:"AI 챗봇" },
  { id:"knowledge", icon:BookOpen,        label:"Knowledge Base" },
  { id:"qna",       icon:HelpCircle,      label:"QnA" },
  { id:"admin",     icon:Settings,        label:"관리자홈" },
];

const SCREEN_TITLES = {
  dashboard:"대시보드", notices:"공지사항", aichat:"AI 챗봇",
  knowledge:"Knowledge Base", qna:"QnA", admin:"관리자홈",
};

export default function MainLayout({ user, screen, onNavigate, children }) {
  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Pretendard','Noto Sans KR',system-ui,sans-serif" }}>
      {/* ── Sidebar */}
      <aside style={{ width:236, background:"#0d1b2e", color:"white", display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>
        <div style={{ padding:"20px 18px", borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ background:"linear-gradient(135deg,#f97316,#ea580c)", borderRadius:11, padding:"6px 8px" }}>
            <ShieldCheck size={18} color="white"/>
          </div>
          <span style={{ fontWeight:800, fontSize:19, letterSpacing:"-0.3px" }}>INTERX</span>
        </div>

        <nav style={{ padding:"10px 8px", flex:1, overflow:"auto" }}>
          {SIDE_NAV.map(({ id, icon:Icon, label }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:11,
                padding:"10px 14px", borderRadius:12, border:"none",
                background:screen===id?"#f97316":"transparent",
                color:screen===id?"white":"rgba(255,255,255,.52)",
                fontSize:13, fontWeight:screen===id?700:500,
                cursor:"pointer", marginBottom:2, textAlign:"left", transition:"all .15s",
              }}
              onMouseEnter={e => { if(screen!==id) e.currentTarget.style.background="rgba(255,255,255,.07)"; }}
              onMouseLeave={e => { if(screen!==id) e.currentTarget.style.background="transparent"; }}
            >
              <Icon size={16}/> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, background:"rgba(255,255,255,.06)", borderRadius:12, padding:"9px 11px" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#ea580c)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, flexShrink:0 }}>
              {user?.name?.[0] ?? "A"}
            </div>
            <div style={{ overflow:"hidden", flex:1 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</p>
              <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,.4)" }}>{user?.role}</p>
            </div>
            <button onClick={() => onNavigate("__logout")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.4)", padding:4 }} title="로그아웃">
              <LogOut size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f0f4f8", overflow:"hidden", minWidth:0 }}>
        {/* Header */}
        <header style={{ height:60, background:"white", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => onNavigate("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", display:"flex" }}>
              <Home size={17}/>
            </button>
            <ChevronRight size={13} color="#d1d5db"/>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#111827" }}>{SCREEN_TITLES[screen] ?? "INTERX"}</h2>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:"4px 11px", fontSize:11, color:"#6b7280" }}>
              <ShieldAlert size={12} color="#f59e0b"/>
              IP: 192.168.0.15
            </div>
            <button style={{ position:"relative", background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:18 }}>
              🔔
              <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, background:"#ef4444", borderRadius:"50%", fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, border:"2px solid white" }}>3</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflow:"auto", padding:"26px 28px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
