import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style, size = 'md' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[size], (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[styles.text, variant === 'outline' && styles.outlineText, size === 'sm' && styles.smText]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#4F46E5' },
  secondary: { backgroundColor: '#6366F1' },
  danger: { backgroundColor: '#EF4444' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#4F46E5' },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontWeight: '600', fontSize: 15 },
  outlineText: { color: '#4F46E5' },
  smText: { fontSize: 13 },
});
