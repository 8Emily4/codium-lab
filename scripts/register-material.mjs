// 강의자료 등록/수정 — stdin 으로 받은 JSON 1건을 materials 테이블에 INSERT/UPDATE.
// devskills 의 "기술검토등록" 패턴을 codium-lab(libSQL)에 맞춘 버전.
//
// 사용:
//   echo '<JSON>' | node --env-file-if-exists=.env.local scripts/register-material.mjs
//
// 입력(JSON 단일 객체):
//   id?       — 있으면 수정, 없으면 신규
//   title     — (신규 시 필수) 제목
//   summary?  — 한 줄 요약
//   body?     — 본문 마크다운
//   status?   — draft | published | archived (기본 draft)
//   access?   — public(무료) | restricted(유료) (기본 restricted)
//   price?    — 유료 자료의 가격(원, 정수). 무료(public)면 무시되어 NULL 저장.
//   category? — 분류
//   tags?     — string[]
//   authorName? — 작성자명
//
// 출력(stdout): {"id":"...","ok":true,"action":"created"|"updated","title":"..."}
import { createClient } from "@libsql/client";
import { randomUUID } from "node:crypto";

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
if (!raw.trim()) fail("stdin 으로 JSON 을 전달하세요.");

let data;
try {
  data = JSON.parse(raw);
} catch {
  fail("JSON 파싱 실패");
}
if (!data || typeof data !== "object") fail("JSON 객체가 아닙니다.");
if (!data.id && !data.title) fail("신규 등록에는 title 이 필요합니다.");

const STATUS = ["draft", "published", "archived"];
const ACCESS = ["public", "restricted"];

const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    body TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    access TEXT NOT NULL DEFAULT 'restricted',
    category TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    author_id TEXT,
    author_name TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

// price 컬럼은 나중에 추가됨 — 기존 테이블에도 멱등하게 보강(앱 ensureSchema 와 동일).
const info = await client.execute(`PRAGMA table_info(materials)`);
if (!info.rows.some((r) => String(r.name) === "price")) {
  await client.execute(`ALTER TABLE materials ADD COLUMN price INTEGER`);
}

const tags = Array.isArray(data.tags)
  ? JSON.stringify(data.tags.map(String))
  : undefined;
const status = STATUS.includes(data.status) ? data.status : undefined;
const access = ACCESS.includes(data.access) ? data.access : undefined;
// 가격: 유료(restricted)일 때만 의미 있음. 숫자만 남겨 정수화, 무료면 null.
function normPrice(raw, acc) {
  if (acc === "public") return null;
  if (raw == null || raw === "") return undefined; // 미전달 → 수정 시 변경 안 함
  const digits = String(raw).replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Math.floor(Number(digits));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
const price = normPrice(data.price, access);

if (data.id) {
  // 수정 — 전달된 필드만 갱신
  const sets = [];
  const args = [];
  const set = (col, val) => {
    if (val !== undefined) {
      sets.push(`${col} = ?`);
      args.push(val);
    }
  };
  set("title", data.title);
  set("summary", data.summary ?? undefined);
  set("body", data.body);
  set("status", status);
  set("access", access);
  set("price", price);
  set("category", data.category ?? undefined);
  set("tags", tags);
  set("author_name", data.authorName);
  if (sets.length === 0) fail("수정할 필드가 없습니다.");
  sets.push("updated_at = unixepoch()");
  args.push(data.id);
  const rs = await client.execute({
    sql: `UPDATE materials SET ${sets.join(", ")} WHERE id = ? RETURNING id, title`,
    args,
  });
  if (rs.rows.length === 0) fail(`id 를 찾을 수 없습니다: ${data.id}`);
  process.stdout.write(
    JSON.stringify({
      id: String(rs.rows[0].id),
      ok: true,
      action: "updated",
      title: String(rs.rows[0].title),
    }) + "\n",
  );
} else {
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO materials
            (id, title, summary, body, status, access, price, category, tags, author_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.title,
      data.summary ?? null,
      data.body ?? "",
      status ?? "draft",
      access ?? "restricted",
      price ?? null,
      data.category ?? null,
      tags ?? "[]",
      data.authorName ?? null,
    ],
  });
  process.stdout.write(
    JSON.stringify({ id, ok: true, action: "created", title: data.title }) + "\n",
  );
}
