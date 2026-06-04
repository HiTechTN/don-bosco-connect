import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/public/HomePage';

const MOCK_ANNOUNCEMENTS = {
  items: [
    {
      id: 'ann-1',
      title: 'Rentrée scolaire 2026-2027',
      slug: 'rentree-scolaire-2026-2027',
      excerpt: 'Informations pratiques pour la rentrée à venir.',
      category: 'academique',
      cover_image_url: 'https://picsum.photos/seed/rentree/800/400',
      publish_at: '2026-06-01T10:00:00Z',
      views_count: 142,
      tags: ['rentrée'],
      pinned: true,
      reactions: { '👍': 24, '🎉': 8 },
    },
    {
      id: 'ann-2',
      title: 'Journée portes ouvertes',
      slug: 'journee-portes-ouvertes',
      excerpt: 'Venez découvrir notre établissement ce samedi.',
      category: 'evenement',
      cover_image_url: null,
      publish_at: '2026-05-20T08:00:00Z',
      views_count: 87,
      tags: ['événements'],
      pinned: false,
      reactions: { '❤️': 12 },
    },
    {
      id: 'ann-3',
      title: 'Nouveau règlement intérieur',
      slug: 'nouveau-reglement-interieur',
      excerpt: 'Le règlement intérieur a été mis à jour.',
      category: 'general',
      cover_image_url: null,
      publish_at: '2026-05-15T14:00:00Z',
      views_count: 53,
      tags: ['règlement'],
      pinned: false,
      reactions: null,
    },
  ],
  total: 3,
  page: 1,
  per_page: 50,
  pages: 1,
};

const EMPTY_ANNOUNCEMENTS = { items: [], total: 0, page: 1, per_page: 50, pages: 0 };

function mockFetch(data: unknown) {
  return async (input: RequestInfo | URL): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/v1/auth/me')) {
      return new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/api/v1/annonces')) {
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not found', { status: 404 });
  };
}

function StoryWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof HomePage> = {
  title: 'Pages/HomePage',
  component: HomePage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Page d\'accueil du portail public. Hero, statistiques, et 3 dernières annonces.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Defaut: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetch(MOCK_ANNOUNCEMENTS);
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
};

export const SansAnnonces: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetch(EMPTY_ANNOUNCEMENTS);
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Quand il n\'y a aucune annonce publiée.',
      },
    },
  },
};

export const Mobile: Story = {
  decorators: [
    (Story) => {
      window.fetch = mockFetch(MOCK_ANNOUNCEMENTS);
      return (
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      );
    },
  ],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Version mobile de la page d\'accueil.',
      },
    },
  },
};
