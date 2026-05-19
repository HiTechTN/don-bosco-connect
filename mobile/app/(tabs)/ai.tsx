import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { aiService } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(userMsg);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erreur technique.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Mentor IA</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.message, item.role === 'user' ? styles.userMsg : styles.assistantMsg]}>
            <Text style={[styles.msgText, item.role === 'user' && styles.userText]}>
              {item.content}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Posez votre question..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading || !message.trim()}>
          <Text style={styles.sendText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a365d', padding: 16 },
  list: { flex: 1, padding: 16 },
  message: { padding: 12, borderRadius: 12, marginBottom: 12, maxWidth: '80%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#3182ce' },
  assistantMsg: { alignSelf: 'flex-start', backgroundColor: 'white' },
  msgText: { fontSize: 16 },
  userText: { color: 'white' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: 'white' },
  input: { flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#3182ce', padding: 12, borderRadius: 8, justifyContent: 'center' },
  sendText: { color: 'white', fontWeight: '600' },
});