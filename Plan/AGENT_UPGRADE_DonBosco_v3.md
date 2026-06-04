# PROMPT MAÎTRE v3.0 — Don Bosco Connect
## Mise à niveau Premium · Production-Ready · Portail Public

> **Basé sur audit réel du dépôt HiTechTN/don-bosco-connect (commit courant, juin 2026)**
> **Stack confirmée :** FastAPI 0.115 · SQLAlchemy 2.0 · React 18/Vite · React Native/Expo SDK 52 · PostgreSQL 16 + pgvector · Redis 7.2 · Celery 5.3 · MinIO · Nginx · Prometheus/Grafana · Docker Compose

---

## CONTEXTE AUDIT — État réel du repo

### ✅ Ce qui existe et fonctionne
- Architecture Docker Compose complète (12 services, health checks, networks isolés)
- `backend/app/` : structure FastAPI async correcte (models, schemas, api/v1, workers, services)
- `frontend/src/` : React + Vite + Tailwind + shadcn/ui + TanStack Query
- `mobile/` : React Native / Expo SDK 52, 22 écrans, navigation configurée
- CI/CD GitHub Actions (ci.yml, deploy-pages.yml, publish.yml)
- README trilingue (FR/EN/AR), RUNBOOK.md, DEPLOYMENT_ROADMAP.md
- APK mobile publié (release v1.0.0-mobile-20260519)

### 🚨 Problèmes critiques confirmés (à corriger en ÉTAPE 0)
1. **`.env.production` commité publiquement** avec `SECRET_KEY`, `ADMIN_PASSWORD=admin123`, `SERVER_IP` en clair
2. **`demo_backend.py`** : `hash()` Python utilisé comme hash cryptographique ; endpoint `/auth/refresh` retourne un token sans vérification ; fallback `SELECT * FROM users LIMIT 1` si JWT invalide ; `CORS allow_origins=["*"]`
3. **Docker Compose** : Ollama (:11434), API (:8002), MinIO (:9000/:9001), Flower (:5555) exposés directement à l'hôte sans auth ni TLS
4. **Nginx sur port 8081, pas de TLS** — JWT transitent en clair sur le réseau

### ⚠️ Lacunes fonctionnelles identifiées
- Le frontend utilise encore des mock data dans `src/lib/` (confirmé par README : "Mock API, services")
- Aucun module Annonces/Portail public dans le repo actuel
- Pipeline RAG réel non validé (présent dans le code mais non testé E2E)
- Aucun test automatisé constaté dans les dossiers `tests/`

---

## ORDRE D'EXÉCUTION OBLIGATOIRE

```
ÉTAPE 0 : Sécurité critique (BLOQUANTE — ne pas commencer autre chose avant)
ÉTAPE 1 : Connexion frontend ↔ API réelle (remplacer les mocks)
ÉTAPE 2 : Portail public + Module Annonces (Back + Front)
ÉTAPE 3 : Hardening sécurité avancé (CSP, XSS, cookies, audit)
ÉTAPE 4 : Tests automatisés + CI green
ÉTAPE 5 : Observabilité & Go-Live checklist
```

---

# ÉTAPE 0 — URGENCE SÉCURITÉ (Jour 1, avant tout commit)

### 0.1 Purge des secrets du dépôt Git

```bash
# Supprimer .env.production de tout l'historique
brew install bfg  # ou : apt install bfg
git clone --mirror https://github.com/HiTechTN/don-bosco-connect.git
cd don-bosco-connect.git
bfg --delete-files .env.production
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Dans le repo de travail :
echo ".env.production" >> .gitignore
echo ".env" >> .gitignore
git rm --cached .env.production 2>/dev/null || true
git commit -m "security: purge .env.production from history"
```

### 0.2 Rotation des secrets compromis

Sur le serveur cible (192.168.0.100), exécuter **immédiatement** :

```bash
# Nouveau SECRET_KEY
NEW_KEY=$(openssl rand -hex 32)
echo "Nouveau SECRET_KEY: $NEW_KEY"

# Nouveau mot de passe admin (bcrypt) — dans Python :
python3 -c "from passlib.context import CryptContext; c=CryptContext(schemes=['bcrypt'], deprecated='auto'); print(c.hash('NouveauMotDePasse!2026'))"

# Mettre à jour .env sur le serveur (jamais commité)
# Invalider TOUTES les sessions Redis existantes :
redis-cli -a $REDIS_PASSWORD FLUSHDB
```

### 0.3 Corriger `demo_backend.py` — 4 failles précises

```python
# FICHIER : demo_backend.py

# ❌ FAILLE 1 — hash() n'est pas cryptographique
token_hash = str(hash(token_raw))
# ✅ CORRECTION
import hashlib
token_hash = hashlib.sha256(token_raw.encode()).hexdigest()

# ❌ FAILLE 2 — Refresh sans vérification
async def refresh(body: RefreshRequest):
    return {"access_token": create_access_token("demo", "admin"), ...}
# ✅ CORRECTION
async def refresh(body: RefreshRequest):
    token_hash = hashlib.sha256(body.refresh_token.encode()).hexdigest()
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM refresh_tokens WHERE token_hash=? AND revoked_at IS NULL AND expires_at > ?",
        (token_hash, datetime.now(timezone.utc).isoformat())
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Refresh token invalide")
    return {"access_token": create_access_token(row["user_id"], "student"), "refresh_token": body.refresh_token}

# ❌ FAILLE 3 — Fallback utilisateur si JWT invalide
user = conn.execute("SELECT * FROM users LIMIT 1").fetchone()
# ✅ CORRECTION
if not user_id:
    raise HTTPException(status_code=401, detail="Token invalide")

# ❌ FAILLE 4 — CORS trop permissif
allow_origins=["*"]
# ✅ CORRECTION
allow_origins=["https://hitechtn.github.io", "http://localhost:5173", "http://localhost:3000"]
```

### 0.4 Corriger `docker-compose.yml` — Fermer les ports exposés

```yaml
# FICHIER : docker-compose.yml
# Retirer les mappings de ports dangereux, garder uniquement expose:

ollama:
  # ❌ Supprimer : ports: ["11434:11434"]
  expose: ["11434"]

api:
  # ❌ Supprimer : ports: ["8002:8000"]
  expose: ["8000"]

minio:
  # ❌ Supprimer : ports: ["9000:9000", "9001:9001"]
  expose: ["9000", "9001"]
  # La console MinIO passe par nginx uniquement

flower:
  # ❌ Supprimer : ports: ["5555:5555"]
  expose: ["5555"]
  command: >
    celery -A app.workers.celery_app flower --port=5555
    --basic_auth=${FLOWER_USER}:${FLOWER_PASSWORD}
```

### 0.5 Activer TLS dans Nginx

```yaml
# docker-compose.yml — nginx
nginx:
  ports:
    - "80:80"
    - "443:443"   # ← ajouter
```

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name donbosco.local;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name donbosco.local;
    ssl_certificate     /etc/nginx/ssl/donbosco.crt;
    ssl_certificate_key /etc/nginx/ssl/donbosco.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Headers sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=public:10m rate=60r/s;

    location /api/v1/auth/login  { limit_req zone=login burst=3 nodelay; proxy_pass http://api:8000; }
    location /api/v1/public/     { limit_req zone=public burst=20 nodelay; proxy_pass http://api:8000; }
    location /api/               { limit_req zone=api burst=50 nodelay; proxy_pass http://api:8000; }
    location /ws/                { proxy_pass http://api:8000; proxy_http_version 1.1;
                                    upgrade $http_upgrade; connection "Upgrade"; }
    location /                   { proxy_pass http://frontend:80; }
}
```

**Critère de sortie Étape 0 :** `git log --all -- .env.production` retourne vide. `docker compose up` : zéro port exposé sauf nginx :80/:443. Failles demo_backend corrigées.

---

# ÉTAPE 1 — Connexion Frontend ↔ API Réelle

> **Constat audit :** `frontend/src/lib/` contient des mocks. Les dashboards affichent des données fictives. Cette étape connecte le frontend au vrai backend.

### 1.1 Remplacer le mock API client

```typescript
// FICHIER : frontend/src/lib/api.ts — REMPLACER l'implémentation mock par :
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,    // si migration cookies HttpOnly (voir Étape 3)
  timeout: 10_000,
});

// Intercepteur refresh token automatique
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post('/api/v1/auth/refresh',
          { refresh_token: localStorage.getItem('refresh_token') });
        localStorage.setItem('access_token', data.access_token);
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(error.config);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 1.2 Variables d'environnement frontend

```bash
# frontend/.env.local (jamais commité)
VITE_API_URL=https://donbosco.local/api/v1
VITE_WS_URL=wss://donbosco.local/ws/v1

# frontend/.env.example (commité)
VITE_API_URL=https://donbosco.local/api/v1
VITE_WS_URL=wss://donbosco.local/ws/v1
```

### 1.3 Remplacer les hooks par TanStack Query réels

```typescript
// PATTERN à appliquer sur tous les hooks existants :
// Avant (mock) :
const useUsers = () => ({ data: MOCK_USERS, isLoading: false });

// Après (API réelle) :
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useUsers = (params?: { role?: string; search?: string }) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => api.get('/users', { params }).then(r => r.data),
    staleTime: 30_000,
  });
```

**Fichiers prioritaires à connecter :**
- `src/pages/admin/` → users, classes, analytics
- `src/pages/teacher/` → courses, grades, absences
- `src/pages/student/` → grades, quiz, ai-chat
- `src/pages/parent/` → absences, grades, messages

**Critère de sortie Étape 1 :** Aucun import de données depuis `src/lib/mock*` dans les pages. Dashboard admin affiche des données PostgreSQL réelles. Tests manuels des 4 profils validés.

---

# ÉTAPE 2 — Portail Public + Module Annonces

## 2.1 Migration base de données

```sql
-- FICHIER : backend/alembic/versions/0003_announcements.py
-- Exécuter via : alembic upgrade head

CREATE TABLE announcements (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        VARCHAR(255) NOT NULL,
    title_ar     VARCHAR(255),
    slug         VARCHAR(255) UNIQUE NOT NULL,
    excerpt      TEXT,
    excerpt_ar   TEXT,
    content_json JSONB NOT NULL DEFAULT '{}',    -- TipTap JSON
    content_html TEXT,                            -- Cache HTML sanitisé
    category     VARCHAR(50) NOT NULL DEFAULT 'general',
    tags         TEXT[]   DEFAULT '{}',
    status       VARCHAR(20) NOT NULL DEFAULT 'draft',
    visibility   VARCHAR(20) NOT NULL DEFAULT 'public',
    allowed_roles TEXT[] DEFAULT '{}',
    pinned       BOOLEAN DEFAULT FALSE,
    priority     SMALLINT DEFAULT 0,
    cover_image_url TEXT,
    attachments  JSONB DEFAULT '[]',             -- [{name, url, size, mime_type}]
    views_count  INTEGER DEFAULT 0,
    publish_at   TIMESTAMPTZ,
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcement_reactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji           VARCHAR(10) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(announcement_id, user_id, emoji)
);

CREATE INDEX idx_ann_status_visibility ON announcements(status, visibility);
CREATE INDEX idx_ann_publish_at        ON announcements(publish_at);
CREATE INDEX idx_ann_slug              ON announcements(slug);
CREATE INDEX idx_ann_pinned            ON announcements(pinned, priority DESC);
```

## 2.2 API Backend

### Endpoints publics (sans auth)

```python
# FICHIER : backend/app/api/v1/public.py
# Monter sur le router SANS dépendance auth

from fastapi import APIRouter, Query
from app.services.announcement_service import AnnouncementService

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/announcements")
async def list_public_announcements(
    page: int = 1,
    per_page: int = 12,
    category: str | None = None,
    q: str | None = None,
):
    """
    Retourne UNIQUEMENT status='published' ET visibility='public'
    ET (publish_at IS NULL OR publish_at <= NOW()).
    Ne jamais exposer : created_by, allowed_roles, content_json brut.
    """
    return await AnnouncementService.list_public(page, per_page, category, q)

@router.get("/announcements/{slug}")
async def get_public_announcement(slug: str):
    """Incrémente views_count. Retourne content_html sanitisé (jamais content_json)."""
    return await AnnouncementService.get_public_by_slug(slug)
```

### Endpoints admin (RBAC admin uniquement)

```python
# FICHIER : backend/app/api/v1/announcements.py
# Routes admin : création, édition, publication, upload

@router.post("/")                    # Créer (draft par défaut)
@router.get("/")                     # Lister tout (draft+published+archived)
@router.get("/{id}")                 # Détails complets
@router.patch("/{id}")               # Modifier
@router.post("/{id}/publish")        # Publier (status → published, log audit)
@router.post("/{id}/archive")        # Archiver
@router.delete("/{id}")              # Supprimer (soft delete)
@router.post("/{id}/cover")          # Upload image cover → MinIO
@router.post("/{id}/attachments")    # Upload pièces jointes → MinIO
@router.delete("/{id}/attachments/{key}")  # Supprimer pièce jointe

# Réactions (auth requis, tout rôle)
@router.post("/{id}/reactions")      # Body: {emoji: "👍"}
@router.delete("/{id}/reactions/{emoji}")
@router.get("/{id}/reactions")       # Agrégat : {👍: 12, ❤️: 5}
```

### Service anti-XSS (obligatoire pour le rich text)

```python
# FICHIER : backend/app/services/announcement_service.py

import bleach
from bleach.linkifier import LinkifyFilter

# Allowlist stricte — PAS de script, iframe, form, onX
ALLOWED_TAGS = [
    'p','br','strong','em','u','s','h1','h2','h3','h4',
    'ul','ol','li','blockquote','pre','code',
    'a','img','table','thead','tbody','tr','th','td',
    'hr','span','div',
]
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    '*': ['class'],
}

def sanitize_html(html: str) -> str:
    """Sanitise le HTML issu du rendu TipTap avant stockage/affichage."""
    return bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True,
        strip_comments=True,
    )

async def render_and_sanitize(content_json: dict) -> str:
    """Convertit TipTap JSON → HTML → sanitise → retourne."""
    # Utiliser tiptap-renderer ou une lib Python équivalente
    # puis passer par sanitize_html()
    ...
```

## 2.3 Portail Public — Frontend

### Structure des routes

```typescript
// FICHIER : frontend/src/App.tsx — Ajouter les routes publiques

// Routes publiques (pas de guard)
<Route path="/"                  element={<PublicLayout />}>
  <Route index                   element={<HomePage />} />
  <Route path="annonces"         element={<AnnouncesPage />} />
  <Route path="annonces/:slug"   element={<AnnounceDetailPage />} />
  <Route path="login"            element={<LoginPage />} />
</Route>

// Routes privées (guard obligatoire)
<Route path="/app" element={<PrivateGuard><AppLayout /></PrivateGuard>}>
  ...dashboards existants...
</Route>
```

### Page d'accueil publique — Sections

```typescript
// FICHIER : frontend/src/pages/public/HomePage.tsx

// Section 1 : Hero
// - Logo Don Bosco + nom établissement
// - Slogan (i18n FR/AR/EN)
// - CTA primaire "Se connecter à l'espace scolaire"
// - Image/illustration de l'établissement (lazy loaded)
// - Fond : couleurs institutionnelles (bleu Don Bosco)

// Section 2 : À propos (condensé)
// - Mission / Valeurs / Historique
// - 3 chiffres clés (élèves, enseignants, années d'existence)

// Section 3 : Dernières annonces (3 cartes)
// - Données depuis GET /api/v1/public/announcements?per_page=3
// - Skeleton loader pendant chargement
// - CTA "Voir toutes les annonces"

// Section 4 : Événements à venir (si données disponibles)
// - Source : GET /api/v1/public/announcements?category=evenement

// Section 5 : Footer
// - Adresse, téléphone, email
// - Liens : Mentions légales, Contact, Politique RGPD
// - Icônes réseaux sociaux (si applicable)
```

### Design system — Tokens obligatoires

```typescript
// FICHIER : frontend/src/lib/tokens.ts

export const tokens = {
  colors: {
    primary:    '#1B4F72',   // Bleu Don Bosco institutionnel
    secondary:  '#F39C12',   // Doré accent
    surface:    '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    border:     '#E2E8F0',
    text:       '#1E293B',
    textMuted:  '#64748B',
    success:    '#10B981',
    danger:     '#EF4444',
    warning:    '#F59E0B',
  },
  fonts: {
    heading: "'Syne', sans-serif",    // Import Google Fonts
    body:    "'Instrument Serif', serif",
    mono:    "'DM Mono', monospace",
  },
  radius: { sm: '4px', md: '8px', lg: '12px', xl: '20px', full: '9999px' },
  shadow: {
    card:  '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
    hover: '0 10px 25px rgba(0,0,0,.12)',
  },
};
```

### Composant AnnouncementCard

```typescript
// FICHIER : frontend/src/components/public/AnnouncementCard.tsx

interface AnnouncementCardProps {
  title: string;
  excerpt: string;
  category: string;
  coverImageUrl?: string;
  publishAt: string;
  slug: string;
  pinned?: boolean;
  reactions?: Record<string, number>;
}

// Rendu :
// - Badge catégorie (couleur par type)
// - Épingle si pinned
// - Image cover (lazy, aspect-ratio 16/9, fallback dégradé)
// - Titre (2 lignes max, ellipsis)
// - Excerpt (3 lignes max)
// - Date formatée (i18n)
// - Réactions agrégées en bas (lecture seule sur la liste)
// - Hover : shadow + translateY(-2px) transition
// - Skeleton identique au layout card pendant chargement
```

### Page détail annonce

```typescript
// FICHIER : frontend/src/pages/public/AnnounceDetailPage.tsx

// SEO : <Helmet> avec title, description, og:image, og:type=article
// Structure :
// - Hero : cover image full width + overlay gradient + titre dessus
// - Meta : date, catégorie, temps de lecture estimé
// - Contenu : dangerouslySetInnerHTML du content_html (déjà sanitisé serveur)
// - Pièces jointes : liste downloadable
// - Réactions : si user connecté → boutons emoji actifs ; sinon → CTA "Connectez-vous pour réagir"
// - Partage : copie du lien (Web Share API si dispo, fallback clipboard)
// - Navigation : "← Annonce précédente" / "Annonce suivante →"
// - Bloc "Autres annonces" (3 cartes, même catégorie)
```

## 2.4 Admin UI Annonces

```typescript
// FICHIER : frontend/src/pages/admin/AnnouncementsPage.tsx

// Liste avec filtres :
// - Tabs : Tout | Brouillons | Publiées | Archivées
// - Filtre catégorie, pinned toggle, recherche titre
// - Colonne "Planifiée le" si publish_at défini
// - Actions bulk : archiver sélectionnées

// FICHIER : frontend/src/pages/admin/AnnouncementEditorPage.tsx
// Éditeur complet :
// - Champ titre + auto-génération slug (modifiable)
// - Excerpt (textarea, 160 chars max avec compteur)
// - Sélecteur catégorie + tags (input chips)
// - Sélecteur visibility + rôles autorisés (affiché si role_based)
// - Toggle pinned + input priority (si pinned)
// - Date/heure publication planifiée (DateTimePicker)
// - Upload cover image (drag & drop, preview immédiate)
// - Upload pièces jointes (multi-fichiers, liste avec suppression)
// - Éditeur TipTap (rich text) + onglet Preview (rendu HTML)
// - Boutons : "Enregistrer brouillon" / "Publier maintenant" / "Planifier"
```

### Dépendances à installer

```bash
# Backend
pip install bleach tiptap-python python-slugify  --break-system-packages

# Frontend
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image \
  @tiptap/extension-link @tiptap/extension-placeholder \
  react-helmet-async framer-motion date-fns
```

**Critère de sortie Étape 2 :** Admin crée une annonce, la publie, et elle apparaît sur `/annonces` sans reload manuel. Les annonces `visibility=authenticated` ne sont PAS visibles sur le portail public. Aucun `content_json` brut retourné par l'API publique.

---

# ÉTAPE 3 — Hardening Sécurité Avancé

## 3.1 Migration tokens → Cookies HttpOnly

```python
# FICHIER : backend/app/api/v1/auth.py

from fastapi import Response

@router.post("/login")
async def login(body: LoginRequest, response: Response):
    ...
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,         # HTTPS uniquement
        samesite="strict",
        max_age=900,         # 15 minutes
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/api/v1/auth/refresh",  # Restreindre le chemin
        max_age=604800,      # 7 jours
    )
    return {"user": user_data}  # Pas de token dans le body

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    # Invalider refresh_token en DB
    return {"ok": True}
```

```typescript
// FICHIER : frontend/src/lib/api.ts — adapter axios
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // Envoyer les cookies automatiquement
  // ❌ Supprimer : headers Authorization: Bearer
});
// ❌ Supprimer localStorage.setItem('access_token', ...)
```

## 3.2 CSP stricte compatible SPA + TipTap

```nginx
# nginx/nginx.conf — dans le bloc server 443
add_header Content-Security-Policy "
  default-src 'self';
  script-src  'self';
  style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src    'self' https://fonts.gstatic.com;
  img-src     'self' data: blob: https://minio.donbosco.local;
  connect-src 'self' wss://donbosco.local;
  frame-src   'none';
  object-src  'none';
  base-uri    'self';
  form-action 'self';
" always;
```

## 3.3 Tests XSS — 10 payloads obligatoires

```python
# FICHIER : backend/app/tests/test_xss_sanitization.py

import pytest
from app.services.announcement_service import sanitize_html

XSS_PAYLOADS = [
    ('<script>alert(1)</script>',                          ''),
    ('<img src=x onerror=alert(1)>',                       '<img src="x" alt="">'),
    ('<a href="javascript:alert(1)">click</a>',            '<a>click</a>'),
    ('<p onmouseover="alert(1)">text</p>',                 '<p>text</p>'),
    ('<iframe src="https://evil.com">',                    ''),
    ('<svg onload=alert(1)>',                              ''),
    ('<!--<script>alert(1)</script>-->',                   ''),
    ('<form action="https://evil.com"><input></form>',     ''),
    ('<meta http-equiv="refresh" content="0;url=evil">',  ''),
    ('<div style="background:url(javascript:alert(1))">',  '<div>'),
]

@pytest.mark.parametrize("payload,expected_not_contains", XSS_PAYLOADS)
def test_xss_payload_sanitized(payload, expected_not_contains):
    result = sanitize_html(payload)
    assert 'script' not in result.lower()
    assert 'javascript:' not in result.lower()
    assert 'onerror' not in result.lower()
    assert 'onload' not in result.lower()
    assert '<iframe' not in result.lower()
    assert '<form' not in result.lower()
```

## 3.4 Audit logs pour toutes les actions admin annonces

```python
# FICHIER : backend/app/api/v1/announcements.py — dans chaque endpoint admin

from app.services.audit_service import log_audit

@router.post("/{id}/publish")
async def publish_announcement(id: UUID, current_user: User = Depends(get_admin)):
    ann = await AnnouncementService.publish(id)
    await log_audit(
        user_id=current_user.id,
        action="announcement.publish",
        resource_type="announcement",
        resource_id=id,
        metadata={"title": ann.title, "visibility": ann.visibility}
    )
    return ann
```

**Critère de sortie Étape 3 :** Aucun cookie accessible via `document.cookie`. CSP bloque les scripts inline en dev tools. Les 10 tests XSS passent. Tous les logs admin visibles dans `/api/v1/admin/audit`.

---

# ÉTAPE 4 — Tests automatisés + CI Green

## 4.1 Tests backend (pytest)

```bash
# FICHIER : backend/app/tests/test_announcements.py

# Cas à couvrir obligatoirement :
# [ ] GET /public/announcements ne retourne que status=published + visibility=public
# [ ] GET /public/announcements ne retourne JAMAIS content_json
# [ ] GET /public/announcements ne retourne JAMAIS les annonces draft
# [ ] GET /public/announcements ne retourne JAMAIS les annonces publish_at dans le futur
# [ ] POST /announcements (admin) → crée en draft
# [ ] POST /announcements/{id}/publish → status passe à published
# [ ] POST /announcements/{id}/reactions (élève) → fonctionne
# [ ] POST /announcements/{id}/reactions (non connecté) → 401
# [ ] Upload cover image > 10Mo → 413
# [ ] Upload cover image .exe → 415

pytest backend/app/tests/ -v --cov=app --cov-fail-under=65
```

## 4.2 Tests E2E Playwright

```typescript
// FICHIER : e2e/public-portal.spec.ts

test('Portail public accessible sans auth', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Don Bosco');
  await page.click('text=Voir toutes les annonces');
  await expect(page).toHaveURL('/annonces');
});

test('Annonce publiée visible sur le portail', async ({ page }) => {
  // Prérequis : annonce "Test Public" créée via API dans beforeAll
  await page.goto('/annonces');
  await expect(page.locator('[data-testid="announce-card"]').first()).toBeVisible();
  await page.click('[data-testid="announce-card"]');
  await expect(page.url()).toMatch(/\/annonces\/.+/);
});

test('Annonce privée invisible sans auth', async ({ page }) => {
  await page.goto('/annonces');
  // L'annonce visibility=authenticated ne doit pas apparaître
  await expect(page.locator('text=Annonce Privée')).not.toBeVisible();
});

test('Admin peut créer et publier une annonce', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'admin@donbosco.tn');
  await page.fill('[name=password]', process.env.ADMIN_PASSWORD!);
  await page.click('[type=submit]');
  await page.goto('/app/admin/announcements/new');
  await page.fill('[name=title]', 'Annonce E2E Test');
  await page.click('text=Publier maintenant');
  await expect(page.locator('text=Publiée')).toBeVisible();
});
```

## 4.3 GitHub Actions — Mise à jour CI

```yaml
# FICHIER : .github/workflows/ci.yml — Ajouter les étapes manquantes

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check no secrets committed
        run: |
          if git log --all -- .env.production | grep -q commit; then
            echo "ERREUR: .env.production détecté dans l'historique Git!"
            exit 1
          fi
      - name: Check .env.production in .gitignore
        run: grep -q ".env.production" .gitignore || (echo "ERREUR: .env.production absent du .gitignore" && exit 1)

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
      redis:
        image: redis:7.2-alpine
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/app/tests/ --cov=app --cov-fail-under=65 -v

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx playwright install --with-deps
      - run: docker compose -f docker-compose.dev.yml up -d
      - run: npx playwright test e2e/
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**Critère de sortie Étape 4 :** `CI` badge vert dans README. Coverage backend ≥ 65%. Les 4 scénarios Playwright passent en local et en CI.

---

# ÉTAPE 5 — Observabilité & Go-Live

## 5.1 Métriques Prometheus pour les annonces

```python
# FICHIER : backend/app/main.py — Ajouter les métriques custom

from prometheus_client import Counter, Histogram

announcements_published_total = Counter(
    'announcements_published_total', 'Annonces publiées',
    ['category', 'visibility']
)
announcements_views_total = Counter(
    'announcements_views_total', 'Vues annonces',
    ['slug']
)
public_api_latency = Histogram(
    'public_api_request_duration_seconds', 'Latence API publique',
    ['endpoint']
)
```

## 5.2 Dashboard Grafana "Portail Public"

```yaml
# FICHIER : monitoring/grafana/dashboards/public_portal.json
# Panels à créer :
# - Requêtes/min sur /api/v1/public/* (last 1h)
# - Latence p95 endpoints publics
# - Top 5 annonces les plus vues (aujourd'hui)
# - Taux d'erreur API publique
# - Compteur annonces par statut (draft/published/archived)
```

## 5.3 Go-Live Checklist

```markdown
# FICHIER : GOLIVE_CHECKLIST.md

## Sécurité
- [ ] .env.production absent de l'historique Git (vérifier : git log --all -- .env.production)
- [ ] SECRET_KEY ≥ 64 chars générée avec openssl rand -hex 32
- [ ] Tous les mots de passe par défaut changés (admin, DB, Redis, MinIO, Flower, Grafana)
- [ ] TLS actif (nginx :443), HTTP → HTTPS redirect
- [ ] Aucun port exposé sauf nginx :80/:443
- [ ] CSP configurée et testée (pas de violation dans la console)
- [ ] Tests XSS passent (10 payloads)
- [ ] Logs d'audit actifs (vérifier avec une action admin réelle)

## Fonctionnel
- [ ] Les 4 profils peuvent se connecter (admin, teacher, student, parent)
- [ ] Portail public accessible sans connexion (/, /annonces, /annonces/:slug)
- [ ] Annonce publiée visible en < 5 secondes
- [ ] Upload fichier cours fonctionne (PDF 50Mo test)
- [ ] Notifications absence reçues par parent (test live)
- [ ] Mentor IA répond (tester avec un cours indexé)

## Performance
- [ ] LCP page d'accueil publique < 2.5s (mesure Lighthouse)
- [ ] API health check /health → 200 en < 200ms
- [ ] docker stats : aucun service > 80% CPU en idle

## Sauvegarde
- [ ] scripts/backup.sh exécuté et vérifié (dump SQL lisible)
- [ ] Restore testé sur base de test séparée
- [ ] Cron backup configuré : 0 2 * * * /opt/donbosco/scripts/backup.sh

## RGPD
- [ ] Mentions légales accessibles depuis le footer public
- [ ] Politique RGPD accessible (traitement données mineurs)
- [ ] Consentement parental documenté dans onboarding admin

## Monitoring
- [ ] Grafana accessible (réseau interne uniquement)
- [ ] Alertes configurées (API down, CPU > 90%, backup manqué)
- [ ] Loki reçoit les logs (vérifier dans Grafana Explore)
```

---

# LIVRABLES FINAUX (vérifiés avant clôture)

| # | Livrable | Critère de validation |
|---|---|---|
| 1 | `.env.production` absent de Git | `git log --all -- .env.production` = vide |
| 2 | Docker : zéro port exposé hors nginx | `docker compose ps` : aucun `0.0.0.0:xxx->` sauf nginx |
| 3 | Portail public `/` responsive et accessible | Lighthouse score ≥ 85 |
| 4 | `/annonces` + `/annonces/:slug` fonctionnels | Données réelles PostgreSQL |
| 5 | API publique strictement filtrée | Aucun `content_json`, `allowed_roles`, `created_by` en réponse |
| 6 | Admin peut créer/publier/archiver | Test manuel complet 4 actions |
| 7 | Anti-XSS validé | 10 tests pytest verts |
| 8 | CI badge vert | GitHub Actions : security + backend + e2e |
| 9 | Dashboard Grafana "Portail Public" | Screenshot dans le PR |
| 10 | GOLIVE_CHECKLIST.md complétée | Tous les items cochés |

---

## Note finale pour l'agent

À chaque étape, **commit atomique** avec message conventionnel :
- `security: ...` pour l'Étape 0
- `feat(api): ...` pour le backend
- `feat(ui): ...` pour le frontend
- `test: ...` pour les tests
- `ci: ...` pour les workflows

**Ne jamais commiter :**
- `.env`, `.env.production`, `.env.local`
- `*.pem`, `*.key`, `*.crt`
- Tout fichier contenant des credentials, même de démo

