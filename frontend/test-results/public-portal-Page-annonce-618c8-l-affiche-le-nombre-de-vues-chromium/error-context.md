# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-portal.spec.ts >> Page /annonces/:slug — Détail >> affiche le nombre de vues
- Location: tests/public-portal.spec.ts:249:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=142 vue')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=142 vue')

```

```yaml
- banner:
  - link "Don Bosco Connect":
    - /url: /
    - img
    - text: Don Bosco Connect
  - navigation:
    - link "Accueil":
      - /url: /
    - link "Annonces":
      - /url: /annonces
    - link "Contact":
      - /url: /contact
  - button "Change language":
    - img
    - text: 🇫🇷 Français
  - link "Connexion":
    - /url: /login
- main:
  - img "Rentrée scolaire 2026-2027"
  - text: Academique
  - heading "Rentrée scolaire 2026-2027" [level=1]
  - link "Retour aux annonces":
    - /url: /annonces
    - img
    - text: Retour aux annonces
  - img
  - text: 1 juin 2026
  - img
  - text: "{count} vues 📖 {min} min de lecture"
  - button "Partager":
    - img
    - text: Partager
  - img
  - text: rentrée
  - img
  - text: "2026"
  - article:
    - heading "Bienvenue" [level=2]
    - paragraph: La rentrée est prévue le 1er septembre 2026.
  - heading "Réactions" [level=3]
  - text: 👍 24 🎉 8
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
  216 |     const firstCard = page.locator('[data-testid="announce-card"]').first();
  217 |     await expect(firstCard.locator('img')).toBeVisible();
  218 |   });
  219 | 
  220 |   test('les cartes sans cover image affichent le placeholder Megaphone', async ({ page }) => {
  221 |     // Second card has no cover image
  222 |     const secondCard = page.locator('[data-testid="announce-card"]').nth(1);
  223 |     await expect(secondCard.locator('img')).not.toBeVisible();
  224 |   });
  225 | });
  226 | 
  227 | /* ═══════════════════════════════════════════════════════════
  228 |    ANNOUNCEMENT DETAIL PAGE
  229 |    ═══════════════════════════════════════════════════════════ */
  230 | 
  231 | test.describe('Page /annonces/:slug — Détail', () => {
  232 |   test.beforeEach(async ({ page }) => {
  233 |     await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  234 |     await page.goto('/annonces/rentree-scolaire-2026-2027');
  235 |   });
  236 | 
  237 |   test('affiche le titre de l\'annonce', async ({ page }) => {
  238 |     await expect(page.locator('h1')).toContainText('Rentrée scolaire 2026-2027');
  239 |   });
  240 | 
  241 |   test('affiche la catégorie', async ({ page }) => {
  242 |     await expect(page.locator('text=Academique')).toBeVisible();
  243 |   });
  244 | 
  245 |   test('affiche la date de publication', async ({ page }) => {
  246 |     await expect(page.locator('text=1 juin 2026')).toBeVisible();
  247 |   });
  248 | 
  249 |   test('affiche le nombre de vues', async ({ page }) => {
> 250 |     await expect(page.locator('text=142 vue')).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
  251 |   });
  252 | 
  253 |   test('affiche les tags', async ({ page }) => {
  254 |     await expect(page.locator('span', { hasText: 'rentrée' })).toBeVisible();
  255 |     await expect(page.locator('span', { hasText: '2026' })).toBeVisible();
  256 |   });
  257 | 
  258 |   test('affiche le contenu HTML de l\'annonce', async ({ page }) => {
  259 |     const article = page.locator('article');
  260 |     await expect(article.locator('h2')).toContainText('Bienvenue');
  261 |     await expect(article).toContainText('La rentrée est prévue le 1er septembre 2026');
  262 |   });
  263 | 
  264 |   test('affiche les réactions', async ({ page }) => {
  265 |     await expect(page.locator('text=👍').first()).toBeVisible();
  266 |     await expect(page.locator('text=24').first()).toBeVisible();
  267 |     await expect(page.locator('text=🎉').first()).toBeVisible();
  268 |   });
  269 | 
  270 |   test('le bouton "Partager" est visible', async ({ page }) => {
  271 |     await expect(page.locator('button', { hasText: 'Partager' })).toBeVisible();
  272 |   });
  273 | 
  274 |   test('le lien "Retour aux annonces" pointe vers /annonces', async ({ page }) => {
  275 |     const backLink = page.locator('a', { hasText: 'Retour aux annonces' });
  276 |     await expect(backLink).toHaveAttribute('href', '/annonces');
  277 |   });
  278 | 
  279 |   test('affiche la cover image en hero', async ({ page }) => {
  280 |     const heroImg = page.locator('img[alt="Rentrée scolaire 2026-2027"]');
  281 |     await expect(heroImg).toBeVisible();
  282 |   });
  283 | });
  284 | 
  285 | /* ═══════════════════════════════════════════════════════════
  286 |    NAVIGATION FLOW: List → Detail → Back
  287 |    ═══════════════════════════════════════════════════════════ */
  288 | 
  289 | test.describe('Flow de navigation : Liste → Détail → Retour', () => {
  290 |   test('naviguer depuis la liste vers le détail et revenir', async ({ page }) => {
  291 |     await mockAnnouncementsListAPI(page);
  292 |     await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  293 | 
  294 |     // Step 1: Go to announcements list
  295 |     await page.goto('/annonces');
  296 |     await expect(page.locator('[data-testid="announce-card"]')).toHaveCount(3);
  297 | 
  298 |     // Step 2: Click first card to go to detail
  299 |     await page.locator('[data-testid="announce-card"]').first().click();
  300 |     await expect(page).toHaveURL(/\/annonces\/rentree-scolaire-2026-2027/);
  301 |     await expect(page.locator('h1')).toContainText('Rentrée scolaire 2026-2027');
  302 | 
  303 |     // Step 3: Click back link to return to list
  304 |     await page.locator('a', { hasText: 'Retour aux annonces' }).click();
  305 |     await expect(page).toHaveURL(/\/annonces$/);
  306 |     await expect(page.locator('[data-testid="announce-card"]')).toHaveCount(3);
  307 |   });
  308 | });
  309 | 
  310 | /* ═══════════════════════════════════════════════════════════
  311 |    404 / ERROR HANDLING
  312 |    ═══════════════════════════════════════════════════════════ */
  313 | 
  314 | test.describe('Gestion des erreurs', () => {
  315 |   test('page d\'annonce inexistante affiche "Annonce non trouvée"', async ({ page }) => {
  316 |     await page.route('**/api/v1/public/annonces/does-not-exist', async (route) => {
  317 |       await route.fulfill({ status: 404, contentType: 'application/json', body: '{"detail":"Not found"}' });
  318 |     });
  319 | 
  320 |     await page.goto('/annonces/does-not-exist');
  321 |     await expect(page.locator('text=Annonce non trouvée')).toBeVisible();
  322 |     await expect(page.locator('a', { hasText: 'Retour aux annonces' })).toBeVisible();
  323 |   });
  324 | });
  325 | 
  326 | /* ═══════════════════════════════════════════════════════════
  327 |    SKELETON LOADING STATE
  328 |    ═══════════════════════════════════════════════════════════ */
  329 | 
  330 | test.describe('État de chargement (skeleton)', () => {
  331 |   test('affiche les skeletons pendant le chargement des annonces', async ({ page }) => {
  332 |     // Delay the API response to see loading state
  333 |     await page.route('**/api/v1/annonces**', async (route) => {
  334 |       await new Promise(r => setTimeout(r, 2000));
  335 |       await route.fulfill({
  336 |         status: 200,
  337 |         contentType: 'application/json',
  338 |         body: JSON.stringify(MOCK_ANNOUNCEMENTS),
  339 |       });
  340 |     });
  341 | 
  342 |     await page.goto('/annonces');
  343 | 
  344 |     // Skeleton loaders use animate-pulse class
  345 |     const skeletons = page.locator('.animate-pulse');
  346 |     await expect(skeletons.first()).toBeVisible();
  347 | 
  348 |     // Wait for data to load
  349 |     await expect(page.locator('[data-testid="announce-card"]').first()).toBeVisible({ timeout: 5000 });
  350 |   });
```