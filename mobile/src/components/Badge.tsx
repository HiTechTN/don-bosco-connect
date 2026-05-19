import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  color?: string;
}

export default function Badge({ label, color = '#4F46E5' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600' },
});
