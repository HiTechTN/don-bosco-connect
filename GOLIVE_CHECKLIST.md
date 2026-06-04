# Go-Live Checklist — Don Bosco Connect

## Sécurité
- [ ] `.env.production` absent de l'historique Git (vérifier : `git log --all -- .env.production`)
- [ ] `SECRET_KEY` ≥ 64 chars générée avec `openssl rand -hex 32`
- [ ] Tous les mots de passe par défaut changés (admin, DB, Redis, MinIO, Flower, Grafana)
- [ ] TLS actif (nginx :443), HTTP → HTTPS redirect
- [ ] Aucun port exposé sauf nginx :80/:443
- [ ] CSP configurée et testée (pas de violation dans la console)
- [ ] Tests XSS passent (10 payloads) — `pytest backend/app/tests/test_xss_sanitization.py`
- [ ] Logs d'audit actifs (vérifier avec une action admin réelle)
- [ ] CORS restrictif configuré (pas de `*` en production)
- [ ] Rate limiting actif sur `/api/v1/auth/login` (5 req/min)

## Fonctionnel
- [ ] Les 4 profils peuvent se connecter (admin, teacher, student, parent)
- [ ] Portail public accessible sans connexion (`/`, `/annonces`, `/annonces/:slug`)
- [ ] Annonce publiée visible en < 5 secondes
- [ ] Admin peut créer / modifier / publier / archiver / supprimer une annonce
- [ ] Les annonces `visibility=authenticated` ne sont PAS visibles sur le portail public
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
- [ ] Mentions légales accessibles depuis le footer public
- [ ] Politique RGPD accessible (traitement données mineurs)
- [ ] Consentement parental documenté dans onboarding admin

## Monitoring
- [ ] Grafana accessible (réseau interne uniquement)
- [ ] Dashboard "Portail Public" chargé et fonctionnel
- [ ] Alertes configurées (API down, CPU > 90%, backup manqué)
- [ ] Prometheus reçoit les métriques (vérifier dans Grafana Explore)

## CI/CD
- [ ] CI badge vert dans README (security + backend + frontend)
- [ ] Coverage backend ≥ 50%
- [ ] Docker build réussi sans erreur
- [ ] Alembic migrations à jour (`alembic upgrade head`)

---

*Dernière mise à jour : 2026-06-04*
