# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-portal-ar.spec.ts >> PolitiqueRGPDPage — Arabic rendering >> renders with RTL direction
- Location: tests/public-portal-ar.spec.ts:241:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[dir="rtl"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[dir="rtl"]').first()

```

```yaml
- banner:
  - link "Don Bosco Connect":
    - /url: /
    - img
    - text: Don Bosco Connect
  - navigation:
    - link "public_nav.home":
      - /url: /
    - link "public_nav.announcements":
      - /url: /annonces
    - link "public_nav.contact":
      - /url: /contact
  - button "Change language":
    - img
    - text: 🇫🇷 Français
  - link "auth.login":
    - /url: /login
- main:
  - link "common.back_to_home":
    - /url: /
    - img
    - text: common.back_to_home
  - heading "rgpd.title" [level=1]
  - paragraph: rgpd.subtitle
  - paragraph: rgpd.intro
  - heading "rgpd.controller" [level=2]:
    - img
    - text: rgpd.controller
  - paragraph:
    - strong: Institut Don Bosco Tunis
  - paragraph: Avenue de la République, Tunis 1002, Tunisie
  - paragraph:
    - text: "Email :"
    - strong: rgpd@donbosco.tn
  - heading "rgpd.collected_data" [level=2]:
    - img
    - text: rgpd.collected_data
  - paragraph: rgpd.collected_data_desc
  - table:
    - rowgroup:
      - row "rgpd.data_category rgpd.data_content rgpd.data_purpose":
        - columnheader "rgpd.data_category"
        - columnheader "rgpd.data_content"
        - columnheader "rgpd.data_purpose"
    - rowgroup:
      - row "rgpd.data_identity rgpd.data_identity_content rgpd.data_identity_purpose":
        - cell "rgpd.data_identity"
        - cell "rgpd.data_identity_content"
        - cell "rgpd.data_identity_purpose"
      - row "rgpd.data_school rgpd.data_school_content rgpd.data_school_purpose":
        - cell "rgpd.data_school"
        - cell "rgpd.data_school_content"
        - cell "rgpd.data_school_purpose"
      - row "rgpd.data_usage rgpd.data_usage_content rgpd.data_usage_purpose":
        - cell "rgpd.data_usage"
        - cell "rgpd.data_usage_content"
        - cell "rgpd.data_usage_purpose"
      - row "rgpd.data_messaging rgpd.data_messaging_content rgpd.data_messaging_purpose":
        - cell "rgpd.data_messaging"
        - cell "rgpd.data_messaging_content"
        - cell "rgpd.data_messaging_purpose"
  - heading "rgpd.legal_basis" [level=2]
  - paragraph: rgpd.legal_basis_desc
  - list:
    - listitem:
      - strong: rgpd.basis_contract
      - text: — rgpd.basis_contract_desc
    - listitem:
      - strong: rgpd.basis_legal
      - text: — rgpd.basis_legal_desc
    - listitem:
      - strong: rgpd.basis_legitimate
      - text: — rgpd.basis_legitimate_desc
    - listitem:
      - strong: rgpd.basis_consent
      - text: — rgpd.basis_consent_desc
  - heading "rgpd.retention" [level=2]:
    - img
    - text: rgpd.retention
  - paragraph:
    - text: •
    - strong: rgpd.retention_students
    - text: ": rgpd.retention_students_desc"
  - paragraph:
    - text: •
    - strong: rgpd.retention_teachers
    - text: ": rgpd.retention_teachers_desc"
  - paragraph:
    - text: •
    - strong: rgpd.retention_messaging
    - text: ": rgpd.retention_messaging_desc"
  - paragraph:
    - text: •
    - strong: rgpd.retention_logs
    - text: ": rgpd.retention_logs_desc"
  - paragraph:
    - text: •
    - strong: rgpd.retention_analytics
    - text: ": rgpd.retention_analytics_desc"
  - heading "rgpd.rights" [level=2]:
    - img
    - text: rgpd.rights
  - paragraph: rgpd.rights_desc
  - paragraph: rgpd.right_access
  - paragraph: rgpd.right_access_desc
  - paragraph: rgpd.right_rectification
  - paragraph: rgpd.right_rectification_desc
  - paragraph: rgpd.right_erasure
  - paragraph: rgpd.right_erasure_desc
  - paragraph: rgpd.right_portability
  - paragraph: rgpd.right_portability_desc
  - paragraph: rgpd.right_opposition
  - paragraph: rgpd.right_opposition_desc
  - paragraph: rgpd.right_limitation
  - paragraph: rgpd.right_limitation_desc
  - heading "rgpd.security" [level=2]:
    - img
    - text: rgpd.security
  - paragraph: rgpd.security_desc
  - list:
    - listitem: rgpd.security_tls
    - listitem: rgpd.security_bcrypt
    - listitem: rgpd.security_aes
    - listitem: rgpd.security_cookies
    - listitem: rgpd.security_ratelimit
    - listitem: rgpd.security_audit
    - listitem: rgpd.security_local
    - listitem: rgpd.security_backup
  - heading "rgpd.minors" [level=2]
  - paragraph: rgpd.minors_desc1
  - paragraph: rgpd.minors_desc2
  - heading "rgpd.deletion" [level=2]:
    - img
    - text: rgpd.deletion
  - paragraph: rgpd.deletion_desc
  - paragraph:
    - img
    - text: rgpd.dpo
  - paragraph: 📧 rgpd@donbosco.tn
  - paragraph: 📞 +216 71 123 456
  - paragraph: rgpd.response_time
  - paragraph: common.last_updated
  - paragraph: rgpd.policy_update
- contentinfo:
  - img
  - text: Don Bosco Connect
  - paragraph: public_footer.tagline
  - heading "public_footer.contact" [level=3]
  - list:
    - listitem: 📍 public_footer.address
    - listitem: 📞 +216 71 123 456
    - listitem: ✉️ contact@donbosco.tn
  - heading "public_footer.useful_links" [level=3]
  - list:
    - listitem:
      - link "public_nav.contact":
        - /url: /contact
    - listitem:
      - link "public_footer.legal":
        - /url: /mentions-legales
    - listitem:
      - link "public_footer.rgpd":
        - /url: /politique-rgpd
  - text: © 2026 Don Bosco Connect. public_footer.rights
- button "Open Tanstack query devtools":
  - img
```

# Test source

```ts
  144 | 
  145 |   test('shows Arabic search placeholder', async ({ page }) => {
  146 |     await page.goto('/annonces');
  147 |     const searchInput = page.locator('input[placeholder="البحث عن إعلان..."]');
  148 |     await expect(searchInput).toBeVisible();
  149 |   });
  150 | });
  151 | 
  152 | /* ═══════════════════════════════════════════════════════════
  153 |    ANNOUNCE DETAIL PAGE — Arabic
  154 |    ═══════════════════════════════════════════════════════════ */
  155 | 
  156 | test.describe('AnnounceDetailPage — Arabic rendering', () => {
  157 |   test.beforeEach(async ({ page }) => {
  158 |     await setArabicLanguage(page);
  159 |     await mockAnnouncementDetailAPI(page, 'rentree-scolaire-2026-2027');
  160 |   });
  161 | 
  162 |   test('renders with RTL direction', async ({ page }) => {
  163 |     await page.goto('/annonces/rentree-scolaire-2026-2027');
  164 |     const container = page.locator('[dir="rtl"]').first();
  165 |     await expect(container).toBeVisible();
  166 |   });
  167 | 
  168 |   test('shows Arabic back link', async ({ page }) => {
  169 |     await page.goto('/annonces/rentree-scolaire-2026-2027');
  170 |     await expect(page.locator('text=العودة إلى الإعلانات')).toBeVisible();
  171 |   });
  172 | 
  173 |   test('shows Arabic share button', async ({ page }) => {
  174 |     await page.goto('/annonces/rentree-scolaire-2026-2027');
  175 |     await expect(page.locator('button', { hasText: 'مشاركة' })).toBeVisible();
  176 |   });
  177 | 
  178 |   test('shows Arabic reactions section', async ({ page }) => {
  179 |     await page.goto('/annonces/rentree-scolaire-2026-2027');
  180 |     await expect(page.locator('text=ردود الفعل')).toBeVisible();
  181 |   });
  182 | 
  183 |   test('shows Arabic 404 for missing announcement', async ({ page }) => {
  184 |     await page.route('**/api/v1/public/announcements/does-not-exist', async (route) => {
  185 |       await route.fulfill({ status: 404, contentType: 'application/json', body: '{"detail":"Not found"}' });
  186 |     });
  187 |     await page.goto('/annonces/does-not-exist');
  188 |     await expect(page.locator('text=لم يتم العثور على الإعلان')).toBeVisible();
  189 |   });
  190 | });
  191 | 
  192 | /* ═══════════════════════════════════════════════════════════
  193 |    MENTIONS LÉGALES PAGE — Arabic
  194 |    ═══════════════════════════════════════════════════════════ */
  195 | 
  196 | test.describe('MentionsLegalesPage — Arabic rendering', () => {
  197 |   test.beforeEach(async ({ page }) => {
  198 |     await setArabicLanguage(page);
  199 |   });
  200 | 
  201 |   test('renders with RTL direction', async ({ page }) => {
  202 |     await page.goto('/mentions-legales');
  203 |     const container = page.locator('[dir="rtl"]').first();
  204 |     await expect(container).toBeVisible();
  205 |   });
  206 | 
  207 |   test('shows Arabic page title', async ({ page }) => {
  208 |     await page.goto('/mentions-legales');
  209 |     await expect(page.locator('h1')).toContainText('الإشعارات القانونية');
  210 |   });
  211 | 
  212 |   test('shows Arabic section headings', async ({ page }) => {
  213 |     await page.goto('/mentions-legales');
  214 |     await expect(page.locator('text=ناشر الموقع')).toBeVisible();
  215 |     await expect(page.locator('text=المستضيف')).toBeVisible();
  216 |     await expect(page.locator('text=المالكية الفكرية')).toBeVisible();
  217 |     await expect(page.locator('text=ملفات تعريف الارتباط')).toBeVisible();
  218 |   });
  219 | 
  220 |   test('shows Arabic back link', async ({ page }) => {
  221 |     await page.goto('/mentions-legales');
  222 |     await expect(page.locator('text=العودة إلى الصفحة الرئيسية')).toBeVisible();
  223 |   });
  224 | 
  225 |   test('sets document lang to ar', async ({ page }) => {
  226 |     await page.goto('/mentions-legales');
  227 |     const lang = await page.locator('html').getAttribute('lang');
  228 |     expect(lang).toBe('ar');
  229 |   });
  230 | });
  231 | 
  232 | /* ═══════════════════════════════════════════════════════════
  233 |    POLITIQUE RGPD PAGE — Arabic
  234 |    ═══════════════════════════════════════════════════════════ */
  235 | 
  236 | test.describe('PolitiqueRGPDPage — Arabic rendering', () => {
  237 |   test.beforeEach(async ({ page }) => {
  238 |     await setArabicLanguage(page);
  239 |   });
  240 | 
  241 |   test('renders with RTL direction', async ({ page }) => {
  242 |     await page.goto('/politique-rgpd');
  243 |     const container = page.locator('[dir="rtl"]').first();
> 244 |     await expect(container).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
  245 |   });
  246 | 
  247 |   test('shows Arabic page title', async ({ page }) => {
  248 |     await page.goto('/politique-rgpd');
  249 |     await expect(page.locator('h1')).toContainText('سياسة حماية البيانات');
  250 |   });
  251 | 
  252 |   test('shows Arabic subtitle', async ({ page }) => {
  253 |     await page.goto('/politique-rgpd');
  254 |     await expect(page.locator('text=متوافق مع RGPD').first()).toBeVisible();
  255 |   });
  256 | 
  257 |   test('shows Arabic data categories', async ({ page }) => {
  258 |     await page.goto('/politique-rgpd');
  259 |     await expect(page.locator('text=البيانات المجمعة')).toBeVisible();
  260 |     await expect(page.locator('text=الهوية')).toBeVisible();
  261 |   });
  262 | 
  263 |   test('shows Arabic rights section', async ({ page }) => {
  264 |     await page.goto('/politique-rgpd');
  265 |     await expect(page.locator('text=حقوقك')).toBeVisible();
  266 |     await expect(page.locator('text=حق الوصول')).toBeVisible();
  267 |   });
  268 | 
  269 |   test('shows Arabic security section', async ({ page }) => {
  270 |     await page.goto('/politique-rgpd');
  271 |     await expect(page.locator('text=تدابير الأمان')).toBeVisible();
  272 |   });
  273 | 
  274 |   test('shows Arabic minors section', async ({ page }) => {
  275 |     await page.goto('/politique-rgpd');
  276 |     await expect(page.locator('text=حماية القاصرين')).toBeVisible();
  277 |   });
  278 | });
  279 | 
  280 | /* ═══════════════════════════════════════════════════════════
  281 |    CONTACT PAGE — Arabic
  282 |    ═══════════════════════════════════════════════════════════ */
  283 | 
  284 | test.describe('ContactPage — Arabic rendering', () => {
  285 |   test.beforeEach(async ({ page }) => {
  286 |     await setArabicLanguage(page);
  287 |   });
  288 | 
  289 |   test('renders with RTL direction', async ({ page }) => {
  290 |     await page.goto('/contact');
  291 |     const container = page.locator('[dir="rtl"]').first();
  292 |     await expect(container).toBeVisible();
  293 |   });
  294 | 
  295 |   test('shows Arabic page title', async ({ page }) => {
  296 |     await page.goto('/contact');
  297 |     await expect(page.locator('h1')).toContainText('اتصل بنا');
  298 |   });
  299 | 
  300 |   test('shows Arabic contact info', async ({ page }) => {
  301 |     await page.goto('/contact');
  302 |     await expect(page.locator('text=معلومات الاتصال')).toBeVisible();
  303 |     await expect(page.locator('text=العنوان')).toBeVisible();
  304 |     await expect(page.locator('text=الهاتف')).toBeVisible();
  305 |   });
  306 | 
  307 |   test('shows Arabic form labels', async ({ page }) => {
  308 |     await page.goto('/contact');
  309 |     await expect(page.locator('text=أرسل لنا رسالة')).toBeVisible();
  310 |     await expect(page.locator('text=الاسم الكامل')).toBeVisible();
  311 |     await expect(page.locator('text=رسالة')).toBeVisible();
  312 |   });
  313 | 
  314 |   test('shows Arabic submit button', async ({ page }) => {
  315 |     await page.goto('/contact');
  316 |     await expect(page.locator('button', { hasText: 'إرسال الرسالة' })).toBeVisible();
  317 |   });
  318 | });
  319 | 
  320 | /* ═══════════════════════════════════════════════════════════
  321 |    LANGUAGE SWITCHER — Persistence
  322 |    ═══════════════════════════════════════════════════════════ */
  323 | 
  324 | test.describe('Language persistence', () => {
  325 |   test('language preference persists across page reloads', async ({ page }) => {
  326 |     // First visit: set Arabic via the switcher
  327 |     await page.goto('/');
  328 |     await page.locator('button[aria-label="Change language"]').click();
  329 |     await page.locator('button', { hasText: 'العربية' }).click();
  330 | 
  331 |     // Verify Arabic is showing
  332 |     await expect(page.locator('text=آخر الإعلانات')).toBeVisible();
  333 | 
  334 |     // Reload the page
  335 |     await page.reload();
  336 | 
  337 |     // Verify Arabic persists
  338 |     await expect(page.locator('text=آخر الإعلانات')).toBeVisible();
  339 |     const container = page.locator('[dir="rtl"]').first();
  340 |     await expect(container).toBeVisible();
  341 |   });
  342 | 
  343 |   test('language preference persists across navigation', async ({ page }) => {
  344 |     await mockAnnouncementsListAPI(page);
```