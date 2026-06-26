// .env 를 process.env 로 먼저 로드한 뒤 next 를 실행합니다.
// 왜 래퍼가 필요한가:
//   `node --env-file=.env next ...` 처럼 node 플래그로 주입하면, next dev 가
//   워커를 띄울 때 부모 execArgv 를 NODE_OPTIONS 로 전파하는데 --env-file 류는
//   NODE_OPTIONS 화이트리스트에 없어 "not allowed in NODE_OPTIONS" 로 죽습니다.
//   → 여기서 env 만 채우고(execArgv 는 비움) next 를 자식으로 실행하면 PORT 등이
//     정상 주입되고 워커 전파 문제도 없습니다.
// 사용: node scripts/run-next.mjs dev | start | build ...
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile(".env"); // Node 20.12+ 내장

const nextBin = "node_modules/next/dist/bin/next";
const { status } = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});
process.exit(status ?? 0);
