/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AnnounceDetailPage from '@/pages/public/AnnounceDetailPage';

const MOCK_ANNOUNCEMENT = {
  id: 'ann-1',
  title: 'Rentrée scolaire 2026-2027',
  slug: 'rentree-scolaire-2026-2027',
  excerpt: 'Informations pratiques pour la rentrée à venir.',
  content_html: '<h2>Bienvenue</h2><p>La rentrée est prévue le 1er septembre 2026. Merci de vous munir de tous les documents nécessaires.</p><p>Les manuels seront distribués la première semaine.</p>',
  category: 'academique',
  cover_image_url: 'https://picsum.photos/seed/rentree/800/400',
  publish_at: '2026-06-01T10:00:00Z',
  views_count: 142,
  tags: ['rentrée', '2026'],
  pinned: true,
  reactions: { '👍': 24, '🎉': 8 },
};

const NO_IMAGE_ANNOUNCEMENT = { ...MOCK_ANNOUNCEMENT, cover_image_url: null };

function mockFetch(announcement: unknown) {
  return async (input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/v1/auth/me')) {
      return new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/api/v1/annonces/')) {
      return new Response(JSON.stringify(announcement), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not found', { status: 404 });
  };
}

function mockFetchNotFound() {
  return async (input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/v1/auth/me')) {
      return new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/api/v1/annonces/')) {
      return new Response(JSON.stringify({ detail: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not found', { status: 404 });
  };
}

function StoryWrapper({ children, entry }: { children: React.ReactNode; entry: string }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[entry]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof AnnounceDetailPage> = {
  title: 'Pages/AnnounceDetailPage',
  component: AnnounceDetailPage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Page de détail d\'une annonce. Contenu complet, tags, réactions, métadonnées.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnnounceDetailPage>;

export const AvecImage: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetch(MOCK_ANNOUNCEMENT);
      return (
        <StoryWrapper entry="/annonces/rentree-scolaire-2026-2027">
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Annonce avec image de couverture en hero.',
      },
    },
  },
};

export const SansImage: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetch(NO_IMAGE_ANNOUNCEMENT);
      return (
        <StoryWrapper entry="/annonces/rentree-scolaire-2026-2027">
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sans image — affiche le gradient hero par défaut.',
      },
    },
  },
};

export const Page404: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetchNotFound();
      return (
        <StoryWrapper entry="/annonces/inexistante">
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Annonce introuvable — message d\'erreur 404.',
      },
    },
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetch(MOCK_ANNOUNCEMENT);
      return (
        <StoryWrapper entry="/annonces/rentree-scolaire-2026-2027">
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Version mobile de la page de détail.',
      },
    },
  },
};
