import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen, changeLanguage } from './test-utils';
import PolitiqueRGPDPage from '../pages/public/PolitiqueRGPDPage';

describe('PolitiqueRGPDPage', () => {
  beforeEach(async () => {
    await changeLanguage('fr');
  });

  describe('French rendering', () => {
    it('renders the page title from i18n', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Politique de protection des données')).toBeDefined();
    });

    it('renders the subtitle', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText(/Conforme au RGPD/)).toBeDefined();
    });

    it('renders the collected data section', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Données collectées')).toBeDefined();
    });

    it('renders the data categories table', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Identité')).toBeDefined();
      expect(screen.getByText('Données scolaires')).toBeDefined();
      expect(screen.getByText("Données d'utilisation")).toBeDefined();
    });

    it('renders the legal basis section', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Base légale du traitement')).toBeDefined();
    });

    it('renders the retention section', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Durée de conservation')).toBeDefined();
    });

    it('renders all 6 user rights', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText("Droit d'accès")).toBeDefined();
      expect(screen.getByText('Droit de rectification')).toBeDefined();
      expect(screen.getByText("Droit à l'effacement")).toBeDefined();
      expect(screen.getByText('Droit à la portabilité')).toBeDefined();
      expect(screen.getByText("Droit d'opposition")).toBeDefined();
      expect(screen.getByText('Droit de limitation')).toBeDefined();
    });

    it('renders the security section', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Mesures de sécurité')).toBeDefined();
    });

    it('renders the minors protection section', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      expect(screen.getByText('Protection des mineurs')).toBeDefined();
    });

    it('sets dir=ltr for French', () => {
      renderWithProviders(<PolitiqueRGPDPage />);
      const container = screen.getByText('Politique de protection des données').closest('[dir]');
      expect(container?.getAttribute('dir')).toBe('ltr');
    });
  });

  describe('Arabic rendering', () => {
    it('renders the page title in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('سياسة حماية البيانات')).toBeDefined();
    });

    it('renders the subtitle in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText(/متوافق مع RGPD/)).toBeDefined();
    });

    it('renders the collected data section in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('البيانات المجمعة')).toBeDefined();
    });

    it('renders data categories in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('الهوية')).toBeDefined();
      expect(screen.getByText('البيانات المدرسية')).toBeDefined();
    });

    it('renders the rights section in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('حقوقك')).toBeDefined();
      expect(screen.getByText('حق الوصول')).toBeDefined();
    });

    it('renders the security section in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('تدابير الأمان')).toBeDefined();
    });

    it('renders the minors section in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('حماية القاصرين')).toBeDefined();
    });

    it('sets dir=rtl for Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      const container = screen.getByText('سياسة حماية البيانات').closest('[dir]');
      expect(container?.getAttribute('dir')).toBe('rtl');
    });

    it('renders the back link in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('العودة إلى الصفحة الرئيسية')).toBeDefined();
    });

    it('renders the DPO section in Arabic', () => {
      renderWithProviders(<PolitiqueRGPDPage />, { language: 'ar' });
      expect(screen.getByText('مندوب حماية البيانات')).toBeDefined();
    });
  });
});
