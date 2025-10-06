import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { getSportIcon, getSportColor } from '../utils/eventGrouping';
import type { SportActivity } from '../types/event';

interface FavoriteSportsProps {
  sports: SportActivity[];
}

export default function FavoriteSports({ sports }: FavoriteSportsProps) {
  if (!sports || sports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite sports selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Sports</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportsContainer}
      >
        {sports.map((sport, index) => {
          const icon = getSportIcon(sport);
          const color = getSportColor(sport);
          
          return (
            <View key={index} style={[styles.sportChip, { borderColor: color }]}>
              <View style={[styles.sportIconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={16} color={theme.colors.textOnPrimary} />
              </View>
              <Text style={[styles.sportText, { color }]}>{sport}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sportsContainer: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 2,
    gap: theme.spacing.xs,
  },
  sportIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


