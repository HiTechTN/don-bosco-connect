import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { mockApi } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

export default function StudentTimetableScreen() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await mockApi.getTimetable();
        setSlots(data);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const DAY_MAP: Record<string, string> = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi' };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={DAYS}
        keyExtractor={(d) => d}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: day }) => {
          const daySlots = slots.filter((s) => (DAY_MAP[s.day?.toLowerCase()] || s.day) === day);
          return (
            <View style={styles.daySection}>
              <Text style={styles.dayTitle}>{day}</Text>
              {daySlots.length === 0 ? (
                <Text style={styles.empty}>Aucun cours</Text>
              ) : (
                daySlots.map((slot) => (
                  <View key={slot.id} style={[styles.slot, { borderLeftColor: slot.subject_color || '#4F46E5' }]}>
                    <Text style={styles.time}>{slot.start_time || '08:00'} - {slot.end_time || '09:00'}</Text>
                    <Text style={styles.subject}>{slot.subject_name}</Text>
                    <Text style={styles.teacher}>{slot.teacher_name}</Text>
                  </View>
                ))
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  daySection: { marginBottom: 20 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  empty: { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', paddingLeft: 8 },
  slot: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 6, borderLeftWidth: 4, elevation: 1 },
  time: { fontSize: 11, color: '#6B7280' },
  subject: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginTop: 2 },
  teacher: { fontSize: 12, color: '#6B7280', marginTop: 1 },
});
