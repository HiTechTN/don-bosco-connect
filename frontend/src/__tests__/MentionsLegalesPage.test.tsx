import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen, changeLanguage } from './test-utils';
import MentionsLegalesPage from '../pages/public/MentionsLegalesPage';

describe('MentionsLegalesPage', () => {
  beforeEach(async () => {
    await changeLanguage('fr');
  });

  describe('French rendering', () => {
    it('renders the page title from i18n', async () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Mentions légales')).toBeDefined();
    });

    it('renders the publisher section', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Éditeur du site')).toBeDefined();
    });

    it('renders the director section', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Directeur de la publication')).toBeDefined();
    });

    it('renders the host section', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Hébergeur')).toBeDefined();
    });

    it('renders the IP section', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Propriété intellectuelle')).toBeDefined();
    });

    it('renders the cookies section', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Cookies')).toBeDefined();
    });

    it('renders the applicable law section', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText('Droit applicable')).toBeDefined();
    });

    it('renders the back to home link', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText("Retour à l'accueil")).toBeDefined();
    });

    it('renders cookie details with HttpOnly mention', () => {
      renderWithProviders(<MentionsLegalesPage />);
      expect(screen.getByText(/Cookie HttpOnly pour l'authentification/)).toBeDefined();
    });

    it('sets dir=ltr for French', () => {
      renderWithProviders(<MentionsLegalesPage />);
      const container = screen.getByText('Mentions légales').closest('[dir]');
      expect(container?.getAttribute('dir')).toBe('ltr');
    });
  });

  describe('Arabic rendering', () => {
    it('renders the page title from i18n in Arabic', () => {
      renderWithProviders(<MentionsLegalesPage />, { language: 'ar' });
      expect(screen.getByText('الإشعارات القانونية')).toBeDefined();
    });

    it('renders the publisher section in Arabic', () => {
      renderWithProviders(<MentionsLegalesPage />, { language: 'ar' });
      expect(screen.getByText('ناشر الموقع')).toBeDefined();
    });

    it('renders the cookies section in Arabic', () => {
      renderWithProviders(<MentionsLegalesPage />, { language: 'ar' });
      expect(screen.getByText('ملفات تعريف الارتباط')).toBeDefined();
    });

    it('sets dir=rtl for Arabic', () => {
      renderWithProviders(<MentionsLegalesPage />, { language: 'ar' });
      const container = screen.getByText('الإشعارات القانونية').closest('[dir]');
      expect(container?.getAttribute('dir')).toBe('rtl');
    });

    it('renders the back link in Arabic', () => {
      renderWithProviders(<MentionsLegalesPage />, { language: 'ar' });
      expect(screen.getByText('العودة إلى الصفحة الرئيسية')).toBeDefined();
    });

    it('renders the RGPD link text in Arabic', () => {
      renderWithProviders(<MentionsLegalesPage />, { language: 'ar' });
      expect(screen.getByText('سياسة RGPD')).toBeDefined();
    });
  });
});
