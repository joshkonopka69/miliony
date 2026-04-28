import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';

// Location images mapping - uses local assets for location photos
const LOCATION_IMAGES: Record<string, ImageSourcePropType> = {
  'Central Park': require('../../assets/sports.png'),
  'Prospect Park': require('../../assets/sports.png'),
  'Riverside Park': require('../../assets/sports.png'),
  default: require('../../assets/sports.png'),
};

const getLocationImage = (locationName: string): ImageSourcePropType => {
  return LOCATION_IMAGES[locationName] || LOCATION_IMAGES.default;
};

interface Game {
  id: string;
  title: string;
  players: number;
  location: string;
  time: string;
  isJoined?: boolean;
  isCreated?: boolean;
}

const joinedGames: Game[] = [
  {
    id: '1',
    title: 'Pickup Basketball',
    players: 5,
    location: 'Central Park',
    time: '5:00 PM',
    isJoined: true,
  },
  {
    id: '2',
    title: 'Soccer Match',
    players: 10,
    location: 'Prospect Park',
    time: '6:00 PM',
    isJoined: true,
  },
];

const createdGames: Game[] = [
  {
    id: '3',
    title: 'Volleyball Game',
    players: 8,
    location: 'Riverside Park',
    time: '7:00 PM',
    isCreated: true,
  },
];

export default function EventsScreen() {
  const navigation = useAppNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGamePress = (game: Game) => {
    console.log('Opening game details for:', game.title);
    navigation.navigate(ROUTES.EVENT_DETAILS, { game });
  };

  const handleChatPress = (game: Game) => {
    console.log('Opening chat for:', game.title);
    navigation.navigate(ROUTES.GAME_CHAT, { game });
  };

  const GameCard = ({ game }: { game: Game }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => handleGamePress(game)}
      activeOpacity={0.7}
    >
      {/* Location Photo */}
      <Image 
        source={getLocationImage(game.location)} 
        style={styles.gameImage} 
        resizeMode="cover"
      />
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameDetails}>
          {game.players} players · {game.location} · {game.time}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleChatPress(game)}
        activeOpacity={0.7}
      >
        <Text style={{fontSize: 22, color: '#9ca3af'}}>•</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={{fontSize: 22, color: '#000000'}}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Games</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Joined Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Joined</Text>
          {joinedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </View>

        {/* Created Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Created</Text>
          {createdGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab="MyGames"
        onProfilePress={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F5F5F5',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  gameDetails: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});