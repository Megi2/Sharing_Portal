# 📦 InterX 영업자료 포탈

> 사내 영업자료(영상·제안서·문서)를 안전하게 관리하고, AI 기반 검색·추천·요약 기능을 제공하는 통합 콘텐츠 관리 플랫폼

---

## 아키텍처 개요

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Backend Core    │────▶│    PostgreSQL    │
│  React v19   │     │  Django 5.0 + DRF │     │       v17        │
│  Vite + TW   │     └───────────────────┘     └──────────────────┘
└──────────────┘              │                         ▲
                              │ Redis                   │ Read
                              ▼                         │
                     ┌───────────────────┐     ┌──────────────────┐
                     │      Redis        │     │    AI Agent      │
                     │  Cache / Queue    │     │ FastAPI+LangChain│
                     └───────────────────┘     └──────────────────┘
```

| 레이어 | 기술 스택 | 역할 |
|--------|----------|------|
| Frontend | React 19, Vite, Tailwind CSS, TanStack Query | 포탈 UI (검색/상세/관리자) |
| Backend Core | Django 5.0.7, DRF, SimpleJWT | 데이터 CRUD, 권한, 트랜잭션 |
| Database | PostgreSQL 17, Redis 7 | 데이터 저장, 캐시/큐 |

---

## 사전 요구사항

```bash
# 필수 설치 확인
docker --version        # Docker 20.10+
docker-compose --version # Docker Compose v2+
node --version          # Node.js 18+
python --version        # Python 3.12+
```

---

## 1. 인프라 실행 (Docker)

PostgreSQL과 Redis를 Docker로 실행합니다.

```bash
# 프로젝트 루트에서
cd backend

# DB + Redis 컨테이너 실행
docker-compose up -d

# 실행 상태 확인
docker ps
```

> **접속 정보**
> - PostgreSQL: `localhost:5433` / DB: `portal_db` / User: `portal` / PW: `portal`
> - Redis: `localhost:6379`

```bash
# 컨테이너 로그 확인
docker logs portal-db
docker logs portal-redis

# 컨테이너 중지 / 재시작
docker-compose stop
docker-compose start

# 완전 삭제 (볼륨 포함)
docker-compose down -v
```

---

## 2. Backend (Django) 실행

```bash
cd backend

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 DB 접속 정보 등 확인/수정
```

```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# 의존성 설치
pip install -r requirements.txt
```

```bash
# DB 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 초기 데이터 시드 (부서, 역할, 관리자 계정, 카테고리)
python manage.py seed
```

> **초기 관리자 계정**: `admin@company.com` / `admin1234`

```bash
# 개발 서버 실행
python manage.py runserver
# → http://localhost:8000

# Swagger API 문서
# → http://localhost:8000/api/docs/
```

---

## 3. Frontend (React) 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

---

## 4. AI Agent (FastAPI) 실행

```bash
cd ai-agent

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env에 Gemini API Key 등 설정

# 서버 실행
uvicorn main:app --reload --port 8001
# → http://localhost:8001
# → http://localhost:8001/docs (Swagger)
```

---

## 5. 전체 서비스 한 번에 실행 (요약)

```bash
# 터미널 1: 인프라
cd backend && docker-compose up -d

# 터미널 2: Backend
cd backend && source venv/bin/activate && python manage.py runserver

# 터미널 3: Frontend
cd frontend && npm run dev

# 터미널 4: AI Agent
cd ai-agent && source venv/bin/activate && uvicorn main:app --reload --port 8001
```

| 서비스 | URL | 비고 |
|--------|-----|------|
| Frontend | http://localhost:5173 | Vite 개발 서버 |
| Backend API | http://localhost:8000 | Django 개발 서버 |
| Swagger | http://localhost:8000/api/docs/ | API 문서 |
| AI Agent | http://localhost:8001 | FastAPI 서버 |
| PostgreSQL | localhost:5433 | Docker |
| Redis | localhost:6379 | Docker |

---

## 주요 API 엔드포인트

### 인증

```bash
# 로그인 → JWT 발급
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin1234"}'

# 내 정보 조회
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 사용자 관리

```bash
# 사용자 목록 조회
curl http://localhost:8000/api/users/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 사용자 생성
curl -X POST http://localhost:8000/api/users/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"홍길동",
    "email":"hong@company.com",
    "deptId":"<DEPT_UUID>",
    "position":"매니저",
    "roleCodes":["USER"],
    "status":"ACTIVE"
  }'

# 사용자 수정
curl -X PATCH http://localhost:8000/api/users/<USER_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"roleCodes":["ADMIN"],"status":"INACTIVE"}'
```

### 자산 관리

```bash
# 자산 목록 조회 (필터/검색)
curl "http://localhost:8000/api/assets/?type=DOCUMENT&q=제안서&sort=latest" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 자산 상세 조회
curl http://localhost:8000/api/assets/<ASSET_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 자산 생성
curl -X POST http://localhost:8000/api/assets/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"DOCUMENT",
    "categoryId":"<CATEGORY_UUID>",
    "title":"스마트팩토리 제안서",
    "description":"OO기업 맞춤 제안",
    "viewScope":"ALL_USERS",
    "downloadAllowed":false,
    "tags":["전략","제조"]
  }'

# 자산 수정
curl -X PATCH http://localhost:8000/api/assets/<ASSET_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"수정된 제목","publishStatus":"PUBLISHED"}'

# 자산 삭제
curl -X DELETE http://localhost:8000/api/assets/<ASSET_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 버전 관리

```bash
# 버전 목록 조회
curl http://localhost:8000/api/assets/<ASSET_ID>/versions \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 새 버전 등록
curl -X POST http://localhost:8000/api/assets/<ASSET_ID>/versions \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType":"GDRIVE",
    "sourceUrl":"https://drive.google.com/...",
    "sourceFileId":"drive-file-id",
    "note":"고객 요청 반영"
  }'
```

### 권한 관리 (ACL)

```bash
# 자산별 권한 조회
curl http://localhost:8000/api/assets/<ASSET_ID>/permissions \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 권한 설정
curl -X PUT http://localhost:8000/api/assets/<ASSET_ID>/permissions \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[{
    "subjectType":"DEPT",
    "subjectId":"<DEPT_UUID>",
    "canView":true,
    "canDownload":false
  }]'
```

### 공유 요청

```bash
# 공유 요청 생성
curl -X POST http://localhost:8000/api/share-requests/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<ASSET_UUID>","reason":"고객 미팅용"}'

# 공유 요청 목록
curl http://localhost:8000/api/share-requests/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 승인
curl -X POST http://localhost:8000/api/share-requests/<REQUEST_ID>/approve \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 반려
curl -X POST http://localhost:8000/api/share-requests/<REQUEST_ID>/reject \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"comment":"보안 등급 문제"}'
```

### 감사 로그

```bash
# 로그 조회
curl "http://localhost:8000/api/logs/?from=2026-03-01&to=2026-03-31&action=VIEW&result=SUCCESS" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# CSV 내보내기
curl "http://localhost:8000/api/logs/export?from=2026-03-01&to=2026-03-31" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" -o logs.csv
```

### 공지사항

```bash
# 최신 공지 조회
curl http://localhost:8000/api/announcements/latest \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 공지 생성
curl -X POST http://localhost:8000/api/announcements/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"3월 포탈 오픈","body":"파일럿 시작","isPinned":true}'
```

---

## 프로젝트 디렉토리 구조

```
interx-portal/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx              # 메인 앱 컴포넌트
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Django 백엔드
│   ├── config/                  # Django 설정
│   │   ├── settings.py          # DB, JWT, CORS, DRF 설정
│   │   ├── urls.py              # 루트 URL 라우팅
│   │   ├── renderers.py         # 공통 Response 포맷
│   │   └── exceptions.py        # 에러 핸들러
│   ├── apps/
│   │   ├── accounts/            # 사용자/부서/역할/인증
│   │   ├── assets/              # 자산/버전/태그/카테고리/ACL
│   │   ├── sharing/             # 공유요청/반출승인
│   │   ├── logs/                # 감사 로그
│   │   └── announcements/       # 공지사항
│   ├── docker-compose.yml       # PostgreSQL + Redis
│   ├── requirements.txt
│   └── .env.example
│
├── ai-agent/                    # FastAPI AI 에이전트
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── README.md                    # ← 현재 문서
```

---

## 트러블슈팅

```bash
# PostgreSQL 접속 테스트
docker exec -it portal-db psql -U portal -d portal_db

# Redis 접속 테스트
docker exec -it portal-redis redis-cli ping
# → PONG

# Django 마이그레이션 초기화 (문제 발생 시)
python manage.py flush --no-input
python manage.py migrate --run-syncdb
python manage.py seed

# 포트 충돌 확인
lsof -i :5433  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8000  # Django
lsof -i :5173  # Vite
lsof -i :8001  # FastAPI
```

---

## 환경 변수 (.env)

```env
# Database
DB_NAME=portal_db
DB_USER=portal
DB_PASSWORD=portal
DB_HOST=localhost
DB_PORT=5433

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60        # minutes
JWT_REFRESH_TOKEN_LIFETIME=1440     # minutes

# Redis
REDIS_URL=redis://localhost:6379/0

# AI Agent (ai-agent/.env)
GEMINI_API_KEY=your-gemini-api-key
CORE_API_URL=http://localhost:8000
```