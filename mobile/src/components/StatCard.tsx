import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  style?: ViewStyle;
}

export default function StatCard({ label, value, color = '#4F46E5', icon, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, minWidth: 80 },
  icon: { fontSize: 24, marginBottom: 4 },
  value: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
  label: { fontSize: 11, color: '#6B7280', textAlign: 'center', fontWeight: '500' },
});
