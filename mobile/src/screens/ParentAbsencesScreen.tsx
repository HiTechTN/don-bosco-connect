import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { mockApi } from '../services/api';
import { RootStackParamList, Absence } from '../types';
import LoadingScreen from '../components/LoadingScreen';

type ParentAbsencesRouteProp = RouteProp<RootStackParamList, 'ParentAbsences'>;

export default function ParentAbsencesScreen() {
  const route = useRoute<ParentAbsencesRouteProp>();
  const { child } = route.params;
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const data = await mockApi.getAbsences(child.id) as Absence[];
        if (mounted.current) setAbsences(data);
      } catch (e) { console.error('Failed to load absences:', e); } finally { if (mounted.current) setLoading(false); }
    })();
    return () => { mounted.current = false; };
  }, [child.id]);

  if (loading) return <LoadingScreen />;

  const justified = absences.filter((a) => a.justification_status === 'justified').length;
  const pending = absences.filter((a) => a.justification_status === 'pending').length;
  const unjustified = absences.filter((a) => a.justification_status === 'unjustified').length;

  return (
    <View style={styles.container}>
      <View style={styles.childHeader}>
        <Text style={styles.childName}>{child.first_name} {child.last_name}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{absences.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: '#059669' }]}>{justified}</Text><Text style={styles.statLabel}>Justifiées</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: '#F59E0B' }]}>{pending}</Text><Text style={styles.statLabel}>En attente</Text></View>
        <View style={styles.stat}><Text style={[styles.statNum, { color: '#EF4444' }]}>{unjustified}</Text><Text style={styles.statLabel}>Non justif.</Text></View>
      </View>
      <FlatList
        data={absences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={[styles.status, { color: item.justification_status === 'justified' ? '#059669' : item.justification_status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
                {item.justification_status === 'justified' ? 'Justifiée' : item.justification_status === 'pending' ? 'En attente' : 'Non justifiée'}
              </Text>
            </View>
            <Text style={styles.type}>{item.type === 'absence' ? 'Absence' : 'Retard'}</Text>
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
  statsRow: { flexDirection: 'row', gap: 6, padding: 12, backgroundColor: '#fff', margin: 12, borderRadius: 14, elevation: 2 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  statLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 6, elevation: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  date: { fontSize: 15, fontWeight: '500', color: '#1F2937' },
  status: { fontSize: 13, fontWeight: '600' },
  type: { fontSize: 12, color: '#6B7280' },
});
