# 코디움랩 (Codium Lab)

코디움랩 소개 사이트 + 운영 워크스페이스. **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · libSQL(Turso)**.

마케팅 페이지, 강의자료 열람/관리, 기술블로그, AI 콘텐츠 쇼케이스, 방문 통계를 하나의 앱에서 운영합니다. 한국어/영어 다국어를 지원하며 PWA로 설치할 수 있습니다.

## 빠른 시작

```bash
npm install
cp .env.example .env      # 값 채우기 (.env 는 git에 커밋되지 않음)
npm run dev
```

http://localhost:10380 접속 → 미들웨어가 언어(`/ko` 또는 `/en`)로 리다이렉트합니다. (포트는 `.env` 의 `PORT` 로 변경 가능 — 기본 10380, 다른 프로젝트와의 충돌 방지용) 로컬에서는 `.env` 의 `TURSO_DATABASE_URL=file:./local.db` 로 파일 DB가 자동 생성되고, 스키마는 첫 쿼리 시 멱등하게 만들어집니다.

> 슈퍼관리자 로그인이 필요하면: `npm run admin:hash` 로 비밀번호 해시를 만들어 `.env` 의 `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD_HASH` 에 채운 뒤 `/ko/login/admin` 으로 로그인합니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm run start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npm run admin:hash` | 슈퍼관리자 비밀번호 해시(scrypt) 생성 |
| `npm run whoami` | `.env` 의 슈퍼관리자 설정 확인 |
| `npm run material:register` | CLI로 강의자료 등록 |

타입체크: `npx tsc --noEmit`

## 기술 스택

- **Next.js 16** (App Router) / **React 19** / **TypeScript 5**
- **Tailwind CSS v4** (다크모드)
- **libSQL** (`@libsql/client`) — 로컬 파일 DB ↔ Turso 호스팅 DB 동일 코드
- **jose** — JWT 세션 쿠키 / **Zod** — 검증 / **react-hook-form** — 폼
- **Mermaid** — 아키텍처 다이어그램 / **react-markdown + remark-gfm** — 강의자료·블로그 렌더링
- PWA(서비스워커 + 매니페스트)

## 주요 구조

| 경로 | 역할 |
| --- | --- |
| `middleware.ts` | 로케일 리다이렉트(`/ko`·`/en`), `x-lang` 헤더 |
| `app/[lang]/(site)/**` | 마케팅 페이지 (home, about, services, process, ai, brands, media, blog, faq, contact) |
| `app/[lang]/(auth)/**` | 로그인 — 카카오 OAuth / 관리자 이메일·비밀번호 |
| `app/[lang]/work/**` | 워크스페이스: 대시보드 · 내 강의자료 |
| `app/[lang]/work/admin/**` | 관리: 자료 · 블로그 · 콘텐츠/채널 · 방문통계 · 사용자 · 아키텍처 |
| `app/api/**` | 인증 콜백/로그아웃, 문의 접수, 방문 트래킹 |
| `dictionaries/{ko,en}.json` | 공유 다국어 사전 (`app/[lang]/dictionaries.ts` 로 로드) |
| `lib/**` | 도메인 로직 + DB 접근 |
| `lib/brand.ts` | 회사·브랜드 소개 텍스트 (콘텐츠는 여기서 수정) |

## 인증 & 권한

- 세션은 jose JWT 쿠키. 제공자: **카카오 OAuth** + **슈퍼관리자**(이메일/비밀번호, scrypt 해시).
- 역할: `superAdmin` → `admin` → `user`. 슈퍼관리자로 로그인 후 **사용자 관리**에서 소셜 계정에 `admin` 권한을 부여합니다.
- 강의자료는 `material_grants` 로 사용자별·기간별 접근권한을 부여합니다.

## 데이터베이스

libSQL 단일 DB. 각 도메인 모듈이 자기 테이블을 멱등 생성합니다.

| 테이블 | 정의 위치 | 용도 |
| --- | --- | --- |
| `inquiries` | `lib/db.ts` | 문의 접수 |
| `users`, `material_grants` | `lib/db.ts` | 사용자·역할, 자료 접근권한 |
| `materials` | `lib/db.ts` | 강의자료 |
| `blog_posts` | `lib/blog.ts` | 기술블로그 글 |
| `media_contents`, `media_channels` | `lib/media.ts` | AI 콘텐츠/유튜브 채널 |
| `page_visits` | `lib/analytics.ts` | 방문 통계 |
| `site_settings` | `lib/settings.ts` | 사이트 설정 토글 |

로컬 문의 확인:

```bash
sqlite3 local.db "SELECT id, name, email, datetime(created_at,'unixepoch','localtime') FROM inquiries ORDER BY id DESC;"
```

## 다국어(i18n)

- 모든 사용자 경로는 `/{ko|en}/...`. 사용자 노출 문자열은 항상 언어로 분기합니다.
- 페이지 로컬 사전(`const T = { ko, en }`) 또는 공유 사전(`dictionaries/*.json`) 사용. 하드코딩 리터럴 금지.

## 배포 (Vercel)

서버리스 파일시스템은 비영속이라 파일 DB 대신 Turso를 사용합니다.

1. `turso db create codium-lab` → URL: `turso db show codium-lab --url`
2. `turso db tokens create codium-lab` 로 토큰 발급
3. Vercel 환경변수에 `TURSO_DATABASE_URL`(`libsql://...`), `TURSO_AUTH_TOKEN` 및 `JWT_SECRET_KEY`, 카카오/슈퍼관리자 변수 등록 (전체 목록은 [`.env.example`](.env.example))
4. 푸시 → 빌드·배포. 스키마는 런타임에 자동 생성.

## 환경변수

전체 목록과 발급 방법은 [`.env.example`](.env.example) 참고. 핵심:

- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` — DB
- `JWT_SECRET_KEY`(32자+), `JWT_ACCESS_EXPIRE_MINUTES` — 세션
- `KAKAO_CLIENT_ID` / `KAKAO_REDIRECT_URI` (+ 선택 `KAKAO_CLIENT_SECRET`, `KAKAO_SCOPES`) — 카카오 로그인
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD_HASH` (+ 선택 `SUPER_ADMIN_NAME`) — 슈퍼관리자
