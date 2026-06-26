@AGENTS.md

# Codium Lab — 프로젝트 가이드

코디움랩(Codium Lab) 소개 사이트 + 운영 워크스페이스. 마케팅 페이지, 강의자료 열람/관리, 기술블로그, AI 콘텐츠 쇼케이스, 방문 통계를 하나의 Next.js 앱에서 운영합니다.

## 명령어

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (포트는 `.env` 의 `PORT`, 기본 http://localhost:10380) |
| `npm run build` / `npm run start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npx tsc --noEmit` | 타입체크 (커밋 전 권장) |
| `npm run admin:hash` | 슈퍼관리자 비밀번호 해시 생성(scrypt) |
| `npm run whoami` | `.env` 슈퍼관리자 설정 확인 |
| `npm run material:register` | CLI로 강의자료 등록 |

## 아키텍처 & 컨벤션

**중요:** Next.js 16.2.4 + React 19. 코드 작성 전 `node_modules/next/dist/docs/` 의 해당 가이드를 먼저 확인할 것(AGENTS.md). 학습 데이터의 옛 Next API와 다릅니다.

- **라우팅 / i18n**: `middleware.ts` 가 로케일 없는 경로를 `/{ko|en}` 로 리다이렉트. 모든 사용자 경로는 `app/[lang]/...` 아래에 있고 `lang` 파라미터를 받습니다. 지원 로케일은 `ko`(기본)/`en`.
- **다국어 텍스트**: 사용자 노출 문자열은 **반드시** 언어로 분기해야 함. 두 가지 패턴 중 하나를 따르세요:
  1. 페이지/컴포넌트 로컬 딕셔너리: `const T = { ko: {...}, en: {...} }; const t = T[lang === "en" ? "en" : "ko"]`
  2. 공유 딕셔너리: `dictionaries/ko.json` · `dictionaries/en.json` (→ `app/[lang]/dictionaries.ts` 의 `getDictionary`)
  - 하드코딩 한글/영문 리터럴 금지. `lang` prop이 없으면 호출부에서 내려주세요.
- **인증 / 권한** (`lib/auth.ts`, `lib/users.ts`): jose JWT 세션 쿠키. 제공자는 카카오 OAuth + 슈퍼관리자(이메일/비밀번호, scrypt). 역할은 `superAdmin | admin | user`. `getSessionWithRole()` 로 서버에서 확인.
- **데이터 계층** (`lib/`): libSQL(Turso/로컬 파일). 각 도메인 모듈(`materials`, `blog`, `media`, `analytics`, `users`, `settings`)이 자기 테이블의 `CREATE TABLE IF NOT EXISTS` 를 멱등 실행. 새 쿼리는 함수 시작에서 `ensureSchema()`/모듈 init 패턴을 따를 것.
- **변경(쓰기) 작업**: 관리자 CRUD는 **서버 액션**(`app/[lang]/work/admin/*/actions.ts`)을 사용. 폼은 `<form action={serverAction}>`.
- **폼 검증(react-hook-form)**: 등록/생성 폼은 제출 전 RHF + zod로 필수값을 검증함. 서버 액션은 유지하고 폼만 클라이언트 컴포넌트로 분리하는 패턴:
  - `"use client"` + `useForm({ resolver: zodResolver(schema) })`, `<form ref noValidate onSubmit={handleSubmit(onValid)}>`
  - `onValid` 에서 `new FormData(formRef.current!)` 로 DOM에서 폼데이터를 재구성해 서버 액션 호출(`startTransition`).
  - `register("name")` 가 `name` 을 설정하므로 별도 `name` 하드코딩 금지. `noValidate` 로 브라우저 기본(한글) 검증 툴팁 제거.
  - 검증 메시지는 ko/en. 레퍼런스: `components/InquiryForm.tsx`, `app/[lang]/work/admin/**/*Form.tsx`.
- **스타일**: Tailwind CSS v4. 다크모드 지원(`dark:` 클래스 동반). `lib/cn.ts`(clsx + tailwind-merge)로 클래스 병합.
- **PWA**: `components/PWARegister.tsx` + `public/sw.js` + `app/manifest.ts`. 서비스워커는 **프로덕션에서만** 등록(개발 모드는 기존 SW 해제 — `_next/static` 캐시-우선이 핫리로드를 깨뜨림).

## 디렉터리 요약

- `app/[lang]/(site)/**` — 마케팅 페이지(home, about, services, process, ai, brands, media, blog, faq, contact)
- `app/[lang]/(auth)/**` — 로그인(카카오 / 관리자)
- `app/[lang]/work/**` — 운영 워크스페이스(대시보드, 내 강의자료) + `admin/**`(자료·블로그·콘텐츠·방문통계·사용자·아키텍처 관리)
- `app/api/**` — 인증 콜백, 로그아웃, 문의 접수, 방문 트래킹
- `lib/**` — 도메인 로직 + DB. 사이트 콘텐츠 텍스트는 `lib/brand.ts`
- `components/**` — UI(`auth/`, `blog/`, `game/`, `media/`, `work/`, `ui/`)

## 작업 시 주의

- 커밋은 사용자가 요청할 때만. 커밋 메시지 본문은 한국어, 끝에 `Co-Authored-By` 라인.
- 임시 스크립트/스모크 파일(`scratch-*.mjs` 등)은 커밋하지 말 것.
- `.env` 는 `.env.example` 복사로 생성(커밋 금지). 환경변수 설명은 `.env.example` 참고.
