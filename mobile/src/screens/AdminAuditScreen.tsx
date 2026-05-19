import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';

export default function AdminAuditScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const params: any = {};
        if (filter) params.resource_type = filter;
        const res = await api.get('/audit/logs', { params });
        setLogs(res.data.items || res.data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, [filter]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput style={styles.input} placeholder="Filtrer par type (user, class, subject...)" value={filter} onChangeText={setFilter} placeholderTextColor="#9CA3AF" />
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.logRow}>
            <Text style={styles.action}>{item.action}</Text>
            <Badge label={item.resource_type || '-'} color="#6B7280" />
            <Text style={styles.email}>{item.user_email}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  filters: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 14 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 6, elevation: 1 },
  action: { fontSize: 13, fontWeight: '500', color: '#1F2937', flex: 1 },
  email: { fontSize: 11, color: '#6B7280', maxWidth: 100 },
  date: { fontSize: 11, color: '#9CA3AF' },
});
