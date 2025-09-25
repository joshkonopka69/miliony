import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image,
  Alert
} from 'react-native';
import { useAppNavigation, useAppRoute } from '../navigation';
import { ROUTES } from '../navigation/types';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

interface Game {
  id: string;
  title: string;
  players: number;
  location: string;
  time: string;
  image: string;
  isJoined?: boolean;
  isCreated?: boolean;
  description?: string;
  date?: string;
  maxPlayers?: number;
  skillLevel?: string;
  equipment?: string;
  rules?: string;
  organizer?: string;
}

export default function EventDetailsScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'EventDetails'>();
  const game = route.params?.game;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleJoinGame = () => {
    Alert.alert(
      'Join Game',
      `Are you sure you want to join "${game?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => console.log('Joined game:', game?.title) }
      ]
    );
  };

  const handleLeaveGame = () => {
    Alert.alert(
      'Leave Game',
      `Are you sure you want to leave "${game?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => console.log('Left game:', game?.title) }
      ]
    );
  };

  const handleChatPress = () => {
    navigation.navigate(ROUTES.GAME_CHAT, { game });
  };

  const handleShareGame = () => {
    Alert.alert('Share Game', `Share "${game?.title}" with friends!`);
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareGame}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
          <SMLogo size={30} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Game Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: game.image }} style={styles.gameImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameLocation}>📍 {game.location}</Text>
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.content}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{game.date || 'Today'} at {game.time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Players</Text>
                <Text style={styles.infoValue}>{game.players}/{game.maxPlayers || 10} players</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{game.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Skill Level</Text>
                <Text style={styles.infoValue}>{game.skillLevel || 'All Levels'}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {game.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{game.description}</Text>
            </View>
          )}

          {/* Equipment */}
          {game.equipment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment Needed</Text>
              <Text style={styles.equipment}>{game.equipment}</Text>
            </View>
          )}

          {/* Rules */}
          {game.rules && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rules</Text>
              <Text style={styles.rules}>{game.rules}</Text>
            </View>
          )}

          {/* Organizer */}
          {game.organizer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organizer</Text>
              <Text style={styles.organizer}>{game.organizer}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleChatPress}
        >
          <Text style={styles.chatButtonText}>💬 Chat</Text>
        </TouchableOpacity>
        
        {game.isJoined ? (
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveGame}
          >
            <Text style={styles.leaveButtonText}>Leave Game</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinGame}
          >
            <Text style={styles.joinButtonText}>Join Game</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // border-gray-100
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#374151', // text-gray-700
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
    color: '#374151', // text-gray-700
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  gameLocation: {
    fontSize: 16,
    color: '#ffffff',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // border-gray-100
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280', // text-gray-500
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827', // text-gray-900
    flex: 2,
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
  },
  equipment: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
  },
  rules: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
  },
  organizer: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6', // border-gray-100
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#f3f4f6', // bg-gray-100
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151', // text-gray-700
  },
  joinButton: {
    flex: 2,
    backgroundColor: '#10b981', // bg-emerald-500
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  leaveButton: {
    flex: 2,
    backgroundColor: '#ef4444', // bg-red-500
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280', // text-gray-500
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#10b981', // text-emerald-500
    fontWeight: '500',
  },
});