# AGENT PROMPT — Don Bosco Connect · Mise à niveau complète
> Copier-coller ce prompt en entier dans Claude Code, Cursor, Windsurf ou tout agent de coding.
> Ce prompt est **autonome** : aucune clarification ne sera demandée. L'agent exécute dans l'ordre et livre un projet fonctionnel.

---

## MISSION

Tu es un ingénieur senior full-stack. Tu reprends le projet **Don Bosco Connect** (`https://github.com/HiTechTN/don-bosco-connect`) et tu le mets à niveau vers un état **production-ready** sans interruption ni question. Tu travailles de manière séquentielle, phase par phase, en validant chaque étape avant de passer à la suivante. Le résultat final est un projet qui démarre avec `docker compose up -d` et passe tous ses tests.

---

## CONTEXTE DU PROJET

**Description** : Plateforme éducative IA 100% on-premise pour le Collège Don Bosco Tunis.
**Repo** : `HiTechTN/don-bosco-connect` · branche `main`
**Version actuelle** : 2.0.0 → **Version cible** : 2.1.0

**Stack complète** :
- Backend : FastAPI (Python 3.11) + SQLAlchemy 2.0 async + Alembic + Celery
- Frontend : React 18 + Vite + TypeScript (strict) + Tailwind CSS + shadcn/ui
- Mobile : React Native / Expo SDK 51
- DB : PostgreSQL 16 + pgvector · Redis 7.2 · MinIO
- AI : Ollama local (DeepSeek R1 14B + nomic-embed-text) · RAG · Quiz adaptatif
- Infra : Docker Compose · Nginx 1.25 · Prometheus + Grafana · GitHub Actions

**Rôles utilisateurs** : Admin · Enseignant · Élève · Parent

---

## RÈGLES ABSOLUES — NE JAMAIS VIOLER

1. **Zéro secret dans le code** : aucune clé, mot de passe ou token dans un fichier commité.
2. **Zéro `any` implicite** en TypeScript : `tsconfig.json` a `"strict": true`.
3. **Zéro fetch() direct** dans les composants React : tout passe par les hooks TanStack Query dans `src/hooks/`.
4. **Zéro régression fonctionnelle** : les 4 dashboards (admin/teacher/student/parent) restent opérationnels à chaque étape.
5. **Toute nouvelle route FastAPI** a un test pytest correspondant.
6. **Toute migration DB** passe par Alembic (`alembic revision --autogenerate`), jamais de DDL direct.
7. **Conventional Commits** pour chaque commit : `feat:`, `fix:`, `chore:`, `test:`, `docs:`.
8. Si un fichier n'existe pas encore, le créer. Si une dépendance manque, l'installer et mettre à jour le fichier requirements/package.json correspondant.

---

## PHASE 0 — SETUP & AUDIT INITIAL (avant tout code)

### 0.1 · Clone & vérification de l'état
```bash
git clone https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect
git log --oneline -10
docker compose config  # valider la syntaxe Docker Compose
```

### 0.2 · Inventaire des fichiers existants
Lister et lire les fichiers suivants avant toute modification :
- `docker-compose.yml` · `docker-compose.prod.yml` · `docker-compose.dev.yml`
- `backend/requirements.txt` · `backend/app/main.py`
- `frontend/package.json` · `frontend/src/lib/` (identifier le Mock API)
- `.env.example` · `.env.production` · `.gitignore`
- `scripts/setup.sh` · `scripts/backup.sh`
- `.github/workflows/ci.yml`

### 0.3 · Créer le fichier CLAUDE.md à la racine
Ce fichier est le contexte permanent pour tout agent futur :

```markdown
# CLAUDE.md — Don Bosco Connect

## Commandes essentielles
- Démarrer : `docker compose up -d`
- Tests backend : `cd backend && pytest --cov=app -v`
- Types frontend : `cd frontend && npx tsc --noEmit`
- Lint : `cd frontend && npx eslint src`
- Migration DB : `alembic revision --autogenerate -m "description"`
- Appliquer migration : `alembic upgrade head`

## Architecture
```
don-bosco-connect/
├── backend/app/
│   ├── api/v1/      # Routeurs REST (auth, users, grades, ai, absences, schedule)
│   ├── models/      # SQLAlchemy ORM
│   ├── schemas/     # Pydantic v2
│   ├── services/    # Business logic (séparé des routeurs)
│   ├── workers/     # Celery tasks
│   └── core/        # Config, security, database, deps
├── frontend/src/
│   ├── hooks/       # TanStack Query hooks (SEUL endroit qui appelle l'API)
│   ├── pages/       # Admin / Teacher / Student / Parent dashboards
│   ├── components/  # UI réutilisables
│   ├── types/       # Interfaces TypeScript
│   └── lib/         # Utils, constants (PAS de fetch ici)
├── mobile/src/
│   ├── screens/     # 22 écrans
│   └── hooks/       # Hooks partagés
└── scripts/         # Setup, backup, healthcheck
```

## Conventions
- Python : Black + isort + mypy strict
- TypeScript : strict:true, pas de any, interfaces > types pour les objets
- API responses : toujours Pydantic, jamais de dict raw
- Secrets : jamais dans le code, toujours depuis os.getenv()
- Tests : pytest-asyncio pour les routes async, factory-boy pour les fixtures

## Comptes de démo (dev uniquement)
Générés par `scripts/init_db.py` — voir `.env.example` pour la procédure.
```

---

## PHASE 1 — SÉCURITÉ CRITIQUE (jour 1 · non négociable)

### 1.1 · Purger .env.production de l'historique git

```bash
# Vérifier ce qui est exposé
cat .env.production

# Supprimer du tracking git
git rm --cached .env.production
echo ".env.production" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Si le fichier contient de vrais secrets : purger l'historique complet
pip install git-filter-repo
git filter-repo --path .env.production --invert-paths --force

# Commit
git add .gitignore
git commit -m "chore: remove .env.production from tracking and history"
```

### 1.2 · Créer un .env.example propre et complet

Créer/mettre à jour `.env.example` avec **toutes** les variables nécessaires, valeurs vides ou placeholders :

```env
# ============================================================
# Don Bosco Connect — Variables d'environnement
# Copier ce fichier en .env et remplir les valeurs
# JAMAIS commiter le .env rempli
# ============================================================

# --- Application ---
APP_ENV=development
APP_VERSION=2.1.0
DEBUG=false

# --- Base de données ---
DATABASE_URL=postgresql+asyncpg://donbosco:CHANGE_ME@db:5432/donbosco_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# --- Sécurité JWT ---
# Générer avec : openssl rand -hex 32
SECRET_KEY=CHANGE_ME_RUN_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# --- MFA / TOTP ---
MFA_ISSUER=DonBoscoConnect

# --- Redis ---
REDIS_URL=redis://redis:6379/0
REDIS_CACHE_TTL=3600

# --- MinIO (stockage fichiers) ---
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=CHANGE_ME
MINIO_SECRET_KEY=CHANGE_ME
MINIO_BUCKET_DOCS=donbosco-documents
MINIO_SECURE=false

# --- IA / Ollama ---
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=deepseek-r1-tool-calling:14b
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_TIMEOUT=120

# --- Celery ---
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# --- Sentry (optionnel, laisser vide pour désactiver) ---
SENTRY_DSN=
SENTRY_ENVIRONMENT=production

# --- Backup ---
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# --- Frontend (Vite) ---
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws
VITE_APP_VERSION=2.1.0
```

### 1.3 · Mettre à jour scripts/setup.sh pour générer les secrets

Dans `scripts/setup.sh`, ajouter la génération automatique :

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🔐 Don Bosco Connect — Configuration sécurisée"

if [ -f .env ]; then
  echo "⚠️  .env existe déjà. Sauvegarder et continuer? (y/N)"
  read -r answer
  [ "$answer" != "y" ] && exit 1
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

cp .env.example .env

# Générer les secrets automatiquement
SECRET_KEY=$(openssl rand -hex 32)
MINIO_ACCESS_KEY=$(openssl rand -hex 16)
MINIO_SECRET_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 24)

sed -i "s/CHANGE_ME_RUN_openssl_rand_hex_32/$SECRET_KEY/" .env
sed -i "s/MINIO_ACCESS_KEY=CHANGE_ME/MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY/" .env
sed -i "s/MINIO_SECRET_KEY=CHANGE_ME/MINIO_SECRET_KEY=$MINIO_SECRET_KEY/" .env
sed -i "s/donbosco:CHANGE_ME/donbosco:$DB_PASSWORD/" .env

echo "✅ Secrets générés automatiquement dans .env"
echo "📋 Notez ces valeurs (elles ne s'afficheront plus) :"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY"
```

### 1.4 · Configurer le backup automatisé

Dans `docker-compose.prod.yml`, ajouter le service backup :

```yaml
  backup:
    image: prodrigestivill/postgres-backup-local:16
    restart: unless-stopped
    volumes:
      - ./backups:/backups
    environment:
      - POSTGRES_HOST=db
      - POSTGRES_DB=${POSTGRES_DB:-donbosco_db}
      - POSTGRES_USER=${POSTGRES_USER:-donbosco}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - SCHEDULE=${BACKUP_SCHEDULE:-0 2 * * *}
      - BACKUP_KEEP_DAYS=${BACKUP_RETENTION_DAYS:-30}
      - BACKUP_KEEP_WEEKS=4
      - BACKUP_KEEP_MONTHS=3
    depends_on:
      - db
```

**Validation Phase 1** :
```bash
git status  # .env.production ne doit PAS apparaître
grep -r "admin123\|teacher123\|SECRET_KEY.*=.*[a-f0-9]\{32\}" backend/ frontend/  # doit retourner vide
docker compose config  # doit valider sans erreur
```

---

## PHASE 2 — CONNEXION BACKEND RÉELLE (jours 2–6)

### 2.1 · Analyser et identifier le Mock API

```bash
find frontend/src/lib -name "*.ts" -o -name "*.tsx" | xargs grep -l "mock\|Mock\|fake\|Fake\|dummy" 2>/dev/null
grep -r "setTimeout\|Math.random\|mockData\|fakeData" frontend/src/ --include="*.ts" --include="*.tsx" -l
```

### 2.2 · Installer TanStack Query v5

```bash
cd frontend
npm install @tanstack/react-query@^5 @tanstack/react-query-devtools@^5
```

### 2.3 · Créer le QueryClient et le Provider

Créer `frontend/src/lib/queryClient.ts` :
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

Créer `frontend/src/lib/apiClient.ts` — le seul endroit qui fait des appels HTTP :
```typescript
const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    // Tenter le refresh token
    const refreshed = await attemptRefresh()
    if (refreshed) {
      return request<T>(path, options)
    }
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    throw new ApiError(401, 'Session expirée')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, error.detail ?? 'Erreur serveur')
  }

  if (res.status === 204) return {} as T
  return res.json()
}

async function attemptRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    return true
  } catch {
    return false
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```

### 2.4 · Créer les hooks TanStack Query pour chaque domaine

Créer `frontend/src/hooks/useAuth.ts` :
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { User, LoginRequest, TokenResponse } from '@/types'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<User>('/auth/me'),
    enabled: !!localStorage.getItem('access_token'),
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<TokenResponse>('/auth/login', data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      qc.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/auth/logout', {}),
    onSettled: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      qc.clear()
      window.location.href = '/login'
    },
  })
}
```

Créer de la même façon (même pattern) :
- `frontend/src/hooks/useGrades.ts` → endpoints `/grades`
- `frontend/src/hooks/useAbsences.ts` → endpoints `/absences`
- `frontend/src/hooks/useSchedule.ts` → endpoints `/schedule`
- `frontend/src/hooks/useUsers.ts` → endpoints `/users`
- `frontend/src/hooks/useAI.ts` → endpoints `/ai`
- `frontend/src/hooks/useMessages.ts` → endpoints `/messages`
- `frontend/src/hooks/useGamification.ts` → endpoints `/gamification`

### 2.5 · Remplacer le Mock API dans tous les composants

Pour chaque composant qui importe depuis `lib/mockApi` ou utilise `setTimeout` pour simuler des données :
1. Identifier l'import
2. Remplacer par le hook TanStack Query correspondant
3. Gérer les états `isLoading`, `isError`, `data` explicitement

Pattern de remplacement :
```typescript
// AVANT (mock)
const [data, setData] = useState(mockGrades)
useEffect(() => { setTimeout(() => setData(realData), 500) }, [])

// APRÈS (TanStack Query)
const { data, isLoading, isError } = useGrades()
if (isLoading) return <GradesSkeleton />
if (isError) return <ErrorMessage />
```

### 2.6 · Wrapper l'app avec QueryClientProvider

Dans `frontend/src/main.tsx` :
```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
)
```

**Validation Phase 2** :
```bash
cd frontend && npx tsc --noEmit  # zéro erreur TypeScript
grep -r "mockApi\|setTimeout.*setData\|Math.random" src/ --include="*.tsx" --include="*.ts"
# Le résultat doit être vide (ou uniquement dans __mocks__/)
npm run build  # build de production doit réussir
```

---

## PHASE 3 — STREAMING IA & WEBSOCKET (jours 7–11)

### 3.1 · Streaming SSE pour l'assistant IA (FastAPI)

Dans `backend/app/api/v1/ai.py`, remplacer la route `/chat` par une version streaming :

```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.services.ai_service import AIService
from app.schemas.ai import ChatRequest
import json

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    current_user = Depends(get_current_user),
    ai_service: AIService = Depends(),
):
    """Endpoint SSE : retourne les tokens au fur et à mesure."""
    async def event_generator():
        try:
            async for token in ai_service.stream_response(
                message=request.message,
                user_id=current_user.id,
                context_type=request.context_type,
            ):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Désactiver le buffering Nginx
        },
    )
```

Dans `backend/app/services/ai_service.py`, implémenter `stream_response` :
```python
import httpx
from typing import AsyncIterator

async def stream_response(
    self,
    message: str,
    user_id: int,
    context_type: str,
) -> AsyncIterator[str]:
    """Stream les tokens depuis Ollama."""
    context = await self._get_rag_context(message, user_id)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{self.ollama_url}/api/chat",
            json={
                "model": self.model,
                "messages": [
                    {"role": "system", "content": self._system_prompt(context)},
                    {"role": "user", "content": message},
                ],
                "stream": True,
            },
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    data = json.loads(line)
                    if token := data.get("message", {}).get("content"):
                        yield token
```

### 3.2 · Hook React pour le streaming SSE

Créer `frontend/src/hooks/useAIStream.ts` :
```typescript
import { useState, useCallback, useRef } from 'react'

interface StreamState {
  content: string
  isStreaming: boolean
  error: string | null
}

export function useAIStream() {
  const [state, setState] = useState<StreamState>({
    content: '',
    isStreaming: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string, contextType = 'general') => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState({ content: '', isStreaming: true, error: null })

    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/v1/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, context_type: contextType }),
        signal: abortRef.current.signal,
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.done) {
            setState(s => ({ ...s, isStreaming: false }))
            return
          }
          if (data.error) throw new Error(data.error)
          if (data.token) {
            setState(s => ({ ...s, content: s.content + data.token }))
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState(s => ({ ...s, isStreaming: false, error: err.message }))
      }
    }
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setState(s => ({ ...s, isStreaming: false }))
  }, [])

  return { ...state, sendMessage, abort }
}
```

### 3.3 · WebSocket FastAPI + Redis Pub/Sub

Dans `backend/app/api/v1/websocket.py` :
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.core.security import verify_ws_token
from app.core.redis import get_redis
import asyncio
import json

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: str = Query(...),
):
    # Vérifier le JWT passé en query param (headers non supportés dans WS)
    payload = verify_ws_token(token)
    if not payload or payload.get("sub") != str(user_id):
        await websocket.close(code=4001)
        return

    await websocket.accept()
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe(f"user:{user_id}", "broadcast")

    try:
        async def listen():
            async for msg in pubsub.listen():
                if msg["type"] == "message":
                    await websocket.send_text(msg["data"].decode())

        listen_task = asyncio.create_task(listen())
        # Garder la connexion vivante
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        listen_task.cancel()
        await pubsub.unsubscribe(f"user:{user_id}", "broadcast")
```

Créer `frontend/src/hooks/useWebSocket.ts` :
```typescript
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

type WSMessage = {
  type: 'notification' | 'grade' | 'absence' | 'message' | 'ping'
  payload?: unknown
}

export function useWebSocket(userId: number | undefined) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  const qc = useQueryClient()

  const connect = useCallback(() => {
    if (!userId) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    const wsUrl = `${import.meta.env.VITE_WS_URL}/${userId}?token=${token}`
    ws.current = new WebSocket(wsUrl)

    ws.current.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data)
      if (msg.type === 'ping') return

      // Invalider les caches concernés
      if (msg.type === 'grade') qc.invalidateQueries({ queryKey: ['grades'] })
      if (msg.type === 'absence') qc.invalidateQueries({ queryKey: ['absences'] })
      if (msg.type === 'message') qc.invalidateQueries({ queryKey: ['messages'] })
    }

    ws.current.onclose = () => {
      // Reconnexion exponentielle avec cap à 30s
      const delay = Math.min(1000 * 2 ** (ws.current as any)._retries ?? 1, 30000)
      reconnectTimeout.current = setTimeout(connect, delay)
    }

    ws.current.onerror = () => ws.current?.close()
  }, [userId, qc])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeout.current)
      ws.current?.close()
    }
  }, [connect])
}
```

### 3.4 · Nginx — configuration WebSocket

Dans `nginx/nginx.conf`, ajouter dans le bloc `location /ws/` :
```nginx
location /ws/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

**Validation Phase 3** :
```bash
# Tester le streaming
curl -N -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Explique la photosynthèse","context_type":"general"}' \
  http://localhost:8080/api/v1/ai/chat/stream
# Doit streamer les tokens ligne par ligne
```

---

## PHASE 4 — TESTS & CI/CD (jours 12–15)

### 4.1 · Configuration pytest complète

Créer/mettre à jour `backend/pytest.ini` :
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
filterwarnings =
    ignore::DeprecationWarning
    ignore::PendingDeprecationWarning
```

Créer `backend/pyproject.toml` (section coverage) :
```toml
[tool.coverage.run]
source = ["app"]
omit = ["app/migrations/*", "tests/*"]

[tool.coverage.report]
fail_under = 70
show_missing = true
```

### 4.2 · Tests pour toutes les routes critiques

Structure `backend/tests/` :
```
tests/
├── conftest.py          # Fixtures globales (db, client, users)
├── test_auth.py         # Login, refresh, logout, MFA
├── test_grades.py       # CRUD notes, permissions par rôle
├── test_absences.py     # Créer, justifier, statistiques
├── test_ai.py           # Chat, RAG, streaming
├── test_users.py        # Admin CRUD utilisateurs
└── test_schedule.py     # Emploi du temps
```

`backend/tests/conftest.py` :
```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db
from app.core.security import create_access_token
from app.models import Base, User

DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5433/test_db"

@pytest.fixture(scope="session")
async def engine():
    e = create_async_engine(DATABASE_URL, echo=False)
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield e
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await e.dispose()

@pytest.fixture
async def db(engine):
    Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(db):
    async def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
async def admin_token(db):
    # Créer un user admin de test et retourner son token
    return create_access_token({"sub": "1", "role": "admin"})

@pytest.fixture
async def teacher_token(db):
    return create_access_token({"sub": "2", "role": "teacher"})

@pytest.fixture
async def student_token(db):
    return create_access_token({"sub": "3", "role": "student"})
```

`backend/tests/test_auth.py` (exemple minimal, étendre pour tous les cas) :
```python
import pytest

class TestAuth:
    async def test_login_success(self, client, db):
        res = await client.post("/api/v1/auth/login", json={
            "email": "admin@donbosco.tn",
            "password": "ValidPassword1!"
        })
        assert res.status_code == 200
        assert "access_token" in res.json()
        assert "refresh_token" in res.json()

    async def test_login_wrong_password(self, client):
        res = await client.post("/api/v1/auth/login", json={
            "email": "admin@donbosco.tn",
            "password": "wrong"
        })
        assert res.status_code == 401

    async def test_protected_route_without_token(self, client):
        res = await client.get("/api/v1/auth/me")
        assert res.status_code == 401

    async def test_protected_route_with_token(self, client, admin_token):
        res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200

    async def test_rate_limiting_login(self, client):
        for _ in range(5):
            await client.post("/api/v1/auth/login", json={
                "email": "x@x.tn", "password": "wrong"
            })
        res = await client.post("/api/v1/auth/login", json={
            "email": "x@x.tn", "password": "wrong"
        })
        assert res.status_code == 429
```

### 4.3 · GitHub Actions CI — mise à jour

Mettre à jour `.github/workflows/ci.yml` :
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5433:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 5
      redis:
        image: redis:7.2-alpine
        ports: ["6379:6379"]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: pip
      - run: pip install -r backend/requirements.txt
      - name: Vérifier migrations Alembic
        working-directory: backend
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5433/test_db
        run: alembic upgrade head && alembic check
      - name: Tests avec couverture
        working-directory: backend
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5433/test_db
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test-secret-key-for-ci-only
        run: |
          pytest --cov=app --cov-report=xml --cov-fail-under=70 -v
      - uses: codecov/codecov-action@v4
        with:
          file: backend/coverage.xml

  frontend-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: cd frontend && npm ci
      - name: TypeScript strict check
        run: cd frontend && npx tsc --noEmit
      - name: ESLint
        run: cd frontend && npx eslint src --ext .ts,.tsx --max-warnings 0
      - name: Build production
        run: cd frontend && npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Bandit (vulnérabilités Python)
        run: |
          pip install bandit safety
          bandit -r backend/app -ll
      - name: Safety (dépendances vulnérables)
        run: safety check -r backend/requirements.txt
      - name: Vérifier absence de secrets dans le repo
        run: |
          pip install detect-secrets
          detect-secrets scan --baseline .secrets.baseline
```

**Validation Phase 4** :
```bash
cd backend && pytest --cov=app --cov-report=term --cov-fail-under=70 -v
# Doit afficher coverage >= 70% et tous les tests GREEN
cd frontend && npx tsc --noEmit && npx eslint src --max-warnings 0
# Zéro erreur
```

---

## PHASE 5 — CACHE IA & OPTIMISATIONS (jours 16–18)

### 5.1 · Cache des embeddings par hash SHA256

Dans `backend/app/services/rag_service.py` :
```python
import hashlib
import json
from app.core.redis import get_redis

class RAGService:
    async def get_or_create_embeddings(
        self,
        file_content: bytes,
        document_id: int,
    ) -> list[list[float]]:
        """Retourne les embeddings du cache si le fichier n'a pas changé."""
        file_hash = hashlib.sha256(file_content).hexdigest()
        cache_key = f"embeddings:{document_id}:{file_hash}"

        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        # Calculer les embeddings
        chunks = self._split_into_chunks(file_content.decode("utf-8", errors="ignore"))
        embeddings = await self._compute_embeddings(chunks)

        # Mettre en cache 24h
        await redis.setex(cache_key, 86400, json.dumps(embeddings))

        # Stocker dans pgvector
        await self._store_in_pgvector(document_id, chunks, embeddings)

        return embeddings
```

### 5.2 · Cache Redis pour les requêtes fréquentes

Dans `backend/app/api/v1/schedule.py`, ajouter le cache :
```python
from app.core.redis import get_redis
import json

@router.get("/schedule/{class_id}")
async def get_schedule(
    class_id: int,
    current_user = Depends(get_current_user),
):
    redis = await get_redis()
    cache_key = f"schedule:{class_id}"
    
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    schedule = await schedule_service.get_by_class(class_id)
    result = [s.model_dump() for s in schedule]
    await redis.setex(cache_key, 3600, json.dumps(result))  # Cache 1h
    return result
```

---

## PHASE 6 — LIVRAISON FINALE (jours 19–20)

### 6.1 · Mettre à jour docker-compose.prod.yml complet

S'assurer que tous les services ont :
- `restart: unless-stopped`
- `healthcheck` configuré
- `mem_limit` défini
- Variables d'environnement depuis `.env` (pas hardcodées)

### 6.2 · Mettre à jour le CHANGELOG.md

Créer/mettre à jour `CHANGELOG.md` :
```markdown
# Changelog

## [2.1.0] — 2026-05

### 🔐 Sécurité
- Suppression de .env.production de l'historique git
- Génération automatique des secrets dans setup.sh
- Backup PostgreSQL automatisé (02h00 quotidien, retention 30j)
- Scan automatique Bandit + Safety + detect-secrets en CI

### 🔌 Architecture
- Remplacement complet du Mock API par TanStack Query v5
- Connexion frontend-backend entièrement opérationnelle
- Service layer unifié dans src/hooks/

### ⚡ Performance
- Streaming SSE pour l'assistant IA (TTFT réduit de ~10s à <1s)
- Cache Redis embeddings pgvector par SHA256 (évite recalcul)
- Cache emplois du temps et données statiques (TTL 1h)

### 🔔 Temps réel
- WebSocket FastAPI + Redis Pub/Sub pour notifications
- Reconnexion automatique avec backoff exponentiel côté React
- Nginx configuré pour les connexions WebSocket longue durée

### 🧪 Qualité
- Couverture tests backend : ≥ 70% enforced en CI
- TypeScript strict mode validé en CI (zéro any implicite)
- Alembic check obligatoire avant tout déploiement
- Tests pour toutes les routes critiques (auth, grades, absences, AI)
```

### 6.3 · Script de validation finale

Créer `scripts/validate.sh` :
```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Don Bosco Connect — Validation production"
echo ""

ERRORS=0

# 1. Secrets
echo "1/6 Vérification secrets..."
if git ls-files | xargs grep -l "SECRET_KEY.*=.*[a-f0-9]\{32\}" 2>/dev/null | grep -v ".example"; then
  echo "❌ Secrets détectés dans le repo"
  ERRORS=$((ERRORS+1))
else
  echo "✅ Aucun secret dans le repo"
fi

# 2. Tests backend
echo "2/6 Tests backend..."
cd backend
if pytest --cov=app --cov-fail-under=70 -q 2>&1 | tail -1 | grep -q "passed"; then
  echo "✅ Tests backend OK"
else
  echo "❌ Tests backend échoués ou coverage insuffisant"
  ERRORS=$((ERRORS+1))
fi
cd ..

# 3. TypeScript
echo "3/6 TypeScript strict..."
cd frontend
if npx tsc --noEmit 2>&1 | grep -q "error"; then
  echo "❌ Erreurs TypeScript détectées"
  ERRORS=$((ERRORS+1))
else
  echo "✅ TypeScript OK"
fi
cd ..

# 4. Build frontend
echo "4/6 Build production frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
  echo "✅ Build frontend OK"
else
  echo "❌ Build frontend échoué"
  ERRORS=$((ERRORS+1))
fi
cd ..

# 5. Docker Compose
echo "5/6 Configuration Docker Compose..."
if docker compose config > /dev/null 2>&1; then
  echo "✅ Docker Compose valide"
else
  echo "❌ Docker Compose invalide"
  ERRORS=$((ERRORS+1))
fi

# 6. Stack complète
echo "6/6 Démarrage de la stack..."
docker compose up -d --wait
sleep 5
if curl -sf http://localhost:8080/health > /dev/null; then
  echo "✅ API accessible"
else
  echo "❌ API inaccessible"
  ERRORS=$((ERRORS+1))
fi
docker compose down

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 VALIDATION RÉUSSIE — Projet prêt pour la production"
  exit 0
else
  echo "💥 $ERRORS problème(s) détecté(s) — Corriger avant livraison"
  exit 1
fi
```

---

## CRITÈRES DE SUCCÈS — DÉFINITION DU DONE

Le projet est considéré livré quand **toutes** ces conditions sont vraies :

| # | Critère | Comment vérifier |
|---|---------|-----------------|
| 1 | `.env.production` absent du repo et de l'historique | `git log --all -- .env.production` retourne vide |
| 2 | `docker compose up -d` démarre sans erreur | Tous les services `healthy` dans `docker ps` |
| 3 | Les 4 dashboards (admin/teacher/student/parent) sont fonctionnels | Login avec comptes générés par `init_db.py` |
| 4 | L'assistant IA stream les tokens | Voir les tokens apparaître progressivement dans l'UI |
| 5 | Coverage backend ≥ 70% | `pytest --cov=app --cov-fail-under=70` passe en vert |
| 6 | TypeScript zéro erreur | `tsc --noEmit` retourne rien |
| 7 | Build frontend réussit | `npm run build` sans erreur |
| 8 | CI GitHub Actions passe | Tous les jobs verts sur la branche main |
| 9 | Aucun Mock API dans le frontend | `grep -r "mockApi" src/` retourne vide |
| 10 | Backup automatisé configuré | Service `backup` présent dans `docker-compose.prod.yml` |

---

## EN CAS DE BLOCAGE

Si une intégration échoue pour une raison technique (ex: endpoint FastAPI absent, schéma DB différent de ce qui est attendu) :
1. Lire le code existant dans `backend/app/api/v1/` pour comprendre l'implémentation réelle
2. Adapter le hook TanStack Query correspondant au schéma réel (ne pas inventer les types — les déduire des modèles Pydantic existants)
3. Si un endpoint n'existe pas, le créer dans FastAPI avec son test pytest avant de connecter le frontend
4. Ne jamais bloquer — si une feature est bloquée, la marquer `// TODO: BLOCKED — [raison]` et passer à la suivante

**Priorité absolue si le temps manque** : Phases 1 (sécurité) et 2 (connexion réelle) avant tout.

---

*Don Bosco Connect · Upgrade Brief v2.1.0 · HiTech TN · Mai 2026*
