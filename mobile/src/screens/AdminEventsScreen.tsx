import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  const typeColors: Record<string, string> = { academic: '#4F46E5', holiday: '#059669', exam: '#DC2626', activity: '#D97706' };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <Badge label={item.event_type} color={typeColors[item.event_type] || '#6B7280'} />
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.date}>
              {new Date(item.start_datetime).toLocaleDateString('fr-FR')}
              {item.all_day ? ' (Toute la journée)' : ''}
            </Text>
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
  title: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  date: { fontSize: 12, color: '#9CA3AF' },
});
