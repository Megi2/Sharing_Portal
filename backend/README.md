# 📦 영업자료 포탈 — Backend (Django)

## 프로젝트 구조

```
portal/
├── config/                  # Django 설정
│   ├── settings.py          # DB, JWT, CORS, DRF 설정
│   ├── urls.py              # 루트 URL → 각 앱으로 라우팅
│   ├── renderers.py         # 공통 Response 포맷 {"success", "data", "message"}
│   └── exceptions.py        # 에러 핸들러
├── apps/
│   ├── accounts/            # 사용자/부서/역할/인증
│   │   ├── models.py        # User, Department, Role, UserRole
│   │   ├── serializers.py   # Login, UserProfile, UserCRUD
│   │   ├── views.py         # LoginView, MeView, UserListCreate, UserUpdate
│   │   ├── urls.py          # /api/auth/login, /api/auth/me
│   │   ├── urls_users.py    # /api/users/
│   │   └── management/commands/seed.py  # 초기 데이터
│   ├── assets/              # 자산/버전/태그/카테고리/ACL
│   │   ├── models.py        # Asset, AssetVersion, Category, Tag, AssetPermission
│   │   ├── serializers.py
│   │   ├── views.py         # CRUD + Versions + Permissions
│   │   └── urls.py          # /api/assets/
│   ├── sharing/             # 공유요청/반출승인
│   │   ├── models.py        # ShareRequest
│   │   ├── views.py         # 생성/승인/반려
│   │   └── urls.py          # /api/share-requests/
│   ├── logs/                # 감사 로그
│   │   ├── models.py        # AccessLog
│   │   ├── views.py         # 조회 + CSV 내보내기
│   │   └── urls.py          # /api/logs/
│   └── announcements/       # 공지사항
│       ├── models.py        # Announcement
│       ├── views.py         # 최신 조회 + 생성
│       └── urls.py          # /api/announcements/
├── docker-compose.yml       # PostgreSQL 17 + Redis
├── requirements.txt
├── .env.example
└── manage.py
```

## 빠른 시작

### 1. DB 실행 (Docker)
```bash
docker-compose up -d
```

### 2. 환경 설정
```bash
cp .env.example .env
# 필요 시 .env 수정
```

### 3. 가상환경 + 의존성
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. 마이그레이션 + 초기 데이터
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py seed
```
→ 초기 관리자: `admin@company.com` / `admin1234`

### 5. 서버 실행
```bash
python manage.py runserver
```

### 6. API 문서 확인
- Swagger: http://localhost:8000/api/docs/

---

## API 엔드포인트 요약

| 메서드 | URL | 설명 |
|--------|-----|------|
| POST | `/api/auth/login` | 로그인 → JWT 발급 |
| GET | `/api/auth/me` | 내 정보 조회 |
| GET | `/api/users/` | 사용자 목록 |
| POST | `/api/users/` | 사용자 생성 |
| PATCH | `/api/users/{id}` | 사용자 수정 |
| GET | `/api/assets/` | 자산 목록 (필터/검색) |
| POST | `/api/assets/` | 자산 생성 |
| GET | `/api/assets/{id}` | 자산 상세 |
| PATCH | `/api/assets/{id}` | 자산 수정 |
| DELETE | `/api/assets/{id}` | 자산 삭제 |
| GET | `/api/assets/{id}/versions` | 버전 목록 |
| POST | `/api/assets/{id}/versions` | 새 버전 등록 |
| GET | `/api/assets/{id}/permissions` | ACL 조회 |
| PUT | `/api/assets/{id}/permissions` | ACL 설정 |
| POST | `/api/share-requests/` | 공유 요청 생성 |
| GET | `/api/share-requests/` | 요청 목록 |
| POST | `/api/share-requests/{id}/approve` | 승인 |
| POST | `/api/share-requests/{id}/reject` | 반려 |
| GET | `/api/logs/` | 로그 조회 |
| GET | `/api/logs/export` | CSV 내보내기 |
| GET | `/api/announcements/latest` | 최신 공지 |
| POST | `/api/announcements/` | 공지 생성 |

---

## 기술 스택

- **Django 5.0.7** + DRF
- **PostgreSQL 17** (UUID PK)
- **JWT** (SimpleJWT)
- **drf-spectacular** (Swagger)
