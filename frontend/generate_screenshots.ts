import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:4173';
const SCREENSHOTS_DIR = path.join(__dirname, 'demo', 'screenshots');

const CREDENTIALS = [
  { role: 'admin', email: 'admin@donbosco.tn', password: 'admin123!' },
  { role: 'teacher', email: 'karim.hamdi@donbosco.tn', password: 'teacher123!' },
  { role: 'student', email: 'adam.slim@donbosco.tn', password: 'student123!' },
  { role: 'parent', email: 'ahmed.slim@parent.tn', password: 'parent123!' },
];

const ROUTES_BY_ROLE: Record<string, { path: string; filename: string }[]> = {
  admin: [
    { path: '/admin/dashboard', filename: 'admin_02_dashboard' },
    { path: '/admin/users', filename: 'admin_03_users' },
    { path: '/admin/classes', filename: 'admin_04_classes' },
    { path: '/admin/subjects', filename: 'admin_05_subjects' },
    { path: '/admin/timetable', filename: 'admin_06_timetable' },
    { path: '/admin/events', filename: 'admin_07_events' },
    { path: '/admin/audit', filename: 'admin_08_audit' },
  ],
  teacher: [
    { path: '/teacher/dashboard', filename: 'teacher_02_dashboard' },
    { path: '/teacher/courses', filename: 'teacher_03_courses' },
    { path: '/teacher/grades', filename: 'teacher_04_grades' },
    { path: '/teacher/absences', filename: 'teacher_05_absences' },
    { path: '/teacher/messages', filename: 'teacher_06_messages' },
    { path: '/teacher/ai', filename: 'teacher_07_ai' },
  ],
  student: [
    { path: '/student/dashboard', filename: 'student_02_dashboard' },
    { path: '/student/grades', filename: 'student_03_grades' },
    { path: '/student/absences', filename: 'student_04_absences' },
    { path: '/student/timetable', filename: 'student_05_timetable' },
    { path: '/student/quizzes', filename: 'student_06_quizzes' },
    { path: '/student/ai', filename: 'student_07_ai' },
    { path: '/student/gamification', filename: 'student_08_gamification' },
  ],
  parent: [
    { path: '/parent/dashboard', filename: 'parent_02_dashboard' },
    { path: '/parent/grades', filename: 'parent_03_grades' },
    { path: '/parent/absences', filename: 'parent_04_absences' },
    { path: '/parent/messages', filename: 'parent_05_messages' },
  ],
};

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(password);

  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();

  await page.waitForTimeout(5000);
}

async function waitForPageReady(page: Page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  } catch (e) {}
  await page.waitForTimeout(3000);

  try {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
        }
      });
    });
  } catch (e) {}

  await page.waitForTimeout(2000);
}

async function takeScreenshot(page: Page, routePath: string, filename: string) {
  await page.goto(`${BASE_URL}${routePath}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForPageReady(page);

  const outputPath = path.join(SCREENSHOTS_DIR, `${filename}.png`);
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    type: 'png',
    omitBackground: false,
  });

  console.log(`  ✅ ${filename}.png`);
}

async function takeScreenshotWithRetry(page: Page, routePath: string, filename: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      await takeScreenshot(page, routePath, filename);
      return;
    } catch (err) {
      if (i === retries) throw err;
      console.log(`  🔄 Retrying ${filename} (${i + 1}/${retries})...`);
      await page.waitForTimeout(2000);
    }
  }
}

async function main() {
  console.log(' Starting screenshot generation...\n');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR',
  });

  console.log('📸 Login page...');
  const loginPage = await context.newPage();
  await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await loginPage.waitForTimeout(3000);
  await loginPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '00_login.png') });
  console.log('  ✅ 00_login.png\n');
  await loginPage.close();

  for (const cred of CREDENTIALS) {
    console.log(`📸 ${cred.role.toUpperCase()} screenshots:`);

    let page: Page | null = null;
    try {
      page = await context.newPage();
      await login(page, cred.email, cred.password);

      const routes = ROUTES_BY_ROLE[cred.role] || [];
      for (const route of routes) {
        try {
          if (cred.role === 'student') {
            await takeScreenshotWithRetry(page, route.path, route.filename);
          } else {
            await takeScreenshot(page, route.path, route.filename);
          }
        } catch (err) {
          console.error(`  ⚠️ Failed ${route.filename}:`, err);
          if (page.isClosed()) break;
        }
      }
    } catch (error) {
      console.error(`  ❌ Error for ${cred.role}:`, error);
    } finally {
      if (page && !page.isClosed()) {
        await page.close();
      }
    }
    console.log('');
  }

  await browser.close();
  console.log('✅ All screenshots generated!');
}

main().catch(console.error);
