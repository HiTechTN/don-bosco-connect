import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { saveTokens, saveUser } from '../lib/auth';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.mfa_required) {
        setMfaRequired(true);
      } else {
        await saveTokens(res.data.access_token, res.data.refresh_token);
        await saveUser(res.data.user);
        navigation.replace(res.data.user.role === 'admin' ? 'AdminHome' : res.data.user.role === 'teacher' ? 'TeacherHome' : res.data.user.role === 'parent' ? 'ParentHome' : 'StudentHome');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/mfa/verify', { email, password, mfa_code: mfaCode });
      await saveTokens(res.data.access_token, res.data.refresh_token);
      await saveUser(res.data.user);
      navigation.replace(res.data.user.role === 'admin' ? 'AdminHome' : res.data.user.role === 'teacher' ? 'TeacherHome' : 'StudentHome');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Code MFA invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Don Bosco Connect</Text>
      {!mfaRequired ? (
        <>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Connexion</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.instruction}>Code d'authentification</Text>
          <TextInput
            placeholder="Code à 6 chiffres"
            style={styles.input}
            value={mfaCode}
            onChangeText={setMfaCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleMfaVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Vérifier</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#1a237e' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', marginBottom: 12, padding: 14, borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: '#1a237e', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#d32f2f', textAlign: 'center', marginBottom: 8 },
  instruction: { textAlign: 'center', fontSize: 16, marginBottom: 16, color: '#555' },
});