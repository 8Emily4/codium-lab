.PHONY: help setup install up dev build dev-build start lint clean reinstall

help:
	@echo "Available targets:"
	@echo "  setup      - Install dependencies (npm install)"
	@echo "  install    - Alias for setup"
	@echo "  up         - Start dev server (next dev)"
	@echo "  dev        - Alias for up"
	@echo "  build      - Production build (next build)"
	@echo "  dev-build  - Build then start dev server"
	@echo "  start      - Start production server (next start)"
	@echo "  lint       - Run eslint"
	@echo "  clean      - Remove .next build output"
	@echo "  reinstall  - Remove node_modules and reinstall"

setup:
	npm install

install: setup

up:
	npm run dev

dev: up

build:
	npm run build

dev-build: build up

start:
	npm run start

lint:
	npm run lint

clean:
	rm -rf .next

reinstall:
	rm -rf node_modules package-lock.json
	npm install
