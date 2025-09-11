import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';

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
        <View style={styles.headerSpacer} />
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
        <View style={styles.gamesList}>
          {activeTab === 'Created' ? (
            <>
              {renderGameItem({
                id: '1',
                title: 'Basketball Game',
                location: 'Central Park',
                date: '20/07/24',
                time: '10:00 AM'
              })}
              {renderGameItem({
                id: '2',
                title: 'Soccer Match',
                location: 'Riverside Park',
                date: '15/07/24',
                time: '06:00 PM'
              })}
            </>
          ) : (
            <>
              {renderGameItem({
                id: '3',
                title: 'Tennis Tournament',
                location: 'Queens Park',
                date: '18/07/24',
                time: '02:00 PM'
              })}
              {renderGameItem({
                id: '4',
                title: 'Volleyball League',
                location: 'Brooklyn Bridge Park',
                date: '12/07/24',
                time: '07:00 PM'
              })}
            </>
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
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚽</Text>
          <Text style={styles.navLabel}>My Games</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>👤</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
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
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#27272a', // text-zinc-800
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    letterSpacing: -0.015,
    paddingRight: 40, // pr-10 equivalent
  },
  headerSpacer: {
    width: 40,
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
  },
  profileJoinDate: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#71717a', // text-zinc-500
    textAlign: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7', // border-zinc-200
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#18181b', // border-b-zinc-900
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#71717a', // text-zinc-500
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
  },
  gamesList: {
    backgroundColor: '#ffffff',
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5', // divide-zinc-100
  },
  gameImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#e4e4e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameImageText: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    color: '#18181b', // text-zinc-900
  },
  gameDetails: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#71717a', // text-zinc-500
  },
  friendsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    letterSpacing: -0.015,
    paddingBottom: 8,
  },
  friendsList: {
    flexDirection: 'column',
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(113, 113, 122, 0.1)', // bg-zinc-100/50
    padding: 12,
    borderRadius: 12,
  },
  friendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e4e4e7', // bg-zinc-200
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  friendIconText: {
    fontSize: 20,
    color: '#27272a', // text-zinc-800
  },
  friendText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'medium',
    color: '#18181b', // text-zinc-900
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7', // border-zinc-200
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // bg-white/80
    paddingVertical: 8,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
    color: '#71717a', // text-zinc-500
    height: 32,
    textAlignVertical: 'center',
  },
  navIconActive: {
    color: '#18181b', // text-zinc-900
  },
  navLabel: {
    fontSize: 12,
    fontWeight: 'medium',
    color: '#71717a', // text-zinc-500
  },
  navLabelActive: {
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
  },
});
