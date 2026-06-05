/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react';

function AnnouncementDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200" />
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-4 mt-6">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + (i * 5) % 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof AnnouncementDetailSkeleton> = {
  title: 'Components/Skeletons/AnnouncementDetail',
  component: AnnouncementDetailSkeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Skeleton de la page de détail — hero, métadonnées, et contenu.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnnouncementDetailSkeleton>;

export const PageDetail: Story = {};
