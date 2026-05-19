import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';

interface Props {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message = 'Aucune donnée', actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} size="sm" style={styles.btn} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 48, marginBottom: 12 },
  message: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  btn: { marginTop: 4 },
});
