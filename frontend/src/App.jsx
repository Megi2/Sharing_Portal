import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Upload,
  Users,
  History,
  Lock,
  Search,
  Bell,
  ShieldAlert,
  ChevronRight,
  Video,
  FileText,
  Eye,
  ArrowLeft,
  X,
  UserPlus,
  Download,
  Edit3,
  ShieldOff,
  CheckCircle,
  Layers,
  Image as ImageIcon,
  Settings,
  UploadCloud,
  Trash2,
  Save,
  FolderOpen,
  Loader2,
} from "lucide-react";

// ★ API + Store imports
import { getAssets, deleteAsset, updateAsset, createAsset } from "@/api/assets";
import { getUsers, updateUser } from "@/api/users";
import { getLogs, getExportUrl } from "@/api/logs";
import { getLatestAnnouncement } from "@/api/announcements";
import { login as apiLogin, getMe, logout as apiLogout } from "@/api/auth";
import useAuthStore from "@/stores/authStore";

/**
 * InterX Content Secure System
 * React + Tailwind + lucide-react
 *
 * ✅ 백엔드 API 연결 버전
 *    - hardcoded 데이터 → useEffect + API 호출
 *    - localStorage 저장 → 제거 (백엔드 DB가 담당)
 *    - 저장/수정/삭제 → async API 호출 후 로컬 상태 반영
 */

const Badge = ({ children, variant = "blue" }) => {
  const map = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[variant] ?? map.blue}`}>
      {children}
    </span>
  );
};

const NavButton = ({ active, icon: Icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
      "hover:bg-slate-800 text-slate-400",
      active ? "bg-orange-600 text-white hover:bg-orange-600" : "",
    ].join(" ")}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{children}</span>
  </button>
);

const FilterButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "px-5 py-2 rounded-lg text-sm font-bold transition-all",
      active ? "bg-white text-orange-600 shadow-sm" : "text-slate-600 hover:text-slate-900",
    ].join(" ")}
  >
    {children}
  </button>
);

function statusColor(status) {
  if (status === "보안재생") return "bg-red-500";
  if (status === "열람제한") return "bg-amber-500";
  return "bg-green-500";
}

function roleBadgeClass(role) {
  return role.includes("관리") ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-600";
}

function memberStatusBadgeClass(status) {
  return status === "활성"
    ? "text-green-500 border-green-200 bg-green-50"
    : "text-slate-400 border-slate-200 bg-slate-50";
}

function logStatusClass(status) {
  return status === "SUCCESS" ? "text-green-500 border-green-100" : "text-red-500 border-red-100";
}

// ── 백엔드 응답 → 프론트 형태 변환 헬퍼 ──
function mapAssetFromApi(item) {
  return {
    id: item.id,
    type: item.type === "VIDEO" ? "video" : "document",
    category: item.category || "기타",
    title: item.title,
    date: item.updatedAt?.split("T")[0] || "",
    status:
      item.viewScope === "ADMIN_ONLY"
        ? "열람제한"
        : item.downloadAllowed
        ? "공유가능"
        : "보안재생",
    desc: item.description || "",
    tags: item.tags || [],
    viewPermission: item.viewScope === "ADMIN_ONLY" ? "admin-only" : "all-users",
    downloadAllowed: item.downloadAllowed ?? false,
  };
}

function mapMemberFromApi(u) {
  return {
    id: u.id,
    name: u.name,
    position: u.position || "",
    dept: u.dept || "",
    role: u.roles?.includes("SUPER_ADMIN")
      ? "최고 관리자"
      : u.roles?.includes("ADMIN")
      ? "관리인 (Admin)"
      : "사용자 (User)",
    email: u.email,
    lastLogin: u.lastLoginAt || "없음",
    status: u.status === "ACTIVE" ? "활성" : "비활성",
  };
}

function mapLogFromApi(log) {
  return {
    time: log.occurredAt,
    user: log.userName || "Unknown",
    action: log.action,
    asset: log.assetTitle || "",
    ip: log.ip || "",
    status: log.result,
  };
}

export default function App() {
  // ── Auth Store ──
  const { user, isLoggedIn, setUser, logout } = useAuthStore();

  // ── Notices (공지사항 — 아직 백엔드 공지 목록 API 없으므로 fallback 유지) ──
  const noticesData = [
    {
      id: 1,
      type: "보안",
      title: "2026 보안 정책 변경 안내",
      date: "2026-02-20",
      desc: "모든 영상 콘텐츠는 이제 HLS 암호화 스트리밍 방식으로만 제공됩니다. 외부 공유 시 반드시 보안 감사를 거쳐야 합니다.",
      important: true,
    },
    {
      id: 2,
      type: "정책",
      title: "외부 협력사 자료 공유 절차 개정",
      date: "2026-02-18",
      desc: "협력사에 자료를 전달할 경우, 담당 관리자의 사전 승인 후 보안 채널을 통해서만 공유 가능합니다.",
      important: true,
    },
    {
      id: 3,
      type: "공지",
      title: "사내 보안 교육 이수 안내 (필수)",
      date: "2026-02-15",
      desc: "전 임직원 대상 2026년 상반기 보안 교육 이수 기한은 2월 28일까지입니다. 미이수 시 시스템 접근이 제한될 수 있습니다.",
      important: false,
    },
    {
      id: 4,
      type: "공지",
      title: "InterX 시스템 점검 일정",
      date: "2026-02-12",
      desc: "2026년 2월 25일 02:00~06:00 (새벽) 정기 서버 점검이 진행됩니다. 해당 시간 동안 서비스 접근이 불가합니다.",
      important: false,
    },
    {
      id: 5,
      type: "정책",
      title: "개인정보 처리방침 개정 공지",
      date: "2026-02-08",
      desc: "2026년 3월 1일부로 개인정보 처리방침이 개정됩니다. 변경된 내용을 반드시 확인하시기 바랍니다.",
      important: false,
    },
  ];

  // ══════════════════════════════════════════
  // ★ API에서 데이터 로드 (하드코딩 제거)
  // ══════════════════════════════════════════
  const [contents, setContents] = useState([]);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── 앱 시작 시: 로그인 상태 확인 + 데이터 로드 ──
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        // 토큰 만료 등
        setLoading(false);
        return;
      }

      // 자산 + 사용자 로드
      try {
        const [assetsRes, usersRes] = await Promise.all([
          getAssets().catch(() => ({ results: [] })),
          getUsers().catch(() => ({ results: [] })),
        ]);
        setContents((assetsRes.results || []).map(mapAssetFromApi));
        setMembers((usersRes.results || []).map(mapMemberFromApi));
      } catch (err) {
        console.error("초기 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ── 로그 탭 열 때만 로그 로드 ──
  const [menu, setMenu] = useState("dashboard");
  useEffect(() => {
    if (menu !== "logs") return;
    async function fetchLogs() {
      try {
        const data = await getLogs();
        setLogs((data.results || []).map(mapLogFromApi));
      } catch (err) {
        console.error("로그 로드 실패:", err);
      }
    }
    fetchLogs();
  }, [menu]);

  // ── UI state ──
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [memberDeptFilter, setMemberDeptFilter] = useState("all");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // ── Edit member modal state ──
  const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: "", status: "" });

  // ── Edit content modal state ──
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [editContentFormData, setEditContentFormData] = useState({
    title: "",
    category: "",
    desc: "",
    tags: "",
    viewPermission: "all-users",
    downloadAllowed: false,
  });

  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const sectionsRef = useRef([]);

  const currentUserName = user ? `${user.name} ${user.position || ""}`.trim() : "사용자";
  const watermarkText = `${currentUserName} (192.168.0.15)`;
  const watermarkSpans = useMemo(() => Array.from({ length: 40 }, (_, i) => `${watermarkText}-${i}`), [watermarkText]);

  // ── Derived list (filter + search) ──
  const filteredContents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contents.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      const matchesSearch =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [contents, filter, search]);

  // ── Derived members list (dept/role filter) ──
  const filteredMembers = useMemo(
    () =>
      members.filter((m) => {
        const deptOk = memberDeptFilter === "all" || m.dept === memberDeptFilter;
        const roleOk = memberRoleFilter === "all" || m.role === memberRoleFilter;
        return deptOk && roleOk;
      }),
    [members, memberDeptFilter, memberRoleFilter]
  );

  // ── Modal open/close ──
  function openModal(item) {
    setSelected(item);
    setModalOpen(true);
  }

  function closeModal() {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }
    setModalOpen(false);
    setSelected(null);
  }

  // ── Edit member functions ──
  function openEditMemberModal(member) {
    setEditingMember(member);
    setEditFormData({ role: member.role, status: member.status });
    setEditMemberModalOpen(true);
  }

  function closeEditMemberModal() {
    setEditMemberModalOpen(false);
    setEditingMember(null);
    setEditFormData({ role: "", status: "" });
  }

  // ★ API 호출로 변경
  async function saveMemberEdit() {
    if (!editingMember) return;
    const roleMap = {
      "최고 관리자": ["SUPER_ADMIN"],
      "관리인 (Admin)": ["ADMIN"],
      "사용자 (User)": ["USER"],
    };
    try {
      await updateUser(editingMember.id, {
        status: editFormData.status === "활성" ? "ACTIVE" : "INACTIVE",
        roleCodes: roleMap[editFormData.role] || ["USER"],
      });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? { ...m, role: editFormData.role, status: editFormData.status }
            : m
        )
      );
      closeEditMemberModal();
    } catch (err) {
      alert("수정 실패: " + (err.response?.data?.message || err.message));
    }
  }

  // ── Edit content functions ──
  function openEditContentModal(content) {
    setEditingContent(content);
    setEditContentFormData({
      title: content.title,
      category: content.category,
      desc: content.desc,
      tags: content.tags.join(", "),
      viewPermission: content.viewPermission || "all-users",
      downloadAllowed: content.downloadAllowed || false,
    });
    setEditContentModalOpen(true);
  }

  function closeEditContentModal() {
    setEditContentModalOpen(false);
    setEditingContent(null);
    setEditContentFormData({
      title: "",
      category: "",
      desc: "",
      tags: "",
      viewPermission: "all-users",
      downloadAllowed: false,
    });
  }

  // ★ API 호출로 변경
  async function saveContentEdit() {
    if (!editingContent) return;
    try {
      await updateAsset(editingContent.id, {
        title: editContentFormData.title,
        description: editContentFormData.desc,
        viewScope: editContentFormData.viewPermission === "admin-only" ? "ADMIN_ONLY" : "ALL_USERS",
        downloadAllowed: editContentFormData.downloadAllowed,
      });
      setContents((prev) =>
        prev.map((c) =>
          c.id === editingContent.id
            ? {
                ...c,
                title: editContentFormData.title,
                category: editContentFormData.category,
                desc: editContentFormData.desc,
                tags: editContentFormData.tags.split(",").map((t) => t.trim()).filter(Boolean),
                viewPermission: editContentFormData.viewPermission,
                downloadAllowed: editContentFormData.downloadAllowed,
              }
            : c
        )
      );
      closeEditContentModal();
    } catch (err) {
      alert("수정 실패: " + (err.response?.data?.message || err.message));
    }
  }

  // ★ API 호출로 변경
  async function deleteContent(contentId) {
    if (!window.confirm("정말 이 콘텐츠를 삭제하시겠습니까?")) return;
    try {
      await deleteAsset(contentId);
      setContents((prev) => prev.filter((c) => c.id !== contentId));
    } catch (err) {
      alert("삭제 실패: " + (err.response?.data?.message || err.message));
    }
  }

  // ESC close
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        if (editContentModalOpen) {
          closeEditContentModal();
        } else if (editMemberModalOpen) {
          closeEditMemberModal();
        } else {
          closeModal();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editContentModalOpen, editMemberModalOpen]);

  // 모달 열릴 때 body scroll lock
  useEffect(() => {
    document.body.style.overflow = modalOpen || editMemberModalOpen || editContentModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen, editMemberModalOpen, editContentModalOpen]);

  // IntersectionObserver: 모달 안 detail-section 애니메이션
  useEffect(() => {
    if (!modalOpen) return;

    const rootEl = modalRef.current;
    if (!rootEl) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("opacity-100", "translate-y-0");
        });
      },
      { root: rootEl, threshold: 0.1 }
    );

    sectionsRef.current.forEach((el) => el && obs.observe(el));

    return () => obs.disconnect();
  }, [modalOpen]);

  // right-click disable
  function preventContextMenu(e) {
    e.preventDefault();
  }

  // ══════════════════════════════════════════
  // ★ 로그인 폼 (아직 로그인 안 된 경우)
  // ══════════════════════════════════════════
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const result = await apiLogin(loginEmail, loginPassword);
      setUser(result.user);

      // 로그인 성공 후 데이터 로드
      const [assetsRes, usersRes] = await Promise.all([
        getAssets().catch(() => ({ results: [] })),
        getUsers().catch(() => ({ results: [] })),
      ]);
      setContents((assetsRes.results || []).map(mapAssetFromApi));
      setMembers((usersRes.results || []).map(mapMemberFromApi));
    } catch (err) {
      setLoginError(err.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setLoginLoading(false);
    }
  }

  // ── 초기 로딩 ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // ── 로그인 화면 ──
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-600 p-2.5 rounded-xl">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">InterX</span>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">로그인</h2>
          <p className="text-sm text-slate-500 mb-8">영업자료 포탈에 접속합니다.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">이메일</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                placeholder="admin@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 disabled:opacity-50"
            >
              {loginLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-6 text-center">
            초기 계정: admin@company.com / admin1234
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // 메인 UI (기존 코드 그대로 — user 정보만 동적으로)
  // ══════════════════════════════════════════
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen" onContextMenu={preventContextMenu}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-30 shadow-2xl hidden lg:block">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">InterX</span>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <NavButton active={menu === "dashboard"} icon={LayoutDashboard} onClick={() => setMenu("dashboard")}>
            대시보드
          </NavButton>
          <NavButton active={menu === "upload"} icon={Upload} onClick={() => setMenu("upload")}>
            자료 업로드
          </NavButton>

          <div className="pt-6 pb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2 tracking-widest">보안 및 감사</p>

            <NavButton active={menu === "members"} icon={Users} onClick={() => setMenu("members")}>
              사용자 권한 관리
            </NavButton>
            <NavButton active={menu === "logs"} icon={History} onClick={() => setMenu("logs")}>
              열람 로그 관리
            </NavButton>
            <NavButton active={menu === "content-management"} icon={FolderOpen} onClick={() => setMenu("content-management")}>
              콘텐츠 관리
            </NavButton>
          </div>
        </nav>

        {/* ★ 하드코딩 → user store에서 가져옴 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white">
              {user?.name?.[0] || "?"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold truncate">{currentUserName}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.roles?.includes("SUPER_ADMIN") ? "최고 관리자" : user?.roles?.includes("ADMIN") ? "관리자" : "사용자"}
              </p>
            </div>
            <button
              onClick={() => { apiLogout(); logout(); }}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="로그아웃"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-slate-200 z-20 flex items-center justify-between px-8">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="콘텐츠 제목 또는 태그 검색..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative text-slate-600 cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">
              1
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold">IP: 192.168.0.15</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ml-0 lg:ml-64 pt-16 min-h-screen p-8">
        {/* Dashboard */}
        {menu === "dashboard" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
              <div className="xl:col-span-12">
              </div>

              {/* Upper Left: Notice Area */}
              <div className="xl:col-span-5">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm h-full min-h-[320px] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-black text-slate-800">공지사항</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {noticesData.length} 건
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {noticesData.map((notice) => {
                      const typeColor = {
                        보안: "bg-red-50 text-red-600",
                        정책: "bg-orange-50 text-orange-600",
                        공지: "bg-slate-100 text-slate-500",
                      }[notice.type] ?? "bg-slate-100 text-slate-500";
                      return (
                        <div
                          key={notice.id}
                          className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            {notice.important && (
                              <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                            )}
                            {!notice.important && (
                              <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-2" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${typeColor}`}>
                                  {notice.type}
                                </span>
                                <span className="text-[11px] text-slate-400">{notice.date}</span>
                              </div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                                {notice.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {notice.desc}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upper Right: Documents & Materials */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">제안서 및 자료</h3>
                    <p className="text-xs text-slate-500">주요 문서 및 전략 기획안 자산</p>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase">
                    Docs: {contents.filter(c => c.type === "document").length}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contents.filter(item => {
                    const q = search.trim().toLowerCase();
                    const matchesSearch = q.length === 0 || item.title.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
                    return item.type === "document" && matchesSearch;
                  }).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openModal(item)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          <FileText className="w-6 h-6 text-orange-600 group-hover:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-orange-600 uppercase mb-1">{item.category}</p>
                          <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-orange-600 transition-colors">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{item.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Video Library */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">영상 라이브러리</h3>
                  <p className="text-sm text-slate-500 mt-1">HLS 암호화가 적용된 고화질 영상 자산</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                  <div className="px-4 py-2 text-xs font-black text-orange-600 bg-white rounded-lg shadow-sm">
                    전체 영상
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {contents.filter(item => {
                  const q = search.trim().toLowerCase();
                  const matchesSearch = q.length === 0 || item.title.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
                  return item.type === "video" && matchesSearch;
                }).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openModal(item)}
                    className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group hover:border-orange-400 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                    <div className="aspect-video bg-slate-50 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-4 right-4 z-10">
                        <span className={`${statusColor(item.status)} text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg`}>
                          {item.status}
                        </span>
                      </div>

                      <Video className="w-12 h-12 text-slate-300 group-hover:scale-110 group-hover:text-orange-200 transition-all duration-700" />

                      <div className="absolute inset-0 bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-white text-orange-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                          <Eye className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="p-7">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2 truncate group-hover:text-orange-600 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{item.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-slate-400 font-medium">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members */}
        {menu === "members" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">사용자 권한 관리</h2>
                <p className="text-sm text-slate-500 mt-1">시스템 접근 권한을 가진 인원을 관리하고 역할을 부여합니다.</p>
              </div>
              <button className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95">
                <UserPlus className="w-4 h-4" /> 사용자 초대
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">전체 사용자</p>
                <h4 className="text-3xl font-black text-slate-900">
                  {members.length} <span className="text-sm font-medium text-slate-400 ml-1 uppercase">명</span>
                </h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">관리자 그룹</p>
                <h4 className="text-3xl font-black text-slate-900">
                  {members.filter(m => m.role.includes("관리")).length} <span className="text-sm font-medium text-slate-400 ml-1 uppercase">명</span>
                </h4>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">활성 사용자</p>
                <h4 className="text-3xl font-black text-green-500">
                  {members.filter(m => m.status === "활성").length} <span className="text-sm font-medium text-slate-400 ml-1 uppercase">명</span>
                </h4>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <select
                    value={memberDeptFilter}
                    onChange={(e) => setMemberDeptFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">전체 부서</option>
                    {[...new Set(members.map(m => m.dept))].filter(Boolean).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={memberRoleFilter}
                    onChange={(e) => setMemberRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">전체 권한</option>
                    <option value="최고 관리자">최고 관리자</option>
                    <option value="관리인 (Admin)">관리인 (Admin)</option>
                    <option value="사용자 (User)">사용자 (User)</option>
                  </select>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">사용자명 / 부서</th>
                    <th className="px-6 py-5">역할 및 권한</th>
                    <th className="px-6 py-5">이메일</th>
                    <th className="px-6 py-5">최근 접속일</th>
                    <th className="px-6 py-5 text-center">계정 상태</th>
                    <th className="px-8 py-5 text-right">관리</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                            {m.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {m.name} {m.position}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.dept}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tight ${roleBadgeClass(m.role)}`}>
                          {m.role}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-xs text-slate-500">{m.email}</td>
                      <td className="px-6 py-5 text-xs text-slate-400">{m.lastLogin}</td>

                      <td className="px-6 py-5 text-center">
                        <span className={`text-[10px] font-black border px-2 py-0.5 rounded-full ${memberStatusBadgeClass(m.status)}`}>
                          {m.status}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => openEditMemberModal(m)}
                          className="text-slate-400 hover:text-orange-600 p-1 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-slate-400 hover:text-red-500 p-1" title="Disable">
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload */}
        {menu === "upload" && (
          <div className="max-w-4xl mx-auto py-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">신규 자료 업로드</h2>
              <p className="text-slate-500 mt-1 text-sm">
                관리자 계정으로 신규 콘텐츠를 등록합니다. 모든 업로드 행위는 감사 로그에 남습니다.
              </p>
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
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="자료 명칭을 입력하세요"
                  />
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
                <button className="px-10 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700">
                  업로드 시작
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {menu === "logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">열람 로그 및 보안 감사</h2>
                <p className="text-sm text-slate-500 mt-1">실시간 콘텐츠 접근 이력 및 비인가 시도를 감시합니다.</p>
              </div>

              {/* ★ CSV 내보내기 연결 */}
              <a
                href={getExportUrl()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50"
              >
                <Download className="w-4 h-4" /> 리포트 다운로드
              </a>
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
                          <div className="w-7 h-7 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {log.user[0]}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500 truncate max-w-[150px]">{log.asset}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ip}</td>
                      <td className="px-8 py-4 text-right">
                        <span className={`text-[9px] font-black border px-1.5 py-0.5 rounded ${logStatusClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-6 bg-slate-50/50 flex justify-center">
                <nav className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600">
                    3
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Content Management */}
        {menu === "content-management" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">콘텐츠 관리</h2>
                <p className="text-sm text-slate-500 mt-1">콘텐츠 정보 수정, 삭제 및 권한 설정을 관리합니다.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500">
                    <option>전체 타입</option>
                    <option>영상</option>
                    <option>제안서</option>
                    <option>기타</option>
                  </select>
                  <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500">
                    <option>전체 권한</option>
                    <option>관리자만</option>
                    <option>모든 사용자</option>
                  </select>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5">콘텐츠 제목</th>
                    <th className="px-6 py-5">분류</th>
                    <th className="px-6 py-5">등록일</th>
                    <th className="px-6 py-5">열람 권한</th>
                    <th className="px-6 py-5">다운로드</th>
                    <th className="px-8 py-5 text-right">관리</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {content.type === "video" ? (
                            <Video className="w-5 h-5 text-slate-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-400" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900">{content.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 max-w-[300px]">
                              {content.desc}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded tracking-tight">
                          {content.category}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-xs text-slate-500">{content.date}</td>

                      <td className="px-6 py-5">
                        <span
                          className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tight ${content.viewPermission === "admin-only"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                            }`}
                        >
                          {content.viewPermission === "admin-only" ? "관리자만" : "모든 사용자"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tight ${content.downloadAllowed
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-50 text-slate-500"
                            }`}
                        >
                          {content.downloadAllowed ? "가능" : "불가능"}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditContentModal(content)}
                            className="text-slate-400 hover:text-orange-600 p-1 transition-colors"
                            title="수정"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteContent(content.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && selected && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-white z-[100] overflow-y-auto"
          onScroll={() => {}}
        >
          {/* Sticky Header in Modal */}
          <div className="sticky top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between z-[110]">
            <div className="flex items-center gap-4">
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <h3 className="font-bold text-slate-800">{selected.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Active Security</span>
                <span className="text-[11px] text-slate-400">User: {currentUserName} (192.168.0.15)</span>
              </div>

              {selected.downloadAllowed && (
                <button
                  onClick={() => alert("자료 호스트로부터 다운로드를 시작합니다...")}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
              )}

              <button className="bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95">
                자산 공유 요청
              </button>

              <button onClick={closeModal} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto pb-32">
            {/* 1. Hero / Player */}
            <section
              ref={(el) => (sectionsRef.current[0] = el)}
              className="mt-8 px-6 opacity-0 translate-y-5 transition-all duration-700"
            >
              <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative aspect-video flex items-center justify-center group">
                {/* Watermark overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-wrap justify-around items-center opacity-[0.05] z-50">
                  {watermarkSpans.map((k) => (
                    <span
                      key={k}
                      className="font-bold text-[14px] whitespace-nowrap"
                      style={{ transform: "rotate(-30deg)" }}
                    >
                      {watermarkText}
                    </span>
                  ))}
                </div>

                {selected.type === "video" ? (
                  <div className="w-full h-full flex flex-col">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      controlsList="nodownload"
                      onContextMenu={preventContextMenu}
                    >
                      <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center p-4">
                    <div className="w-full h-full bg-white rounded-xl shadow-inner relative overflow-hidden">
                      <iframe
                        src="https://res.cloudinary.com/demo/image/upload/multi_page_pdf.pdf#toolbar=0&navpanes=0"
                        className="w-full h-full border-none"
                        title="Document Preview"
                      />
                      <div className="absolute top-0 right-0 p-4 pointer-events-none">
                        <div className="bg-slate-900/10 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded border border-white/20 uppercase">
                          Protected View
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Content Info Header */}
            <section
              ref={(el) => (sectionsRef.current[1] = el)}
              className="mt-12 px-8 opacity-0 translate-y-5 transition-all duration-700"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      {selected.category}
                    </span>
                    <span className="text-[10px] font-black text-white bg-red-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {selected.status}
                    </span>
                  </div>

                  <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">{selected.title}</h1>
                  <p className="text-lg text-slate-500 leading-relaxed">{selected.desc}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[240px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">자산 메타데이터</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">등록일</span>
                      <span className="font-bold text-slate-700">{selected.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">등록자</span>
                      <span className="font-bold text-slate-700">{currentUserName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">파일 크기</span>
                      <span className="font-bold text-slate-700">425.2 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Scrollable Detail Sections */}
            <section
              ref={(el) => (sectionsRef.current[2] = el)}
              className="mt-20 px-8 grid grid-cols-1 md:grid-cols-2 gap-16 opacity-0 translate-y-5 transition-all duration-700"
            >
              <div>
                <h4 className="text-2xl font-bold text-slate-800 mb-6">주요 특징 및 활용 가이드</h4>
                <p className="text-slate-600 leading-relaxed mb-8">
                  본 콘텐츠는 브랜드 아이덴티티 강화를 목표로 제작되었습니다. 내부 보고서 및 공식 프레젠테이션 자산으로
                  활용 가능하며, 모든 편집본은 사전에 홍보팀의 검수를 거쳐야 합니다.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h6 className="font-bold text-slate-800">표준 컬러 가이드 준수</h6>
                      <p className="text-xs text-slate-500 mt-1">InterX 2026 브랜드 컬러 팔레트를 엄격히 준수하여 제작되었습니다.</p>
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h6 className="font-bold text-slate-800">다양한 해상도 최적화</h6>
                      <p className="text-xs text-slate-500 mt-1">4K, FHD, Mobile 등 모든 디바이스에서 최적의 가독성을 제공합니다.</p>
                    </div>
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
                  <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Security Policy Section */}
            <section
              ref={(el) => (sectionsRef.current[3] = el)}
              className="mt-24 px-8 opacity-0 translate-y-5 transition-all duration-700"
            >
              <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <h4 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-orange-500" /> 보안 및 준수 사항
                  </h4>

                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" />
                      <p className="text-slate-300">
                        본 자산은 <b>{currentUserName}</b>님의 권한 하에 열람되고 있습니다. 시스템은 현재 귀하의 IP(192.168.0.15)와
                        열람 시간을 초단위로 기록하고 있습니다.
                      </p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" />
                      <p className="text-slate-300">
                        영상 녹화, 스크린샷 캡처 시 화면에 워터마크가 포함되며, 비인가 유출이 감지될 경우 즉시 보안 담당자에게
                        알림이 전송됩니다.
                      </p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" />
                      <p className="text-slate-300">
                        {selected.downloadAllowed ? (
                          <>현재 정책상 본 자산은 <b>다운로드 허가</b>된 문서입니다. 상단 다운로드 버튼을 이용하십시오.</>
                        ) : (
                          <>현재 정책상 본 자산의 <b>다운로드는 제한</b>되어 있습니다. 오프라인 사용이 필요한 경우 '자산 공유 요청' 기능을 이용하십시오.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
                  <Lock className="w-full h-full p-20" />
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMemberModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">사용자 권한 수정</h3>
              <button
                onClick={closeEditMemberModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                  {editingMember.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {editingMember.name} {editingMember.position}
                  </p>
                  <p className="text-sm text-slate-500">{editingMember.dept}</p>
                  <p className="text-xs text-slate-400">{editingMember.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">역할 및 권한</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="최고 관리자">최고 관리자</option>
                  <option value="관리인 (Admin)">관리인 (Admin)</option>
                  <option value="사용자 (User)">사용자 (User)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">계정 상태</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="활성">활성</option>
                  <option value="비활성">비활성</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={closeEditMemberModal}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveMemberEdit}
                className="px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editContentModalOpen && editingContent && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">콘텐츠 수정</h3>
              <button
                onClick={closeEditContentModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">콘텐츠 제목</label>
                <input
                  type="text"
                  value={editContentFormData.title}
                  onChange={(e) =>
                    setEditContentFormData({ ...editContentFormData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="콘텐츠 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">분류</label>
                <select
                  value={editContentFormData.category}
                  onChange={(e) =>
                    setEditContentFormData({ ...editContentFormData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="영상">영상</option>
                  <option value="제안서">제안서</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">설명</label>
                <textarea
                  value={editContentFormData.desc}
                  onChange={(e) =>
                    setEditContentFormData({ ...editContentFormData, desc: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                  placeholder="콘텐츠 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={editContentFormData.tags}
                  onChange={(e) =>
                    setEditContentFormData({ ...editContentFormData, tags: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="예: 브랜드, 공식, 전략"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" /> 권한 설정
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">열람 권한</label>
                    <select
                      value={editContentFormData.viewPermission}
                      onChange={(e) =>
                        setEditContentFormData({ ...editContentFormData, viewPermission: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      <option value="admin-only">관리자만 볼 수 있음</option>
                      <option value="all-users">사용자도 볼 수 있음</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">다운로드 권한</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors flex-1">
                        <input
                          type="radio"
                          name="downloadAllowed"
                          checked={editContentFormData.downloadAllowed === true}
                          onChange={() =>
                            setEditContentFormData({ ...editContentFormData, downloadAllowed: true })
                          }
                          className="w-4 h-4 accent-orange-600"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-700">다운로드 가능</p>
                          <p className="text-xs text-slate-500">사용자가 파일을 다운로드할 수 있습니다</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors flex-1">
                        <input
                          type="radio"
                          name="downloadAllowed"
                          checked={editContentFormData.downloadAllowed === false}
                          onChange={() =>
                            setEditContentFormData({ ...editContentFormData, downloadAllowed: false })
                          }
                          className="w-4 h-4 accent-orange-600"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-700">다운로드 불가능</p>
                          <p className="text-xs text-slate-500">다운로드가 제한됩니다</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={closeEditContentModal}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveContentEdit}
                className="px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
