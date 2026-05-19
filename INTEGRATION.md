# 🔧 Don Bosco Connect — Integration Guide

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-c96442?style=flat-square" alt="Version"/>
  <img src="https://img.shields.io/badge/status-production-059669?style=flat-square" alt="Status"/>
</p>

## 📋 Overview

Integration and deployment guide for system administrators.

---

## 🖥️ System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 16 GB | 32 GB |
| Storage | 50 GB SSD | 100 GB NVMe |
| OS | Ubuntu 22.04 / Debian 12 | Ubuntu 24.04 LTS |
| Docker | 24.0+ | 27.x |
| Network | 100 Mbps | 1 Gbps |

### Required Software
- **Docker** 24.0+ & Docker Compose v2
- **Ollama** (local AI engine)

---

## 🚀 Quick Start (Docker)

### 1. Clone & Configure

```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start Stack

```bash
./scripts/setup.sh    # Generate keys, SSL certs
docker compose up -d
```

### 3. Seed Demo Data

```bash
docker exec donbosco_api python scripts/init_db.py
```

### 4. Verify

```bash
./scripts/healthcheck.sh
curl http://localhost:8000/health
curl http://localhost:8080    # Frontend
```

---

## 🧩 Architecture

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Frontend │  │   API    │  │   DB     │  │  Ollama  │
│ :8080    │→│ :8000    │→│ :5432    │  │ :11434   │
│ React    │  │ FastAPI  │  │ PG + vec │  │ DeepSeek │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

| Service | Port | Purpose |
|---------|------|---------|
| `nginx` | 8080 | Reverse proxy, TLS, rate limiting |
| `api` | 8000 | FastAPI backend, REST + WebSocket |
| `frontend` | 80 | Static React SPA (served by nginx) |
| `db` | 5432 | PostgreSQL 16 + pgvector |
| `redis` | 6379 | Cache, session store, Celery broker |
| `minio` | 9000-9001 | S3-compatible file storage |
| `worker` | — | Celery async tasks |
| `ollama` | 11434 | Local LLM (external, configurable) |

---

## 🔐 Security Configuration

```bash
# Generate JWT secret (32 bytes hex)
openssl rand -hex 32

# Generate AES encryption key
openssl rand -hex 32

# Self-signed SSL (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/donbosco.key \
  -out nginx/ssl/donbosco.crt
```

### Key `.env` Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key (32 bytes hex) |
| `ENCRYPTION_KEY` | AES-256-GCM key |
| `DB_PASSWORD` | PostgreSQL password |
| `REDIS_PASSWORD` | Redis password |
| `MINIO_ROOT_PASSWORD` | MinIO admin password |
| `OLLAMA_BASE_URL` | Ollama server URL |
| `AI_DAILY_TOKEN_LIMIT_PER_STUDENT` | Per-student daily AI token cap |

---

## 🤖 Ollama Configuration

### Supported Models

| Model | Size | Use |
|-------|------|-----|
| `deepseek-r1-tool-calling:14b` | ~9 GB | Recommended (best accuracy) |
| `nomic-embed-text` | ~0.3 GB | Embeddings for RAG |

### Install Models

```bash
ollama pull deepseek-r1-tool-calling:14b
ollama pull nomic-embed-text
```

### Test

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "deepseek-r1-tool-calling:14b",
  "prompt": "Explique la photosynthèse"
}'
```

---

## 📊 Monitoring

```bash
# Grafana
open http://localhost:3001

# Prometheus
open http://localhost:9090

# Logs
docker compose logs -f
```

---

## 💾 Backup & Restore

```bash
# Backup
./scripts/backup.sh    # → /backups/donbosco_YYYYMMDD.sql

# Restore
docker compose exec -T db psql -U donbosco_user -d donbosco < backup.sql
```

---

## 🔄 Update

```bash
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🆘 Troubleshooting

| Problem | Check |
|---------|-------|
| API down | `docker compose logs api --tail=50` |
| DB corrupted | `docker compose down -v && docker compose up -d` |
| Ollama not responding | `curl http://localhost:11434/api/tags` |
| Files not loading | Check MinIO Console at `http://localhost:9001` |
| CORS errors | Verify `CORS_ORIGINS` in `.env` |

---

*© Collège Don Bosco Tunis — Usage interne*
