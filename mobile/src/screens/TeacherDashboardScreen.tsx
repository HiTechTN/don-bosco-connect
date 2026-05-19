import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { getUser, clearAuth } from '../lib/auth';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import Card from '../components/Card';

interface Props { navigation: any }

export default function TeacherDashboardScreen({ navigation }: Props) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ courses: 0, evaluations: 0, students: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser(); setUser(u);
      try {
        const [cRes, eRes] = await Promise.all([
          api.get('/courses').catch(() => ({ data: [] })),
          api.get('/evaluations').catch(() => ({ data: [] })),
        ]);
        setStats({
          courses: cRes.data.length || cRes.data.items?.length || 0,
          evaluations: eRes.data.length || 0,
          students: 0,
        });
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
          <Text style={styles.role}>Enseignant</Text>
        </View>
        <TouchableOpacity onPress={async () => { await clearAuth(); navigation.replace('Login'); }}>
          <Text style={styles.logout}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard label="Cours" value={stats.courses} color="#4F46E5" icon="📖" style={styles.stat} />
          <StatCard label="Évaluations" value={stats.evaluations} color="#059669" icon="📝" style={styles.stat} />
          <StatCard label="Élèves" value={stats.students} color="#D97706" icon="👨‍🎓" style={styles.stat} />
        </View>

        <Card title="Actions rapides">
          <View style={styles.quickActions}>
            {[
              { title: 'Cours', icon: '📖', screen: 'TeacherCourses', color: '#4F46E5' },
              { title: 'Notes', icon: '📝', screen: 'TeacherGrades', color: '#059669' },
              { title: 'Absences', icon: '🚫', screen: 'TeacherAbsences', color: '#DC2626' },
              { title: 'Messages', icon: '💬', screen: 'Messages', color: '#8B5CF6' },
              { title: 'IA Chat', icon: '🤖', screen: 'AIChat', color: '#14B8A6' },
            ].map((item) => (
              <TouchableOpacity key={item.screen} style={styles.actionBtn} onPress={() => navigation.navigate(item.screen)}>
                <Text style={styles.actionIcon}>{item.icon}</Text>
                <Text style={styles.actionLabel}>{item.title}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  logout: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stat: { flex: 1 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  actionBtn: { alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F9FAFB', width: '30%' },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: '500', color: '#374151' },
});
