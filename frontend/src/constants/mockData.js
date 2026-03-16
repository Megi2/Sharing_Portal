// 백엔드 연결 전 fallback 또는 개발용 mock 데이터
// API 연결 후에도 로딩 중 skeleton 표시에 사용 가능

export const MOCK_CONTENTS = [
  { id:1, type:"video", category:"영상", title:"2026 브랜드 홍보 영상 (고화질)", date:"2026-02-10", publishStatus:"DRAFT", status:"보안재생", desc:"기업 브랜드 가치 제고를 위한 고화질 홍보 영상입니다.", tags:["브랜드","공식"], viewPermission:"all-users", downloadAllowed:false },
  { id:2, type:"document", category:"제안서", title:"신규 프로젝트 전략 기획안.pdf", date:"2026-02-11", publishStatus:"ARCHIVED", status:"열람제한", desc:"차기 프로젝트의 핵심 전략 및 예산 기획이 포함된 대외비 문서입니다.", tags:["전략","PDF"], viewPermission:"admin-only", downloadAllowed:false },
  { id:3, type:"video", category:"영상", title:"사내 정보 보안 교육 01", date:"2026-02-09", publishStatus:"DRAFT", status:"보안재생", desc:"전 임직원 대상 필수 보안 교육 영상입니다.", tags:["교육","보안"], viewPermission:"all-users", downloadAllowed:false },
  { id:4, type:"document", category:"제안서", title:"2026 사업 계획서 최종안", date:"2026-01-20", publishStatus:"ARCHIVED", status:"열람제한", desc:"연간 사업 로드맵 및 부서별 KPI 목표 수립 자료입니다.", tags:["계획","중요"], viewPermission:"admin-only", downloadAllowed:false },
  { id:5, type:"document", category:"기타", title:"기업 CI 가이드라인 v2.0", date:"2026-01-15", publishStatus:"PUBLISHED", status:"공유가능", desc:"브랜드 로고 및 지정 색상 활용을 위한 표준 가이드북입니다.", tags:["CI","디자인"], viewPermission:"all-users", downloadAllowed:true },
  { id:6, type:"video", category:"영상", title:"2026 상반기 타운홀 미팅 하이라이트", date:"2026-02-15", publishStatus:"DRAFT", status:"보안재생", desc:"경영진의 2026년 비전 공유 및 주요 사업 로드맵 발표 하이라이트 영상입니다.", tags:["타운홀","비전"], viewPermission:"admin-only", downloadAllowed:false },
];

export const MOCK_NOTICES = [
  { id:1, type:"보안", title:"2026 보안 정책 변경 안내", date:"2026-02-20", desc:"모든 영상 콘텐츠는 이제 HLS 암호화 스트리밍 방식으로만 제공됩니다. 외부 공유 시 반드시 보안 감사를 거쳐야 합니다.", important:true },
  { id:2, type:"정책", title:"외부 협력사 자료 공유 절차 개정", date:"2026-02-18", desc:"협력사에 자료를 전달할 경우, 담당 관리자의 사전 승인 후 보안 채널을 통해서만 공유 가능합니다.", important:true },
  { id:3, type:"공지", title:"사내 보안 교육 이수 안내 (필수)", date:"2026-02-15", desc:"전 임직원 대상 2026년 상반기 보안 교육 이수 기한은 2월 28일까지입니다. 미이수 시 시스템 접근이 제한될 수 있습니다.", important:false },
  { id:4, type:"공지", title:"INTERX 시스템 점검 일정", date:"2026-02-12", desc:"2026년 2월 25일 02:00~06:00 (새벽) 정기 서버 점검이 진행됩니다. 해당 시간 동안 서비스 접근이 불가합니다.", important:false },
  { id:5, type:"정책", title:"개인정보 처리방침 개정 공지", date:"2026-02-08", desc:"2026년 3월 1일부로 개인정보 처리방침이 개정됩니다. 변경된 내용을 반드시 확인하시기 바랍니다.", important:false },
];

export const MOCK_MEMBERS = [
  { id:"m-1", name:"전진하", position:"매니저", dept:"AX&Security", role:"최고 관리자", roles:["SUPERADMIN"], email:"jh.jun@interxlab.com", lastLogin:"방금 전", status:"활성" },
  { id:"m-2", name:"이정인", position:"매니저", dept:"AX&Security", role:"관리인 (Admin)", roles:["ADMIN"], email:"ji.lee@interxlab.com", lastLogin:"1시간 전", status:"활성" },
  { id:"m-3", name:"이민정", position:"매니저", dept:"AX&Security", role:"사용자 (User)", roles:["USER"], email:"mj.lee@interxlab.com", lastLogin:"어제", status:"활성" },
  { id:"m-4", name:"김도윤", position:"매니저", dept:"사업개발", role:"관리인 (Admin)", roles:["ADMIN"], email:"dy.kim@interx.com", lastLogin:"3시간 전", status:"활성" },
  { id:"m-5", name:"박서윤", position:"선임 매니저", dept:"마케팅팀", role:"사용자 (User)", roles:["USER"], email:"sy.park@interxlab.com", lastLogin:"2026-02-10", status:"비활성" },
];

export const MOCK_LOGS = [
  { time:"2026-02-13 14:02:11", user:"전진하 매니저", action:"영상 재생", asset:"2026 브랜드 홍보 영상", ip:"192.168.0.15", status:"SUCCESS" },
  { time:"2026-02-13 13:45:00", user:"이철수", action:"문서 열람", asset:"신규 프로젝트 기획안.pdf", ip:"10.20.33.102", status:"SUCCESS" },
  { time:"2026-02-13 10:20:15", user:"전진하 매니저", action:"로그 다운로드", asset:"2026-02-12 Audit Report", ip:"192.168.0.15", status:"SUCCESS" },
  { time:"2026-02-13 09:11:05", user:"Unknown", action:"비인가 접근", asset:"교육 자료 01", ip:"211.55.10.5", status:"DENIED" },
];

export const PUBLISH_STATUS_OPTIONS = [
  { value:"DRAFT",     label:"보안재생" },
  { value:"REVIEW",    label:"검토중" },
  { value:"PUBLISHED", label:"공유가능" },
  { value:"ARCHIVED",  label:"열람제한" },
];
