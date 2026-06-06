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

/** Set language to Arabic via localStorage before navigating */
async function setArabicLanguage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'ar');
  });
}

async function mockAnnouncementsListAPI(page: Page, data = MOCK_ANNOUNCEMENTS) {
  await page.route('**/api/v1/public/announcements**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

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
   HOME PAGE — Arabic
   ═══════════════════════════════════════════════════════════ */

test.describe('HomePage — Arabic rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setArabicLanguage(page);
    await mockAnnouncementsListAPI(page);
    await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  });

  test('renders with RTL direction', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('shows Arabic hero tagline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=منصة رقمية مدرسية').first()).toBeVisible();
  });

  test('shows Arabic CTA button', async ({ page }) => {
    await page.goto('/');
    // New landing page uses landing.hero_cta_explore in hero and landing.hero_cta_demo
    await expect(page.locator('text=استكشف البوابة')).toBeVisible();
  });

  test('shows Arabic about section', async ({ page }) => {
    await page.goto('/');
    // New landing page uses landing.features_title instead of home.about_title
    await expect(page.locator('text=كل ما تحتاجه')).toBeVisible();
  });

  test('shows Arabic stats', async ({ page }) => {
    await page.goto('/');
    // New landing page uses landing.stats_users
    await expect(page.locator('text=مستخدمون نشطون')).toBeVisible();
  });

  test('shows Arabic announcements section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=آخر الإعلانات')).toBeVisible();
  });

  test('shows Arabic footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=شارع الجمهورية، تونس')).toBeVisible();
  });

  test('shows Arabic nav links', async ({ page }) => {
    await page.goto('/');
    // New landing page: check for hero title and CTA which are always visible
    await expect(page.locator('text=التعليم').first()).toBeVisible();
    await expect(page.locator('text=استكشف البوابة')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   ANNOUNCES PAGE — Arabic
   ═══════════════════════════════════════════════════════════ */

test.describe('AnnouncesPage — Arabic rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setArabicLanguage(page);
    await mockAnnouncementsListAPI(page);
  });

  test('renders with RTL direction', async ({ page }) => {
    await page.goto('/annonces');
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('shows Arabic page title', async ({ page }) => {
    await page.goto('/annonces');
    await expect(page.locator('h1')).toContainText('الإعلانات');
  });

  test('shows Arabic category filters', async ({ page }) => {
    await page.goto('/annonces');
    await expect(page.locator('button', { hasText: 'الكل' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'عام' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'حدث' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'أكاديمي' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'تربوي' })).toBeVisible();
  });

  test('shows Arabic search placeholder', async ({ page }) => {
    await page.goto('/annonces');
    const searchInput = page.locator('input[placeholder="البحث عن إعلان..."]');
    await expect(searchInput).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   ANNOUNCE DETAIL PAGE — Arabic
   ═══════════════════════════════════════════════════════════ */

test.describe('AnnounceDetailPage — Arabic rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setArabicLanguage(page);
    await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  });

  test('renders with RTL direction', async ({ page }) => {
    await page.goto('/annonces/rentree-scolaire-2026-2027');
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('shows Arabic back link', async ({ page }) => {
    await page.goto('/annonces/rentree-scolaire-2026-2027');
    await expect(page.locator('text=العودة إلى الإعلانات')).toBeVisible();
  });

  test('shows Arabic share button', async ({ page }) => {
    await page.goto('/annonces/rentree-scolaire-2026-2027');
    await expect(page.locator('button', { hasText: 'مشاركة' })).toBeVisible();
  });

  test('shows Arabic reactions section', async ({ page }) => {
    await page.goto('/annonces/rentree-scolaire-2026-2027');
    await expect(page.locator('h3', { hasText: 'ردود الفعل' })).toBeVisible();
  });

  test('shows Arabic 404 for missing announcement', async ({ page }) => {
    await setArabicLanguage(page);
    await page.route('**/api/v1/public/announcements/does-not-exist', async (route) => {
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{"detail":"Not found"}' });
    });
    await page.goto('/annonces/does-not-exist');
    // Wait for loading to finish and error state to render
    await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2', { hasText: 'لم يتم العثور على الإعلان' })).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   MENTIONS LÉGALES PAGE — Arabic
   ═══════════════════════════════════════════════════════════ */

test.describe('MentionsLegalesPage — Arabic rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setArabicLanguage(page);
  });

  test('renders with RTL direction', async ({ page }) => {
    await page.goto('/mentions-legales');
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('shows Arabic page title', async ({ page }) => {
    await page.goto('/mentions-legales');
    await expect(page.locator('h1')).toContainText('الإشعارات القانونية');
  });

  test('shows Arabic section headings', async ({ page }) => {
    await page.goto('/mentions-legales');
    await expect(page.locator('text=ناشر الموقع')).toBeVisible();
    await expect(page.locator('text=المستضيف')).toBeVisible();
    await expect(page.locator('text=المالكية الفكرية')).toBeVisible();
    await expect(page.locator('h2', { hasText: 'ملفات تعريف الارتباط' })).toBeVisible();
  });

  test('shows Arabic back link', async ({ page }) => {
    await page.goto('/mentions-legales');
    await expect(page.locator('text=العودة إلى الصفحة الرئيسية')).toBeVisible();
  });

  test('sets document lang to ar', async ({ page }) => {
    await page.goto('/mentions-legales');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('ar');
  });
});

/* ═══════════════════════════════════════════════════════════
   POLITIQUE RGPD PAGE — Arabic
   ═══════════════════════════════════════════════════════════ */

test.describe('PolitiqueRGPDPage — Arabic rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setArabicLanguage(page);
  });

  test('renders with RTL direction', async ({ page }) => {
    await page.goto('/politique-rgpd');
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('shows Arabic page title', async ({ page }) => {
    await page.goto('/politique-rgpd');
    await expect(page.locator('h1')).toContainText('سياسة حماية البيانات');
  });

  test('shows Arabic subtitle', async ({ page }) => {
    await page.goto('/politique-rgpd');
    await expect(page.locator('text=متوافق مع RGPD').first()).toBeVisible();
  });

  test('shows Arabic data categories', async ({ page }) => {
    await page.goto('/politique-rgpd');
    await expect(page.locator('text=البيانات المجمعة')).toBeVisible();
    await expect(page.locator('td', { hasText: 'الهوية' })).toBeVisible();
  });

  test('shows Arabic rights section', async ({ page }) => {
    await page.goto('/politique-rgpd');
    await expect(page.locator('h2', { hasText: 'حقوقك' })).toBeVisible();
    await expect(page.locator('text=حق الوصول')).toBeVisible();
  });

  test('shows Arabic security section', async ({ page }) => {
    await page.goto('/politique-rgpd');
    await expect(page.locator('text=تدابير الأمان')).toBeVisible();
  });

  test('shows Arabic minors section', async ({ page }) => {
    await page.goto('/politique-rgpd');
    await expect(page.locator('text=حماية القاصرين')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   CONTACT PAGE — Arabic
   ═══════════════════════════════════════════════════════════ */

test.describe('ContactPage — Arabic rendering', () => {
  test.beforeEach(async ({ page }) => {
    await setArabicLanguage(page);
  });

  test('renders with RTL direction', async ({ page }) => {
    await page.goto('/contact');
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('shows Arabic page title', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('اتصل بنا');
  });

  test('shows Arabic contact info', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=معلومات الاتصال')).toBeVisible();
    await expect(page.locator('text=العنوان')).toBeVisible();
    await expect(page.locator('text=الهاتف')).toBeVisible();
  });

  test('shows Arabic form labels', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=أرسل لنا رسالة')).toBeVisible();
    await expect(page.locator('text=الاسم الكامل')).toBeVisible();
    await expect(page.locator('label', { hasText: 'الرسالة' })).toBeVisible();
  });

  test('shows Arabic submit button', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('button', { hasText: 'إرسال الرسالة' })).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   LANGUAGE SWITCHER — Persistence
   ═══════════════════════════════════════════════════════════ */

test.describe('Language persistence', () => {
  test('language preference persists across page reloads', async ({ page }) => {
    // First visit: set Arabic via the switcher
    await page.goto('/');
    await page.locator('button[aria-label="Change language"]').click();
    await page.locator('button', { hasText: 'العربية' }).click();

    // Verify Arabic is showing
    await expect(page.locator('text=آخر الإعلانات')).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify Arabic persists
    await expect(page.locator('text=آخر الإعلانات')).toBeVisible();
    const container = page.locator('[dir="rtl"]').first();
    await expect(container).toBeVisible();
  });

  test('language preference persists across navigation', async ({ page }) => {
    await mockAnnouncementsListAPI(page);
    await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');

    // Set Arabic
    await page.goto('/');
    await page.locator('button[aria-label="Change language"]').click();
    await page.locator('button', { hasText: 'العربية' }).click();
    await expect(page.locator('text=آخر الإعلانات')).toBeVisible();

    // Navigate to /annonces
    await page.goto('/annonces');
    await expect(page.locator('h1')).toContainText('الإعلانات');

    // Navigate to /mentions-legales
    await page.goto('/mentions-legales');
    await expect(page.locator('h1')).toContainText('الإشعارات القانونية');
  });
});
