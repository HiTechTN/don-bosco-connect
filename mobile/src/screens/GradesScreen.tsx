import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getUser } from '../lib/auth';
import { mockApi } from '../services/api';
import { Grade } from '../types';
import LoadingScreen from '../components/LoadingScreen';

export default function GradesScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const u = await getUser();
        if (!mounted.current) return;
        const data = await mockApi.getGrades(u.id);
        if (mounted.current) setGrades(data);
      } catch (e) { console.error('Failed to load grades:', e); } finally { if (mounted.current) setLoading(false); }
    })();
    return () => { mounted.current = false; };
  }, []);

  if (loading) return <LoadingScreen />;

  const avg = grades.length ? (grades.reduce((s, g) => s + (g.score || 0), 0) / grades.length).toFixed(2) : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.avgCard}>
        <Text style={styles.avgLabel}>Moyenne générale</Text>
        <Text style={styles.avgValue}>{avg}/20</Text>
      </View>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.subject}>{item.subject_name || 'Matière'}</Text>
              <Text style={[styles.score, { color: (item.score || 0) >= 10 ? '#059669' : '#EF4444' }]}>{item.score ?? 'Abs'}/20</Text>
            </View>
            <Text style={styles.evalTitle}>{item.evaluation_title}</Text>
            {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
            <Text style={styles.date}>{new Date(item.graded_at).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  avgCard: { backgroundColor: '#4F46E5', padding: 20, margin: 12, borderRadius: 16, alignItems: 'center' },
  avgLabel: { fontSize: 14, color: '#C7D2FE' },
  avgValue: { fontSize: 36, fontWeight: '800', color: '#fff', marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subject: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  score: { fontSize: 18, fontWeight: '700' },
  evalTitle: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  comment: { fontSize: 13, color: '#374151', fontStyle: 'italic' },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});
