import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

interface Props { route: any }

export default function ParentGradesScreen({ route }: Props) {
  const { child } = route.params;
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/students/${child.id}/grades`);
        setGrades(res.data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const avg = grades.length ? (grades.reduce((s: number, g: any) => s + (g.score || 0), 0) / grades.length).toFixed(2) : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.childHeader}>
        <Text style={styles.childName}>{child.first_name} {child.last_name}</Text>
        <Text style={styles.avg}>Moyenne: {avg}/20</Text>
      </View>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.subject}>{item.subject_name}</Text>
              <Text style={[styles.score, { color: (item.score || 0) >= 10 ? '#059669' : '#EF4444' }]}>{item.score ?? 'Abs'}/20</Text>
            </View>
            <Text style={styles.evalTitle}>{item.evaluation_title}</Text>
            <Text style={styles.date}>{new Date(item.graded_at).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  childHeader: { backgroundColor: '#4F46E5', padding: 20, alignItems: 'center' },
  childName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  avg: { fontSize: 14, color: '#C7D2FE', marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  subject: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  score: { fontSize: 18, fontWeight: '700' },
  evalTitle: { fontSize: 13, color: '#6B7280' },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});
