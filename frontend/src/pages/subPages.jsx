import { useState, useEffect, useRef } from "react";
import { Plus, Bot, Send, BookOpen } from "lucide-react";
import { MOCK_NOTICES } from "../constants/mockData";
import { getLatestAnnouncements } from "../api/announcements";

// ─────────────────────────────────────────────────
// NoticesPage
// ─────────────────────────────────────────────────
export function NoticesPage() {
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getLatestAnnouncements()
      .then(data => { if (data?.length) setNotices(data); })
      .catch(() => {}); // fallback to mock
  }, []);

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h3 style={{ margin:"0 0 4px", fontSize:21, fontWeight:800, color:"#111827" }}>공지사항</h3>
        <p style={{ margin:0, color:"#6b7280", fontSize:13 }}>최신 보안 정책 및 시스템 공지를 확인하세요.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {notices.map(n => {
          const tc = { 보안:{ bg:"#fee2e2", c:"#dc2626" }, 정책:{ bg:"#fff7ed", c:"#f97316" }, 공지:{ bg:"#f0f9ff", c:"#0284c7" } }[n.type] ?? { bg:"#f3f4f6", c:"#6b7280" };
          const isOpen = selected === n.id;
          return (
            <div key={n.id} onClick={() => setSelected(isOpen ? null : n.id)}
              style={{ background:"white", borderRadius:18, padding:"20px 24px", border:`1px solid ${isOpen?"#e5e7eb":"#f1f5f9"}`, cursor:"pointer", transition:"border .15s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                {n.important && <div style={{ width:7, height:7, borderRadius:"50%", background:"#f97316", flexShrink:0 }}/>}
                <span style={{ fontSize:11, background:tc.bg, color:tc.c, padding:"3px 10px", borderRadius:20, fontWeight:700 }}>{n.type}</span>
                <span style={{ color:"#9ca3af", fontSize:12 }}>{n.date ?? n.createdAt?.split("T")[0]}</span>
                {n.important && <span style={{ marginLeft:"auto", fontSize:11, background:"#fff7ed", color:"#f97316", padding:"2px 9px", borderRadius:20, fontWeight:600 }}>중요</span>}
              </div>
              <h4 style={{ margin:"0 0 6px", fontSize:15, fontWeight:700, color:"#111827" }}>{n.title}</h4>
              {isOpen && <p style={{ margin:"10px 0 0", color:"#4b5563", fontSize:13, lineHeight:1.75, borderTop:"1px solid #f3f4f6", paddingTop:12 }}>{n.desc ?? n.body}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// AIChatPage
// ─────────────────────────────────────────────────
const AUTO_REPLIES = [
  ["보안", "2026년 보안 정책은 2월 20일 개정되었습니다. 모든 영상 콘텐츠는 HLS 암호화 스트리밍으로만 제공되며, 외부 공유 시 보안 감사가 필수입니다."],
  ["자료", "현재 시스템에 다수의 콘텐츠가 등록되어 있습니다. 대시보드에서 전체 목록을 확인하세요."],
  ["공지", "최신 공지사항으로 '2026 보안 정책 변경 안내'와 '외부 협력사 자료 공유 절차 개정'이 있습니다."],
  ["업로드", "자료 업로드는 관리자홈 > 자료 업로드 탭에서 가능합니다. 영상 최대 2GB, 문서 최대 100MB 지원합니다."],
];

export function AIChatPage() {
  const [msgs, setMsgs] = useState([{ role:"bot", text:"안녕하세요! INTERX AI 챗봇입니다. 영업 자료 검색, 문서 요약, 정책 문의 등 무엇이든 도와드리겠습니다 😊" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMsgs(m => [...m, { role:"user", text }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const found = AUTO_REPLIES.find(([k]) => text.includes(k));
    const reply = found ? found[1] : "죄송합니다, 해당 질문에 대한 정확한 정보를 찾지 못했습니다. 공지사항이나 Knowledge Base를 확인하거나 관리자에게 문의해 주세요.";
    setMsgs(m => [...m, { role:"bot", text:reply }]);
    setLoading(false);
  }

  const suggestions = ["최신 보안 정책 알려줘", "자료 목록 알려줘", "공지사항 요약해줘", "업로드 방법 알려줘"];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 148px)" }}>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)} style={{ background:"white", border:"1px solid #e5e7eb", borderRadius:20, padding:"5px 12px", fontSize:12, color:"#6b7280", cursor:"pointer" }}>{s}</button>
        ))}
      </div>
      <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column", gap:14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:9, alignItems:"flex-end" }}>
            {m.role==="bot" && (
              <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#ea580c)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Bot size={17} color="white"/>
              </div>
            )}
            <div style={{ maxWidth:"68%", padding:"12px 16px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background:m.role==="user"?"linear-gradient(135deg,#f97316,#ea580c)":"white", color:m.role==="user"?"white":"#111827", fontSize:14, lineHeight:1.7, border:m.role==="bot"?"1px solid #f1f5f9":undefined }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:9, alignItems:"flex-end" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#ea580c)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Bot size={17} color="white"/>
            </div>
            <div style={{ background:"white", borderRadius:"18px 18px 18px 4px", padding:"16px 20px", border:"1px solid #f1f5f9" }}>
              <div style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#d1d5db", animation:`typing .9s ease-in-out ${i*.2}s infinite` }}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <style>{`@keyframes typing{0%,80%,100%{transform:scale(0.6);opacity:.5}40%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ display:"flex", gap:10, paddingTop:14, borderTop:"1px solid #f3f4f6" }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="메시지를 입력하세요..."
          style={{ flex:1, padding:"12px 16px", border:"1px solid #e5e7eb", borderRadius:13, outline:"none", fontSize:14, color:"#374151" }}/>
        <button onClick={send} style={{ width:48, height:48, borderRadius:13, background:"linear-gradient(135deg,#f97316,#ea580c)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          <Send size={18} color="white"/>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// KnowledgePage
// ─────────────────────────────────────────────────
const KB_ITEMS = [
  { cat:"제품 정보",  title:"INTERX 제품 카탈로그 2026",     tags:["카탈로그","제품"], icon:"📦", updated:"2026-02-01" },
  { cat:"기술 문서",  title:"시스템 아키텍처 가이드",          tags:["기술","아키텍처"], icon:"🔧", updated:"2026-01-28" },
  { cat:"영업 지원",  title:"고객 제안서 템플릿 v3",           tags:["제안서","템플릿"], icon:"📋", updated:"2026-02-10" },
  { cat:"교육 자료",  title:"제품 교육 가이드 (영업용)",        tags:["교육","영업"],    icon:"📚", updated:"2026-01-15" },
  { cat:"FAQ",       title:"고객 자주 묻는 질문 모음",         tags:["FAQ","고객"],     icon:"❓", updated:"2026-02-05" },
  { cat:"계약/법무", title:"표준 계약서 양식 2026",            tags:["계약","법무"],    icon:"⚖️",  updated:"2026-01-20" },
];

export function KnowledgePage() {
  const [cat, setCat] = useState("전체");
  const cats = ["전체", ...new Set(KB_ITEMS.map(i => i.cat))];
  const filtered = cat === "전체" ? KB_ITEMS : KB_ITEMS.filter(i => i.cat === cat);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h3 style={{ margin:"0 0 4px", fontSize:21, fontWeight:800, color:"#111827" }}>Knowledge Base</h3>
        <p style={{ margin:0, color:"#6b7280", fontSize:13 }}>영업 및 기술 자료를 카테고리별로 검색하세요.</p>
      </div>
      <div style={{ display:"flex", gap:7, marginBottom:22, flexWrap:"wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={()=>setCat(c)} style={{ padding:"7px 16px", borderRadius:20, border:cat===c?"none":"1px solid #e5e7eb", background:cat===c?"#f97316":"white", color:cat===c?"white":"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer" }}>{c}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
        {filtered.map((item,idx) => (
          <div key={idx} style={{ background:"white", borderRadius:18, padding:"22px", border:"1px solid #f1f5f9", cursor:"pointer" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>{item.icon}</div>
            <span style={{ fontSize:11, background:"#f0f9ff", color:"#0284c7", padding:"3px 9px", borderRadius:20, fontWeight:600 }}>{item.cat}</span>
            <h4 style={{ margin:"10px 0 7px", fontSize:14, fontWeight:700, color:"#111827" }}>{item.title}</h4>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
              {item.tags.map(t => <span key={t} style={{ fontSize:11, background:"#f3f4f6", color:"#6b7280", padding:"2px 7px", borderRadius:20 }}>{t}</span>)}
            </div>
            <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>업데이트: {item.updated}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// QnAPage
// ─────────────────────────────────────────────────
const INIT_QNAS = [
  { id:1, q:"외부 협력사에게 자료를 공유하려면 어떻게 해야 하나요?", a:"담당 관리자에게 사전 승인을 받은 후, 보안 채널을 통해서만 공유 가능합니다. 관리자홈 > 공유 요청에서 신청하세요.", date:"2026-02-18", answered:true },
  { id:2, q:"보안재생 영상은 어떤 환경에서만 재생 가능한가요?", a:"HLS 암호화 스트리밍을 지원하는 Chrome, Edge 최신 버전에서만 재생됩니다. 외부 플레이어 사용은 불가합니다.", date:"2026-02-15", answered:true },
  { id:3, q:"콘텐츠 업로드 시 파일 크기 제한이 있나요?", a:"영상 파일은 최대 2GB, 문서 파일은 최대 100MB까지 업로드 가능합니다.", date:"2026-02-12", answered:true },
  { id:4, q:"관리자 권한을 신청하려면 어떻게 해야 하나요?", a:null, date:"2026-02-22", answered:false },
];

export function QnAPage() {
  const [qnas, setQnas] = useState(INIT_QNAS);
  const [open, setOpen] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newQ, setNewQ] = useState("");

  function submit() {
    if (!newQ.trim()) return;
    setQnas(q => [...q, { id:Date.now(), q:newQ.trim(), a:null, date:new Date().toISOString().split("T")[0], answered:false }]);
    setNewQ(""); setShowForm(false);
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h3 style={{ margin:"0 0 4px", fontSize:21, fontWeight:800, color:"#111827" }}>QnA</h3>
          <p style={{ margin:0, color:"#6b7280", fontSize:13 }}>자주 묻는 질문과 답변을 확인하세요.</p>
        </div>
        <button onClick={()=>setShowForm(s=>!s)} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", background:"#f97316", border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>
          <Plus size={14}/> 질문하기
        </button>
      </div>
      {showForm && (
        <div style={{ background:"white", borderRadius:18, padding:"22px", marginBottom:18, border:"1px solid #f1f5f9" }}>
          <h4 style={{ margin:"0 0 12px", fontSize:14, fontWeight:700 }}>새 질문 작성</h4>
          <textarea value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="질문 내용을 입력하세요..." rows={3}
            style={{ width:"100%", boxSizing:"border-box", padding:"11px 13px", border:"1px solid #e5e7eb", borderRadius:11, fontSize:13, outline:"none", resize:"vertical", marginBottom:10 }}/>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={submit} style={{ padding:"8px 18px", background:"#f97316", border:"none", borderRadius:10, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>등록</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"8px 18px", background:"#f3f4f6", border:"none", borderRadius:10, color:"#6b7280", fontSize:13, cursor:"pointer" }}>취소</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {qnas.map(q => (
          <div key={q.id} onClick={()=>setOpen(open===q.id?null:q.id)} style={{ background:"white", borderRadius:18, padding:"20px 24px", border:"1px solid #f1f5f9", cursor:"pointer" }}>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:13, fontWeight:800, color:"#2563eb" }}>Q</span>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ margin:"2px 0 6px", fontSize:14, fontWeight:700, color:"#111827" }}>{q.q}</p>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#9ca3af" }}>{q.date}</span>
                  <span style={{ fontSize:11, background:q.answered?"#dcfce7":"#fff7ed", color:q.answered?"#16a34a":"#f97316", padding:"2px 9px", borderRadius:20, fontWeight:600 }}>
                    {q.answered?"답변완료":"답변대기"}
                  </span>
                </div>
              </div>
            </div>
            {open===q.id && q.a && (
              <div style={{ display:"flex", gap:10, marginTop:14, paddingTop:14, borderTop:"1px solid #f3f4f6" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:800, color:"#16a34a" }}>A</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:"#374151", lineHeight:1.75 }}>{q.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
