import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { getUser } from '../lib/auth';

export default function GradesScreen() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      try {
        const res = await api.get(`/students/${u.id}/grades`);
        setGrades(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Notes</Text>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.score}>{item.score ?? 'Abs'}/20</Text>
            {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
            <Text style={styles.date}>{new Date(item.graded_at).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune note</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a237e', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  score: { fontSize: 20, fontWeight: '600', color: '#1a237e' },
  comment: { fontSize: 14, color: '#555', marginTop: 4 },
  date: { fontSize: 12, color: '#999', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});