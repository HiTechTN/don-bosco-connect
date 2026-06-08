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
  ],
  total: 1,
  page: 1,
  per_page: 50,
  pages: 1,
};

const MOCK_SINGLE_ANNOUNCEMENT = MOCK_ANNOUNCEMENTS.items[0];

/* ─── Helpers ───────────────────────────────────────────── */

const PLACEHOLDER_SVG = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect fill="%231B4F72" width="800" height="400"/><text fill="white" font-size="24" x="400" y="200" text-anchor="middle" dominant-baseline="middle">Placeholder</text></svg>';

async function setLanguage(page: Page, lang: 'fr' | 'ar') {
  await page.addInitScript((lng) => {
    localStorage.setItem('language', lng);
  }, lang);
}

async function mockAnnouncementsListAPI(page: Page) {
  await page.route('**/api/v1/public/announcements**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_ANNOUNCEMENTS),
    });
  });
}

async function mockAnnouncementDetailAPI(page: Page, slug = 'rentree-scolaire-2026-2027') {
  await page.route(`**/api/v1/public/announcements/${slug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SINGLE_ANNOUNCEMENT),
    });
  });
}

async function mockExternalImages(page: Page) {
  await page.route('**/picsum.photos/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect fill="#1B4F72" width="800" height="400"/></svg>',
    });
  });
}

async function waitForPageReady(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  // Wait for animations to settle
  await page.waitForTimeout(500);
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: HomePage FR vs AR', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalImages(page);
    await mockAnnouncementsListAPI(page);
    await mockAnnouncementDetailAPI(page);
  });

  test('homepage French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/');
    await expect(page).toHaveScreenshot('homepage-fr.png', {
      fullPage: true,
    });
  });

  test('homepage Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/');
    await expect(page).toHaveScreenshot('homepage-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   ANNOUNCES PAGE — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: AnnouncesPage FR vs AR', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalImages(page);
    await mockAnnouncementsListAPI(page);
  });

  test('announces page French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/annonces');
    await expect(page).toHaveScreenshot('announces-fr.png', {
      fullPage: true,
    });
  });

  test('announces page Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/annonces');
    await expect(page).toHaveScreenshot('announces-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   ANNOUNCE DETAIL — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: AnnounceDetailPage FR vs AR', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalImages(page);
    await mockAnnouncementDetailAPI(page);
  });

  test('announce detail French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/annonces/rentree-scolaire-2026-2027');
    await expect(page).toHaveScreenshot('announce-detail-fr.png', {
      fullPage: true,
    });
  });

  test('announce detail Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/annonces/rentree-scolaire-2026-2027');
    await expect(page).toHaveScreenshot('announce-detail-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   MENTIONS LEGALES — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: MentionsLegalesPage FR vs AR', () => {
  test('mentions legales French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/mentions-legales');
    await expect(page).toHaveScreenshot('mentions-legales-fr.png', {
      fullPage: true,
    });
  });

  test('mentions legales Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/mentions-legales');
    await expect(page).toHaveScreenshot('mentions-legales-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   POLITIQUE RGPD — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: PolitiqueRGPDPage FR vs AR', () => {
  test('politique rgpd French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/politique-rgpd');
    await expect(page).toHaveScreenshot('politique-rgpd-fr.png', {
      fullPage: true,
    });
  });

  test('politique rgpd Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/politique-rgpd');
    await expect(page).toHaveScreenshot('politique-rgpd-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   CONTACT PAGE — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: ContactPage FR vs AR', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalImages(page);
  });
  test('contact page French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/contact');
    await expect(page).toHaveScreenshot('contact-fr.png', {
      fullPage: true,
    });
  });

  test('contact page Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/contact');
    await expect(page).toHaveScreenshot('contact-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE — Visual comparison FR vs AR
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: LoginPage FR vs AR', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalImages(page);
  });
  test('login page French LTR screenshot', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/login');
    await expect(page).toHaveScreenshot('login-fr.png', {
      fullPage: true,
    });
  });

  test('login page Arabic RTL screenshot', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/login');
    await expect(page).toHaveScreenshot('login-ar.png', {
      fullPage: true,
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   HERO SECTION — Focused viewport comparison
   ═══════════════════════════════════════════════════════════ */

test.describe('Visual regression: HomePage hero viewport', () => {
  test.beforeEach(async ({ page }) => {
    await mockExternalImages(page);
    await mockAnnouncementsListAPI(page);
    await mockAnnouncementDetailAPI(page);
  });

  test('hero section French viewport', async ({ page }) => {
    await setLanguage(page, 'fr');
    await waitForPageReady(page, '/');
    // Clip to hero section only (above the fold)
    await expect(page).toHaveScreenshot('hero-fr.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  });

  test('hero section Arabic viewport', async ({ page }) => {
    await setLanguage(page, 'ar');
    await waitForPageReady(page, '/');
    await expect(page).toHaveScreenshot('hero-ar.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
  });
});
