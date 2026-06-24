// 로그인한 사용자 목록을 출력합니다 — 누구에게 admin 권한을 줄지 확인용.
// (슈퍼관리자는 이메일/비밀번호 SUPER_ADMIN_EMAIL 로 로그인합니다 — `npm run admin:hash`)
// 사용: npm run whoami  (한 번 이상 로그인한 뒤 실행)
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

let rs;
try {
  rs = await client.execute(
    "SELECT id, name, email, role, last_login_at FROM users ORDER BY last_login_at DESC",
  );
} catch {
  console.log("아직 users 테이블이 없습니다. 먼저 앱을 실행하고 카카오로 로그인하세요.");
  process.exit(0);
}

if (rs.rows.length === 0) {
  console.log("로그인 기록이 없습니다. 먼저 카카오로 로그인하세요.");
  process.exit(0);
}

console.log("\n로그인한 사용자 (최근순):\n");
for (const r of rs.rows) {
  const when = new Date(Number(r.last_login_at) * 1000).toLocaleString("ko-KR");
  console.log(`  ${r.id}`);
  console.log(
    `    이름: ${r.name ?? "-"} · 이메일: ${r.email ?? "-"} · 역할: ${r.role} · 최근 로그인: ${when}\n`,
  );
}
console.log(
  "슈퍼관리자로 로그인한 뒤, 워크스페이스 '사용자 관리'에서 위 사용자에게 admin 권한을 줄 수 있습니다.",
);
console.log("(슈퍼관리자 계정 설정: `npm run admin:hash` → .env 의 SUPER_ADMIN_EMAIL/PASSWORD_HASH)\n");
