import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';

export default function AdminClassesScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      setClasses(res.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.className}>{item.name}</Text>
              <Badge label={`${item.enrollment_count || 0}/${item.max_students || 30}`} color="#4F46E5" />
            </View>
            <Text style={styles.teacher}>📖 {item.main_teacher_name || 'Non assigné'}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, ((item.enrollment_count || 0) / (item.max_students || 30)) * 100)}%` }]} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  className: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  teacher: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
});
