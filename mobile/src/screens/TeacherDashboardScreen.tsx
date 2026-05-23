import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import Card from '../components/Card';

interface Props { navigation: any }

const MOCK_STATS = { courses: 3, evaluations: 5, students: 28 };

export default function TeacherDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [stats] = useState(MOCK_STATS);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
          <Text style={styles.role}>Enseignant</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.first_name || 'E')[0]}{(user?.last_name || 'T')[0]}
            </Text>
          </View>
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
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  content: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20, marginTop: 4 },
  stat: { flex: 1 },
  quickActions: { gap: 10, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#F9FAFB', borderRadius: 12, gap: 12 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 15, fontWeight: '500', color: '#374151' },
});
