import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import api, { mockApi } from '../services/api';
import { Absence } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function TeacherAbsencesScreen() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = async () => {
    setLoading(true);
    try {
        const data = await mockApi.getAbsencesForTeacher() as Absence[];
      if (mounted.current) setAbsences(data);
    } catch (e) { console.error('Failed to load absences:', e); } finally { if (mounted.current) setLoading(false); }
  };

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, []);

  const justify = async (id: string) => {
    try {
      await api.patch(`/absences/${id}`, { justification_status: 'justified' });
      load();
    } catch (e) { console.error('Justify error:', e); Alert.alert('Erreur'); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={absences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.studentName}>{item.student_name}</Text>
              <Badge
                label={item.justification_status === 'justified' ? 'Justifiée' : item.justification_status === 'pending' ? 'En attente' : 'Non justifiée'}
                color={item.justification_status === 'justified' ? '#059669' : item.justification_status === 'pending' ? '#F59E0B' : '#EF4444'}
              />
            </View>
            <Text style={styles.meta}>{item.date} • {item.type === 'absence' ? 'Absence' : 'Retard'}</Text>
            {item.justification_status !== 'justified' && (
              <Button title="Justifier" onPress={() => justify(item.id)} variant="outline" size="sm" style={{ marginTop: 8 }} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  studentName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  meta: { fontSize: 13, color: '#6B7280' },
});
