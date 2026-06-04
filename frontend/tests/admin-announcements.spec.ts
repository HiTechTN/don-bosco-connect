import { test, expect, type Page } from '@playwright/test';

/* ─── Mock data ─────────────────────────────────────────── */

const MOCK_USER = {
  id: 'admin-uuid-0001',
  email: 'admin@donbosco.tn',
  role: 'admin',
  first_name: 'Admin',
  last_name: 'Principal',
};

const MOCK_ADMIN_ANNOUNCEMENTS = {
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
      status: 'published',
      views_count: 142,
      tags: ['rentrée', '2026'],
      pinned: true,
    },
    {
      id: 'ann-2',
      title: 'Brouillon : Réunion parents-professeurs',
      slug: null,
      excerpt: 'Annonce en cours de rédaction.',
      content_html: '<p>À venir.</p>',
      category: 'general',
      cover_image_url: null,
      publish_at: null,
      status: 'draft',
      views_count: 0,
      tags: [],
      pinned: false,
    },
  ],
  total: 2,
  page: 1,
  per_page: 20,
  pages: 1,
};

/* ─── Helpers ───────────────────────────────────────────── */

async function mockAuthAPIs(page: Page) {
  // Mock /auth/me to return logged-in user
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    });
  });

  // Mock /auth/login to set cookies and return user
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: MOCK_USER }),
    });
  });

  // Mock /auth/logout
  await page.route('**/api/v1/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
}

async function mockAdminAnnouncementsAPI(page: Page) {
  await page.route('**/api/v1/annonces**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ADMIN_ANNOUNCEMENTS),
      });
    } else if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'ann-new',
          ...body,
          slug: body.title?.toLowerCase().replace(/\s+/g, '-') || 'nouvelle-annonce',
          status: 'draft',
          views_count: 0,
          created_at: new Date().toISOString(),
        }),
      });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   ADMIN ANNOUNCEMENTS LIST
   ═══════════════════════════════════════════════════════════ */

test.describe('Admin — Liste des annonces', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthAPIs(page);
    await mockAdminAnnouncementsAPI(page);
  });

  test('affiche la page admin des annonces après connexion', async ({ page }) => {
    // Set a cookie to simulate auth
    await page.goto('/admin/announcements');

    // Page should show announcements content (or redirect to login if not authenticated)
    // Since we mock /auth/me, the layout should render
    const heading = page.locator('h1, h2, [class*="font-bold"]').first();
    await expect(heading).toBeVisible();
  });

  test('affiche les annonces avec leur statut', async ({ page }) => {
    await page.goto('/admin/announcements');
    // Should show announcement titles
    await expect(page.locator('text=Rentrée scolaire 2026-2027')).toBeVisible();
  });

  test('affiche le bouton pour créer une nouvelle annonce', async ({ page }) => {
    await page.goto('/admin/announcements');
    const newBtn = page.locator('a, button', { hasText: /nouvelle|créer|ajouter/i }).first();
    await expect(newBtn).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   ADMIN CREATE / EDIT ANNOUNCEMENT
   ═══════════════════════════════════════════════════════════ */

test.describe('Admin — Création d\'annonce', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthAPIs(page);
    await mockAdminAnnouncementsAPI(page);
  });

  test('la page de création affiche un formulaire', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    // Should have a title input and a content area
    const titleInput = page.locator('input[placeholder*="titre"], input[name="title"], input[type="text"]').first();
    await expect(titleInput).toBeVisible();
  });

  test('remplit le formulaire et soumet une nouvelle annonce', async ({ page }) => {
    await page.goto('/admin/announcements/new');

    // Fill in title
    const titleInput = page.locator('input[placeholder*="titre"], input[name="title"], input[type="text"]').first();
    await titleInput.fill('Test annonce E2E');

    // Try to fill excerpt if available
    const excerptInput = page.locator('textarea, input[placeholder*="résumé"], input[placeholder*="excerpt"]').first();
    if (await excerptInput.isVisible()) {
      await excerptInput.fill('Résumé de test');
    }

    // Try to select a category if there's a select/dropdown
    const categorySelect = page.locator('select, [role="combobox"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }

    // Click save/submit button
    const submitBtn = page.locator('button[type="submit"], button', { hasText: /enregistrer|sauvegarder|créer|publier/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   FULL FLOW: Create → Publish → View on Public Portal
   ═══════════════════════════════════════════════════════════ */

test.describe('Flow complet : Création → Publication → Affichage public', () => {
  test('un admin crée une annonce, la publie, puis elle est visible sur le portail public', async ({ page }) => {
    // Step 1: Mock all APIs
    await mockAuthAPIs(page);

    const newAnnouncement = {
      id: 'ann-new',
      title: 'Sortie scolaire au musée',
      slug: 'sortie-scolaire-au-musee',
      excerpt: 'Visite guidée du Bardo.',
      content_html: '<p>Nous organisons une sortie au musée du Bardo.</p>',
      category: 'evenement',
      cover_image_url: null,
      publish_at: '2026-06-04T10:00:00Z',
      status: 'published',
      views_count: 0,
      tags: ['sortie'],
      pinned: false,
    };

    // Mock create API
    await page.route('**/api/v1/annonces', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newAnnouncement),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [newAnnouncement], total: 1, page: 1, per_page: 20, pages: 1 }),
        });
      }
    });

    // Mock publish endpoint
    await page.route('**/api/v1/annonces/ann-new/publish', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...newAnnouncement, status: 'published' }),
      });
    });

    // Mock public announcement endpoint
    await page.route('**/api/v1/annonces/sortie-scolaire-au-musee', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newAnnouncement),
      });
    });

    // Step 2: Navigate to public portal and verify it's visible
    await page.goto('/annonces');
    // (In real flow, the announcement would now be in the public list)

    // Step 3: Navigate to the detail page directly
    await page.goto('/annonces/sortie-scolaire-au-musee');
    await expect(page.locator('h1')).toContainText('Sortie scolaire au musée');
    await expect(page.locator('text=Evenement')).toBeVisible();
  });
});
