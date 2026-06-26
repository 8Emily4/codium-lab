.PHONY: help setup install env up dev build dev-build start lint typecheck clean reinstall

help: ## 도움말 표시
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

# --- Setup ---

setup: ## 최초 설치 (.env 생성 + 의존성 설치)
	@if [ ! -f .env ]; then cp .env.example .env && echo ".env 파일 생성됨 — 필요시 수정하세요"; else echo ".env 이미 존재"; fi
	npm install

install: setup ## setup 별칭

env: ## .env 가 없으면 .env.example 에서 생성
	@if [ ! -f .env ]; then cp .env.example .env && echo ".env 생성됨"; else echo ".env 이미 존재"; fi

reinstall: ## node_modules·lock 삭제 후 재설치
	rm -rf node_modules package-lock.json
	npm install

# --- Lifecycle ---

up: ## 개발 서버 시작 (.env 의 PORT, 기본 http://localhost:10380)
	npm run dev

dev: up ## up 별칭

build: ## 프로덕션 빌드 (next build)
	npm run build

dev-build: build up ## 빌드 후 개발 서버 시작

start: ## 프로덕션 서버 시작 (next start)
	npm run start

# --- Quality ---

lint: ## ESLint 실행
	npm run lint

typecheck: ## 타입 체크 (tsc --noEmit)
	npx tsc --noEmit

# --- Clean ---

clean: ## .next 빌드 산출물 삭제
	rm -rf .next
