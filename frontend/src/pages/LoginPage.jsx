import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage({ onLogin }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("admin@company.com");
  const [pw, setPw] = useState("admin1234");
  const [err, setErr] = useState("");

  async function handleLogin() {
    setErr("");
    const user = await login(email, pw);
    if (user) {
      onLogin(user);
    } else {
      setErr("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  }

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#050e1a 0%,#0c1f38 60%,#050e1a 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Pretendard','Noto Sans KR',system-ui,sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-12px) rotate(3deg)}}
        @keyframes twinkle{0%,100%{opacity:.2}50%{opacity:.85}}
        .l-input{width:100%;box-sizing:border-box;padding:13px 18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:13px;color:white;font-size:15px;transition:all .2s;outline:none;}
        .l-input:focus{border-color:rgba(249,115,22,.6)!important;box-shadow:0 0 0 3px rgba(249,115,22,.12);}
        .l-btn{width:100%;padding:15px;margin-top:26px;border:none;border-radius:14px;color:white;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s;}
        .l-btn:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);}
        .l-btn:disabled{opacity:.6;cursor:not-allowed;}
      `}</style>

      {/* Stars */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {[...Array(60)].map((_,i) => (
          <div key={i} style={{
            position:"absolute",
            left:`${(i*37.3+5)%100}%`, top:`${(i*19.7+3)%100}%`,
            width:i%5===0?3:i%3===0?2:1.5, height:i%5===0?3:i%3===0?2:1.5,
            borderRadius:"50%", background:"rgba(148,210,255,.7)",
            animation:`twinkle ${2+i%3}s ease-in-out ${(i*.3)%2}s infinite`,
          }}/>
        ))}
      </div>

      {/* Mascot */}
      <div style={{ position:"absolute", top:44, right:80, fontSize:76, lineHeight:1, animation:"float 3.5s ease-in-out infinite", zIndex:1 }}>
        🦊
      </div>

      {/* Card */}
      <div style={{
        background:"rgba(255,255,255,.05)", backdropFilter:"blur(24px)",
        border:"1px solid rgba(255,255,255,.1)", borderRadius:28,
        padding:"48px 44px", width:"100%", maxWidth:420,
        position:"relative", zIndex:2,
        boxShadow:"0 32px 80px rgba(0,0,0,.4)",
      }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:60, height:60, borderRadius:18,
            background:"linear-gradient(135deg,#f97316,#dc2626)",
            marginBottom:16, boxShadow:"0 8px 24px rgba(249,115,22,.4)",
          }}>
            <ShieldCheck size={30} color="white"/>
          </div>
          <h1 style={{ color:"white", fontSize:30, fontWeight:800, margin:"0 0 6px", letterSpacing:"-0.5px" }}>
            INTERX
          </h1>
          <p style={{ color:"rgba(148,210,255,.7)", fontSize:14, margin:0 }}>영업자료 보안 포탈</p>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", color:"rgba(255,255,255,.55)", fontSize:13, fontWeight:600, marginBottom:8 }}>이메일</label>
          <input className="l-input" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="이메일 주소 입력"/>
        </div>

        <div>
          <label style={{ display:"block", color:"rgba(255,255,255,.55)", fontSize:13, fontWeight:600, marginBottom:8 }}>비밀번호</label>
          <input className="l-input" type="password" value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="비밀번호 입력"/>
        </div>

        {err && <p style={{ color:"#f87171", fontSize:13, margin:"10px 0 0" }}>⚠ {err}</p>}

        <button className="l-btn" onClick={handleLogin} disabled={loading} style={{
          background: loading ? "rgba(249,115,22,.45)" : "linear-gradient(135deg,#f97316,#ea580c)",
          boxShadow: loading ? "none" : "0 8px 24px rgba(249,115,22,.35)",
        }}>
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <p style={{ color:"rgba(255,255,255,.25)", fontSize:12, textAlign:"center", marginTop:20 }}>
          demo: admin@company.com / admin1234
        </p>
      </div>
    </div>
  );
}
