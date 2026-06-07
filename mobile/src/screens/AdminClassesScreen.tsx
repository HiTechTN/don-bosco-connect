import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { mockApi } from '../services/api';
import { ClassRecord } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';

export default function AdminClassesScreen() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getClasses();
      if (mounted.current) setClasses(data);
    } catch (e) { console.error('Failed to load classes:', e); } finally { if (mounted.current) setLoading(false); }
  };

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, []);

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
