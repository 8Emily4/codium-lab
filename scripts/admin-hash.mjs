// 슈퍼관리자 비밀번호를 scrypt 해시로 만들어 .env 에 넣을 줄을 출력합니다.
// 사용:
//   npm run admin:hash            (입력 프롬프트, 화면에 안 보임)
//   npm run admin:hash -- 비밀번호  (빠르지만 셸 히스토리에 남으니 주의)
import { scryptSync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline";

function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

// 입력을 화면에 표시하지 않는(masked) 프롬프트.
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    let first = true;
    rl._writeToOutput = (str) => {
      if (first) {
        rl.output.write(str);
        first = false;
      } else if (str.includes("\n") || str.includes("\r")) {
        rl.output.write(str);
      }
      // 그 외(타이핑 글자)는 출력하지 않음
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const argPw = process.argv[2];
const password = argPw ?? (await askHidden("슈퍼관리자 비밀번호 입력: "));

if (!password || password.length < 8) {
  console.error("\n비밀번호는 8자 이상이어야 합니다.");
  process.exit(1);
}

const hash = hashPassword(password);
console.log("\n아래 두 줄을 .env (배포 시 Vercel 환경변수)에 넣으세요:\n");
console.log("SUPER_ADMIN_EMAIL=you@example.com");
console.log(`SUPER_ADMIN_PASSWORD_HASH=${hash}\n`);
console.log("로그인: /ko/login → '관리자 로그인' (또는 /ko/login/admin)\n");
