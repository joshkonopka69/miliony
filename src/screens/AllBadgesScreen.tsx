import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { useTranslation } from '../contexts/TranslationContext';

export default function AllBadgesScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  // Mock game stats (would come from props or context)
  const [gameStats] = useState({
    basketball: 15,
    football: 8,
    tennis: 5,
    volleyball: 3,
    running: 20,
    cycling: 7,
    swimming: 2,
    gym: 10,
  });

  // Define all badges by category
  const badgeCategories = [
    {
      sport: 'Basketball',
      icon: '🏀',
      color: '#F97316',
      badges: [
        { id: 'basketball_rookie', name: 'Basketball Rookie', icon: '🏀', description: 'Play 1 basketball game', required: 1 },
        { id: 'basketball_player', name: 'Basketball Player', icon: '🏀', description: 'Play 5 basketball games', required: 5 },
        { id: 'basketball_pro', name: 'Basketball Pro', icon: '🏀', description: 'Play 10 basketball games', required: 10 },
        { id: 'basketball_legend', name: 'Basketball Legend', icon: '🏆', description: 'Play 20 basketball games', required: 20 },
      ],
    },
    {
      sport: 'Football',
      icon: '⚽',
      color: '#10B981',
      badges: [
        { id: 'football_rookie', name: 'Football Rookie', icon: '⚽', description: 'Play 1 football game', required: 1 },
        { id: 'football_player', name: 'Football Player', icon: '⚽', description: 'Play 5 football games', required: 5 },
        { id: 'football_pro', name: 'Football Pro', icon: '⚽', description: 'Play 10 football games', required: 10 },
        { id: 'football_legend', name: 'Football Legend', icon: '🏆', description: 'Play 20 football games', required: 20 },
      ],
    },
    {
      sport: 'Tennis',
      icon: '🎾',
      color: '#EAB308',
      badges: [
        { id: 'tennis_rookie', name: 'Tennis Rookie', icon: '🎾', description: 'Play 1 tennis game', required: 1 },
        { id: 'tennis_player', name: 'Tennis Player', icon: '🎾', description: 'Play 5 tennis games', required: 5 },
        { id: 'tennis_pro', name: 'Tennis Pro', icon: '🎾', description: 'Play 10 tennis games', required: 10 },
      ],
    },
    {
      sport: 'Running',
      icon: '🏃‍♂️',
      color: '#EF4444',
      badges: [
        { id: 'running_rookie', name: 'Running Rookie', icon: '🏃‍♂️', description: 'Complete 1 run', required: 1 },
        { id: 'running_player', name: 'Running Enthusiast', icon: '🏃‍♂️', description: 'Complete 5 runs', required: 5 },
        { id: 'running_pro', name: 'Marathon Runner', icon: '🏃‍♂️', description: 'Complete 10 runs', required: 10 },
        { id: 'running_legend', name: 'Running Legend', icon: '🏆', description: 'Complete 20 runs', required: 20 },
      ],
    },
    {
      sport: 'Volleyball',
      icon: '🏐',
      color: '#3B82F6',
      badges: [
        { id: 'volleyball_rookie', name: 'Volleyball Rookie', icon: '🏐', description: 'Play 1 volleyball game', required: 1 },
        { id: 'volleyball_player', name: 'Volleyball Player', icon: '🏐', description: 'Play 5 volleyball games', required: 5 },
      ],
    },
    {
      sport: 'Cycling',
      icon: '🚴‍♂️',
      color: '#8B5CF6',
      badges: [
        { id: 'cycling_rookie', name: 'Cycling Rookie', icon: '🚴‍♂️', description: 'Complete 1 ride', required: 1 },
        { id: 'cycling_player', name: 'Cycling Enthusiast', icon: '🚴‍♂️', description: 'Complete 5 rides', required: 5 },
        { id: 'cycling_pro', name: 'Cycling Pro', icon: '🚴‍♂️', description: 'Complete 10 rides', required: 10 },
      ],
    },
    {
      sport: 'Gym',
      icon: '💪',
      color: '#6B7280',
      badges: [
        { id: 'gym_rookie', name: 'Gym Rookie', icon: '💪', description: 'Complete 1 gym session', required: 1 },
        { id: 'gym_player', name: 'Gym Regular', icon: '💪', description: 'Complete 5 gym sessions', required: 5 },
        { id: 'gym_pro', name: 'Gym Pro', icon: '💪', description: 'Complete 10 gym sessions', required: 10 },
      ],
    },
    {
      sport: 'Swimming',
      icon: '🏊‍♂️',
      color: '#06B6D4',
      badges: [
        { id: 'swimming_rookie', name: 'Swimming Rookie', icon: '🏊‍♂️', description: 'Complete 1 swim', required: 1 },
        { id: 'swimming_player', name: 'Swimming Enthusiast', icon: '🏊‍♂️', description: 'Complete 5 swims', required: 5 },
      ],
    },
    {
      sport: 'Special',
      icon: '⭐',
      color: '#FFD700',
      badges: [
        { id: 'all_rounder', name: 'All-Rounder', icon: '⭐', description: 'Play 3 different sports', required: 3 },
        { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: 'Join 10 events total', required: 10 },
      ],
    },
  ];

  const getBadgeProgress = (sportKey: string, required: number, badgeId: string) => {
    if (badgeId === 'all_rounder') {
      const sportsPlayed = Object.values(gameStats).filter(count => count > 0).length;
      return sportsPlayed;
    }
    if (badgeId === 'social_butterfly') {
      const totalGames = Object.values(gameStats).reduce((sum, count) => sum + count, 0);
      return totalGames;
    }
    const key = sportKey.toLowerCase() as keyof typeof gameStats;
    return gameStats[key] || 0;
  };

  const isBadgeEarned = (sportKey: string, required: number, badgeId: string) => {
    const progress = getBadgeProgress(sportKey, required, badgeId);
    return progress >= required;
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.allBadges.title}</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {badgeCategories.map((category) => {
          const earnedCount = category.badges.filter(badge =>
            isBadgeEarned(category.sport, badge.required, badge.id)
          ).length;

          return (
            <View key={category.sport} style={styles.categorySection}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.sport}</Text>
                  <Text style={styles.categoryProgress}>
                    {earnedCount}/{category.badges.length} earned
                  </Text>
                </View>
              </View>

              {/* Badges Grid */}
              <View style={styles.badgesGrid}>
                {category.badges.map(badge => {
                  const isEarned = isBadgeEarned(category.sport, badge.required, badge.id);
                  const progress = getBadgeProgress(category.sport, badge.required, badge.id);
                  const progressPercent = Math.min((progress / badge.required) * 100, 100);

                  return (
                    <View
                      key={badge.id}
                      style={[
                        styles.badgeCard,
                        !isEarned && styles.badgeCardLocked
                      ]}
                    >
                      {/* Badge Icon */}
                      <View style={[
                        styles.badgeIconContainer,
                        { backgroundColor: isEarned ? category.color + '20' : '#F3F4F6' }
                      ]}>
                        <Text style={[
                          styles.badgeIcon,
                          !isEarned && styles.badgeIconLocked
                        ]}>
                          {badge.icon}
                        </Text>
                        {isEarned && (
                          <View style={styles.earnedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                          </View>
                        )}
                      </View>

                      {/* Badge Info */}
                      <Text style={[
                        styles.badgeName,
                        !isEarned && styles.badgeNameLocked
                      ]} numberOfLines={2}>
                        {badge.name}
                      </Text>
                      <Text style={styles.badgeDescription} numberOfLines={2}>
                        {badge.description}
                      </Text>

                      {/* Progress or Earned Status */}
                      {!isEarned ? (
                        <>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${progressPercent}%`, backgroundColor: category.color }
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {progress}/{badge.required}
                          </Text>
                        </>
                      ) : (
                        <View style={styles.earnedContainer}>
                          <Ionicons name="trophy" size={12} color="#FFD700" />
                          <Text style={styles.earnedText}>Earned!</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Top Bar
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  // Category Section
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryProgress: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Badges Grid
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  earnedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 36,
  },
  badgeNameLocked: {
    color: '#6B7280',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
    minHeight: 28,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  earnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earnedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});




