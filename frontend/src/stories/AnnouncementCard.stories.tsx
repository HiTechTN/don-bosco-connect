import type { Meta, StoryObj } from '@storybook/react';
import { AnnouncementCard } from '@/components/public/AnnouncementCard';

const meta: Meta<typeof AnnouncementCard> = {
  title: 'Components/AnnouncementCard',
  component: AnnouncementCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Carte d\'annonce réutilisable pour le portail public. Affiche image de couverture, catégorie, titre, extrait, date et réactions.',
      },
    },
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['general', 'evenement', 'academique', 'pedagogique', 'vie_scolaire'],
      description: 'Catégorie de l\'annonce (détermine la couleur du badge)',
    },
    pinned: { control: 'boolean', description: 'Affiche le badge "Épinglée"' },
  },
};

export default meta;
type Story = StoryObj<typeof AnnouncementCard>;

/* ─── Avec image de couverture ─────────────────────────── */

export const AvecImage: Story = {
  args: {
    title: 'Rentrée scolaire 2026-2027',
    excerpt: 'Informations pratiques pour la rentrée à venir. Les cours débutent le 1er septembre.',
    category: 'academique',
    coverImageUrl: 'https://picsum.photos/seed/renintree/800/400',
    publishAt: '2026-06-01T10:00:00Z',
    slug: 'rentree-scolaire-2026-2027',
    pinned: false,
    reactions: null,
  },
};

/* ─── Épinglée avec image ──────────────────────────────── */

export const Epinglee: Story = {
  args: {
    title: 'Rentrée scolaire 2026-2027',
    excerpt: 'Informations pratiques pour la rentrée à venir.',
    category: 'academique',
    coverImageUrl: 'https://picsum.photos/seed/epinglee/800/400',
    publishAt: '2026-06-01T10:00:00Z',
    slug: 'rentree-scolaire-2026-2027',
    pinned: true,
    reactions: { '👍': 24, '🎉': 8 },
  },
};

/* ─── Sans image de couverture ─────────────────────────── */

export const SansImage: Story = {
  args: {
    title: 'Nouveau règlement intérieur',
    excerpt: 'Le règlement intérieur a été mis à jour pour l\'année en cours.',
    category: 'general',
    coverImageUrl: null,
    publishAt: '2026-05-15T14:00:00Z',
    slug: 'nouveau-reglement-interieur',
    pinned: false,
    reactions: null,
  },
};

/* ─── Sans extrait ─────────────────────────────────────── */

export const SansExtrait: Story = {
  args: {
    title: 'Annonce courte sans description',
    excerpt: null,
    category: 'vie_scolaire',
    coverImageUrl: null,
    publishAt: '2026-05-10T09:00:00Z',
    slug: 'annonce-courte',
    pinned: false,
    reactions: null,
  },
};

/* ─── Avec réactions ───────────────────────────────────── */

export const AvecReactions: Story = {
  args: {
    title: 'Journée portes ouvertes',
    excerpt: 'Venez découvrir notre établissement ce samedi de 9h à 16h.',
    category: 'evenement',
    coverImageUrl: 'https://picsum.photos/seed/portes/800/400',
    publishAt: '2026-05-20T08:00:00Z',
    slug: 'journee-portes-ouvertes',
    pinned: false,
    reactions: { '❤️': 12, '👏': 5, '🎉': 3 },
  },
};

/* ─── Catégorie Pédagogique ────────────────────────────── */

export const Pedagogique: Story = {
  args: {
    title: 'Nouveau programme de mathématiques',
    excerpt: 'Découvrez le nouveau programme de maths pour le secondaire.',
    category: 'pedagogique',
    coverImageUrl: null,
    publishAt: '2026-04-15T11:00:00Z',
    slug: 'nouveau-programme-maths',
    pinned: false,
    reactions: null,
  },
};

/* ─── Grille de 3 cartes ───────────────────────────────── */

export const Grille: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <AnnouncementCard
        title="Rentrée scolaire 2026-2027"
        excerpt="Informations pratiques pour la rentrée à venir."
        category="academique"
        coverImageUrl="https://picsum.photos/seed/rentree/800/400"
        publishAt="2026-06-01T10:00:00Z"
        slug="rentree"
        pinned
      />
      <AnnouncementCard
        title="Journée portes ouvertes"
        excerpt="Venez découvrir notre établissement."
        category="evenement"
        coverImageUrl={null}
        publishAt="2026-05-20T08:00:00Z"
        slug="portes-ouvertes"
        reactions={{ '❤️': 12 }}
      />
      <AnnouncementCard
        title="Nouveau règlement intérieur"
        excerpt="Le règlement a été mis à jour pour l'année en cours."
        category="general"
        coverImageUrl="https://picsum.photos/seed/reglement/800/400"
        publishAt="2026-05-15T14:00:00Z"
        slug="reglement"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de grille de 3 annonces tel qu\'affiché sur la page d\'accueil.',
      },
    },
  },
};
