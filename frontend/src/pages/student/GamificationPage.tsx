/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, Medal, Star, TrendingUp, Flame, Zap, Target, 
  Award, Crown, Rocket, Sparkles, Download, Share2, 
  BookOpen, GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../lib/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  xp_reward?: number;
}

interface StudentProfile {
  xp_total: number;
  level: number;
  streak_days: number;
  adaptive_level: string;
  avatar_config?: Record<string, unknown>;
}

interface LeaderboardEntry {
  rank: number;
  student_id: string;
  first_name: string;
  last_name: string;
  xp_total: number;
  level: number;
}

interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  first_quiz: Trophy,
  perfect_score: Star,
  streak_7: Flame,
  streak_30: Zap,
  top_student: Crown,
  helper: Award,
  scholar: BookOpen,
  graduate: GraduationCap,
  rising_star: Rocket,
  champion: Trophy,
};

export default function GamificationPage() {
  const { user } = useAuthStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number>(0);

  const { data: profile, isLoading: profileLoading } = useQuery<StudentProfile>({
    queryKey: ['gamification-profile'],
    queryFn: () => api.get('/gamification/profile').then(r => r.data),
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ['my-badges'],
    queryFn: () => api.get('/gamification/my-badges').then(r => r.data),
  });

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/gamification/leaderboard', { params: { period: 'all' } }).then(r => r.data),
  });

  const { data: xpHistory } = useQuery<XPTransaction[]>({
    queryKey: ['xp-history'],
    queryFn: () => api.get('/gamification/xp-history').then(r => r.data),
  });

  const { data: availableBadges } = useQuery<Badge[]>({
    queryKey: ['available-badges'],
    queryFn: () => api.get('/gamification/badges').then(r => r.data),
  });

  useEffect(() => {
    if (profile && previousLevel > 0 && profile.level > previousLevel) {
      setShowLevelUp(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981']
      });
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    if (profile) {
      setPreviousLevel(profile.level);
    }
  }, [profile?.level]);

  const xpToNextLevel = (profile?.level || 1) * 500;
  const currentLevelXP = (profile?.level || 1) * 500 - 500;
  const progress = profile ? ((profile.xp_total - currentLevelXP) / (xpToNextLevel - currentLevelXP)) * 100 : 0;

  const myRank = leaderboard?.findIndex(e => e.student_id === user?.id) ?? -1;

  const handleExportPortfolio = () => {
    setShowConfetti(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert('Portfolio numérique exporté avec succès! (Fonctionnalité en cours de développement)');
  };

  const getBadgeIcon = (badgeName: string) => {
    const key = Object.keys(BADGE_ICONS).find(k => badgeName.toLowerCase().includes(k)) || 'default';
    return BADGE_ICONS[key] || Trophy;
  };

  if (profileLoading || badgesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Up Popup */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-12 rounded-3xl text-center shadow-2xl">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Crown className="w-24 h-24 mx-auto mb-4 text-yellow-400" />
              </motion.div>
              <h2 className="text-4xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-2xl">Niveau {profile?.level}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container" onClick={() => setShowConfetti(false)}></div>
      )}

      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="welcome-banner relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Mon Parcours</h1>
          <p className="opacity-90">Continue comme ça, chaque effort compte!</p>
        </div>
        <div className="absolute -right-10 -top-10 opacity-20">
          <Rocket className="w-40 h-40" />
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-slate-400">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{profile?.xp_total?.toLocaleString() || 0}</p>
          <p className="text-sm text-slate-500">Points XP</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <Medal className="w-8 h-8 text-indigo-500" />
            <span className="text-xs text-slate-400">Niveau</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{profile?.level || 1}</p>
          <div className="skill-bar mt-2">
            <div className="skill-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{Math.round(progress)}% vers le prochain niveau</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            {profile?.streak_days && profile.streak_days > 0 ? (
              <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            ) : (
              <Flame className="w-8 h-8 text-slate-300" />
            )}
            <span className="text-xs text-slate-400">Série</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{profile?.streak_days || 0}</p>
          <p className="text-sm text-slate-500">Jours consécutifs</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-green-500" />
            <span className="text-xs text-slate-400">Rang</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">#{myRank >= 0 ? myRank + 1 : '-'}</p>
          <p className="text-sm text-slate-500">Classement</p>
        </motion.div>
      </div>

      {/* Portfolio Export */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 flex-wrap"
      >
        <button 
          onClick={handleExportPortfolio}
          className="portfolio-export-btn"
        >
          <Download className="w-5 h-5" />
          Exporter mon Portfolio
        </button>
        <button className="btn-secondary flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Partager
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Badges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Mes Badges
            </h2>
            <span className="text-sm text-slate-400">{badges?.length || 0} obtenus</span>
          </CardHeader>
          <CardBody>
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, idx) => {
                  const IconComponent = getBadgeIcon(badge.name);
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="achievement-unlocked flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200"
                    >
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <IconComponent className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{badge.name}</p>
                        {badge.xp_reward && (
                          <p className="text-xs text-yellow-600">+{badge.xp_reward} XP</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">Aucun badge obtenu</p>
                <p className="text-sm text-slate-400">Complète des quizzes pour en gagner!</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Classement
            </h2>
            <span className="text-sm text-slate-400">Top 10</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {leaderboard?.slice(0, 10).map((entry, idx) => {
                const isMe = entry.student_id === user?.id;
                return (
                  <motion.div
                    key={entry.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`leaderboard-item ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''} ${isMe ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                        idx === 1 ? 'bg-slate-300 text-slate-700' :
                        idx === 2 ? 'bg-amber-600 text-amber-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.first_name} {entry.last_name}</p>
                        <p className="text-xs opacity-70">Niveau {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.xp_total.toLocaleString()}</p>
                      <p className="text-xs opacity-70">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Available Badges to Unlock */}
      {availableBadges && availableBadges.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Badges à débloquer
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableBadges.filter(ab => !badges?.some(b => b.id === ab.id)).map((badge, idx) => {
                const IconComponent = getBadgeIcon(badge.name);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  >
                    <div className="p-3 bg-slate-100 rounded-full mb-2">
                      <IconComponent className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-center text-slate-600">{badge.name}</p>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* XP History */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Historique des gains XP
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {xpHistory?.slice(0, 20).map((x, idx) => (
              <motion.div
                key={x.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-slate-600">{x.reason}</span>
                </div>
                <span className="font-bold text-green-600">+{x.amount} XP</span>
              </motion.div>
            ))}
            {(!xpHistory || xpHistory.length === 0) && (
              <p className="text-center text-slate-400 py-4">Aucun historique disponible</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}