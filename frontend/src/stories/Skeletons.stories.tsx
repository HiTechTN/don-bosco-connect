/* eslint-disable storybook/no-renderer-packages, @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { AnnouncementCard } from '@/components/public/AnnouncementCard';

function AnnouncementCardSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
      {withImage ? (
        <div className="h-48 bg-gray-200" />
      ) : (
        <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <div className="w-10 h-10 bg-white/30 rounded" />
        </div>
      )}
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

const meta: Meta<typeof AnnouncementCardSkeleton> = {
  title: 'Components/Skeletons/AnnouncementCard',
  component: AnnouncementCardSkeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Skeleton de chargement pour les cartes d\'annonces.',
      },
    },
  },
  argTypes: {
    withImage: { control: 'boolean', description: 'Avec ou sans zone image' },
  },
};

export default meta;
type Story = StoryObj<typeof AnnouncementCardSkeleton>;

export const AvecImage: Story = {
  args: { withImage: true },
};

export const SansImage: Story = {
  args: { withImage: false },
};

export const Grille3x2: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <AnnouncementCardSkeleton key={i} withImage={i % 3 !== 0} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grille de 6 skeletons telle qu\'affichée sur /annonces.',
      },
    },
  },
};
