.PHONY: help install dev dev-build dev-logs dev-stop dev-restart dev-status up build build-no-cache down restart restart-api logs logs-api status health health-check-all migrate migrate-new migrate-down migrate-check seed psql test test-cov test-fast test-e2e test-integration test-all lint lint-fix format typecheck lint-frontend shell-api shell-db redis-cli backup backup-dev validate clean clean-all reset release release-apk push pull

# Default target
.DEFAULT_GOAL := help

# Compose files
DEV_COMPOSE := docker compose -f docker-compose.yml -f docker-compose.dev.yml
PROD_COMPOSE := docker compose -f docker-compose.yml -f docker-compose.prod.yml
COMPOSE := docker compose

# ─── Development ────────────────────────────────────────────────────────────────

help: ## Show this help message
	@echo ""
	@echo "Don Bosco Connect — Development Commands"
	@echo "========================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Initialize project for new developers (creates .env, starts services)
	@echo ""
	@echo "\033[1;36m═══ Don Bosco Connect — Project Setup ═══\033[0m"
	@echo ""
	@test -f .env && echo "\033[1;33m⚠️  .env already exists, skipping setup\033[0m" || \
		(bash scripts/setup.sh)
	@echo ""
	@echo "\033[1;36m═══ Starting Development Environment ═══\033[0m"
	@echo ""
	@$(DEV_COMPOSE) up -d
	@echo ""
	@echo "\033[1;32m✅ Project initialized and running!\033[0m"
	@echo "   API:     http://localhost:8000/docs"
	@echo "   Nginx:   http://localhost:80"
	@echo "   HTTPS:   https://localhost:8443"
	@echo "   Flower:  http://localhost:5555"
	@echo "   Grafana: http://localhost:3000"
	@echo ""

dev: ## Start in development mode (hot-reload)
	$(DEV_COMPOSE) up -d
	@echo "✅ Development server running"
	@echo "   API:   http://localhost:8000/docs"
	@echo "   Nginx: http://localhost:80"
	@echo "   HTTPS: https://localhost:8443"

dev-build: ## Build and start in development mode
	$(DEV_COMPOSE) up -d --build

dev-logs: ## Tail development logs
	$(DEV_COMPOSE) logs -f api worker

dev-stop: ## Stop development services
	$(DEV_COMPOSE) down

dev-restart: ## Restart all dev services (api, worker, beat)
	$(DEV_COMPOSE) restart api worker beat
	@echo "✅ Dev services restarted (api, worker, beat)"

dev-status: ## Show dev container status and check all health endpoints
	@echo ""
	@echo "\033[1;36m═══ Dev Container Status ═══\033[0m"
	@echo ""
	@$(DEV_COMPOSE) ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'
	@echo ""
	@echo "\033[1;36m═══ Health Checks ═══\033[0m"
	@echo ""
	@printf "  API (localhost:8000)     "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" http://localhost:8000/health || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@printf "  Nginx (localhost:80)     "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" http://localhost:80 || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@printf "  HTTPS (localhost:8443)   "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" -k https://localhost:8443 || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@printf "  Redis                   "; $(DEV_COMPOSE) exec -T redis redis-cli -a "$${REDIS_PASSWORD}" ping 2>/dev/null | grep -q PONG && printf "\033[1;32mPONG\033[0m" || printf "\033[1;31mNOT RESPONDING\033[0m"; echo ""
	@printf "  PostgreSQL              "; $(DEV_COMPOSE) exec -T db pg_isready -U donbosco_user -d donbosco >/dev/null 2>&1 && printf "\033[1;32mREADY\033[0m" || printf "\033[1;31mNOT READY\033[0m"; echo ""
	@printf "  MinIO (localhost:9000)  "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" http://localhost:9000/minio/health/live || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@echo ""

# ─── Production ─────────────────────────────────────────────────────────────────

up: ## Start in production mode
	$(COMPOSE) up -d
	@echo "✅ Production server running"
	@echo "   API:   http://localhost:8000/docs"
	@echo "   HTTPS: https://localhost:8443"

build: ## Build all Docker images
	$(COMPOSE) build

build-no-cache: ## Build all images without cache
	$(COMPOSE) build --no-cache

down: ## Stop all services
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

restart-api: ## Restart only the API service
	$(COMPOSE) restart api

# ─── Logs & Status ──────────────────────────────────────────────────────────────

logs: ## Tail all service logs
	$(COMPOSE) logs -f

logs-api: ## Tail API logs only
	$(COMPOSE) logs -f api

status: ## Show container status
	$(COMPOSE) ps

health: ## Check API health endpoint
	@curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "API not reachable"

health-check-all: ## Check all service health endpoints (API, Redis, DB, MinIO)
	@echo ""
	@echo "\033[1;36m═══ Service Health Checks ═══\033[0m"
	@echo ""
	@printf "  API (localhost:8000)     "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" http://localhost:8000/health || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@printf "  Nginx (localhost:80)     "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" http://localhost:80 || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@printf "  HTTPS (localhost:8443)   "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" -k https://localhost:8443 || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@printf "  Redis                   "; $(COMPOSE) exec -T redis redis-cli -a "$${REDIS_PASSWORD}" ping 2>/dev/null | grep -q PONG && printf "\033[1;32mPONG\033[0m" || printf "\033[1;31mNOT RESPONDING\033[0m"; echo ""
	@printf "  PostgreSQL              "; $(COMPOSE) exec -T db pg_isready -U donbosco_user -d donbosco >/dev/null 2>&1 && printf "\033[1;32mREADY\033[0m" || printf "\033[1;31mNOT READY\033[0m"; echo ""
	@printf "  MinIO (localhost:9000)  "; curl -s -o /dev/null -w "\033[1;32mHTTP %{http_code}\033[0m" http://localhost:9000/minio/health/live || printf "\033[1;31mUNREACHABLE\033[0m"; echo ""
	@echo ""

# ─── Database ───────────────────────────────────────────────────────────────────

migrate: ## Run Alembic migrations
	$(COMPOSE) exec api alembic upgrade head

migrate-new: ## Generate a new Alembic migration (usage: make migrate-new MSG="description")
	ifndef MSG
		$(error MSG is required. Usage: make migrate-new MSG="add foo bar")
	endif
	$(COMPOSE) exec api alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Downgrade one migration step
	$(COMPOSE) exec api alembic downgrade -1

migrate-check: ## Check for pending migrations
	$(COMPOSE) exec api alembic check

seed: ## Seed the database with demo data
	$(COMPOSE) exec api python scripts/init_db.py

psql: ## Open psql shell in the database
	$(COMPOSE) exec db psql -U donbosco_user -d donbosco

# ─── Testing ────────────────────────────────────────────────────────────────────

test: ## Run backend tests
	$(COMPOSE) exec api python -m pytest app/tests/ -p no:xdist -v

test-cov: ## Run backend tests with coverage
	$(COMPOSE) exec api python -m pytest app/tests/ -p no:xdist --cov=app --cov-report=term -v

test-fast: ## Run backend tests (quiet mode)
	$(COMPOSE) exec api python -m pytest app/tests/ -p no:xdist -q

test-e2e: ## Run Playwright E2E tests (starts Vite dev server)
	@echo "" && \
	echo "\033[1;36m═══ E2E Tests (Playwright) ═══\033[0m" && \
	echo "" && \
	cd frontend && npx vite --port 5173 &>/tmp/vite-dev.log & \
	VITE_PID=$$! && \
	echo "  ⏳ Waiting for Vite dev server (port 5173)..." && \
	i=0; while [ $$i -lt 15 ] && ! curl -s -o /dev/null http://localhost:5173 2>/dev/null; do i=$$((i+1)); sleep 1; done && \
	echo "  🧪 Running Playwright tests..." && \
	(cd frontend && npx playwright test --reporter=list); \
	EXIT=$$?; \
	kill $$VITE_PID 2>/dev/null || true; \
	if [ $$EXIT -ne 0 ]; then echo "\033[1;31m❌ E2E tests failed (exit $$EXIT)\033[0m"; exit $$EXIT; fi; \
	echo "\033[1;32m✅ E2E tests passed\033[0m"

test-integration: ## Run all integration tests (backend + frontend typecheck + E2E)
	@FAILED=0; \
	echo "" && \
	echo "\033[1;36m═══ Integration Test Suite ═══\033[0m" && \
	echo "" && \
	echo "\033[1;36m[1/3] Backend Tests\033[0m" && \
	echo "─────────────────────────────────" && \
	($(COMPOSE) exec api python -m pytest app/tests/ -p no:xdist -v) || FAILED=1; \
	echo "" && \
	echo "\033[1;36m[2/3] Frontend Typecheck\033[0m" && \
	echo "─────────────────────────────────" && \
	(cd frontend && npx tsc --noEmit) || FAILED=1; \
	echo "" && \
	echo "\033[1;36m[3/3] E2E Tests (Playwright)\033[0m" && \
	echo "─────────────────────────────────" && \
	cd frontend && npx vite --port 5173 &>/tmp/vite-dev.log & \
	VITE_PID=$$! && \
	i=0; while [ $$i -lt 15 ] && ! curl -s -o /dev/null http://localhost:5173 2>/dev/null; do i=$$((i+1)); sleep 1; done && \
	(cd frontend && npx playwright test --reporter=list) || FAILED=1; \
	kill $$VITE_PID 2>/dev/null || true; \
	echo ""; \
	if [ $$FAILED -ne 0 ]; then echo "\033[1;31m❌ Integration tests FAILED\033[0m"; exit 1; fi; \
	echo "\033[1;32m✅ All integration tests passed\033[0m"

test-all: test-integration ## Run all tests (alias for test-integration)

lint: ## Lint backend code with ruff
	cd backend && python3 -m ruff check app/

lint-fix: ## Auto-fix lint issues
	cd backend && python3 -m ruff check --fix app/

format: ## Format backend code
	cd backend && python3 -m ruff format app/

typecheck: ## Type-check frontend
	cd frontend && npx tsc --noEmit

lint-frontend: ## Lint frontend code
	cd frontend && npx eslint src/

# ─── Utilities ──────────────────────────────────────────────────────────────────

shell-api: ## Open a shell in the API container
	$(COMPOSE) exec api /bin/bash

shell-db: ## Open a shell in the database container
	$(COMPOSE) exec db /bin/bash

redis-cli: ## Open redis-cli in the Redis container
	$(COMPOSE) exec redis redis-cli -a "$${REDIS_PASSWORD}"

backup: ## Backup the database
	./scripts/backup.sh

backup-dev: ## Backup dev database and Redis to timestamped directory
	@TS=$$(date +%Y%m%d_%H%M%S) && \
		BACKUP_DIR="backups/$$TS" && \
		mkdir -p "$$BACKUP_DIR" && \
		echo "\033[1;36m═══ Dev Backup ($$TS) ═══\033[0m" && \
		echo "" && \
		echo "  📦 Backing up PostgreSQL..." && \
		$(DEV_COMPOSE) exec -T db pg_dump -U donbosco_user -d donbosco -F c > "$$BACKUP_DIR/postgres.dump" && \
		echo "  ✅ PostgreSQL saved to $$BACKUP_DIR/postgres.dump" || \
		(echo "  ❌ PostgreSQL backup failed" && exit 1) && \
		echo "" && \
		echo "  📦 Backing up Redis..." && \
		$(DEV_COMPOSE) exec -T redis redis-cli -a "$${REDIS_PASSWORD}" LASTSAVE > "$$BACKUP_DIR/redis_before.txt" && \
		$(DEV_COMPOSE) exec -T redis redis-cli -a "$${REDIS_PASSWORD}" BGSAVE >/dev/null 2>&1 && \
		sleep 2 && \
		$(DEV_COMPOSE) exec -T redis redis-cli -a "$${REDIS_PASSWORD}" LASTSAVE > "$$BACKUP_DIR/redis_lastsave.txt" && \
		echo "  ✅ Redis saved to $$BACKUP_DIR/redis_lastsave.txt" || \
		(echo "  ❌ Redis backup failed" && exit 1) && \
		echo "" && \
		echo "\033[1;32m✅ Dev backup complete: $$BACKUP_DIR/\033[0m"

validate: ## Validate the project configuration
	./scripts/validate.sh

clean: ## Remove unused Docker resources
	docker system prune -f
	docker volume prune -f

clean-all: ## Remove ALL Docker resources for this project (WARNING: destroys data)
	$(COMPOSE) down -v --remove-orphans
	docker system prune -f

reset: ## Full reset (WARNING: destroys all data)
	@echo ""
	@echo "\033[1;31m⚠️  WARNING: This will destroy ALL data:\033[0m"
	@echo "    - PostgreSQL database (donbosco)"
	@echo "    - Redis cache and data"
	@echo "    - MinIO storage"
	@echo "    - Ollama models"
	@echo ""
	@read -p "Type 'RESET' to confirm: " confirm; \
		if [ "$$confirm" != "RESET" ]; then \
			echo "\033[1;31m❌ Aborted. You typed '$$confirm' instead of 'RESET'.\033[0m"; \
			exit 1; \
		fi; \
		echo "\033[1;33m🗑️  Stopping containers and removing volumes...\033[0m"; \
		$(COMPOSE) down -v --remove-orphans; \
		docker volume rm don-bosco-connect_redis_data don-bosco-connect_postgres_data don-bosco-connect_minio_data don-bosco-connect_ollama_data 2>/dev/null || true; \
		echo "\033[1;32m✅ Reset complete. All data destroyed.\033[0m"

# ─── Releases ───────────────────────────────────────────────────────────────────

release: ## Create a new release tag (usage: make release TAG=v2.4.0)
	git tag -a $(TAG) -m "Release $(TAG)"
	git push origin $(TAG)
	@echo "✅ Tag $(TAG) pushed — GitHub Actions will create the release"

release-apk: ## Build release APK locally
	@test -d mobile/android || (echo "Error: Run 'npx expo prebuild' first" && exit 1)
	cd mobile/android && ./gradlew assembleRelease
	@echo "✅ APK built at mobile/android/app/build/outputs/apk/release/app-release.apk"

# ─── Git Shortcuts ──────────────────────────────────────────────────────────────

push: ## Push to origin
	git push origin main

pull: ## Pull latest from origin
	git pull origin main
