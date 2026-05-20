import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { mockApi } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import Button from '../components/Button';

interface Props { route?: any }

export default function MessagesScreen({ route }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [mData, uData] = await Promise.all([
          mockApi.getMessages(),
          mockApi.getUsers(),
        ]);
        setMessages(mData);
        setUsers(uData);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const send = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    const msg = { id: `m${Date.now()}`, sender_id: 'student-uuid-001', receiver_id: selectedUser.id, content: newMessage, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  if (loading) return <LoadingScreen />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.userList}>
        <Text style={styles.sectionLabel}>Contacts</Text>
        <FlatList
          horizontal
          data={users.slice(0, 10)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactRow}>
              <View style={[styles.contactAvatar, selectedUser?.id === item.id && styles.selectedAvatar]}>
                <Text style={styles.avatarText}>{item.first_name[0]}</Text>
              </View>
              <Text style={styles.contactName}>{item.first_name}</Text>
            </View>
          )}
        />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageContent}>{item.content}</Text>
            <Text style={styles.messageDate}>{new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor="#9CA3AF"
        />
        <Button title="Envoyer" onPress={send} size="sm" disabled={!newMessage.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  userList: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  contactRow: { alignItems: 'center', marginRight: 16 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  selectedAvatar: { backgroundColor: '#4F46E5' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#374151' },
  contactName: { fontSize: 11, color: '#374151', marginTop: 4 },
  messageBubble: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 6, elevation: 1, maxWidth: '80%', alignSelf: 'flex-start' },
  messageContent: { fontSize: 14, color: '#1F2937' },
  messageDate: { fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 14 },
});
