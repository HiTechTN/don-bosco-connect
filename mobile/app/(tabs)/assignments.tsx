import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { assignmentsService } from '@/services/api';

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentsService.getAssignments()
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Devoirs</Text>
      <FlatList
        data={assignments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.course_title}</Text>
            <Text style={styles.due}>À rendre: {new Date(item.due_date).toLocaleDateString('fr-FR')}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a365d', marginBottom: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1a365d' },
  subtitle: { fontSize: 14, color: '#4a5568', marginTop: 4 },
  due: { fontSize: 14, color: '#e53e3e', marginTop: 4 },
});