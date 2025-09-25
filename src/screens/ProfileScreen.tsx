import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';
import { BottomNavBar } from '../components';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  
  const [activeTab, setActiveTab] = useState<'Created' | 'Joined'>('Created');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTabChange = (tab: 'Created' | 'Joined') => {
    setActiveTab(tab);
  };

  const handleAddFriend = () => {
    navigation.navigate('AddFriend');
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleGamePress = (gameId: string) => {
    console.log('Game pressed:', gameId);
  };

  const renderGameItem = (game: { id: string; title: string; location: string; date: string; time: string }) => (
    <TouchableOpacity 
      key={game.id}
      style={styles.gameItem}
      onPress={() => handleGamePress(game.id)}
      activeOpacity={0.7}
    >
      <View style={styles.gameImage}>
        <Text style={styles.gameImageText}>🏀</Text>
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameDetails}>{game.location} • {game.date}, {game.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <SMLogo size={30} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileImageText}>EC</Text>
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Ethan Carter</Text>
              <Text style={styles.profileUsername}>@ethan.carter</Text>
              <Text style={styles.profileJoinDate}>Joined Sportsmap in 2022</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Created' && styles.activeTab]}
              onPress={() => handleTabChange('Created')}
            >
              <Text style={[styles.tabText, activeTab === 'Created' && styles.activeTabText]}>
                Created
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Joined' && styles.activeTab]}
              onPress={() => handleTabChange('Joined')}
            >
              <Text style={[styles.tabText, activeTab === 'Joined' && styles.activeTabText]}>
                Joined
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Games List */}
        <View style={styles.gamesSection}>
          {activeTab === 'Created' ? (
            <View style={styles.gamesList}>
              {renderGameItem({
                id: '1',
                title: 'Basketball Game',
                location: 'Central Park',
                date: 'Today',
                time: '5:00 PM'
              })}
              {renderGameItem({
                id: '2',
                title: 'Soccer Match',
                location: 'Prospect Park',
                date: 'Tomorrow',
                time: '6:00 PM'
              })}
            </View>
          ) : (
            <View style={styles.gamesList}>
              {renderGameItem({
                id: '3',
                title: 'Volleyball Game',
                location: 'Riverside Park',
                date: 'Friday',
                time: '7:00 PM'
              })}
              {renderGameItem({
                id: '4',
                title: 'Tennis Match',
                location: 'Brooklyn Bridge Park',
                date: 'Saturday',
                time: '10:00 AM'
              })}
            </View>
          )}
        </View>

        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <Text style={styles.friendsTitle}>Friends</Text>
          <View style={styles.friendsList}>
            <TouchableOpacity style={styles.friendItem} onPress={handleAddFriend}>
              <View style={styles.friendIcon}>
                <Text style={styles.friendIconText}>+</Text>
              </View>
              <Text style={styles.friendText}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.friendItem} onPress={handleCreateGroup}>
              <View style={styles.friendIcon}>
                <Text style={styles.friendIconText}>👥</Text>
              </View>
              <Text style={styles.friendText}>Create a Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab="MyProfile"
        onProfilePress={() => navigation.navigate('Profile')}
      />
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
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#e4e4e7', // bg-zinc-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#18181b',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9bc06', // bg-[var(--primary-color)]
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    letterSpacing: -0.015,
    textAlign: 'center',
  },
  profileUsername: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#71717a', // text-zinc-500
    textAlign: 'center',
    marginTop: 4,
  },
  profileJoinDate: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#71717a', // text-zinc-500
    textAlign: 'center',
    marginTop: 4,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7', // border-zinc-200
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#f9bc06', // bg-[var(--primary-color)]
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#71717a', // text-zinc-500
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  gamesSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gamesList: {
    gap: 12,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7', // border-zinc-200
    gap: 16,
  },
  gameImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#e4e4e7', // bg-zinc-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameImageText: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 14,
    color: '#71717a', // text-zinc-500
  },
  friendsSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    marginBottom: 12,
  },
  friendsList: {
    flexDirection: 'row',
    gap: 12,
  },
  friendItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7', // border-zinc-200
    gap: 12,
  },
  friendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e4e4e7', // bg-zinc-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendIconText: {
    fontSize: 20,
    color: '#71717a', // text-zinc-500
  },
  friendText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181b', // text-zinc-900
  },
});