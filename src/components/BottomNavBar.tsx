import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useAppNavigation } from '../navigation';

// Custom Map Icon Component - Using your map-pin.png image
const MapIcon = ({ size = 24 }: { size?: number }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Image 
      source={require('../../assets/map-pin.png')}
      style={{
        width: size * 1.0,
        height: size * 1.0,
      }}
      resizeMode="contain"
    />
  </View>
);

// Custom Games Icon Component - Using your sports.png image (30% bigger)
const GamesIcon = ({ size = 24 }: { size?: number }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <Image 
      source={require('../../assets/sports.png')}
      style={{
        width: size * 1.3,
        height: size * 1.3,
      }}
      resizeMode="contain"
    />
  </View>
);

// Custom Profile Icon Component - Black color
const ProfileIcon = ({ size = 24 }: { size?: number }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={styles.profileIcon}>
      <View style={[styles.profileHead, { backgroundColor: '#000000' }]} />
      <View style={[styles.profileBody, { backgroundColor: '#000000' }]} />
    </View>
  </View>
);

interface BottomNavBarProps {
  activeTab: 'Home' | 'MyGames' | 'MyProfile';
  onProfilePress?: () => void;
}

export default function BottomNavBar({ activeTab, onProfilePress }: BottomNavBarProps) {
  const navigation = useAppNavigation();

  const handleNavigation = (screen: string) => {
    // Navigate to the appropriate screen
    switch (screen) {
      case 'Home':
        navigation.navigate('Map');
        break;
      case 'MyGames':
        navigation.navigate('MyGroups');
        break;
    }
  };

  const handleProfilePress = () => {
    console.log('🟡 BottomNavBar: Profile button pressed!');
    console.log('🟡 onProfilePress function exists:', !!onProfilePress);
    if (onProfilePress) {
      console.log('🟡 Calling onProfilePress function...');
      onProfilePress();
    } else {
      // Default action - navigate to Profile screen
      console.log('🟡 No onProfilePress function provided, navigating to Profile');
      navigation.navigate('Profile');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <View style={styles.navContent}>
            {/* Map Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'Home' && styles.activeNavItem
              ]}
              onPress={() => handleNavigation('Home')}
              activeOpacity={0.7}
            >
              <MapIcon size={24} />
              <Text style={[
                styles.navLabel,
                activeTab === 'Home' && styles.activeLabel
              ]}>
                Map
              </Text>
            </TouchableOpacity>

            {/* My Games Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'MyGames' && styles.activeNavItem
              ]}
              onPress={() => handleNavigation('MyGames')}
              activeOpacity={0.7}
            >
              <GamesIcon size={24} />
              <Text style={[
                styles.navLabel,
                activeTab === 'MyGames' && styles.activeLabel
              ]}>
                My Games
              </Text>
            </TouchableOpacity>

            {/* Profile Tab */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeTab === 'MyProfile' && styles.activeNavItem
              ]}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <ProfileIcon size={24} />
              <Text style={[
                styles.navLabel,
                activeTab === 'MyProfile' && styles.activeLabel
              ]}>
                My Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  navBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // border-gray-200
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 80, // h-20 equivalent
    position: 'relative',
  },
  navItem: {
    width: 96, // w-24 equivalent
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8, // p-2 equivalent
    gap: 4, // gap-1 equivalent
  },
  activeNavItem: {
    backgroundColor: '#f9bc06', // bg-[var(--primary-color)]
    borderRadius: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Profile Icon Styles
  profileIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    width: 10,
    height: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
    marginBottom: 2,
  },
  profileBody: {
    width: 12,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8C805F', // text-[#8C805F]
    textAlign: 'center',
  },
  activeLabel: {
    fontWeight: '600',
    color: '#000000', // Black text for better contrast on yellow background
  },
});
