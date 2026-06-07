import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import api, { mockApi } from '../services/api';
import { EvaluationRecord, GradeRecord } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function TeacherGradesScreen() {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<EvaluationRecord | null>(null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'devoir', max_score: '20' });
  const mounted = useRef(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getEvaluations();
      if (mounted.current) setEvaluations(data);
    } catch (e) { console.error('Failed to load evaluations:', e); } finally { if (mounted.current) setLoading(false); }
  };

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, []);

  const loadGrades = async (ev: EvaluationRecord) => {
    setSelectedEval(ev);
    try {
      const data = await mockApi.getGradesForEvaluation(ev.id);
      setGrades(data);
    } catch (e) { console.error('Failed to load grades:', e); setGrades([]); }
  };

  const createEval = async () => {
    if (!form.title) return;
    try {
      await api.post('/evaluations', form);
      setForm({ title: '', type: 'devoir', max_score: '20' });
      setShowForm(false);
      load();
    } catch (e) { console.error('Create evaluation error:', e); Alert.alert('Erreur'); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {showForm ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Titre" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} placeholderTextColor="#9CA3AF" />
          <TextInput style={styles.input} placeholder="Note max" value={form.max_score} onChangeText={(t) => setForm({ ...form, max_score: t })} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
          <View style={styles.formActions}>
            <Button title="Créer" onPress={createEval} size="sm" />
            <Button title="Annuler" onPress={() => setShowForm(false)} variant="outline" size="sm" />
          </View>
        </View>
      ) : (
        <Button title="+ Nouvelle évaluation" onPress={() => setShowForm(true)} style={{ margin: 12 }} />
      )}

      {selectedEval ? (
        <>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle}>{selectedEval.title}</Text>
            <Button title="Retour" onPress={() => setSelectedEval(null)} variant="outline" size="sm" />
          </View>
          <FlatList
            data={grades}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
              <View style={styles.gradeRow}>
                <Text style={styles.studentName}>{item.student_name || 'Élève'}</Text>
                <Text style={[styles.score, { color: (item.score || 0) >= 10 ? '#059669' : '#EF4444' }]}>{item.score ?? 'Abs'}/{selectedEval.max_score || 20}</Text>
              </View>
            )}
          />
        </>
      ) : (
        <FlatList
          data={evaluations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.evalTitle}>{item.title}</Text>
                <Badge label={item.is_published ? 'Publié' : 'Brouillon'} color={item.is_published ? '#059669' : '#F59E0B'} />
              </View>
              <Text style={styles.evalMeta}>{item.type} • /{item.max_score || 20}</Text>
              <Button title="Voir les notes" onPress={() => loadGrades(item)} variant="outline" size="sm" style={{ marginTop: 8 }} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  form: { padding: 12, backgroundColor: '#fff', margin: 12, borderRadius: 12, elevation: 2 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 8 },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  selectedTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  evalTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  evalMeta: { fontSize: 13, color: '#6B7280' },
  gradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 6, elevation: 1 },
  studentName: { fontSize: 15, fontWeight: '500', color: '#1F2937' },
  score: { fontSize: 16, fontWeight: '700' },
});
