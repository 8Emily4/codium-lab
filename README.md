# 코디움랩 (Codium Lab)

모회사 소개 홈페이지. Next.js 16 (App Router) + TypeScript + Tailwind v4 + libSQL.

자식 브랜드(에이디움 / 베이디움)를 소개하고, B2B 컨설팅·협업 문의를 SQLite 호환 DB(libSQL)에 적재합니다.

## 빠른 시작

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. 첫 문의 전송 시 `local.db` 파일이 자동 생성됩니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Turbopack 기반 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 결과물 실행 |
| `npm run lint` | ESLint |

## 주요 구조

| 경로 | 역할 |
| --- | --- |
| `app/page.tsx` | 랜딩 페이지 (Hero · Brands · About · Contact · Footer 섹션) |
| `app/layout.tsx` | 루트 레이아웃, 메타데이터, 폰트 |
| `app/api/inquiries/route.ts` | `POST /api/inquiries` — 문의 검증 후 DB 적재 |
| `components/Hero.tsx` | 회사 정보 헤더 (서버 컴포넌트) |
| `components/BrandCard.tsx` | 자식 브랜드 카드 (서버 컴포넌트) |
| `components/InquiryForm.tsx` | 문의 폼 (클라이언트 컴포넌트) |
| `lib/brand.ts` | 회사 · 자식 브랜드 데이터. 콘텐츠는 여기서만 수정 |
| `lib/db.ts` | libSQL 클라이언트 싱글톤 · `inquiries` 테이블 마이그레이션 |

## DB 스키마

`lib/db.ts`의 `ensureSchema()`가 첫 호출 시 멱등하게 실행:

```sql
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
)
```

로컬에서 접수된 문의 확인:

```bash
sqlite3 local.db "SELECT id, name, email, message, datetime(created_at,'unixepoch','localtime') FROM inquiries ORDER BY id DESC;"
```

## Vercel 배포

Vercel 함수의 파일 시스템은 영속적이지 않으므로 로컬 파일 DB를 그대로 쓸 수 없습니다. Turso(libSQL 호스팅) 한 단계만 추가하면 됩니다.

1. Turso CLI 설치 및 로그인 → `turso auth signup` (또는 `login`).
2. DB 생성: `turso db create codium-lab` → URL 확인은 `turso db show codium-lab --url`.
3. 토큰 발급: `turso db tokens create codium-lab`.
4. Vercel 프로젝트 Settings → Environment Variables에 다음을 등록:
   - `TURSO_DATABASE_URL` = 위 URL (`libsql://...`)
   - `TURSO_AUTH_TOKEN` = 위 토큰
5. Git에 푸시 → Vercel이 빌드·배포. 첫 POST 시 스키마가 자동 생성됨.

## 콘텐츠 수정

회사 정보, 자식 브랜드 카드 문구는 [lib/brand.ts](lib/brand.ts) 한 파일에서 모두 수정합니다. 자식 브랜드에 외부 링크를 걸려면 `href` 필드를 채우면 카드에 "자세히 보기" CTA가 노출됩니다.

## 알려진 한계 (v0)

- 문의 폼에 rate limiting 없음 — 운영 단계에서 Vercel KV / Upstash 등으로 보강 필요.
- 문의 도착 알림(이메일·슬랙) 없음 — 현재는 DB 조회로만 확인.
- 관리자 화면 없음 — 필요 시 `/admin` 라우트 + 단일 비밀번호 보호로 추가 가능.
