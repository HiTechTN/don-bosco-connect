# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-portal.spec.ts >> Page d'accueil >> une carte d'annonce avec image affiche la cover image
- Location: tests/public-portal.spec.ts:111:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="announce-card"]').first().locator('img')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="announce-card"]').first().locator('img')

```

```yaml
- banner:
  - link:
    - /url: /
    - img
  - button "Change language":
    - img
    - text: 🇫🇷
  - button "Toggle menu":
    - img
- main:
  - img
  - heading "Don Bosco Connect" [level=1]
  - paragraph: Plateforme numérique scolaire — Connexion, apprentissage, réussite.
  - paragraph: Notre portail public vous informe des actualités et événements de l'établissement. Connectez-vous pour accéder à votre espace personnel.
  - link "Se connecter à l'espace scolaire":
    - /url: /login
    - text: Se connecter à l'espace scolaire
    - img
  - heading "À propos de notre établissement" [level=2]
  - paragraph: "L'institut Don Bosco forme les leaders de demain depuis plus de 60 ans. Notre mission : offrir une éducation d'excellence dans un environnement bienveillant."
  - img
  - text: 1 200+ Élèves inscrits
  - img
  - text: 85 Enseignants qualifiés
  - img
  - text: 60+ Années d'existence
  - heading "Dernières annonces" [level=2]
  - paragraph: Restez informé des actualités de l'établissement
  - link "Épinglée Academique Rentrée scolaire 2026-2027 Informations pratiques pour la rentrée à venir. 👍 24 🎉 8":
    - /url: /annonces/rentree-scolaire-2026-2027
    - img
    - img
    - text: Épinglée Academique
    - heading "Rentrée scolaire 2026-2027" [level=3]
    - paragraph: Informations pratiques pour la rentrée à venir.
    - text: 👍 24 🎉 8
  - link "Evenement Journée portes ouvertes Venez découvrir notre établissement ce samedi. ❤️ 12":
    - /url: /annonces/journee-portes-ouvertes
    - img
    - text: Evenement
    - heading "Journée portes ouvertes" [level=3]
    - paragraph: Venez découvrir notre établissement ce samedi.
    - text: ❤️ 12
  - link "General Nouveau règlement intérieur Le règlement intérieur a été mis à jour pour l'année en cours.":
    - /url: /annonces/nouveau-reglement-interieur
    - img
    - text: General
    - heading "Nouveau règlement intérieur" [level=3]
    - paragraph: Le règlement intérieur a été mis à jour pour l'année en cours.
  - link "Voir toutes les annonces":
    - /url: /annonces
    - text: Voir toutes les annonces
    - img
- contentinfo:
  - img
  - text: Don Bosco Connect
  - paragraph: Plateforme numérique scolaire pour la communauté Don Bosco.
  - heading "Contact" [level=3]
  - list:
    - listitem: 📍 Avenue de la République, Tunis
    - listitem: 📞 +216 71 123 456
    - listitem: ✉️ contact@donbosco.tn
  - heading "Liens utiles" [level=3]
  - list:
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Mentions légales":
        - /url: /mentions-legales
    - listitem:
      - link "Politique RGPD":
        - /url: /politique-rgpd
  - text: © 2026 Don Bosco Connect. Tous droits réservés.
- button "Open Tanstack query devtools":
  - img
```

# Test source

```ts
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
  95  |     await expect(page.locator('text=Plateforme numérique scolaire')).toBeVisible();
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
> 115 |     await expect(img).toBeVisible();
      |                       ^ Error: expect(locator).toBeVisible() failed
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
  196 |     // "Toutes" should no longer be active
  197 |     const allBtn = page.locator('button', { hasText: 'Toutes' });
  198 |     await expect(allBtn).not.toHaveClass(/bg-\[#1B4F72\]/);
  199 |   });
  200 | 
  201 |   test('affiche le message "Aucune annonce trouvée" quand la liste est vide', async ({ page }) => {
  202 |     await page.unroute('**/api/v1/public/annonces**');
  203 |     await mockAnnouncementsListAPI(page, { items: [], total: 0, page: 1, per_page: 50, pages: 0 });
  204 |     await page.goto('/annonces');
  205 |     await expect(page.locator('text=Aucune annonce trouvée')).toBeVisible();
  206 |   });
  207 | 
  208 |   test('chaque carte affiche le titre, la catégorie et l\'extrait', async ({ page }) => {
  209 |     const firstCard = page.locator('[data-testid="announce-card"]').first();
  210 |     await expect(firstCard.locator('h3')).toContainText('Rentrée scolaire 2026-2027');
  211 |     await expect(firstCard.locator('span', { hasText: 'Academique' })).toBeVisible();
  212 |     await expect(firstCard.locator('p')).toContainText('Informations pratiques');
  213 |   });
  214 | 
  215 |   test('les cartes avec cover image affichent l\'image', async ({ page }) => {
```