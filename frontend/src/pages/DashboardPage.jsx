import { useMemo, useState } from "react";
import { Search, Video, FileText, LayoutDashboard } from "lucide-react";
import { useAssets } from "../hooks/useAssets";

function statusStyle(s) {
  if (s === "보안재생") return { bg:"#fee2e2", c:"#dc2626" };
  if (s === "열람제한") return { bg:"#fef3c7", c:"#d97706" };
  return { bg:"#dcfce7", c:"#16a34a" };
}

export default function DashboardPage() {
  const { assets, loading } = useAssets();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return assets.filter(c => {
      const matchType = filter === "all" || c.type === filter;
      const matchSearch = !q || c.title.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [assets, filter, search]);

  const stats = [
    { label:"전체 콘텐츠",   value:assets.length,                                     color:"#3b82f6", bg:"#eff6ff" },
    { label:"영상",          value:assets.filter(c=>c.type==="video").length,          color:"#8b5cf6", bg:"#f5f3ff" },
    { label:"문서 / 제안서", value:assets.filter(c=>c.type==="document").length,       color:"#f59e0b", bg:"#fffbeb" },
    { label:"공유 가능",     value:assets.filter(c=>c.downloadAllowed).length,         color:"#10b981", bg:"#ecfdf5" },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:26 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:"white", borderRadius:18, padding:"18px 20px", border:"1px solid #f1f5f9" }}>
            <p style={{ margin:"0 0 8px", fontSize:12, color:"#6b7280" }}>{s.label}</p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:32, fontWeight:800, color:s.color }}>{loading ? "—" : s.value}</span>
              <div style={{ width:34, height:34, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <LayoutDashboard size={15} color={s.color}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter / Search bar */}
      <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", background:"white", border:"1px solid #e5e7eb", borderRadius:12, padding:"9px 14px", gap:8 }}>
          <Search size={14} color="#9ca3af"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="콘텐츠 검색..."
            style={{ border:"none", outline:"none", flex:1, fontSize:13, color:"#374151", background:"transparent" }}/>
        </div>
        {[["all","전체"],["video","영상"],["document","문서"]].map(([f,l]) => (
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"9px 18px", borderRadius:11, border:filter===f?"none":"1px solid #e5e7eb",
            cursor:"pointer", fontSize:13, fontWeight:600,
            background:filter===f?"#f97316":"white", color:filter===f?"white":"#6b7280",
          }}>{l}</button>
        ))}
      </div>

      {/* Content grid */}
      {loading ? (
        <div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>불러오는 중...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {filtered.map(c => {
            const sc = statusStyle(c.status);
            return (
              <div key={c.id} style={{ background:"white", borderRadius:17, padding:"16px 18px", border:"1px solid #f1f5f9" }}>
                <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:11, flexShrink:0, background:c.type==="video"?"#f0fdf4":"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {c.type==="video"
                      ? <Video size={18} color="#16a34a"/>
                      : <FileText size={18} color="#2563eb"/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</p>
                    <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{c.date}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, background:sc.bg, color:sc.c, padding:"2px 8px", borderRadius:20, fontWeight:600 }}>{c.status}</span>
                  {c.tags.map(t => (
                    <span key={t} style={{ fontSize:11, background:"#f3f4f6", color:"#6b7280", padding:"2px 8px", borderRadius:20 }}>{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
