# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-portal.spec.ts >> État de chargement (skeleton) >> affiche les skeletons pendant le chargement des annonces
- Location: tests/public-portal.spec.ts:331:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="announce-card"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="announce-card"]').first()

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
  - heading "Annonces" [level=1]
  - paragraph: Toutes les actualités et informations de l'établissement
  - img
  - textbox "Rechercher une annonce..."
  - button "Toutes"
  - button "Général"
  - button "Événement"
  - button "Académique"
  - button "Pédagogique"
  - button "Vie scolaire"
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
  249 |   test('affiche le nombre de vues', async ({ page }) => {
  250 |     await expect(page.locator('text=142 vue')).toBeVisible();
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
> 349 |     await expect(page.locator('[data-testid="announce-card"]').first()).toBeVisible({ timeout: 5000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  350 |   });
  351 | });
  352 | 
  353 | /* ═══════════════════════════════════════════════════════════
  354 |    RESPONSIVE / MOBILE
  355 |    ═══════════════════════════════════════════════════════════ */
  356 | 
  357 | test.describe('Responsive mobile', () => {
  358 |   test('la page /annonces est responsive sur mobile', async ({ page }) => {
  359 |     await mockAnnouncementsListAPI(page);
  360 |     await page.setViewportSize({ width: 375, height: 812 });
  361 |     await page.goto('/annonces');
  362 | 
  363 |     await expect(page.locator('h1')).toContainText('Annonces');
  364 |     await expect(page.locator('input[placeholder*="Rechercher"]')).toBeVisible();
  365 | 
  366 |     const cards = page.locator('[data-testid="announce-card"]');
  367 |     await expect(cards).toHaveCount(3);
  368 |   });
  369 | 
  370 |   test('le lien mobile "Voir toutes les annonces" est visible sur mobile', async ({ page }) => {
  371 |     await mockAnnouncementsListAPI(page);
  372 |     await page.setViewportSize({ width: 375, height: 812 });
  373 |     await page.goto('/');
  374 | 
  375 |     const mobileLink = page.locator('.sm\\:hidden a', { hasText: 'Voir toutes les annonces' });
  376 |     await expect(mobileLink).toBeVisible();
  377 |   });
  378 | 
  379 |   test('le lien desktop est caché sur mobile', async ({ page }) => {
  380 |     await mockAnnouncementsListAPI(page);
  381 |     await page.setViewportSize({ width: 375, height: 812 });
  382 |     await page.goto('/');
  383 | 
  384 |     const desktopLink = page.locator('.hidden.sm\\:inline-flex', { hasText: 'Voir toutes les annonces' });
  385 |     await expect(desktopLink).not.toBeVisible();
  386 |   });
  387 | });
  388 | 
```