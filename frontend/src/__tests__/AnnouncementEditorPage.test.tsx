import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders, screen, changeLanguage } from './test-utils';
import AnnouncementEditorPage from '../pages/admin/AnnouncementEditorPage';

/* ─── Mocks ─────────────────────────────────────────────── */

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: undefined }) };
});

vi.mock('../hooks/useAnnouncements', () => ({
  useAdminAnnouncement: () => ({ data: null, isLoading: false }),
  useCreateAnnouncement: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateAnnouncement: () => ({ mutate: vi.fn(), isPending: false }),
  usePublishAnnouncement: () => ({ mutate: vi.fn(), isPending: false }),
}));

/* ═══════════════════════════════════════════════════════════
   FRENCH (LTR) RENDERING
   ═══════════════════════════════════════════════════════════ */

describe('AnnouncementEditorPage — French rendering', () => {
  beforeEach(async () => {
    await changeLanguage('fr');
  });

  it('shows the new announcement title', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByRole('heading', { name: 'Nouvelle annonce' })).toBeVisible();
  });

  it('shows the save draft button', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Enregistrer brouillon')).toBeVisible();
  });

  it('shows the publish button', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Publier maintenant')).toBeVisible();
  });

  it('shows the title label', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Titre *')).toBeVisible();
  });

  it('shows the Arabic title label', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Titre (arabe)')).toBeVisible();
  });

  it('shows the excerpt label', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText(/Extrait/)).toBeVisible();
  });

  it('shows the content label', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Contenu')).toBeVisible();
  });

  it('shows the category label and options', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Catégorie')).toBeVisible();
    expect(screen.getByText('Général')).toBeVisible();
  });

  it('shows the visibility label and options', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Visibilité')).toBeVisible();
    expect(screen.getByText('Publique')).toBeVisible();
  });

  it('shows the tags label', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Tags')).toBeVisible();
  });

  it('shows the pinned checkbox', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText(/Épingler en haut/)).toBeVisible();
  });

  it('shows the schedule label', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Planifier la publication')).toBeVisible();
  });

  it('renders with LTR direction', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    const container = screen.getByText('Nouvelle annonce').closest('[dir]');
    expect(container).toHaveAttribute('dir', 'ltr');
  });

  it('shows the editor tip text', () => {
    renderWithProviders(<AnnouncementEditorPage />);
    expect(screen.getByText('Éditeur de contenu riche (TipTap)')).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════
   ARABIC (RTL) RENDERING
   ═══════════════════════════════════════════════════════════ */

describe('AnnouncementEditorPage — Arabic rendering', () => {
  beforeEach(async () => {
    await changeLanguage('fr');
  });

  it('shows the new announcement title in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByRole('heading', { name: 'إعلان جديد' })).toBeVisible();
  });

  it('shows the save draft button in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('حفظ المسودة')).toBeVisible();
  });

  it('shows the publish button in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('نشر الآن')).toBeVisible();
  });

  it('shows the title label in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('العنوان *')).toBeVisible();
  });

  it('shows the Arabic title label in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('العنوان (بالعربية)')).toBeVisible();
  });

  it('shows the excerpt label in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('المقتطف')).toBeVisible();
  });

  it('shows the content label in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('المحتوى')).toBeVisible();
  });

  it('shows the category label and options in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('الفئة')).toBeVisible();
    expect(screen.getAllByText('عام').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the visibility label and options in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('الظهور')).toBeVisible();
    expect(screen.getAllByText('عام').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the tags label in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('الوسوم')).toBeVisible();
  });

  it('shows the pinned checkbox in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText(/تثبيت في الأعلى/)).toBeVisible();
  });

  it('shows the schedule label in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('جدولة النشر')).toBeVisible();
  });

  it('renders with RTL direction', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    const container = screen.getByRole('heading', { name: 'إعلان جديد' }).closest('[dir]');
    expect(container).toHaveAttribute('dir', 'rtl');
  });

  it('shows the editor tip text in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getByText('محرر المحتوى الغني (TipTap)')).toBeVisible();
  });

  it('shows all 5 category options in Arabic', () => {
    renderWithProviders(<AnnouncementEditorPage />, { language: 'ar' });
    expect(screen.getAllByText('عام').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('حدث')).toBeVisible();
    expect(screen.getByText('أكاديمي')).toBeVisible();
    expect(screen.getByText('تربوي')).toBeVisible();
    expect(screen.getByText('حياة مدرسية')).toBeVisible();
  });
});
