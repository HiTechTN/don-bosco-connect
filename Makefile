.PHONY: help dev dev-build dev-logs dev-stop up build build-no-cache down restart restart-api logs logs-api status health migrate migrate-new migrate-down migrate-check seed psql test test-cov test-fast lint lint-fix format typecheck lint-frontend shell-api shell-db redis-cli backup validate clean clean-all reset release release-apk push pull

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
	$(COMPOSE) exec api pytest app/tests/ -p no:xdist -v

test-cov: ## Run backend tests with coverage
	$(COMPOSE) exec api pytest app/tests/ -p no:xdist --cov=app --cov-report=term -v

test-fast: ## Run backend tests (quiet mode)
	$(COMPOSE) exec api pytest app/tests/ -p no:xdist -q

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

validate: ## Validate the project configuration
	./scripts/validate.sh

clean: ## Remove unused Docker resources
	docker system prune -f
	docker volume prune -f

clean-all: ## Remove ALL Docker resources for this project (WARNING: destroys data)
	$(COMPOSE) down -v --remove-orphans
	docker system prune -f

reset: ## Full reset (WARNING: destroys all data)
	@echo "⚠️  This will destroy ALL data (DB, Redis, MinIO, Ollama)"
	@read -p "Type RESET to confirm: " confirm && [ "$$confirm" = "RESET" ] && \
		$(COMPOSE) down -v --remove-orphans && \
		docker volume rm don-bosco-connect_redis_data don-bosco-connect_postgres_data don-bosco-connect_minio_data don-bosco-connect_ollama_data 2>/dev/null; \
		echo "✅ Reset complete"

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
