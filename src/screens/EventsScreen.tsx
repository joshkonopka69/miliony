import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { BottomNavBar, EventDetailsModal } from '../components';

interface Game {
  id: string;
  title: string;
  type: string;
  sport: string;
  sportIcon: string;
  image: string;
  description: string;
  minPlayers?: number;
  maxPlayers?: number;
  isOpen: boolean;
  currentPlayers: number;
  location: string;
  date: string;
  time: string;
  organizer: string;
  organizerAvatar?: string;
}

interface SportGroup {
  sport: string;
  icon: string;
  iconColor: string;
  games: Game[];
}

const myGames: SportGroup[] = [
  {
    sport: 'Basketball',
    icon: '🏀',
    iconColor: '#f97316', // orange-500
    games: [
      {
        id: 'b1',
        title: 'Pick-up game',
        type: '2v2',
        sport: 'Basketball',
        sportIcon: '🏀',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGKQtqKThvtVIRnw6O6CxnLGpPOhl24xTgedEBXvbhVJLK2hJ_ug97qr5Vws0YHfnsbVsiFo9_5ISv_AdVDToZ2MMOpKQBZkgxmIWoBpTcoEZx0QfXrzseVPq7goIEVICWGsOYDn45FEOfkmMFmut4ZYc6qkdzuGcev2Jk6isEPB_MCw18vbfnn2R_3T0lafxKzXimIkvfSLgaX-JWX_tGmpqHlBFqjAjqsr3X4q6Z3M5zMiJktTckrjViGQQd2NAKmxoTIc2WBS9Y',
        description: 'Casual basketball game for all skill levels. Bring your A-game and let\'s have some fun on the court!',
        minPlayers: 4,
        maxPlayers: 8,
        isOpen: false,
        currentPlayers: 6,
        location: 'Central Park Basketball Court',
        date: 'Today',
        time: '6:00 PM',
        organizer: 'Mike Johnson',
        organizerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'b2',
        title: 'Training',
        type: '1v1',
        sport: 'Basketball',
        sportIcon: '🏀',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1vIdvPXWE9d4lXJk32KgV2hjwESpXvtyyRVJt8NNV4HfCzYUzvlz9s5KGwr490hxPT3SWTOuMfl3tXLYcChY4S5FSQm_GQ3VpbilsnRK-1-PXvXgEt5ye53AjpUmHTKdzsfclAWg3fgE-kU6Vnm2UDCPb4frpNhh3wFIpYY_-S0klTbMvGraO3c1iNpJjFDNVtqFq413RTD2admIuvUYsq8FdlvA4vYPba3DjByBaCtBzkzKqthGv9dsMlv_QXX5M6JgXpwCb0um2',
        description: 'Intensive 1v1 training session to improve your basketball skills. Focus on shooting, dribbling, and defense.',
        minPlayers: 2,
        maxPlayers: 2,
        isOpen: false,
        currentPlayers: 1,
        location: 'Sports Complex Court 2',
        date: 'Tomorrow',
        time: '4:00 PM',
        organizer: 'Sarah Wilson',
        organizerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    sport: 'Tennis',
    icon: '🎾',
    iconColor: '#22c55e', // green-500
    games: [
      {
        id: 't1',
        title: 'Training',
        type: '1v1',
        sport: 'Tennis',
        sportIcon: '🎾',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHDv4wjxkM8gAf-VywCCQctVq_UU_9ghVCLB2jxVPG0WETT13EUvCXxNAgJtMHxVwN9Oe9XwnKoSg7gKk9J-p_BaK-h3iSQfHCxd5Xef3HS-XCAZicZFzhuF5U_E_P9SdwASR04n8PMsnVD0Ns0joFunzZzrVikrUNz-VkXY3FQHpHDNPg_2ihPEF__4-2F0l7tLhvQCx_STLdB8f0C23pCLaKYcZjYWnH3IWcBkHbuk1-ugKfQUOXURWhZvaBDL2x_XYo7EaDLuSc',
        description: 'Tennis training session for intermediate players. We\'ll work on technique, footwork, and match strategies.',
        minPlayers: 2,
        maxPlayers: 2,
        isOpen: false,
        currentPlayers: 2,
        location: 'Tennis Club Court 1',
        date: 'Friday',
        time: '7:00 PM',
        organizer: 'David Chen',
        organizerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 't2',
        title: 'Match',
        type: '1v1',
        sport: 'Tennis',
        sportIcon: '🎾',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqmtEp9LdCEgi4baDjGARRPZpwKIlWN2ZhCT9iSRUc4_2EdGro8pE-Q-QWVye0IHmDhX1uHIqXDwQwSGSlSj2JlT5PDbvsj5TN_Kxt1ANaj2yuMCItctgBzJ-5EX6w6z9sA18yRXeLwQ3GUWCAtcq438N4p0tAUR7Pv6733qVSBOsb-f0vInputGUZfK-YuBnZ27Uo1YzycGU4jQQrm1YP81hZ7eE-UpILJzPyNI475U25S16iUou_90ED9oehspM_70d8eltmkkyv',
        description: 'Competitive tennis match. All skill levels welcome. Let\'s see who has the best serve!',
        minPlayers: 2,
        maxPlayers: 2,
        isOpen: false,
        currentPlayers: 1,
        location: 'Tennis Club Court 3',
        date: 'Saturday',
        time: '10:00 AM',
        organizer: 'Emma Rodriguez',
        organizerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
  {
    sport: 'Running',
    icon: '🏃',
    iconColor: '#3b82f6', // blue-500
    games: [
      {
        id: 'r1',
        title: 'Training',
        type: '5k',
        sport: 'Running',
        sportIcon: '🏃',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsAmJgMC1BOTYKfXSv_hVaE9Z_cmAEfEGex53SyLq4w_HDkOtYCtGMH9ubgYUh0AAvPQx1EofBKjsGLZs0oWpnmFWrlNptMbEdDg5ZotO3mD3wnICt8OzZmiEKccls1BnfNCZTJE177s5LzZo4W9Adj8nHRzS_M4QES568kE6Bklnnx2CgUh-bK-CbcZ6SxXjZaLDFZavB8au5VKaJd0OQSpBLWvmCsFZ-eFFdCA45XFh0VAcVDGs1kOdTcfE9vxRcssn3UBhdkj4g',
        description: 'Morning 5K run through the park. Perfect for beginners and experienced runners. We\'ll maintain a steady pace and enjoy the scenery.',
        isOpen: true,
        currentPlayers: 12,
        location: 'Riverside Park',
        date: 'Sunday',
        time: '8:00 AM',
        organizer: 'Alex Thompson',
        organizerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      },
    ],
  },
];

export default function EventsScreen() {
  const navigation = useAppNavigation();
  const [selectedEvent, setSelectedEvent] = useState<Game | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const handleCreateGame = () => {
    // Navigate to create game screen
    console.log('Create new game');
  };

  const handleGamePress = (game: Game) => {
    console.log('Opening event details for:', game.title);
    setSelectedEvent(game);
    setShowEventModal(true);
  };

  const handleJoinEvent = (eventId: string) => {
    console.log('Joining event:', eventId);
    // Here you would typically make an API call to join the event
    // For now, we'll just show a success message
    Alert.alert('Success', 'You have joined the event!');
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Games</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleCreateGame}
            activeOpacity={0.8}
          >
            <Text style={styles.addIcon}>➕</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {myGames.map((group) => (
            <View key={group.sport} style={styles.sportSection}>
              <View style={styles.sportHeader}>
                <Text style={[styles.sportIcon, { color: group.iconColor }]}>{group.icon}</Text>
                <Text style={styles.sportTitle}>{group.sport}</Text>
              </View>
              <View style={styles.gamesList}>
                {group.games.map((game) => (
                  <TouchableOpacity
                    key={game.id}
                    style={styles.gameCard}
                    onPress={() => handleGamePress(game)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: game.image }} style={styles.gameImage} />
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameTitle}>{game.title}</Text>
                      <Text style={styles.gameType}>{game.type}</Text>
                    </View>
                    <Text style={styles.chevronIcon}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="MyGames" />

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={showEventModal}
        onClose={handleCloseModal}
        event={selectedEvent}
        onJoinEvent={handleJoinEvent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDEB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(254, 253, 235, 0.8)', // bg-[#FEFDEB]/80
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: -1, // tracking-tighter
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#FFE600', // primary-500 from your design
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 96, // pb-24 in tailwind is 96
  },
  sportSection: {
    marginTop: 24, // mt-6
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sportIcon: {
    fontSize: 30,
  },
  sportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: -0.5, // tracking-tight
  },
  gamesList: {
    gap: 12,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
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
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  gameType: {
    color: '#6b7280', // zinc-500
    fontSize: 14,
  },
  chevronIcon: {
    fontSize: 24,
    color: '#a1a1aa', // zinc-400
  },
});

