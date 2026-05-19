import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function TeacherAbsencesScreen() {
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/absences');
      setAbsences(res.data.items || res.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const justify = async (id: string) => {
    try {
      await api.patch(`/absences/${id}`, { justification_status: 'justified' });
      load();
    } catch { Alert.alert('Erreur'); }
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
