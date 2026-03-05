/**
 * App.jsx — 인증 게이팅 + 레이아웃 쉘 + 상태 오케스트레이션
 */
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useMembers } from "./hooks/useMembers";

// Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";

// Pages
import DashboardPage from "./components/DashboardPage";
import MembersPage from "./components/MembersPage";
import UploadPage from "./components/UploadPage";
import LogsPage from "./components/LogsPage";
import ContentManagementPage from "./components/ContentManagementPage";

// Modals
import ContentDetailModal from "./components/modals/ContentDetailModal";
import EditMemberModal from "./components/modals/EditMemberModal";
import InviteMemberModal from "./components/modals/InviteMemberModal";
import EditContentModal from "./components/modals/EditContentModal";

// lucide for loading
import { Loader2, ShieldCheck } from "lucide-react";

// ── 정적 데이터 ──
const noticesData = [
  { id: 1, type: "보안", date: "2026-03-01", title: "3월 보안 패치 적용 안내", desc: "전체 시스템 보안 업데이트가 3월 5일 02:00 ~ 06:00 사이 진행됩니다.", important: true },
  { id: 2, type: "정책", date: "2026-02-28", title: "콘텐츠 다운로드 정책 변경", desc: "보안 등급 L3 이상 자산의 다운로드 시 관리자 2인 이상 승인이 필요합니다.", important: true },
  { id: 3, type: "공지", date: "2026-02-25", title: "신규 브랜드 가이드라인 배포", desc: "2026 상반기 브랜드 아이덴티티 가이드라인이 업로드되었습니다.", important: false },
  { id: 4, type: "보안", date: "2026-02-20", title: "비인가 접근 시도 탐지 강화", desc: "AI 기반 이상 탐지 시스템이 업그레이드되었습니다.", important: false },
  { id: 5, type: "공지", date: "2026-02-15", title: "시스템 점검 완료 보고", desc: "2월 정기 점검이 정상적으로 완료되었습니다.", important: false },
];

const defaultContents = [
  { id: 1, type: "video", category: "홍보 영상", title: "2026 브랜드 홍보 영상", desc: "올해 핵심 브랜드 메시지를 전달하는 대표 영상 자산입니다. 4K 촬영·편집 완료.", date: "2026-02-15", status: "보안재생", tags: ["브랜딩", "2026", "4K"], viewPermission: "all-users", downloadAllowed: false },
  { id: 2, type: "video", category: "교육 콘텐츠", title: "신규 입사자 온보딩 교육 영상", desc: "인사팀 공식 교육 커리큘럼에 포함된 필수 시청 자료입니다.", date: "2026-01-10", status: "열람제한", tags: ["온보딩", "교육", "HR"], viewPermission: "all-users", downloadAllowed: false },
  { id: 3, type: "video", category: "제품 데모", title: "InterX Platform 기능 소개 데모", desc: "영업팀 고객 미팅용 제품 시연 영상. NDA 대상 콘텐츠.", date: "2026-02-01", status: "보안재생", tags: ["데모", "영업", "NDA"], viewPermission: "admin-only", downloadAllowed: false },
  { id: 4, type: "document", category: "제안서", title: "스마트팩토리 구축 제안서 v3.2", desc: "대기업 제조사 대상 스마트팩토리 솔루션 제안서 최종본입니다.", date: "2026-02-10", status: "열람가능", tags: ["제안서", "스마트팩토리", "제조"], viewPermission: "all-users", downloadAllowed: true },
  { id: 5, type: "document", category: "전략 기획", title: "2026 사업 전략 로드맵", desc: "연간 사업 로드맵 및 부서별 KPI 목표 수립 자료입니다. 경영진 보고용 최종 버전입니다.", date: "2026-01-05", status: "열람제한", tags: ["전략", "KPI", "로드맵"], viewPermission: "admin-only", downloadAllowed: false },
  { id: 6, type: "document", category: "디자인 가이드", title: "UI/UX 디자인 시스템 가이드라인", desc: "프론트엔드 개발팀을 위한 컴포넌트 규격 및 컬러/타이포그래피 표준 문서.", date: "2026-02-20", status: "열람가능", tags: ["디자인", "UI", "가이드라인"], viewPermission: "all-users", downloadAllowed: true },
];

const defaultLogs = [
  { time: "2026-02-13 14:32:10", user: "전진하 매니저", action: "자산 등록", asset: "스마트팩토리 제안서 v3.2", ip: "192.168.0.15", status: "SUCCESS" },
  { time: "2026-02-13 14:28:03", user: "전진하 매니저", action: "영상 재생", asset: "2026 브랜드 홍보 영상", ip: "192.168.0.15", status: "SUCCESS" },
  { time: "2026-02-13 13:45:00", user: "이철수", action: "문서 열람", asset: "신규 프로젝트 기획안.pdf", ip: "10.20.33.102", status: "SUCCESS" },
  { time: "2026-02-13 10:20:15", user: "전진하 매니저", action: "로그 다운로드", asset: "2026-02-12 Audit Report", ip: "192.168.0.15", status: "SUCCESS" },
  { time: "2026-02-13 09:11:05", user: "Unknown", action: "비인가 접근", asset: "교육 자료 01", ip: "211.55.10.5", status: "DENIED" },
];

// ── 메인 App ──
export default function App() {
  // ── 인증 ──
  const { user, isAuthenticated, loading: authLoading, error: authError, login, logout } = useAuth();

  // ── 인증 로딩 중: 스플래시 ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="bg-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-600/30">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">세션 확인 중...</p>
      </div>
    );
  }

  // ── 미인증: 로그인 페이지 ──
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} error={authError} />;
  }

  // ── 인증됨: 메인 앱 ──
  return <AuthenticatedApp user={user} onLogout={logout} />;
}

// ── 인증된 메인 앱 (기존 로직) ──
function AuthenticatedApp({ user, onLogout }) {
  const { members, loading: membersLoading, error: membersError, fetchMembers, inviteMember, editMember } = useMembers();

  const [contents, setContents] = useState(defaultContents);
  const logs = useMemo(() => defaultLogs, []);

  const [menu, setMenu] = useState("dashboard");
  const [search, setSearch] = useState("");

  const [selectedContent, setSelectedContent] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const anyModalOpen = !!(selectedContent || editingMember || inviteModalOpen || editingContent);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      if (inviteModalOpen) setInviteModalOpen(false);
      else if (editingContent) setEditingContent(null);
      else if (editingMember) setEditingMember(null);
      else if (selectedContent) setSelectedContent(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inviteModalOpen, editingContent, editingMember, selectedContent]);

  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [anyModalOpen]);

  function handleSaveMemberEdit(id, { role, status }) {
    editMember(id, { role, status })
      .then(() => setEditingMember(null))
      .catch((err) => { console.error("수정 실패:", err); alert("사용자 수정에 실패했습니다."); });
  }

  function handleSaveContentEdit(contentId, data) {
    setContents((prev) => prev.map((c) => (c.id === contentId ? { ...c, ...data } : c)));
    setEditingContent(null);
  }

  function handleDeleteContent(contentId) {
    if (window.confirm("정말 이 콘텐츠를 삭제하시겠습니까?")) {
      setContents((prev) => prev.filter((c) => c.id !== contentId));
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar menu={menu} setMenu={setMenu} user={user} onLogout={onLogout} />
      <Header search={search} setSearch={setSearch} />

      <main className="ml-0 lg:ml-64 pt-16 min-h-screen p-8">
        {menu === "dashboard" && (
          <DashboardPage noticesData={noticesData} contents={contents} search={search} openModal={setSelectedContent} />
        )}
        {menu === "members" && (
          <MembersPage members={members} membersLoading={membersLoading} membersError={membersError} fetchMembers={fetchMembers} onInvite={() => setInviteModalOpen(true)} onEditMember={setEditingMember} />
        )}
        {menu === "upload" && <UploadPage />}
        {menu === "logs" && <LogsPage logs={logs} />}
        {menu === "content-management" && (
          <ContentManagementPage contents={contents} onEditContent={setEditingContent} onDeleteContent={handleDeleteContent} />
        )}
      </main>

      {selectedContent && <ContentDetailModal selected={selectedContent} onClose={() => setSelectedContent(null)} />}
      {editingMember && <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} onSave={handleSaveMemberEdit} />}
      {inviteModalOpen && <InviteMemberModal onClose={() => setInviteModalOpen(false)} onInvite={inviteMember} />}
      {editingContent && <EditContentModal content={editingContent} onClose={() => setEditingContent(null)} onSave={handleSaveContentEdit} />}
    </div>
  );
}