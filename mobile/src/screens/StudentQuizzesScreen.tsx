import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { mockApi } from '../services/api';
import { Quiz, Question } from '../types';
import LoadingScreen from '../components/LoadingScreen';

export default function StudentQuizzesScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const data = await mockApi.getQuizzes();
        if (mounted.current) setQuizzes(data);
      } catch (e) { console.error('Failed to load quizzes:', e); } finally { if (mounted.current) setLoading(false); }
    })();
    return () => { mounted.current = false; };
  }, []);

  const startQuiz = async (q: Quiz) => {
    setActiveQuiz(q);
    try {
      const data = await mockApi.getQuizQuestions(q.id);
      setQuestions(data);
    } catch (e) { console.error('Failed to load questions:', e); }
  };

  const answer = (idx: number) => {
    if (idx === 0) setScore(score + 1);
    if (currentQ + 1 < questions.length) setCurrentQ(currentQ + 1);
    else setFinished(true);
  };

  if (loading) return <LoadingScreen />;

  if (activeQuiz && !finished) {
    const q = questions[currentQ] || { question_text: 'Question', options: [{ text: '?' }, { text: '?' }, { text: '?' }, { text: '?' }] };
    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{activeQuiz.title}</Text>
          <Text style={styles.quizProgress}>Question {currentQ + 1}/{questions.length}</Text>
        </View>
        <Text style={styles.question}>{q.question_text}</Text>
        {q.options?.map((opt: any, idx: number) => (
          <TouchableOpacity key={idx} style={styles.option} onPress={() => answer(idx)}>
            <Text style={styles.optionText}>{opt.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (finished) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>🎉</Text>
          <Text style={styles.resultTitle}>Quiz terminé !</Text>
          <Text style={styles.resultScore}>{score}/{questions.length}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={() => { setActiveQuiz(null); setCurrentQ(0); setScore(0); setFinished(false); }}>
            <Text style={styles.restartText}>Retour aux quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.quizCard} onPress={() => startQuiz(item)}>
            <Text style={styles.quizName}>{item.title}</Text>
            <Text style={styles.quizDiff}>Difficulté: {item.difficulty || 'Moyen'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  quizHeader: { backgroundColor: '#4F46E5', padding: 20, marginBottom: 16 },
  quizTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  quizProgress: { fontSize: 13, color: '#C7D2FE', marginTop: 4 },
  question: { fontSize: 17, fontWeight: '600', color: '#1F2937', paddingHorizontal: 16, marginBottom: 16 },
  option: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, elevation: 1 },
  optionText: { fontSize: 15, color: '#1F2937' },
  quizCard: { backgroundColor: '#fff', padding: 20, borderRadius: 14, marginBottom: 10, elevation: 2 },
  quizName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  quizDiff: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  resultCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultEmoji: { fontSize: 64, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  resultScore: { fontSize: 48, fontWeight: '800', color: '#4F46E5', marginVertical: 12 },
  restartBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  restartText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
