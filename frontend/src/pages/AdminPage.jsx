import { useState, useEffect } from "react";
import { UploadCloud, FolderOpen, Users, History, Plus, Video, FileText, X, Save } from "lucide-react";
import { useAssets } from "../hooks/useAssets";
import { getUsers } from "../api/users";
import { getLogs } from "../api/logs";
import { MOCK_MEMBERS, MOCK_LOGS, PUBLISH_STATUS_OPTIONS } from "../constants/mockData";
import { createAsset } from "../api/assets";

const TABS = [
  { id:"upload",   icon:UploadCloud, label:"자료 업로드" },
  { id:"contents", icon:FolderOpen,  label:"콘텐츠 관리" },
  { id:"members",  icon:Users,       label:"사용자 관리" },
  { id:"logs",     icon:History,     label:"열람 로그" },
];

// ─── Status label → style
function statusStyle(s) {
  if (s==="보안재생") return { bg:"#fee2e2", c:"#dc2626" };
  if (s==="열람제한") return { bg:"#fef3c7", c:"#d97706" };
  if (s==="검토중")   return { bg:"#eff6ff", c:"#2563eb" };
  return { bg:"#dcfce7", c:"#16a34a" };
}

// ─── Inline status cell with dropdown
function StatusCell({ asset, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(asset.publishStatus ?? "PUBLISHED");
  const sc = statusStyle(asset.status);

  async function save(newVal) {
    setVal(newVal);
    setEditing(false);
    // PUBLISH_STATUS_LABELS mapping
    const labelMap = { DRAFT:"보안재생", REVIEW:"검토중", PUBLISHED:"공유가능", ARCHIVED:"열람제한" };
    await onUpdate(asset.id, { publishStatus: newVal, status: labelMap[newVal] });
  }

  if (editing) {
    return (
      <select autoFocus value={val} onChange={e => save(e.target.value)} onBlur={() => setEditing(false)}
        style={{ fontSize:11, padding:"3px 8px", borderRadius:8, border:"1px solid #e5e7eb", outline:"none", cursor:"pointer", background:"white" }}>
        {PUBLISH_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }

  return (
    <span onClick={() => setEditing(true)}
      title="클릭하여 상태 변경"
      style={{ fontSize:11, background:sc.bg, color:sc.c, padding:"3px 10px", borderRadius:20, fontWeight:600, cursor:"pointer", userSelect:"none" }}>
      {asset.status} ✏
    </span>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("upload");
  const { assets, loading: assetsLoading, update: updateAsset, remove: removeAsset } = useAssets();
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [dragOver, setDragOver] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title:"", category:"영상", desc:"", tags:"", viewPermission:"all-users" });
  const [uploading, setUploading] = useState(false);

  // fetch members + logs from API (fallback to mock)
  useEffect(() => {
    getUsers().then(d => { if (d?.length) setMembers(d); }).catch(() => {});
    getLogs().then(d => { if (d?.length) setLogs(d); }).catch(() => {});
  }, []);

  async function handleUpload() {
    if (!uploadForm.title.trim()) return alert("제목을 입력해 주세요.");
    setUploading(true);
    try {
      await createAsset({
        type: uploadForm.category === "영상" ? "VIDEO" : "DOCUMENT",
        categoryId: null,
        title: uploadForm.title.trim(),
        description: uploadForm.desc,
        tags: uploadForm.tags.split(",").map(t=>t.trim()).filter(Boolean),
        viewScope: uploadForm.viewPermission === "admin-only" ? "ADMIN_ONLY" : "ALL_USERS",
        downloadAllowed: false,
        publishStatus: "DRAFT",
      });
    } catch {
      // 백엔드 미연결 시 local mock 추가
      const localNew = {
        id: Date.now(),
        type: uploadForm.category === "영상" ? "video" : "document",
        category: uploadForm.category,
        title: uploadForm.title.trim(),
        date: new Date().toISOString().split("T")[0],
        publishStatus: "DRAFT",
        status: "보안재생",
        desc: uploadForm.desc,
        tags: uploadForm.tags.split(",").map(t=>t.trim()).filter(Boolean),
        viewPermission: uploadForm.viewPermission,
        downloadAllowed: false,
      };
      // useAssets 내부 saveFallback 우회 방법: 직접 LS 업데이트
      try {
        const existing = JSON.parse(localStorage.getItem("interx_contents_v3") || "[]");
        localStorage.setItem("interx_contents_v3", JSON.stringify([...existing, localNew]));
      } catch {}
    } finally {
      setUploading(false);
      setUploadForm({ title:"", category:"영상", desc:"", tags:"", viewPermission:"all-users" });
      setTab("contents");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("이 콘텐츠를 삭제하시겠습니까?")) return;
    await removeAsset(id);
  }

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display:"flex", gap:5, marginBottom:22, background:"white", padding:5, borderRadius:15, border:"1px solid #f1f5f9", width:"fit-content" }}>
        {TABS.map(({ id, icon:Icon, label }) => (
          <button key={id} onClick={()=>setTab(id)} style={{
            display:"flex", alignItems:"center", gap:7, padding:"9px 18px",
            borderRadius:11, border:"none", cursor:"pointer",
            background:tab===id?"#f97316":"transparent", color:tab===id?"white":"#6b7280",
            fontSize:13, fontWeight:600, transition:"all .15s",
          }}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      {/* ────────────── 자료 업로드 ────────────── */}
      {tab==="upload" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:22 }}>
          <div style={{ background:"white", borderRadius:20, padding:"28px 30px", border:"1px solid #f1f5f9" }}>
            <h3 style={{ margin:"0 0 22px", fontSize:17, fontWeight:800, color:"#111827" }}>새 자료 업로드</h3>
            <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false)}}
              style={{ border:`2px dashed ${dragOver?"#f97316":"#e5e7eb"}`, borderRadius:14, padding:"36px 20px", textAlign:"center", marginBottom:22, background:dragOver?"#fff7ed":"#f9fafb", transition:"all .2s" }}>
              <UploadCloud size={38} color={dragOver?"#f97316":"#9ca3af"} style={{ margin:"0 auto 12px", display:"block" }}/>
              <p style={{ color:"#374151", fontWeight:700, margin:"0 0 4px", fontSize:14 }}>파일을 드래그하거나 클릭해서 업로드</p>
              <p style={{ color:"#9ca3af", fontSize:12, margin:0 }}>영상: 최대 2GB · 문서: 최대 100MB</p>
            </div>
            {[["title","제목","자료 제목을 입력하세요"],["desc","설명","자료 설명을 입력하세요"],["tags","태그 (쉼표 구분)","예: 브랜드, 공식"]].map(([k,label,ph]) => (
              <div key={k} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>{label}</label>
                <input value={uploadForm[k]} onChange={e=>setUploadForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                  style={{ width:"100%", boxSizing:"border-box", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:11, fontSize:13, outline:"none", color:"#374151" }}/>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>분류</label>
                <select value={uploadForm.category} onChange={e=>setUploadForm(f=>({...f,category:e.target.value}))}
                  style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:11, fontSize:13, outline:"none" }}>
                  {["영상","제안서","기타"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>열람 권한</label>
                <select value={uploadForm.viewPermission} onChange={e=>setUploadForm(f=>({...f,viewPermission:e.target.value}))}
                  style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:11, fontSize:13, outline:"none" }}>
                  <option value="all-users">전체 사용자</option>
                  <option value="admin-only">관리자만</option>
                </select>
              </div>
            </div>
            <button onClick={handleUpload} disabled={uploading} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#f97316,#ea580c)", border:"none", borderRadius:12, color:"white", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 6px 20px rgba(249,115,22,.3)", opacity:uploading?.6:1 }}>
              {uploading?"업로드 중...":"업로드 완료"}
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"white", borderRadius:20, padding:"22px", border:"1px solid #f1f5f9" }}>
              <h4 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:"#111827" }}>업로드 가이드</h4>
              {[["지원 형식","MP4, MOV, PDF, DOCX, PPTX"],["최대 용량","영상 2GB / 문서 100MB"],["보안 처리","업로드 시 자동 암호화"],["접근 권한","열람 권한 반드시 설정"]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f9fafb" }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff7ed", borderRadius:20, padding:"20px", border:"1px solid #fed7aa" }}>
              <p style={{ margin:0, fontSize:12, color:"#c2410c", fontWeight:600, lineHeight:1.7 }}>
                ⚠️ 업로드 전 반드시 파일의 보안 등급을 확인하세요. 대외비 자료는 열람 권한을 '관리자만'으로 설정해야 합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ────────────── 콘텐츠 관리 ────────────── */}
      {tab==="contents" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <p style={{ margin:0, color:"#6b7280", fontSize:13 }}>
              전체 <strong style={{ color:"#111827" }}>{assets.length}</strong>개 콘텐츠 ·
              <span style={{ color:"#9ca3af", fontSize:11, marginLeft:6 }}>상태 셀을 클릭하면 바로 수정할 수 있습니다</span>
            </p>
            <button onClick={()=>setTab("upload")} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 16px", background:"#f97316", border:"none", borderRadius:10, color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              <Plus size={13}/> 새 자료
            </button>
          </div>
          <div style={{ background:"white", borderRadius:18, border:"1px solid #f1f5f9", overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["제목","분류","날짜","상태 (클릭=수정)","열람","다운로드","삭제"].map(h => (
                    <th key={h} style={{ padding:"11px 14px", fontSize:11, fontWeight:700, color:"#6b7280", textAlign:"left", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assetsLoading ? (
                  <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>불러오는 중...</td></tr>
                ) : assets.map(c => (
                  <tr key={c.id} style={{ borderBottom:"1px solid #f9fafb" }}>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {c.type==="video" ? <Video size={13} color="#16a34a"/> : <FileText size={13} color="#2563eb"/>}
                        <span style={{ fontSize:12, fontWeight:600, color:"#111827", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" }}>{c.title}</span>
                      </div>
                    </td>
                    <td style={{ padding:"11px 14px" }}><span style={{ fontSize:10, background:"#f3f4f6", color:"#6b7280", padding:"2px 8px", borderRadius:20 }}>{c.category}</span></td>
                    <td style={{ padding:"11px 14px", fontSize:11, color:"#9ca3af" }}>{c.date}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <StatusCell asset={c} onUpdate={updateAsset}/>
                    </td>
                    <td style={{ padding:"11px 14px", fontSize:11, color:"#6b7280" }}>{c.viewPermission==="admin-only"?"관리자만":"전체"}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontSize:11, color:c.downloadAllowed?"#16a34a":"#dc2626", fontWeight:600 }}>{c.downloadAllowed?"허용":"불허"}</span>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <button onClick={()=>handleDelete(c.id)} style={{ background:"#fee2e2", border:"none", borderRadius:7, padding:"4px 10px", color:"#dc2626", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                        <X size={12} style={{ verticalAlign:"middle" }}/> 삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────── 사용자 관리 ────────────── */}
      {tab==="members" && (
        <div style={{ background:"white", borderRadius:18, border:"1px solid #f1f5f9", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["이름","부서","역할","이메일","최근 로그인","상태"].map(h => (
                  <th key={h} style={{ padding:"11px 14px", fontSize:11, fontWeight:700, color:"#6b7280", textAlign:"left", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ borderBottom:"1px solid #f9fafb" }}>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#f97316,#ea580c)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12, fontWeight:800, flexShrink:0 }}>{m.name[0]}</div>
                      <div>
                        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#111827" }}>{m.name}</p>
                        <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{m.position}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:13, color:"#374151" }}>{m.dept}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, background:m.role.includes("관리")?"#fff7ed":"#f3f4f6", color:m.role.includes("관리")?"#f97316":"#6b7280", padding:"3px 9px", borderRadius:20, fontWeight:600 }}>{m.role}</span>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#6b7280" }}>{m.email}</td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#9ca3af" }}>{m.lastLogin ?? m.lastLoginAt?.split("T")[0]}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, background:m.status==="활성"||m.status==="ACTIVE"?"#dcfce7":"#f3f4f6", color:m.status==="활성"||m.status==="ACTIVE"?"#16a34a":"#9ca3af", padding:"3px 9px", borderRadius:20, fontWeight:600 }}>
                      {m.status==="ACTIVE"?"활성":m.status==="INACTIVE"?"비활성":m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ────────────── 열람 로그 ────────────── */}
      {tab==="logs" && (
        <div style={{ background:"white", borderRadius:18, border:"1px solid #f1f5f9", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["시간","사용자","동작","자료","IP","결과"].map(h => (
                  <th key={h} style={{ padding:"11px 14px", fontSize:11, fontWeight:700, color:"#6b7280", textAlign:"left", borderBottom:"1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l,i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f9fafb" }}>
                  <td style={{ padding:"11px 14px", fontSize:11, color:"#9ca3af", fontFamily:"monospace" }}>{l.time ?? l.occurredAt}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, fontWeight:600, color:"#111827" }}>{l.user ?? l.userName}</td>
                  <td style={{ padding:"11px 14px", fontSize:13, color:"#374151" }}>{l.action}</td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:"#374151" }}>{l.asset ?? l.assetTitle}</td>
                  <td style={{ padding:"11px 14px", fontSize:11, color:"#9ca3af", fontFamily:"monospace" }}>{l.ip}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, background:l.status==="SUCCESS"||l.result==="SUCCESS"?"#dcfce7":"#fee2e2", color:l.status==="SUCCESS"||l.result==="SUCCESS"?"#16a34a":"#dc2626", padding:"3px 9px", borderRadius:20, fontWeight:700 }}>
                      {l.status ?? l.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
