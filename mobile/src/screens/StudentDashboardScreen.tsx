import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { getUser, clearAuth } from '../lib/auth';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import Card from '../components/Card';

interface Props { navigation: any }

export default function StudentDashboardScreen({ navigation }: Props) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ grades: 0, absences: 0, xp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser(); setUser(u);
      try {
        const [gRes, aRes, gamRes] = await Promise.all([
          api.get(`/students/${u.id}/grades`).catch(() => ({ data: [] })),
          api.get(`/students/${u.id}/absences`).catch(() => ({ data: [] })),
          api.get('/gamification/profile').catch(() => ({ data: { xp_total: 0 } })),
        ]);
        setStats({
          grades: gRes.data.length || 0,
          absences: aRes.data.length || 0,
          xp: gamRes.data.xp_total || 0,
        });
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gradientHeader}>
        <Text style={styles.greeting}>Bonjour, {user?.first_name} 👋</Text>
        <Text style={styles.level}>Niveau {Math.floor(stats.xp / 500) + 1} • {stats.xp} XP</Text>
        <View style={styles.xpBar}><View style={[styles.xpFill, { width: `${(stats.xp % 500) / 5}%` }]} /></View>
        <TouchableOpacity onPress={async () => { await clearAuth(); navigation.replace('Login'); }}>
          <Text style={styles.logout}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard label="Notes" value={stats.grades} color="#4F46E5" icon="📝" style={styles.stat} />
          <StatCard label="Absences" value={stats.absences} color="#EF4444" icon="🚫" style={styles.stat} />
          <StatCard label="XP Gagné" value={stats.xp} color="#D97706" icon="⭐" style={styles.stat} />
        </View>

        <Card title="Navigation">
          <View style={styles.grid}>
            {[
              { title: 'Mes Notes', icon: '📝', screen: 'Grades', color: '#4F46E5' },
              { title: 'Absences', icon: '🚫', screen: 'Absences', color: '#EF4444' },
              { title: 'Emploi du temps', icon: '📅', screen: 'StudentTimetable', color: '#8B5CF6' },
              { title: 'Quiz', icon: '🧠', screen: 'StudentQuizzes', color: '#EC4899' },
              { title: 'Gamification', icon: '🏆', screen: 'StudentGamification', color: '#D97706' },
              { title: 'IA Chat', icon: '🤖', screen: 'AIChat', color: '#14B8A6' },
              { title: 'Messages', icon: '💬', screen: 'Messages', color: '#059669' },
            ].map((item) => (
              <TouchableOpacity key={item.screen} style={styles.gridItem} onPress={() => navigation.navigate(item.screen)}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
                <Text style={styles.gridLabel}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  gradientHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, backgroundColor: '#4F46E5' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff' },
  level: { fontSize: 14, color: '#C7D2FE', marginTop: 4 },
  xpBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#FCD34D', borderRadius: 3 },
  logout: { color: '#C7D2FE', fontSize: 14, marginTop: 8, textAlign: 'right' },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20, marginTop: -10 },
  stat: { flex: 1, marginTop: -16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  gridItem: { alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: '#F9FAFB', width: '28%' },
  gridIcon: { fontSize: 28, marginBottom: 4 },
  gridLabel: { fontSize: 11, fontWeight: '500', color: '#374151', textAlign: 'center' },
});
