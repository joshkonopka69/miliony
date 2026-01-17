import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { userService, UserGameStats } from '../services/userService';

export default function AllBadgesScreen() {
  const navigation = useAppNavigation();
  const { t, language } = useTranslation();

  const { user } = useAuth();

  // Game stats now loaded from backend so badges update in real-time
  const [gameStats, setGameStats] = useState<UserGameStats>({
    basketball: 0,
    football: 0,
    tennis: 0,
    volleyball: 0,
    running: 0,
    cycling: 0,
    swimming: 0,
    gym: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      try {
        const stats = await userService.getUserGameStats(user.id);
        setGameStats(stats);
        console.log('✅ AllBadgesScreen: game stats loaded:', stats);
      } catch (error) {
        console.error('❌ AllBadgesScreen: error loading game stats:', error);
      }
    };

    loadStats();
  }, [user?.id]);

  // Badge images mapping for local assets
  const badgeImages = {
    basketball: require('../../assets/badges/basketball.png'),
    football: require('../../assets/badges/football.png'),
    tennis: require('../../assets/badges/tennis.png'),
    running: require('../../assets/badges/running.png'),
    volleyball: require('../../assets/badges/volleyball.png'),
    cycling: require('../../assets/badges/cycling.png'),
    gym: require('../../assets/badges/gym.png'),
    swimming: require('../../assets/badges/swimming.png'),
    allrounder: require('../../assets/badges/allrounder.png'),
    community_star: require('../../assets/badges/community_star.png'),
  };

  interface BadgeItem {
    id: string;
    name: string;
    icon: string;
    image?: any;
    description: string;
    required: number;
  }

  // Define all badges by category
  const badgeCategories: {
    sportKey: string;
    sport: string;
    icon: string;
    categoryImage?: any;
    color: string;
    badges: BadgeItem[];
  }[] = [
      {
        sportKey: 'basketball',
        sport: t.allBadges.basketball,
        icon: '🏀',
        categoryImage: badgeImages.basketball,
        color: '#F97316',
        badges: [
          { id: 'basketball_rookie', name: `${t.allBadges.basketball} ${t.allBadges.tiers.rookie}`, icon: '🏀', image: badgeImages.basketball, description: t.allBadges.playGames.replace('{count}', '1').replace('{sport}', t.allBadges.basketball).replace('{s}', ''), required: 1 },

          { id: 'basketball_player', name: `${t.allBadges.basketball} ${t.allBadges.tiers.player}`, icon: '🏀', image: badgeImages.basketball, description: t.allBadges.playGames.replace('{count}', '5').replace('{sport}', t.allBadges.basketball).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'basketball_pro', name: `${t.allBadges.basketball} ${t.allBadges.tiers.pro}`, icon: '🏀', image: badgeImages.basketball, description: t.allBadges.playGames.replace('{count}', '10').replace('{sport}', t.allBadges.basketball).replace('{s}', language === 'en' ? 's' : ''), required: 10 },
          { id: 'basketball_legend', name: `${t.allBadges.basketball} ${t.allBadges.tiers.legend}`, icon: '🏆', image: badgeImages.basketball, description: t.allBadges.playGames.replace('{count}', '20').replace('{sport}', t.allBadges.basketball).replace('{s}', language === 'en' ? 's' : ''), required: 20 },
        ],

      },
      {
        sportKey: 'football',
        sport: t.allBadges.football,
        icon: '⚽',
        categoryImage: badgeImages.football,
        color: '#10B981',
        badges: [
          { id: 'football_rookie', name: `${t.allBadges.football} ${t.allBadges.tiers.rookie}`, icon: '⚽', image: badgeImages.football, description: t.allBadges.playGames.replace('{count}', '1').replace('{sport}', t.allBadges.football).replace('{s}', ''), required: 1 },
          { id: 'football_player', name: `${t.allBadges.football} ${t.allBadges.tiers.player}`, icon: '⚽', image: badgeImages.football, description: t.allBadges.playGames.replace('{count}', '5').replace('{sport}', t.allBadges.football).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'football_pro', name: `${t.allBadges.football} ${t.allBadges.tiers.pro}`, icon: '⚽', image: badgeImages.football, description: t.allBadges.playGames.replace('{count}', '10').replace('{sport}', t.allBadges.football).replace('{s}', language === 'en' ? 's' : ''), required: 10 },
          { id: 'football_legend', name: `${t.allBadges.football} ${t.allBadges.tiers.legend}`, icon: '🏆', image: badgeImages.football, description: t.allBadges.playGames.replace('{count}', '20').replace('{sport}', t.allBadges.football).replace('{s}', language === 'en' ? 's' : ''), required: 20 },
        ],

      },
      {
        sportKey: 'tennis',
        sport: t.allBadges.tennis,
        icon: '🎾',
        categoryImage: badgeImages.tennis,
        color: '#FFD700',
        badges: [
          { id: 'tennis_rookie', name: `${t.allBadges.tennis} ${t.allBadges.tiers.rookie}`, icon: '🎾', image: badgeImages.tennis, description: t.allBadges.playGames.replace('{count}', '1').replace('{sport}', t.allBadges.tennis).replace('{s}', ''), required: 1 },
          { id: 'tennis_player', name: `${t.allBadges.tennis} ${t.allBadges.tiers.player}`, icon: '🎾', image: badgeImages.tennis, description: t.allBadges.playGames.replace('{count}', '5').replace('{sport}', t.allBadges.tennis).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'tennis_pro', name: `${t.allBadges.tennis} ${t.allBadges.tiers.pro}`, icon: '🎾', image: badgeImages.tennis, description: t.allBadges.playGames.replace('{count}', '10').replace('{sport}', t.allBadges.tennis).replace('{s}', language === 'en' ? 's' : ''), required: 10 },
        ],

      },
      {
        sportKey: 'running',
        sport: t.allBadges.running,
        icon: '🏃‍♂️',
        categoryImage: badgeImages.running,
        color: '#EF4444',
        badges: [
          { id: 'running_rookie', name: `${t.allBadges.running} ${t.allBadges.tiers.rookie}`, icon: '🏃‍♂️', image: badgeImages.running, description: t.allBadges.completeGames.replace('{count}', '1').replace('{sport}', t.allBadges.running).replace('{s}', ''), required: 1 },
          { id: 'running_player', name: `${t.allBadges.running} ${t.allBadges.tiers.enthusiast}`, icon: '🏃‍♂️', image: badgeImages.running, description: t.allBadges.completeGames.replace('{count}', '5').replace('{sport}', t.allBadges.running).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'running_pro', name: t.allBadges.tiers.marathoner, icon: '🏃‍♂️', image: badgeImages.running, description: t.allBadges.completeGames.replace('{count}', '10').replace('{sport}', t.allBadges.running).replace('{s}', language === 'en' ? 's' : ''), required: 10 },
          { id: 'running_legend', name: `${t.allBadges.running} ${t.allBadges.tiers.legend}`, icon: '🏆', image: badgeImages.running, description: t.allBadges.completeGames.replace('{count}', '20').replace('{sport}', t.allBadges.running).replace('{s}', language === 'en' ? 's' : ''), required: 20 },
        ],

      },
      {
        sportKey: 'volleyball',
        sport: t.allBadges.volleyball,
        icon: '🏐',
        categoryImage: badgeImages.volleyball,
        color: '#3B82F6',
        badges: [
          { id: 'volleyball_rookie', name: `${t.allBadges.volleyball} ${t.allBadges.tiers.rookie}`, icon: '🏐', image: badgeImages.volleyball, description: t.allBadges.playGames.replace('{count}', '1').replace('{sport}', t.allBadges.volleyball).replace('{s}', ''), required: 1 },
          { id: 'volleyball_player', name: `${t.allBadges.volleyball} ${t.allBadges.tiers.player}`, icon: '🏐', image: badgeImages.volleyball, description: t.allBadges.playGames.replace('{count}', '5').replace('{sport}', t.allBadges.volleyball).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'volleyball_pro', name: `${t.allBadges.volleyball} ${t.allBadges.tiers.pro}`, icon: '🏐', image: badgeImages.volleyball, description: t.allBadges.playGames.replace('{count}', '10').replace('{sport}', t.allBadges.volleyball).replace('{s}', language === 'en' ? 's' : ''), required: 10 },
        ],
      },
      {
        sportKey: 'cycling',
        sport: t.allBadges.cycling,
        icon: '🚴‍♂️',
        categoryImage: badgeImages.cycling,
        color: '#8B5CF6',
        badges: [
          { id: 'cycling_rookie', name: `${t.allBadges.cycling} ${t.allBadges.tiers.rookie}`, icon: '🚴‍♂️', image: badgeImages.cycling, description: t.allBadges.completeGames.replace('{count}', '1').replace('{sport}', t.allBadges.cycling).replace('{s}', ''), required: 1 },
          { id: 'cycling_player', name: `${t.allBadges.cycling} ${t.allBadges.tiers.enthusiast}`, icon: '🚴‍♂️', image: badgeImages.cycling, description: t.allBadges.completeGames.replace('{count}', '5').replace('{sport}', t.allBadges.cycling).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'cycling_pro', name: `${t.allBadges.cycling} ${t.allBadges.tiers.pro}`, icon: '🚴‍♂️', image: badgeImages.cycling, description: t.allBadges.completeGames.replace('{count}', '10').replace('{sport}', t.allBadges.cycling).replace('{s}', language === 'en' ? 's' : ''), required: 10 },

        ],
      },
      {
        sportKey: 'gym',
        sport: t.allBadges.gym,
        icon: '💪',
        categoryImage: badgeImages.gym,
        color: '#6B7280',
        badges: [
          { id: 'gym_rookie', name: `${t.allBadges.gym} ${t.allBadges.tiers.rookie}`, icon: '💪', image: badgeImages.gym, description: t.allBadges.completeGames.replace('{count}', '1').replace('{sport}', t.allBadges.gym).replace('{s}', ''), required: 1 },
          { id: 'gym_player', name: `${t.allBadges.gym} ${t.allBadges.tiers.regular}`, icon: '💪', image: badgeImages.gym, description: t.allBadges.completeGames.replace('{count}', '5').replace('{sport}', t.allBadges.gym).replace('{s}', language === 'en' ? 's' : ''), required: 5 },
          { id: 'gym_pro', name: `${t.allBadges.gym} ${t.allBadges.tiers.pro}`, icon: '💪', image: badgeImages.gym, description: t.allBadges.completeGames.replace('{count}', '10').replace('{sport}', t.allBadges.gym).replace('{s}', language === 'en' ? 's' : ''), required: 10 },
        ],
      },
      {
        sportKey: 'swimming',
        sport: t.allBadges.swimming,
        icon: '🏊‍♂️',
        categoryImage: badgeImages.swimming,
        color: '#06B6D4',
        badges: [
          { id: 'swimming_rookie', name: `${t.allBadges.swimming} ${t.allBadges.tiers.rookie}`, icon: '🏊‍♂️', image: badgeImages.swimming, description: `Complete 1 ${t.allBadges.swimming.toLowerCase()} swim`, required: 1 },
          { id: 'swimming_player', name: `${t.allBadges.swimming} ${t.allBadges.tiers.enthusiast}`, icon: '🏊‍♂️', image: badgeImages.swimming, description: `Complete 5 ${t.allBadges.swimming.toLowerCase()} swims`, required: 5 },
        ],
      },
      {
        sportKey: 'special',
        sport: t.allBadges.special,
        icon: '⭐',
        categoryImage: badgeImages.allrounder,
        color: '#FFD700',
        badges: [
          { id: 'all_rounder', name: t.allBadges.specialBadges.allRounderName, icon: '🌟', image: badgeImages.allrounder, description: t.allBadges.specialBadges.allRounderRequirement, required: 3 },
          { id: 'social_butterfly', name: t.allBadges.specialBadges.socialButterflyName, icon: '🤝', image: badgeImages.community_star, description: t.allBadges.specialBadges.socialButterflyRequirement, required: 10 },
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
                  {category.categoryImage ? (
                    <Image source={category.categoryImage} style={styles.categoryBadgeImage} />
                  ) : (
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  )}
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.sport}</Text>
                  <Text style={styles.categoryProgress}>
                    {earnedCount}/{category.badges.length} {t.allBadges.earnedBadge}
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
                        { backgroundColor: '#F9FAFB' }
                      ]}>
                        {badge.image ? (
                          <Image
                            source={badge.image}
                            style={[
                              styles.badgeImage,
                              !isEarned && styles.badgeImageLocked
                            ]}
                          />
                        ) : (
                          <Text style={[
                            styles.badgeIcon,
                            !isEarned && styles.badgeIconLocked
                          ]}>
                            {badge.icon}
                          </Text>
                        )}

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
                          <Text style={styles.earnedText}>{t.allBadges.earnedStatus}</Text>
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
  categoryBadgeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  badgeImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  badgeImageLocked: {
    opacity: 0.2,
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




