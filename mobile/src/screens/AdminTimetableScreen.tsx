import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export default function AdminTimetableScreen() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/timetable');
        setSlots(res.data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={DAYS}
        keyExtractor={(d) => d}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: day }) => (
          <View style={styles.daySection}>
            <Text style={styles.dayTitle}>{day}</Text>
            {slots.filter((s) => s.day === day.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')).length === 0 ? (
              <Text style={styles.empty}>Aucun cours</Text>
            ) : (
              slots.filter((s) => s.day === day.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')).map((slot) => (
                <View key={slot.id} style={styles.slot}>
                  <Text style={styles.time}>{slot.start_time || '08:00'}</Text>
                  <View style={[styles.slotContent, { borderLeftColor: slot.subject_color || '#4F46E5' }]}>
                    <Text style={styles.subject}>{slot.subject_name}</Text>
                    <Text style={styles.teacher}>{slot.teacher_name}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  daySection: { marginBottom: 20 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  empty: { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', paddingLeft: 8 },
  slot: { flexDirection: 'row', marginBottom: 6 },
  time: { width: 48, fontSize: 12, color: '#6B7280', paddingTop: 4 },
  slotContent: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderLeftWidth: 3, elevation: 1 },
  subject: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  teacher: { fontSize: 11, color: '#6B7280', marginTop: 2 },
});
