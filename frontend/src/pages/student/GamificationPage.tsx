import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';

export default function GamificationPage() {
  const { data: profile } = useQuery({
    queryKey: ['gamification-profile'],
    queryFn: () => api.get('/gamification/profile').then(r => r.data),
  });

  const { data: badges } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => api.get('/gamification/my-badges').then(r => r.data),
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/gamification/leaderboard', { params: { period: 'all' } }).then(r => r.data),
  });

  const { data: xpHistory } = useQuery({
    queryKey: ['xp-history'],
    queryFn: () => api.get('/gamification/xp-history').then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gamification</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{profile?.xp_total ?? 0}</p>
            <p className="text-sm text-gray-500">XP Total</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Medal className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{profile?.level ?? 1}</p>
            <p className="text-sm text-gray-500">Niveau</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{profile?.streak_days ?? 0}</p>
            <p className="text-sm text-gray-500">Jours de suite</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold">Badges</h2></CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {badges?.map((b: any) => (
                <div key={b.id} className="flex items-center gap-2 bg-yellow-50 rounded-full px-3 py-1.5 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span>{b.badge?.name || 'Badge'}</span>
                </div>
              ))}
              {(!badges || badges.length === 0) && <p className="text-gray-400">Aucun badge obtenu</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">Classement</h2></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {leaderboard?.slice(0, 5).map((entry: any, i: number) => (
                <div key={entry.student_id} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-400">#{entry.rank}</span>
                    <span className="text-sm">{entry.first_name} {entry.last_name}</span>
                  </div>
                  <span className="text-sm font-semibold">{entry.xp_total} XP</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Historique XP</h2></CardHeader>
        <CardBody>
          <div className="space-y-1">
            {xpHistory?.slice(0, 10).map((x: any) => (
              <div key={x.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="text-gray-600">{x.reason}</span>
                <span className="font-semibold text-green-600">+{x.amount} XP</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}