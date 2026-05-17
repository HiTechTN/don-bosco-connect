import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { getUser } from '../lib/auth';

interface Props {
  navigation: any;
}

export default function StudentHomeScreen({ navigation }: Props) {
  const [grades, setGrades] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await getUser();
    setUser(u);
    try {
      const [gRes, aRes] = await Promise.all([
        api.get(`/students/${u.id}/grades`),
        api.get(`/students/${u.id}/absences`),
      ]);
      setGrades(gRes.data);
      setAbsences(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const average = grades.length
    ? (grades.reduce((s: number, g: any) => s + (g.score || 0), 0) / grades.length).toFixed(2)
    : 'N/A';

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Bonjour, {user?.first_name}</Text>
      <Text style={styles.average}>Moyenne générale : {average}/20</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Grades')}>
          <Text style={styles.cardTitle}>Notes ({grades.length})</Text>
          <Text style={styles.cardSub}>Voir mes notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Absences')}>
          <Text style={styles.cardTitle}>Absences ({absences.length})</Text>
          <Text style={styles.cardSub}>Voir mes absences</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Dernières notes</Text>
      <FlatList
        data={grades.slice(-5).reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gradeRow}>
            <Text style={styles.gradeScore}>{item.score ?? 'Abs'}/20</Text>
            <Text style={styles.gradeDate}>{new Date(item.graded_at).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune note pour le moment</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a237e', marginBottom: 4 },
  average: { fontSize: 18, color: '#388e3c', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  gradeRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6, elevation: 1 },
  gradeScore: { fontSize: 16, fontWeight: '500', color: '#1a237e' },
  gradeDate: { fontSize: 13, color: '#888' },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
});