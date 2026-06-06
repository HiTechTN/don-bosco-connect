import { test, expect, type Page } from '@playwright/test';

/* ─── Mock data ─────────────────────────────────────────── */

const MOCK_ANNOUNCEMENTS = {
  items: [
    {
      id: 'ann-1',
      title: 'Rentrée scolaire 2026-2027',
      slug: 'rentree-scolaire-2026-2027',
      excerpt: 'Informations pratiques pour la rentrée à venir.',
      content_html: '<h2>Bienvenue</h2><p>La rentrée est prévue le 1er septembre 2026.</p>',
      category: 'academique',
      cover_image_url: 'https://picsum.photos/800/400',
      publish_at: '2026-06-01T10:00:00Z',
      views_count: 142,
      tags: ['rentrée', '2026'],
      pinned: true,
      reactions: { '👍': 24, '🎉': 8 },
    },
    {
      id: 'ann-2',
      title: 'Journée portes ouvertes',
      slug: 'journee-portes-ouvertes',
      excerpt: 'Venez découvrir notre établissement ce samedi.',
      content_html: '<p>Nous vous accueillons de 9h à 16h.</p>',
      category: 'evenement',
      cover_image_url: null,
      publish_at: '2026-05-20T08:00:00Z',
      views_count: 87,
      tags: ['événements'],
      pinned: false,
      reactions: { '❤️': 12 },
    },
    {
      id: 'ann-3',
      title: 'Nouveau règlement intérieur',
      slug: 'nouveau-reglement-interieur',
      excerpt: 'Le règlement intérieur a été mis à jour pour l\'année en cours.',
      content_html: '<p>Consultez les nouvelles règles ci-dessous.</p>',
      category: 'general',
      cover_image_url: null,
      publish_at: '2026-05-15T14:00:00Z',
      views_count: 53,
      tags: ['règlement'],
      pinned: false,
      reactions: null,
    },
  ],
  total: 3,
  page: 1,
  per_page: 50,
  pages: 1,
};

const MOCK_SINGLE_ANNOUNCEMENT = MOCK_ANNOUNCEMENTS.items[0];

/* ─── Helpers ───────────────────────────────────────────── */

/** Mock the announcements LIST endpoint only (exact match on path, no slug after) */
async function mockAnnouncementsListAPI(page: Page, data = MOCK_ANNOUNCEMENTS) {
  await page.route('**/api/v1/public/announcements**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

/** Mock a single announcement detail endpoint by slug */
async function mockAnnouncementDetailAPI(page: Page, slug: string, data = MOCK_SINGLE_ANNOUNCEMENT) {
  await page.route(`**/api/v1/public/announcements/${slug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */

test.describe('Page d\'accueil', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  });

  test('affiche le hero et le titre principal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText("L\'Éducation");
    await expect(page.locator('main >> text=Réinventée')).toBeVisible();
  });

  test('affiche le bouton de connexion', async ({ page }) => {
    await page.goto('/');
    // New landing page: login button exists in hero CTAs and demo CTA section
    // Scroll through the full page to trigger all lazy sections
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < document.body.scrollHeight; i += 300) {
        window.scrollTo(0, i);
        await delay(100);
      }
    });
    await page.waitForTimeout(500);
    // The login link in the CTA section is always visible after scrolling
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink.first()).toBeVisible({ timeout: 15000 });
  });

  test('affiche les 3 dernières annonces', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('[data-testid="announce-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('une carte d\'annonce avec image affiche la cover image', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('[data-testid="announce-card"]').first();
    const img = firstCard.locator('img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', /picsum\.photos/);
  });

  test('l\'annonce épinglée affiche le badge "Épinglée"', async ({ page }) => {
    await page.goto('/');
    const pinnedBadge = page.locator('text=Épinglée');
    await expect(pinnedBadge).toBeVisible();
  });

  test('clique sur "Voir toutes les annonces" et navigue vers /annonces', async ({ page }) => {
    await page.goto('/');
    // Scroll through the full page to trigger all lazy sections
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < document.body.scrollHeight; i += 300) {
        window.scrollTo(0, i);
        await delay(100);
      }
    });
    await page.waitForTimeout(500);
    const link = page.locator('a[href="/annonces"]').first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await expect(page).toHaveURL(/\/annonces$/);
  });

  test('clique sur une annonce et navigue vers la page de détail', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('[data-testid="announce-card"]').first();
    await card.click();
    await expect(page).toHaveURL(/\/annonces\/rentree-scolaire-2026-2027/);
  });

  test('affiche les statistiques de l\'établissement', async ({ page }) => {
    await page.goto('/');
    // New landing page uses landing.stats_title
    await expect(page.locator('text=Un Impact Concret')).toBeVisible();
  });

  test('affiche la section démo avec les comptes de démonstration', async ({ page }) => {
    await page.goto('/');
    // New landing page has demo accounts section instead of old footer
    await expect(page.locator('text=admin@donbosco.tn')).toBeVisible();
    await expect(page.locator('text=karim.hamdi@donbosco.tn')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   ANNOUNCEMENTS LIST PAGE
   ═══════════════════════════════════════════════════════════ */

test.describe('Page /annonces — Liste et filtres', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await page.goto('/annonces');
  });

  test('affiche le titre de la page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Annonces');
  });

  test('affiche toutes les annonces par défaut', async ({ page }) => {
    const cards = page.locator('[data-testid="announce-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('affiche la barre de recherche', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchInput).toBeVisible();
  });

  test('affiche les boutons de catégorie', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Toutes' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Général' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Événement' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Académique' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Pédagogique' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Vie scolaire' })).toBeVisible();
  });

  test('le filtre "Toutes" est actif par défaut', async ({ page }) => {
    const allBtn = page.locator('button', { hasText: 'Toutes' });
    await expect(allBtn).toHaveClass(/bg-\[#1B4F72\]/);
  });

  test('filtrer par catégorie change l\'apparence du bouton', async ({ page }) => {
    await page.locator('button', { hasText: 'Événement' }).click();
    const eventBtn = page.locator('button', { hasText: 'Événement' });
    await expect(eventBtn).toHaveClass(/bg-\[#1B4F72\]/);

    // "Toutes" should no longer be active
    const allBtn = page.locator('button', { hasText: 'Toutes' });
    await expect(allBtn).not.toHaveClass(/bg-\[#1B4F72\]/);
  });

  test('affiche le message "Aucune annonce trouvée" quand la liste est vide', async ({ page }) => {
    await page.unroute('**/api/v1/public/announcements**');
    await mockAnnouncementsListAPI(page, { items: [], total: 0, page: 1, per_page: 50, pages: 0 });
    await page.goto('/annonces');
    await expect(page.locator('text=Aucune annonce trouvée')).toBeVisible();
  });

  test('chaque carte affiche le titre, la catégorie et l\'extrait', async ({ page }) => {
    const firstCard = page.locator('[data-testid="announce-card"]').first();
    await expect(firstCard.locator('h3')).toContainText('Rentrée scolaire 2026-2027');
    await expect(firstCard.locator('span', { hasText: 'Academique' })).toBeVisible();
    await expect(firstCard.locator('p')).toContainText('Informations pratiques');
  });

  test('les cartes avec cover image affichent l\'image', async ({ page }) => {
    const firstCard = page.locator('[data-testid="announce-card"]').first();
    await expect(firstCard.locator('img')).toBeVisible();
  });

  test('les cartes sans cover image affichent le placeholder Megaphone', async ({ page }) => {
    // Second card has no cover image
    const secondCard = page.locator('[data-testid="announce-card"]').nth(1);
    await expect(secondCard.locator('img')).not.toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   ANNOUNCEMENT DETAIL PAGE
   ═══════════════════════════════════════════════════════════ */

test.describe('Page /annonces/:slug — Détail', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
    await page.goto('/annonces/rentree-scolaire-2026-2027');
  });

  test('affiche le titre de l\'annonce', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Rentrée scolaire 2026-2027');
  });

  test('affiche la catégorie', async ({ page }) => {
    await expect(page.locator('text=Academique')).toBeVisible();
  });

  test('affiche la date de publication', async ({ page }) => {
    await expect(page.locator('text=1 juin 2026')).toBeVisible();
  });

  test('affiche le nombre de vues', async ({ page }) => {
    await expect(page.locator('text=142 vues')).toBeVisible();
  });

  test('affiche les tags', async ({ page }) => {
    await expect(page.locator('span', { hasText: 'rentrée' })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: /^2026$/ })).toBeVisible();
  });

  test('affiche le contenu HTML de l\'annonce', async ({ page }) => {
    const article = page.locator('article');
    await expect(article.locator('h2')).toContainText('Bienvenue');
    await expect(article).toContainText('La rentrée est prévue le 1er septembre 2026');
  });

  test('affiche les réactions', async ({ page }) => {
    await expect(page.locator('text=👍').first()).toBeVisible();
    await expect(page.locator('text=24').first()).toBeVisible();
    await expect(page.locator('text=🎉').first()).toBeVisible();
  });

  test('le bouton "Partager" est visible', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Partager' })).toBeVisible();
  });

  test('le lien "Retour aux annonces" pointe vers /annonces', async ({ page }) => {
    const backLink = page.locator('a', { hasText: 'Retour aux annonces' });
    await expect(backLink).toHaveAttribute('href', '/annonces');
  });

  test('affiche la cover image en hero', async ({ page }) => {
    const heroImg = page.locator('img[alt="Rentrée scolaire 2026-2027"]');
    await expect(heroImg).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   NAVIGATION FLOW: List → Detail → Back
   ═══════════════════════════════════════════════════════════ */

test.describe('Flow de navigation : Liste → Détail → Retour', () => {
  test('naviguer depuis la liste vers le détail et revenir', async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');

    // Step 1: Go to announcements list
    await page.goto('/annonces');
    await expect(page.locator('[data-testid="announce-card"]')).toHaveCount(3);

    // Step 2: Click first card to go to detail
    await page.locator('[data-testid="announce-card"]').first().click();
    await expect(page).toHaveURL(/\/annonces\/rentree-scolaire-2026-2027/);
    await expect(page.locator('h1')).toContainText('Rentrée scolaire 2026-2027');

    // Step 3: Click back link to return to list
    await page.locator('a', { hasText: 'Retour aux annonces' }).click();
    await expect(page).toHaveURL(/\/annonces$/);
    await expect(page.locator('[data-testid="announce-card"]')).toHaveCount(3);
  });
});

/* ═══════════════════════════════════════════════════════════
   404 / ERROR HANDLING
   ═══════════════════════════════════════════════════════════ */

test.describe('Gestion des erreurs', () => {
  test('page d\'annonce inexistante affiche "Annonce non trouvée"', async ({ page }) => {
    // Mock the specific announcement endpoint to return 404
    await page.route('**/api/v1/public/announcements/does-not-exist', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Not found' }),
      });
    });
    // Also mock the list endpoint in case the page fetches it
    await page.route('**/api/v1/public/announcements', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], total: 0, page: 1, per_page: 50, pages: 0 }),
      });
    });

    await page.goto('/annonces/does-not-exist');
    await expect(page.locator('text=Annonce non trouvée')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a', { hasText: 'Retour aux annonces' })).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   SKELETON LOADING STATE
   ═══════════════════════════════════════════════════════════ */

test.describe('État de chargement (skeleton)', () => {
  test('affiche les skeletons pendant le chargement des annonces', async ({ page }) => {
    // Delay the API response to see loading state
    await page.route('**/api/v1/public/announcements**', async (route) => {
      await new Promise(r => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ANNOUNCEMENTS),
      });
    });

    await page.goto('/annonces');

    // Skeleton loaders use animate-pulse class
    const skeletons = page.locator('.animate-pulse');
    await expect(skeletons.first()).toBeVisible();

    // Wait for data to load
    await expect(page.locator('[data-testid="announce-card"]').first()).toBeVisible({ timeout: 5000 });
  });
});

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE / MOBILE
   ═══════════════════════════════════════════════════════════ */

test.describe('Responsive mobile', () => {
  test('la page /annonces est responsive sur mobile', async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/annonces');

    await expect(page.locator('h1')).toContainText('Annonces');
    await expect(page.locator('input[placeholder*="Rechercher"]')).toBeVisible();

    const cards = page.locator('[data-testid="announce-card"]');
    await expect(cards).toHaveCount(3);
  });

  test('le lien mobile "Voir toutes les annonces" est visible sur mobile', async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Scroll through the full page to trigger all lazy sections
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < document.body.scrollHeight; i += 300) {
        window.scrollTo(0, i);
        await delay(100);
      }
    });
    await page.waitForTimeout(1000);
    // Use last() since the first link might be the desktop-only one
    const mobileLink = page.locator('a[href="/annonces"]').last();
    await expect(mobileLink).toBeVisible({ timeout: 15000 });
  });

  test('le lien desktop est caché sur mobile', async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // The desktop-only link with hidden sm:inline-flex should not be visible on mobile
    const desktopLink = page.locator('.hidden.sm\\:inline-flex').first();
    await expect(desktopLink).not.toBeVisible();
  });
});
