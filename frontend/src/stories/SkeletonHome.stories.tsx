import type { Meta, StoryObj } from '@storybook/react';

function HomePageSkeleton() {
  return (
    <div className="bg-white">
      <div className="bg-gradient-to-br from-gray-200 to-gray-300 py-24">
        <div className="max-w-7xl mx-auto px-4 text-center animate-pulse">
          <div className="w-20 h-20 bg-white/30 rounded-2xl mx-auto mb-6" />
          <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4" />
          <div className="h-6 bg-white/20 rounded w-[500px] mx-auto mb-2" />
          <div className="h-6 bg-white/20 rounded w-80 mx-auto mb-8" />
          <div className="h-12 bg-white/30 rounded w-64 mx-auto" />
        </div>
      </div>
      <div className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12 animate-pulse">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-80" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof HomePageSkeleton> = {
  title: 'Components/Skeletons/HomePage',
  component: HomePageSkeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Skeleton complet de la page d\'accueil — hero + section annonces.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof HomePageSkeleton>;

export const PageAccueil: Story = {};
