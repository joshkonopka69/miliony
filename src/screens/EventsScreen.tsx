import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Image 
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';

interface Game {
  id: string;
  title: string;
  players: number;
  location: string;
  time: string;
  image: string;
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB26Ew9uaRiRRc601eC_dt4k5hvT4db-Jzgc2YlGieDIr_xGvc_S1_fQDMTjpnTcCIGvASMQg-uYJsQejxfwNCAH_6sPnTZs-ufhWnxvlGWKlVYLpbztah8Kfls7OTUIdwAW-68k-geuC1CnDt9FeW0kV4LAhFRTfhR67gj785ENgmqnPBfB2OnVZ-1UHjdNfuzpp-1uIh3JVRiusru_2SLx-q7l6l93TFzVWMN4zRnVROJiVGIYyoLXQimdlYvmjbpOitGDX534Hk',
    isJoined: true,
  },
  {
    id: '2',
    title: 'Soccer Match',
    players: 10,
    location: 'Prospect Park',
    time: '6:00 PM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1OsyI5dE7cD8AYErqWq2r9jNqpRa6tnxkTznlh0uhRJPlMMzPVmaz60972BR8G1Sk0PtDJl_FGBPVQHofeHu29q31sesIQBZLRj2FRZ7ttyV_2BE2SAvCjoaYnCFeAjII6Adpix9mJV3hp8YD9uPFqMIlr-TmZMWy2xT69QHM3PtUNjCU49UOJa3Z3ZNoiaGfWuxTqdGKvZRhS_EKWaPY_lq0CjkQB4Co8gftL-q21saAOZ8kNeaY7DqLQajlNvMDEAAHNT-tkSk',
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiZLYsy0twXwMnj_cxtKothtl-PaF1-IVvH-2xjfEeV52VCSN9iHW8in3nUfTsyxDK4uT_4ygfL0WOnav8aHhaGAiYvpJyHtYjQisHD5cKq0hkOy4irfED4CleuM1SRJs338ezq9s6o4SI49E5vyteT3vUfnaObShMVQF4KkupuhrlzgKEz3FFwsDd2WzOx22W6AboL9Qb_45mVDrXD1r9yZdF7IMAE5Wb70LjtaQIjeR90s1t3Rbh2UkSe4ljeIdO1XQ-dmtb5r4',
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
      <Image source={{ uri: game.image }} style={styles.gameImage} />
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
        <Text style={styles.chatIcon}>💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Games</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Joined Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Joined</Text>
            <View style={styles.gamesList}>
              {joinedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </View>
          </View>

          {/* Created Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Created</Text>
            <View style={styles.gamesList}>
              {createdGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="MyGames" />
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
    marginRight: 40, // pr-10 equivalent
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gamesList: {
    gap: 12,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 16,
  },
  gameImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
  },
  chatButton: {
    padding: 8,
  },
  chatIcon: {
    fontSize: 20,
    color: '#9ca3af', // text-gray-400
  },
});

