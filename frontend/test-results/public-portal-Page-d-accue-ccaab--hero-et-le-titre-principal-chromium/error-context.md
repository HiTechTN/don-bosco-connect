# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-portal.spec.ts >> Page d'accueil >> affiche le hero et le titre principal
- Location: tests/public-portal.spec.ts:92:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Plateforme numérique scolaire')
Expected: visible
Error: strict mode violation: locator('text=Plateforme numérique scolaire') resolved to 2 elements:
    1) <p class="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto leading-relaxed">Plateforme numérique scolaire — Connexion, appren…</p> aka getByText('Plateforme numérique scolaire — Connexion, apprentissage, réussite.')
    2) <p class="text-white/60 leading-relaxed">Plateforme numérique scolaire pour la communauté …</p> aka getByText('Plateforme numérique scolaire pour la communauté Don Bosco.')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Plateforme numérique scolaire')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]:
        - link "Don Bosco Connect" [ref=e7] [cursor=pointer]:
          - /url: /
          - img [ref=e9]
          - generic [ref=e12]: Don Bosco Connect
        - navigation [ref=e13]:
          - link "Accueil" [ref=e14] [cursor=pointer]:
            - /url: /
          - link "Annonces" [ref=e15] [cursor=pointer]:
            - /url: /annonces
          - link "Contact" [ref=e16] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e17]:
          - button "Change language" [ref=e19] [cursor=pointer]:
            - img [ref=e20]
            - generic [ref=e23]: 🇫🇷
            - generic [ref=e24]: Français
          - link "Connexion" [ref=e25] [cursor=pointer]:
            - /url: /login
    - main [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e33]:
          - img [ref=e36]
          - heading "Don Bosco Connect" [level=1] [ref=e39]
          - paragraph [ref=e40]: Plateforme numérique scolaire — Connexion, apprentissage, réussite.
          - paragraph [ref=e41]: Notre portail public vous informe des actualités et événements de l'établissement. Connectez-vous pour accéder à votre espace personnel.
          - link "Se connecter à l'espace scolaire" [ref=e42] [cursor=pointer]:
            - /url: /login
            - text: Se connecter à l'espace scolaire
            - img [ref=e43]
        - generic [ref=e46]:
          - generic [ref=e47]:
            - heading "À propos de notre établissement" [level=2] [ref=e48]
            - paragraph [ref=e49]: "L'institut Don Bosco forme les leaders de demain depuis plus de 60 ans. Notre mission : offrir une éducation d'excellence dans un environnement bienveillant."
          - generic [ref=e50]:
            - generic [ref=e51]:
              - img [ref=e53]
              - generic [ref=e58]: 1 200+
              - generic [ref=e59]: Élèves inscrits
            - generic [ref=e60]:
              - img [ref=e62]
              - generic [ref=e65]: "85"
              - generic [ref=e66]: Enseignants qualifiés
            - generic [ref=e67]:
              - img [ref=e69]
              - generic [ref=e72]: 60+
              - generic [ref=e73]: Années d'existence
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - heading "Dernières annonces" [level=2] [ref=e78]
              - paragraph [ref=e79]: Restez informé des actualités de l'établissement
            - link "Voir toutes les annonces" [ref=e80] [cursor=pointer]:
              - /url: /annonces
              - img [ref=e81]
              - text: Voir toutes les annonces
              - img [ref=e84]
          - generic [ref=e86]:
            - link "Épinglée Academique Rentrée scolaire 2026-2027 Informations pratiques pour la rentrée à venir. 👍 24 🎉 8" [ref=e88] [cursor=pointer]:
              - /url: /annonces/rentree-scolaire-2026-2027
              - generic [ref=e89]:
                - img [ref=e90]
                - generic [ref=e93]:
                  - img [ref=e94]
                  - text: Épinglée
              - generic [ref=e96]:
                - generic [ref=e98]: Academique
                - heading "Rentrée scolaire 2026-2027" [level=3] [ref=e99]
                - paragraph [ref=e100]: Informations pratiques pour la rentrée à venir.
                - generic [ref=e101]:
                  - generic [ref=e102]: 👍 24
                  - generic [ref=e103]: 🎉 8
            - link "Evenement Journée portes ouvertes Venez découvrir notre établissement ce samedi. ❤️ 12" [ref=e105] [cursor=pointer]:
              - /url: /annonces/journee-portes-ouvertes
              - img [ref=e107]
              - generic [ref=e110]:
                - generic [ref=e112]: Evenement
                - heading "Journée portes ouvertes" [level=3] [ref=e113]
                - paragraph [ref=e114]: Venez découvrir notre établissement ce samedi.
                - generic [ref=e116]: ❤️ 12
            - link "General Nouveau règlement intérieur Le règlement intérieur a été mis à jour pour l'année en cours." [ref=e118] [cursor=pointer]:
              - /url: /annonces/nouveau-reglement-interieur
              - img [ref=e120]
              - generic [ref=e123]:
                - generic [ref=e125]: General
                - heading "Nouveau règlement intérieur" [level=3] [ref=e126]
                - paragraph [ref=e127]: Le règlement intérieur a été mis à jour pour l'année en cours.
    - contentinfo [ref=e128]:
      - generic [ref=e129]:
        - generic [ref=e130]:
          - generic [ref=e131]:
            - generic [ref=e132]:
              - img [ref=e133]
              - generic [ref=e136]: Don Bosco Connect
            - paragraph [ref=e137]: Plateforme numérique scolaire pour la communauté Don Bosco.
          - generic [ref=e138]:
            - heading "Contact" [level=3] [ref=e139]
            - list [ref=e140]:
              - listitem [ref=e141]: 📍 Avenue de la République, Tunis
              - listitem [ref=e142]: 📞 +216 71 123 456
              - listitem [ref=e143]: ✉️ contact@donbosco.tn
          - generic [ref=e144]:
            - heading "Liens utiles" [level=3] [ref=e145]
            - list [ref=e146]:
              - listitem [ref=e147]:
                - link "Contact" [ref=e148] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e149]:
                - link "Mentions légales" [ref=e150] [cursor=pointer]:
                  - /url: /mentions-legales
              - listitem [ref=e151]:
                - link "Politique RGPD" [ref=e152] [cursor=pointer]:
                  - /url: /politique-rgpd
        - generic [ref=e153]: © 2026 Don Bosco Connect. Tous droits réservés.
  - generic [ref=e154]:
    - img [ref=e156]
    - button "Open Tanstack query devtools" [ref=e204] [cursor=pointer]:
      - img [ref=e205]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | /* ─── Mock data ─────────────────────────────────────────── */
  4   | 
  5   | const MOCK_ANNOUNCEMENTS = {
  6   |   items: [
  7   |     {
  8   |       id: 'ann-1',
  9   |       title: 'Rentrée scolaire 2026-2027',
  10  |       slug: 'rentree-scolaire-2026-2027',
  11  |       excerpt: 'Informations pratiques pour la rentrée à venir.',
  12  |       content_html: '<h2>Bienvenue</h2><p>La rentrée est prévue le 1er septembre 2026.</p>',
  13  |       category: 'academique',
  14  |       cover_image_url: 'https://picsum.photos/800/400',
  15  |       publish_at: '2026-06-01T10:00:00Z',
  16  |       views_count: 142,
  17  |       tags: ['rentrée', '2026'],
  18  |       pinned: true,
  19  |       reactions: { '👍': 24, '🎉': 8 },
  20  |     },
  21  |     {
  22  |       id: 'ann-2',
  23  |       title: 'Journée portes ouvertes',
  24  |       slug: 'journee-portes-ouvertes',
  25  |       excerpt: 'Venez découvrir notre établissement ce samedi.',
  26  |       content_html: '<p>Nous vous accueillons de 9h à 16h.</p>',
  27  |       category: 'evenement',
  28  |       cover_image_url: null,
  29  |       publish_at: '2026-05-20T08:00:00Z',
  30  |       views_count: 87,
  31  |       tags: ['événements'],
  32  |       pinned: false,
  33  |       reactions: { '❤️': 12 },
  34  |     },
  35  |     {
  36  |       id: 'ann-3',
  37  |       title: 'Nouveau règlement intérieur',
  38  |       slug: 'nouveau-reglement-interieur',
  39  |       excerpt: 'Le règlement intérieur a été mis à jour pour l\'année en cours.',
  40  |       content_html: '<p>Consultez les nouvelles règles ci-dessous.</p>',
  41  |       category: 'general',
  42  |       cover_image_url: null,
  43  |       publish_at: '2026-05-15T14:00:00Z',
  44  |       views_count: 53,
  45  |       tags: ['règlement'],
  46  |       pinned: false,
  47  |       reactions: null,
  48  |     },
  49  |   ],
  50  |   total: 3,
  51  |   page: 1,
  52  |   per_page: 50,
  53  |   pages: 1,
  54  | };
  55  | 
  56  | const MOCK_SINGLE_ANNOUNCEMENT = MOCK_ANNOUNCEMENTS.items[0];
  57  | 
  58  | /* ─── Helpers ───────────────────────────────────────────── */
  59  | 
  60  | /** Mock the announcements LIST endpoint only (exact match on path, no slug after) */
  61  | async function mockAnnouncementsListAPI(page: Page, data = MOCK_ANNOUNCEMENTS) {
  62  |   await page.route('**/api/v1/public/announcements**', async (route) => {
  63  |     await route.fulfill({
  64  |       status: 200,
  65  |       contentType: 'application/json',
  66  |       body: JSON.stringify(data),
  67  |     });
  68  |   });
  69  | }
  70  | 
  71  | /** Mock a single announcement detail endpoint by slug */
  72  | async function mockAnnouncementDetailAPI(page: Page, slug: string, data = MOCK_SINGLE_ANNOUNCEMENT) {
  73  |   await page.route(`**/api/v1/public/announcements/${slug}`, async (route) => {
  74  |     await route.fulfill({
  75  |       status: 200,
  76  |       contentType: 'application/json',
  77  |       body: JSON.stringify(data),
  78  |     });
  79  |   });
  80  | }
  81  | 
  82  | /* ═══════════════════════════════════════════════════════════
  83  |    HOME PAGE
  84  |    ═══════════════════════════════════════════════════════════ */
  85  | 
  86  | test.describe('Page d\'accueil', () => {
  87  |   test.beforeEach(async ({ page }) => {
  88  |     await mockAnnouncementsListAPI(page);
  89  |     await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  90  |   });
  91  | 
  92  |   test('affiche le hero et le titre principal', async ({ page }) => {
  93  |     await page.goto('/');
  94  |     await expect(page.locator('h1')).toContainText('Don Bosco Connect');
> 95  |     await expect(page.locator('text=Plateforme numérique scolaire')).toBeVisible();
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  96  |   });
  97  | 
  98  |   test('affiche le bouton de connexion', async ({ page }) => {
  99  |     await page.goto('/');
  100 |     const loginButton = page.locator('a', { hasText: 'Se connecter' });
  101 |     await expect(loginButton).toBeVisible();
  102 |     await expect(loginButton).toHaveAttribute('href', '/login');
  103 |   });
  104 | 
  105 |   test('affiche les 3 dernières annonces', async ({ page }) => {
  106 |     await page.goto('/');
  107 |     const cards = page.locator('[data-testid="announce-card"]');
  108 |     await expect(cards).toHaveCount(3);
  109 |   });
  110 | 
  111 |   test('une carte d\'annonce avec image affiche la cover image', async ({ page }) => {
  112 |     await page.goto('/');
  113 |     const firstCard = page.locator('[data-testid="announce-card"]').first();
  114 |     const img = firstCard.locator('img');
  115 |     await expect(img).toBeVisible();
  116 |     await expect(img).toHaveAttribute('src', /picsum\.photos/);
  117 |   });
  118 | 
  119 |   test('l\'annonce épinglée affiche le badge "Épinglée"', async ({ page }) => {
  120 |     await page.goto('/');
  121 |     const pinnedBadge = page.locator('text=Épinglée');
  122 |     await expect(pinnedBadge).toBeVisible();
  123 |   });
  124 | 
  125 |   test('clique sur "Voir toutes les annonces" et navigue vers /annonces', async ({ page }) => {
  126 |     await page.goto('/');
  127 |     const link = page.locator('a', { hasText: 'Voir toutes les annonces' }).first();
  128 |     await link.click();
  129 |     await expect(page).toHaveURL(/\/annonces$/);
  130 |   });
  131 | 
  132 |   test('clique sur une annonce et navigue vers la page de détail', async ({ page }) => {
  133 |     await page.goto('/');
  134 |     const card = page.locator('[data-testid="announce-card"]').first();
  135 |     await card.click();
  136 |     await expect(page).toHaveURL(/\/annonces\/rentree-scolaire-2026-2027/);
  137 |   });
  138 | 
  139 |   test('affiche les statistiques de l\'établissement', async ({ page }) => {
  140 |     await page.goto('/');
  141 |     await expect(page.locator('text=1 200+')).toBeVisible();
  142 |     await expect(page.locator('text=85')).toBeVisible();
  143 |     await expect(page.locator('text=60+')).toBeVisible();
  144 |   });
  145 | 
  146 |   test('affiche le footer avec les informations de contact', async ({ page }) => {
  147 |     await page.goto('/');
  148 |     await expect(page.locator('text=Avenue de la République, Tunis')).toBeVisible();
  149 |     await expect(page.locator('text=contact@donbosco.tn')).toBeVisible();
  150 |   });
  151 | });
  152 | 
  153 | /* ═══════════════════════════════════════════════════════════
  154 |    ANNOUNCEMENTS LIST PAGE
  155 |    ═══════════════════════════════════════════════════════════ */
  156 | 
  157 | test.describe('Page /annonces — Liste et filtres', () => {
  158 |   test.beforeEach(async ({ page }) => {
  159 |     await mockAnnouncementsListAPI(page);
  160 |     await page.goto('/annonces');
  161 |   });
  162 | 
  163 |   test('affiche le titre de la page', async ({ page }) => {
  164 |     await expect(page.locator('h1')).toContainText('Annonces');
  165 |   });
  166 | 
  167 |   test('affiche toutes les annonces par défaut', async ({ page }) => {
  168 |     const cards = page.locator('[data-testid="announce-card"]');
  169 |     await expect(cards).toHaveCount(3);
  170 |   });
  171 | 
  172 |   test('affiche la barre de recherche', async ({ page }) => {
  173 |     const searchInput = page.locator('input[placeholder*="Rechercher"]');
  174 |     await expect(searchInput).toBeVisible();
  175 |   });
  176 | 
  177 |   test('affiche les boutons de catégorie', async ({ page }) => {
  178 |     await expect(page.locator('button', { hasText: 'Toutes' })).toBeVisible();
  179 |     await expect(page.locator('button', { hasText: 'Général' })).toBeVisible();
  180 |     await expect(page.locator('button', { hasText: 'Événement' })).toBeVisible();
  181 |     await expect(page.locator('button', { hasText: 'Académique' })).toBeVisible();
  182 |     await expect(page.locator('button', { hasText: 'Pédagogique' })).toBeVisible();
  183 |     await expect(page.locator('button', { hasText: 'Vie scolaire' })).toBeVisible();
  184 |   });
  185 | 
  186 |   test('le filtre "Toutes" est actif par défaut', async ({ page }) => {
  187 |     const allBtn = page.locator('button', { hasText: 'Toutes' });
  188 |     await expect(allBtn).toHaveClass(/bg-\[#1B4F72\]/);
  189 |   });
  190 | 
  191 |   test('filtrer par catégorie change l\'apparence du bouton', async ({ page }) => {
  192 |     await page.locator('button', { hasText: 'Événement' }).click();
  193 |     const eventBtn = page.locator('button', { hasText: 'Événement' });
  194 |     await expect(eventBtn).toHaveClass(/bg-\[#1B4F72\]/);
  195 | 
```