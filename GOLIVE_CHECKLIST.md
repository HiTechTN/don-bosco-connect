# Go-Live Checklist — Don Bosco Connect

## Sécurité
- [ ] `.env.production` absent de l'historique Git (vérifier : `git log --all -- .env.production`)
- [ ] `SECRET_KEY` ≥ 64 chars générée avec `openssl rand -hex 32`
- [ ] Tous les mots de passe par défaut changés (admin, DB, Redis, MinIO, Flower, Grafana)
- [x] TLS actif (nginx :443), HTTP → HTTPS redirect — `nginx/nginx.conf` : port 80 fait `return 301 https://$host$request_uri` (exception : `/health` accessible sur HTTP pour healthchecks)
- [x] Aucun port exposé sauf nginx :80/:443 — `docker-compose.yml` : tous les services utilisent `expose` au lieu de `ports`
- [x] CSP configurée et testée — `nginx/nginx.conf` : CSP avec Google Fonts, minio, frame-src 'none', object-src 'none', base-uri 'self', form-action 'self'
- [x] Tests XSS passent (10 payloads) — `backend/app/tests/test_xss_sanitization.py`
- [x] Logs d'audit actifs — `backend/app/services/audit_service.py` + wiring dans `announcements.py` (create/publish/archive/delete)
- [ ] CORS restrictif configuré (pas de `*` en production)
- [x] Rate limiting actif sur `/api/v1/auth/login` (5 req/min) — nginx `limit_req zone=login burst=3`

## Fonctionnel
- [ ] Les 4 profils peuvent se connecter (admin, teacher, student, parent)
- [x] Portail public accessible sans connexion (`/`, `/annonces`, `/annonces/:slug`) — `HomePage.tsx`, `AnnouncesPage.tsx`, `AnnounceDetailPage.tsx`
- [ ] Annonce publiée visible en < 5 secondes
- [x] Admin peut créer / modifier / publier / archiver / supprimer une annonce — `AnnouncementsPage.tsx` + `AnnouncementEditorPage.tsx`
- [x] Les annonces `visibility=authenticated` ne sont PAS visibles sur le portail public — filtré dans `AnnouncementService.list_public()`
- [ ] Upload fichier cours fonctionne (PDF 50Mo test)
- [ ] Notifications absence reçues par parent (test live)
- [ ] Mentor IA répond (tester avec un cours indexé)

## Performance
- [ ] LCP page d'accueil publique < 2.5s (mesure Lighthouse)
- [ ] API health check `/health` → 200 en < 200ms
- [ ] `docker stats` : aucun service > 80% CPU en idle

## Sauvegarde
- [ ] `scripts/backup.sh` exécuté et vérifié (dump SQL lisible)
- [ ] Restore testé sur base de test séparée
- [ ] Cron backup configuré : `0 2 * * * /opt/donbosco/scripts/backup.sh`

## RGPD
- [x] Mentions légales accessibles depuis le footer public — `frontend/src/pages/public/MentionsLegalesPage.tsx`
- [x] Politique RGPD accessible (traitement données mineurs) — `frontend/src/pages/public/PolitiqueRGPDPage.tsx`
- [ ] Consentement parental documenté dans onboarding admin

## Monitoring
- [ ] Grafana accessible (réseau interne uniquement)
- [x] Dashboard "Portail Public" chargé et fonctionnel — `monitoring/grafana/dashboards/public_portal.json` + provisioning `dashboards/dashboards.yml`
- [ ] Alertes configurées (API down, CPU > 90%, backup manqué)
- [x] Prometheus reçoit les métriques — `public_api_latency` histogram dans `main.py` + `timing_middleware`

## CI/CD
- [x] CI badge vert dans README (security + backend + frontend) — `.github/workflows/ci.yml`
- [x] Coverage backend ≥ 50% — `--cov-fail-under=50` dans ci.yml
- [ ] Docker build réussi sans erreur
- [ ] Alembic migrations à jour (`alembic upgrade head`)

## Pages publiques ajoutées
- [x] Mentions légales — `/mentions-legales` (Helmet SEO, éditeur, hébergeur, cookies, propriété intellectuelle)
- [x] Politique RGPD — `/politique-rgpd` (Helmet SEO, données collectées, droits, sécurité, mineurs)
- [x] Footer public lié — `HomePage.tsx` : liens vers `/mentions-legales`, `/politique-rgpd`, `mailto:contact@donbosco.tn`

---

*Dernière mise à jour : 2026-06-05*
