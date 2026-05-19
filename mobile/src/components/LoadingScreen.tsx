import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  text: { marginTop: 12, color: '#6B7280', fontSize: 14 },
});
