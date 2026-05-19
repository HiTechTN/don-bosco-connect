import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function TeacherCoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', chapter_number: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data.items || res.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createCourse = async () => {
    if (!form.title) return;
    try {
      await api.post('/courses', { ...form, chapter_number: parseInt(form.chapter_number) || 1 });
      setForm({ title: '', description: '', chapter_number: '' });
      setShowForm(false);
      load();
    } catch { Alert.alert('Erreur', 'Impossible de créer le cours'); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {showForm ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Titre du cours" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Chapitre n°" value={form.chapter_number} onChangeText={(t) => setForm({ ...form, chapter_number: t })} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
          <View style={styles.formActions}>
            <Button title="Créer" onPress={createCourse} size="sm" />
            <Button title="Annuler" onPress={() => setShowForm(false)} variant="outline" size="sm" />
          </View>
        </View>
      ) : (
        <Button title="+ Nouveau cours" onPress={() => setShowForm(true)} style={{ margin: 12 }} />
      )}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <Badge label={item.is_published ? 'Publié' : 'Brouillon'} color={item.is_published ? '#059669' : '#F59E0B'} />
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>Ch. {item.chapter_number || 1} • {item.tags?.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  form: { padding: 12, backgroundColor: '#fff', margin: 12, borderRadius: 12, elevation: 2 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 8 },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  meta: { fontSize: 11, color: '#9CA3AF' },
});
