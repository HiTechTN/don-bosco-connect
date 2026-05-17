import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import api from '../services/api';
import { getUser, clearAuth } from '../lib/auth';

interface Props {
  navigation: any;
}

export default function TeacherHomeScreen({ navigation }: Props) {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await getUser();
    setUser(u);
    try {
      const res = await api.get('/evaluations');
      setEvaluations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    navigation.replace('Login');
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logout}>Déconnexion</Text></TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CreateEvaluation')}>
          <Text style={styles.cardTitle}>+ Évaluation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MarkAbsences')}>
          <Text style={styles.cardTitle}>+ Absences</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Évaluations récentes</Text>
      <FlatList
        data={evaluations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.evalRow}>
            <Text style={styles.evalTitle}>{item.title}</Text>
            <Text style={styles.evalDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={[styles.badge, item.is_published ? styles.published : styles.draft]}>
              {item.is_published ? 'Publié' : 'Brouillon'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune évaluation</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a237e' },
  logout: { color: '#d32f2f', fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1a237e' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  evalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6, alignItems: 'center', elevation: 1 },
  evalTitle: { fontSize: 15, fontWeight: '500', flex: 1 },
  evalDate: { fontSize: 13, color: '#888', marginHorizontal: 8 },
  badge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  published: { backgroundColor: '#e8f5e9', color: '#388e3c' },
  draft: { backgroundColor: '#fff3e0', color: '#f57c00' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});