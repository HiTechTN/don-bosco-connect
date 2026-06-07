import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '../components/Button';

export default function AIChatScreen() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant IA Don Bosco. Comment puis-je t\'aider aujourd\'hui ?' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    const reply = { role: 'assistant', content: generateReply(input.trim()) };
    setMessages([...messages, userMsg, reply]);
    setInput('');
  };

  const generateReply = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('note') || lower.includes('moyenne') || lower.includes('bulletin'))
      return 'Tu peux consulter tes notes et ta moyenne dans la section "Mes Notes" du tableau de bord.';
    if (lower.includes('emploi') || lower.includes('horaire') || lower.includes('cours'))
      return 'L\'emploi du temps est disponible dans la section "Emploi du temps".';
    if (lower.includes('absence') || lower.includes('justifier'))
      return 'Pour justifier une absence, contacte ton professeur principal ou l\'administration.';
    if (lower.includes('quiz') || lower.includes('exercice'))
      return 'Les quiz sont disponibles dans la section "Quiz". Tu peux tester tes connaissances !';
    if (lower.includes('gamification') || lower.includes('xp') || lower.includes('badge'))
      return 'Le système de gamification te permet de gagner des XP et des badges en complétant des quiz et en étant assidu !';
    return 'Je suis là pour t\'aider à naviguer sur Don Bosco Connect. Pose-moi une question sur les notes, l\'emploi du temps, les absences, les quiz, ou la gamification !';
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'assistant' ? styles.assistant : styles.user]}>
            <Text style={[styles.bubbleText, item.role === 'assistant' ? styles.assistantText : styles.userText]}>
              {item.content}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Pose ta question..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#9CA3AF"
        />
        <Button title="Envoyer" onPress={send} size="sm" disabled={!input.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 16, marginBottom: 8 },
  assistant: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
  user: { backgroundColor: '#4F46E5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  assistantText: { color: '#1F2937' },
  userText: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 14 },
});
