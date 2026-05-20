import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props { navigation: any }

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@donbosco.tn', password: 'admin123!', color: '#4F46E5' },
  { role: 'Enseignant', email: 'karim.hamdi@donbosco.tn', password: 'teacher123!', color: '#059669' },
  { role: 'Élève', email: 'adam.slim@donbosco.tn', password: 'student123!', color: '#D97706' },
  { role: 'Parent', email: 'ahmed.slim@parent.tn', password: 'parent123!', color: '#DC2626' },
];

const mockLogin = async (email: string, password: string) => {
  const users: Record<string, { id: string; name: string; role: string }> = {
    'admin@donbosco.tn': { id: 'admin-uuid-0001', name: 'Admin Principal', role: 'admin' },
    'karim.hamdi@donbosco.tn': { id: 'teacher-uuid-001', name: 'Karim Hamdi', role: 'teacher' },
    'adam.slim@donbosco.tn': { id: 'student-uuid-001', name: 'Adam Slim', role: 'student' },
    'ahmed.slim@parent.tn': { id: 'parent-uuid-001', name: 'Ahmed Slim', role: 'parent' },
  };
  const user = users[email];
  if (user && password.endsWith('!')) {
    const parts = user.name.split(' ');
    return { id: user.id, email, role: user.role, first_name: parts[0] || user.name, last_name: parts.slice(1).join(' ') || '' };
  }
  throw new Error('Email ou mot de passe incorrect');
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true); setError('');
    try {
      const userData = await mockLogin(email, password);
      await AsyncStorage.setItem('access_token', `mock_${userData.id}`);
      await AsyncStorage.setItem('refresh_token', `mock_refresh_${userData.id}`);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      const screenMap: Record<string, string> = {
        admin: 'AdminHome',
        teacher: 'TeacherHome',
        parent: 'ParentHome',
        student: 'StudentHome',
      };
      navigation.replace(screenMap[userData.role] || 'StudentHome');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally { setLoading(false); }
  };

  const fillDemo = (a: typeof DEMO_ACCOUNTS[0]) => { setEmail(a.email); setPassword(a.password); };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>Don Bosco{'\n'}Connect</Text>
          <Text style={styles.subtitle}>Plateforme éducative intelligente</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Se connecter</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Comptes de démonstration</Text>
          <View style={styles.demoRow}>
            {DEMO_ACCOUNTS.map((a) => (
              <TouchableOpacity key={a.role} style={[styles.demoBtn, { borderColor: a.color }]} onPress={() => fillDemo(a)}>
                <Text style={[styles.demoRole, { color: a.color }]}>{a.role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>🔒 Connexion sécurisée</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937', textAlign: 'center', lineHeight: 34 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6 },
  form: { marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, padding: 16, borderRadius: 12, fontSize: 15, color: '#1F2937' },
  loginBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#EF4444', textAlign: 'center', marginBottom: 12, fontSize: 14 },
  demoSection: { marginTop: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  demoTitle: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  demoBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  demoRole: { fontSize: 13, fontWeight: '600' },
  footer: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 32 },
});
