import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  count?: number;
}

export default function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
        {count !== undefined && ` (${count})`}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginRight: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

