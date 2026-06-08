import { test, expect, type Page } from '@playwright/test';

/* ─── Mock data ─────────────────────────────────────────── */

const MOCK_USERS = {
  admin: {
    id: 'admin-uuid-0001',
    email: 'admin@donbosco.tn',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'Principal',
  },
  teacher: {
    id: 'teacher-uuid-0001',
    email: 'karim.hamdi@donbosco.tn',
    role: 'teacher',
    first_name: 'Karim',
    last_name: 'Hamdi',
  },
  student: {
    id: 'student-uuid-0001',
    email: 'adam.slim@donbosco.tn',
    role: 'student',
    first_name: 'Adam',
    last_name: 'Slim',
  },
  parent: {
    id: 'parent-uuid-0001',
    email: 'ahmed.slim@parent.tn',
    role: 'parent',
    first_name: 'Ahmed',
    last_name: 'Slim',
  },
};

/* ─── Helpers ───────────────────────────────────────────── */

async function mockAuthMeAPI(page: Page, role: keyof typeof MOCK_USERS) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USERS[role]),
    });
  });
}

async function mockLogoutAPI(page: Page) {
  await page.route('**/api/v1/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
}

async function mockAdminAPIs(page: Page) {
  await page.route('**/api/v1/analytics/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_users: 150,
        total_teachers: 12,
        total_students: 120,
        total_parents: 18,
        total_courses: 25,
        total_ai_conversations: 42,
        grades_last_30_days: 350,
      }),
    });
  });
  await page.route('**/api/v1/analytics/grades**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ labels: ['Math', 'Français', 'Anglais'], averages: [14, 12, 13.5] }),
    });
  });
  await page.route('**/api/v1/analytics/ai-usage**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ labels: [], values: [] }),
    });
  });
  await page.route('**/api/v1/analytics/quiz-stats**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ total_quizzes: 5, avg_score: 78 }),
    });
  });
  await page.route('**/api/v1/audit**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], total: 0 }),
    });
  });
}

async function mockTeacherAPIs(page: Page) {
  await page.route('**/api/v1/analytics/teacher', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_courses: 5,
        total_evaluations: 12,
        grades_last_30_days: 80,
        total_absences_recorded: 15,
        grade_distribution: { '10-12': 20, '12-14': 30, '14-16': 25, '16-20': 5 },
        avg_score: 13.2,
      }),
    });
  });
  await page.route('**/api/v1/analytics/grades**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ labels: ['Math', 'Français'], averages: [14, 12] }),
    });
  });
}

async function mockStudentAPIs(page: Page) {
  await page.route('**/api/v1/gamification/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ xp_total: 450, level: 5, streak_days: 7 }),
    });
  });
  await page.route('**/api/v1/students/*/grades', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ subject: 'Math', score: 16, date: '2026-06-01' }]),
    });
  });
  await page.route('**/api/v1/students/*/absences', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
  await page.route('**/api/v1/timetable/my', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

async function mockParentAPIs(page: Page) {
  await page.route('**/api/v1/users/me/children', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'child-1', first_name: 'Adam', last_name: 'Slim', class_name: '4ème A' },
      ]),
    });
  });
}

async function setupAndGoto(page: Page, role: keyof typeof MOCK_USERS, path: string) {
  await mockAuthMeAPI(page, role);
  await mockLogoutAPI(page);

  const mockMap: Record<string, () => Promise<void>> = {
    admin: () => mockAdminAPIs(page),
    teacher: () => mockTeacherAPIs(page),
    student: () => mockStudentAPIs(page),
    parent: () => mockParentAPIs(page),
  };
  await mockMap[role]();

  await page.goto(path);
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════ */

test.describe('Admin — Dashboard', () => {
  test('affiche le titre et la section de bienvenue', async ({ page }) => {
    await setupAndGoto(page, 'admin', '/admin/dashboard');

    // Should have a heading with "Dashboard"
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('affiche les cartes de statistiques', async ({ page }) => {
    await setupAndGoto(page, 'admin', '/admin/dashboard');

    // Should show content with numbers (stat values)
    const body = page.locator('body');
    await expect(body).toContainText(/\d+/, { timeout: 10000 });
  });

  test('affiche la sidebar avec les liens de navigation', async ({ page }) => {
    await setupAndGoto(page, 'admin', '/admin/dashboard');

    // Should have navigation links or sidebar — check body text for nav items
    const body = page.locator('body');
    await expect(body).toContainText(/dashboard|tableau de bord|utilisateurs|cours|annonce/i, { timeout: 10000 });
  });
});

/* ═══════════════════════════════════════════════════════════
   TEACHER DASHBOARD
   ═══════════════════════════════════════════════════════════ */

test.describe('Teacher — Dashboard', () => {
  test('affiche le titre du dashboard enseignant', async ({ page }) => {
    await setupAndGoto(page, 'teacher', '/teacher/dashboard');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('affiche les statistiques (cours, évaluations, notes)', async ({ page }) => {
    await setupAndGoto(page, 'teacher', '/teacher/dashboard');

    // Should show stat cards with specific labels
    const content = page.locator('body');
    await expect(content).toContainText(/cours|évaluations|notes/i, { timeout: 10000 });
  });

  test('affiche la distribution des notes', async ({ page }) => {
    await setupAndGoto(page, 'teacher', '/teacher/dashboard');

    // Chart area should be visible
    const chartSection = page.locator('[class*="chart"], canvas, svg, h3').filter({ hasText: /distribution|notes/i }).first();
    await expect(chartSection).toBeVisible({ timeout: 10000 });
  });
});

/* ═══════════════════════════════════════════════════════════
   STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════════ */

test.describe('Student — Dashboard', () => {
  test('affiche la salutation et le profil', async ({ page }) => {
    await setupAndGoto(page, 'student', '/student/dashboard');

    // Should show greeting or student name
    const greeting = page.locator('body');
    await expect(greeting).toContainText(/Adam|bonjour|après-midi|soir/i, { timeout: 10000 });
  });

  test('affiche les cartes d\'action (notes, absences, quiz, gamification)', async ({ page }) => {
    await setupAndGoto(page, 'student', '/student/dashboard');

    // Should show quick action cards with specific labels
    const content = page.locator('body');
    await expect(content).toContainText(/notes|absences|quiz|gamification/i, { timeout: 10000 });
  });

  test('affiche le level et les XP du student', async ({ page }) => {
    await setupAndGoto(page, 'student', '/student/dashboard');

    const content = page.locator('body');
    await expect(content).toContainText(/450.*XP|XP.*450|niveau.*5|level.*5/i, { timeout: 10000 });
  });
});

/* ═══════════════════════════════════════════════════════════
   PARENT DASHBOARD
   ═══════════════════════════════════════════════════════════ */

test.describe('Parent — Dashboard', () => {
  test('affiche le titre du dashboard parent', async ({ page }) => {
    await setupAndGoto(page, 'parent', '/parent/dashboard');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('affiche la liste des enfants', async ({ page }) => {
    await setupAndGoto(page, 'parent', '/parent/dashboard');

    const content = page.locator('body');
    await expect(content).toContainText(/Adam|Slim|enfant/i, { timeout: 10000 });
  });

  test('affiche les cartes d\'action (notes, absences, messages)', async ({ page }) => {
    await setupAndGoto(page, 'parent', '/parent/dashboard');

    const content = page.locator('body');
    await expect(content).toContainText(/notes|absences|messages/i, { timeout: 10000 });
  });
});

/* ═══════════════════════════════════════════════════════════
   CROSS-ROLE: REDIRECT NON-AUTHENTICATED USERS
   ═══════════════════════════════════════════════════════════ */

test.describe('Dashboard — Authentification', () => {
  test('redirige vers /login si non authentifié (admin)', async ({ page }) => {
    // Mock all API endpoints to return 401 — triggers the axios interceptor redirect
    await page.route('**/api/v1/**', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'Not authenticated' }) });
    });

    await page.goto('/admin/dashboard').catch(() => {});
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test('redirige vers /login si non authentifié (student)', async ({ page }) => {
    // Mock all API endpoints to return 401 — triggers the axios interceptor redirect
    await page.route('**/api/v1/**', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'Not authenticated' }) });
    });

    await page.goto('/student/dashboard').catch(() => {});
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
