import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, UserCheck, BrainCircuit, Gamepad2, TrendingUp, Calendar, BookOpen, Target, Flame, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const DAY_MAP: Record<string, string> = { monday: 'lundi', tuesday: 'mardi', wednesday: 'mercredi', thursday: 'jeudi', friday: 'vendredi', saturday: 'samedi' };

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  const { data: grades } = useQuery({ queryKey: ['my-grades'], queryFn: () => api.get(`/students/${user?.id}/grades`).then(r => r.data), enabled: !!user?.id });
  const { data: absences } = useQuery({ queryKey: ['my-absences'], queryFn: () => api.get(`/students/${user?.id}/absences`).then(r => r.data), enabled: !!user?.id });
  const { data: timetable } = useQuery({ queryKey: ['my-timetable'], queryFn: () => api.get('/timetable/my').then(r => r.data), enabled: !!user?.id });
  const { data: profile } = useQuery({ queryKey: ['gamification-profile'], queryFn: () => api.get('/gamification/profile').then(r => r.data) });

  const todayKey = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
  const todaySlots = timetable?.filter((s: any) => DAY_MAP[s.day] === todayKey || s.day === todayKey) || [];

  const scores = (grades || []).filter((g: any) => g.score != null).map((g: any) => g.score);
  const avg = scores.length ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2) : null;

  const subjectGrades = grades?.reduce((acc: Record<string, number[]>, g: any) => {
    if (g.subject_name && g.score != null) {
      if (!acc[g.subject_name]) acc[g.subject_name] = [];
      acc[g.subject_name].push(g.score);
    }
    return acc;
  }, {});

  const subjectAverages = subjectGrades ? Object.entries(subjectGrades).map(([subject, scores]) => ({
    subject, average: (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)
  })).slice(0, 6) : [];

  const lastGrades = grades?.slice(-5).map((g: any) => ({
    name: g.evaluation_title?.substring(0, 15) || 'Évaluation', score: g.score || 0, fullScore: 20
  })) || [];

  const justificationRate = absences?.length ? Math.round((absences.filter((a: any) => a.justified).length / absences.length) * 100) : 100;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.first_name}! 👋</h1>
            <p className="opacity-90">Voici un aperçu de ta journée et tes progrès</p>
          </div>
          {profile && profile.streak_days > 0 && (
            <div className="flex items-center gap-2 mt-4 md:mt-0 bg-white/20 px-4 py-2 rounded-full">
              <Flame className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">{profile.streak_days} jours consécutifs!</span>
            </div>
          )}
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-20"><Sparkles className="w-32 h-32" /></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mes notes', value: grades?.length ?? 0, sub: grades?.length ? `Moyenne: ${avg}/20` : 'Aucune note', icon: ClipboardList, color: 'bg-blue-100', text: 'text-blue-600', path: '/student/grades' },
          { label: 'Absences', value: absences?.length ?? 0, sub: `Justifiées: ${justificationRate}%`, icon: UserCheck, color: 'bg-orange-100', text: 'text-orange-600', path: '/student/absences' },
          { label: 'Quiz', value: 'Jouer', sub: 'Défie-toi!', icon: BrainCircuit, color: 'bg-purple-100', text: 'text-purple-600', path: '/student/quizzes' },
          { label: 'Gamification', value: `${profile?.xp_total ?? 0} XP`, sub: `Niveau ${profile?.level ?? 1}`, icon: Gamepad2, color: 'bg-green-100', text: 'text-green-600', path: '/student/gamification' },
        ].map((c, idx) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-all group" onClick={() => navigate(c.path)}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${c.color} group-hover:scale-110 transition-transform`}><c.icon className={`h-6 w-6 ${c.text}`} /></div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-800">{c.value}</p>
                <p className="text-sm text-slate-500">{c.label}</p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Progression des notes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lastGrades}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-500" /> Performance par matière</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAverages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis dataKey="subject" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                  {subjectAverages.map((_: any, index: number) => (<Cell key={index} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> Aujourd'hui</h3>
            <button onClick={() => navigate('/student/timetable')} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></button>
          </div>
          {todaySlots.length > 0 ? (
            <div className="space-y-3">
              {todaySlots.slice(0, 4).map((slot: any, idx: number) => (
                <motion.div key={slot.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="text-center min-w-[60px]"><p className="text-lg font-bold text-slate-800">{slot.start_time}</p></div>
                  <div className="flex-1 border-l-2 border-indigo-200 pl-3">
                    <p className="font-semibold text-slate-800">{slot.subject_name}</p>
                    {slot.room && <p className="text-sm text-slate-500">Salle {slot.room}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8"><Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400">Aucun cours aujourd'hui</p></div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Actions rapides</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/student/ai')} className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all">
              <BrainCircuit className="w-5 h-5" /><span className="font-medium">Poser une question à l'IA</span>
            </button>
            <button onClick={() => navigate('/student/quizzes')} className="w-full flex items-center gap-3 p-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-indigo-500 transition-all">
              <BrainCircuit className="w-5 h-5" /><span className="font-medium">Faire un quiz</span>
            </button>
            <button onClick={() => navigate('/student/gamification')} className="w-full flex items-center gap-3 p-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-green-500 transition-all">
              <Gamepad2 className="w-5 h-5" /><span className="font-medium">Voir mes achievements</span>
            </button>
          </div>
        </div>
      </div>

      {(absences?.length || 0) > 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Attention</p>
            <p className="text-sm text-amber-700">Tu as {absences?.length} absences au total. Pense à les justifier!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
