import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { mockApi } from '../services/api';
import { SubjectRecord } from '../types';
import LoadingScreen from '../components/LoadingScreen';

export default function AdminSubjectsScreen() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const data = await mockApi.getSubjects();
        if (mounted.current) setSubjects(data);
      } catch (e) { console.error('Failed to load subjects:', e); } finally { if (mounted.current) setLoading(false); }
    })();
    return () => { mounted.current = false; };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.colorDot, { backgroundColor: item.color || '#4F46E5' }]} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.code}>{item.code}</Text>
            </View>
            <Text style={styles.coeff}>Coeff {item.coefficient || 1}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 8, elevation: 1 },
  colorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  code: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  coeff: { fontSize: 13, color: '#6B7280' },
});
