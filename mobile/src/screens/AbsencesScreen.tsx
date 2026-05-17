import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { getUser } from '../lib/auth';

export default function AbsencesScreen() {
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      try {
        const res = await api.get(`/students/${u.id}/absences`);
        setAbsences(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  const justified = absences.filter((a) => a.justification_status === 'justified').length;
  const unjustified = absences.length - justified;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Absences</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{absences.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: '#388e3c' }]}>{justified}</Text><Text style={styles.statLabel}>Justifiées</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: '#d32f2f' }]}>{unjustified}</Text><Text style={styles.statLabel}>Non justifiées</Text></View>
      </View>
      <FlatList
        data={absences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.type}>{item.type === 'absence' ? 'Absence' : 'Retard'}</Text>
            <Text style={[styles.status, { color: item.justification_status === 'justified' ? '#388e3c' : '#d32f2f' }]}>
              {item.justification_status === 'justified' ? 'Justifiée' : item.justification_status === 'pending' ? 'En attente' : 'Non justifiée'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune absence</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a237e', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  stat: { alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, flex: 1, marginHorizontal: 4, elevation: 1 },
  statNum: { fontSize: 24, fontWeight: '700', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1, flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 15, fontWeight: '500' },
  type: { fontSize: 14, color: '#555' },
  status: { fontSize: 13, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});