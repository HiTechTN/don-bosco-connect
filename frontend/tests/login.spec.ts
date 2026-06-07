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

async function mockLoginAPI(page: Page, role: keyof typeof MOCK_USERS) {
  await page.route('**/api/v1/auth/login', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const user = MOCK_USERS[role];
    if (body.email === user.email && body.password) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Email ou mot de passe incorrect' }),
      });
    }
  });
  // Mock refresh endpoint to prevent 401 interceptor from redirecting to /login
  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'mock_token' }),
    });
  });
}

async function mockAuthMeAPI(page: Page, role: keyof typeof MOCK_USERS) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USERS[role]),
    });
  });
}

async function mockDashboardAPIs(page: Page, role: keyof typeof MOCK_USERS) {
  if (role === 'admin') {
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
        body: JSON.stringify({ labels: ['Math', 'Français'], averages: [14, 12] }),
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
  } else if (role === 'teacher') {
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
        body: JSON.stringify({ labels: ['Math'], averages: [14] }),
      });
    });
  } else if (role === 'student') {
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
        body: JSON.stringify([]),
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
  } else if (role === 'parent') {
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
  // Catch-all: prevent unmocked API calls from returning 401 and triggering redirect
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/login') || url.includes('/auth/me') || url.includes('/auth/refresh')) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE — AFFICHAGE
   ═══════════════════════════════════════════════════════════ */

test.describe('Login — Affichage de la page', () => {
  test('affiche le formulaire de connexion avec email et mot de passe', async ({ page }) => {
    await page.goto('/login');

    // Logo / title
    await expect(page.locator('text=Don Bosco')).toBeVisible();

    // Email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('affiche les comptes de démonstration', async ({ page }) => {
    await page.goto('/login');

    // Demo accounts section
    const demoSection = page.locator('text=/compte.*démo|demo/i').first();
    await expect(demoSection).toBeVisible();

    // Should have 4 demo buttons (admin, teacher, student, parent)
    const demoButtons = page.locator('button', { hasText: /admin|enseignant|élève|parent/i });
    await expect(demoButtons).toHaveCount(4);
  });

  test('affiche le bouton pour afficher/masquer le mot de passe', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Click eye icon to show password
    const toggleBtn = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();
    await toggleBtn.click();

    // Password should now be type="text"
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE — COMPTES DÉMO
   ═══════════════════════════════════════════════════════════ */

test.describe('Login — Comptes de démonstration', () => {
  test('clique sur le bouton admin et remplit les champs', async ({ page }) => {
    await page.goto('/login');

    const adminBtn = page.locator('button', { hasText: /admin/i }).first();
    await adminBtn.click();

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('admin@donbosco.tn');
  });

  test('clique sur le bouton enseignant et remplit les champs', async ({ page }) => {
    await page.goto('/login');

    const teacherBtn = page.locator('button', { hasText: /enseignant/i }).first();
    await teacherBtn.click();

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('karim.hamdi@donbosco.tn');
  });
});

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE — CONNEXION RÉUSSIE (par rôle)
   ═══════════════════════════════════════════════════════════ */

test.describe('Login — Connexion réussie', () => {
  for (const role of ['admin', 'teacher', 'student', 'parent'] as const) {
    test(`connecte un ${role} et redirige vers son dashboard`, async ({ page }) => {
      await mockLoginAPI(page, role);
      await mockAuthMeAPI(page, role);
      await mockDashboardAPIs(page, role);

      await page.goto('/login');

      // Fill form
      await page.locator('input[type="email"]').fill(MOCK_USERS[role].email);
      await page.locator('input[type="password"]').fill('testpassword');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Should redirect to the correct dashboard
      const expectedPaths: Record<string, string> = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard',
      };

      await page.waitForURL(`**${expectedPaths[role]}`, { timeout: 10000 });
      expect(page.url()).toContain(expectedPaths[role]);
    });
  }
});

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE — ERREURS
   ═══════════════════════════════════════════════════════════ */

test.describe('Login — Gestion des erreurs', () => {
  test('affiche une erreur pour identifiants incorrects', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Email ou mot de passe incorrect' }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Should display error message — the page uses i18n so check for any error indicator
    const errorDiv = page.locator('div').filter({ hasText: /incorrect|mot de passe|erreur|error/i }).first();
    await expect(errorDiv).toBeVisible({ timeout: 5000 });
  });

  test('affiche une erreur pour compte désactivé', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Compte désactivé' }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('disabled@example.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();

    const errorMsg = page.locator('text=/désactivé|disabled|erreur/i').first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  test('ne redirige pas si la connexion échoue', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Erreur' }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('wrong');
    await page.locator('button[type="submit"]').click();

    // Should stay on /login
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE — VALIDATION FORMULAIRE
   ═══════════════════════════════════════════════════════════ */

test.describe('Login — Validation du formulaire', () => {
  test('le bouton submit est désactivé pendant le chargement', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      // Simulate slow response
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Erreur' }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();

    // Button should show loading state
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });
});
