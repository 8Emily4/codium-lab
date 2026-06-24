/**
 * 코디움랩 아키텍처 페이지에서 쓰는 Mermaid 다이어그램 소스 모음.
 * 실제 코드베이스(lib/db.ts 스키마, lib/auth.ts 세션, app 라우트 구조)를
 * 기준으로 작성했습니다.
 */

/* ── 1. 시스템 아키텍처 ──────────────────────────────────────────── */
export const SYSTEM_ARCHITECTURE = `flowchart TB
  subgraph client["🖥️ 클라이언트"]
    direction LR
    U["방문자 / 수강생<br/>관리자"]
    PWA["PWA<br/>manifest · 서비스워커"]
  end

  subgraph edge["⚡ 엣지 (Vercel)"]
    MW["middleware.ts<br/>언어 감지 · x-lang 헤더<br/>리라이트 / 리다이렉트"]
  end

  subgraph next["▲ Next.js 16 · App Router (React 19)"]
    direction TB
    subgraph routes["라우트 그룹"]
      SITE["(site)<br/>홈·서비스·미디어·문의"]
      AUTH["(auth)<br/>로그인 · 콜백"]
      WORK["/work<br/>워크스페이스 (인증 필요)"]
    end
    subgraph server["서버 실행 단위"]
      RSC["서버 컴포넌트"]
      SA["서버 액션<br/>actions.ts"]
      RH["라우트 핸들러<br/>/api/*"]
    end
  end

  subgraph domain["📦 도메인 레이어 (lib/)"]
    direction LR
    AUTHLIB["auth.ts<br/>HMAC 서명 세션 쿠키"]
    USERS["users.ts<br/>역할(RBAC) 해석"]
    MATS["materials.ts<br/>강의자료·접근권한"]
    MEDIA["media.ts<br/>미디어 콘텐츠"]
    BRAND["brand.ts<br/>브랜드·회사정보"]
  end

  subgraph data["🗄️ 데이터 · 외부 서비스"]
    direction LR
    DB[("Turso<br/>libSQL / SQLite")]
    KAKAO["Kakao OAuth"]
    YT["YouTube · Instagram<br/>임베드"]
  end

  U --> PWA --> MW
  MW --> SITE & AUTH & WORK
  SITE --> RSC
  WORK --> RSC
  AUTH --> RH
  RSC --> SA
  RSC --> AUTHLIB
  SA --> USERS & MATS & MEDIA
  RH --> AUTHLIB & USERS
  RSC --> BRAND
  AUTHLIB --> USERS
  USERS --> DB
  MATS --> DB
  MEDIA --> DB
  RH -. "인가 코드 교환" .-> KAKAO
  SITE -. "iframe" .-> YT

  classDef c fill:#eef2ff,stroke:#6366f1,color:#312e81;
  classDef e fill:#fdf4ff,stroke:#d946ef,color:#86198f;
  classDef d fill:#ecfeff,stroke:#06b6d4,color:#155e75;
  class U,PWA c;
  class MW e;
  class DB,KAKAO,YT d;
`;

/* ── 2. DB ERD ──────────────────────────────────────────────────── */
export const DB_ERD = `erDiagram
  users ||--o{ materials : "작성 author_id"
  users ||--o{ material_grants : "수신 user_id"
  materials ||--o{ material_grants : "대상 material_id"
  users ||--o{ media_contents : "등록 created_by"

  users {
    TEXT id PK "provider:uid"
    TEXT provider "kakao/naver/google/meta"
    TEXT name
    TEXT email
    TEXT avatar
    TEXT role "user|admin (superAdmin=ENV)"
    INTEGER created_at
    INTEGER last_login_at
  }

  materials {
    TEXT id PK "uuid"
    TEXT title
    TEXT summary
    TEXT body "마크다운"
    TEXT status "draft|published|archived"
    TEXT access "public|restricted"
    TEXT category
    TEXT tags "JSON 배열"
    TEXT author_id FK
    TEXT author_name
    INTEGER created_at
    INTEGER updated_at
  }

  material_grants {
    TEXT id PK "uuid"
    TEXT material_id FK
    TEXT user_id FK
    INTEGER starts_at "NULL=즉시"
    INTEGER ends_at "NULL=무기한"
    TEXT granted_by
    INTEGER created_at
  }

  media_contents {
    INTEGER id PK "autoincrement"
    TEXT type "youtube|instagram|other"
    TEXT title
    TEXT description
    TEXT url
    TEXT thumbnail
    TEXT tags "콤마 구분"
    INTEGER featured "0|1"
    INTEGER published "0|1"
    TEXT created_by FK
    INTEGER created_at
    INTEGER updated_at
  }

  inquiries {
    INTEGER id PK "autoincrement"
    TEXT name
    TEXT organization
    TEXT email
    TEXT phone
    TEXT message
    INTEGER created_at
  }
`;

/* ── 3. 인증 · 권한 흐름 ─────────────────────────────────────────── */
export const AUTH_FLOW = `sequenceDiagram
  autonumber
  actor U as 사용자
  participant B as 브라우저
  participant API as /api/auth/kakao
  participant K as Kakao 인증서버
  participant CB as /callback
  participant DB as Turso(users)
  participant W as /work (보호 라우트)

  U->>API: 로그인 클릭
  API->>API: state 생성·쿠키 저장
  API-->>B: Kakao 인가 페이지로 리다이렉트
  B->>K: 동의 + 로그인
  K-->>CB: code + state 반환
  CB->>CB: state 검증 (CSRF 방지)
  CB->>K: code → access token 교환
  K-->>CB: 사용자 프로필
  CB->>DB: upsertUserOnLogin (역할은 보존)
  CB->>CB: HMAC 서명 세션 쿠키 발급
  CB-->>B: httpOnly 쿠키 Set + 리다이렉트

  Note over B,W: 이후 보호 라우트 접근
  B->>W: /work 요청 (세션 쿠키)
  W->>W: decodeSession() HMAC 검증
  W->>DB: resolveRole(id)
  Note right of W: ENV SUPER_ADMIN_IDS → superAdmin<br/>그 외 → DB role(user/admin)
  DB-->>W: 유효 역할
  W-->>B: 역할별 화면 렌더 (RBAC)
`;

/* ── 4. 라우트 · 디렉터리 구조 ──────────────────────────────────── */
export const ROUTE_TREE = `flowchart LR
  root["app/[lang]"]

  root --> site["(site)<br/>공개"]
  root --> auth["(auth)"]
  root --> work["work<br/>🔒 로그인"]
  root --> api["api/"]

  site --> s1["/ 홈"]
  site --> s2["services · process · ai"]
  site --> s3["media · brands · about"]
  site --> s4["contact · faq · game"]

  auth --> a1["login"]
  auth --> a2["login/loading"]

  work --> w1["/ 대시보드"]
  work --> w2["materials<br/>내 강의자료"]
  work --> admin["admin/ 🛡️"]
  admin --> ad1["materials<br/>자료·권한 관리"]
  admin --> ad2["content<br/>미디어 관리"]
  admin --> ad3["users 👑<br/>슈퍼관리자 전용"]
  admin --> ad4["architecture<br/>이 페이지"]

  api --> api1["auth/kakao · callback · logout"]
  api --> api2["inquiries"]

  classDef pub fill:#eef2ff,stroke:#6366f1,color:#312e81;
  classDef sec fill:#fef3c7,stroke:#f59e0b,color:#92400e;
  classDef sup fill:#fdf4ff,stroke:#d946ef,color:#86198f;
  class work,admin,ad1,ad2,ad4 sec;
  class ad3 sup;
  class site,s1,s2,s3,s4 pub;
`;
