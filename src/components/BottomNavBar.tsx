import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { MapPinIcon, TrophyIcon, UserIcon } from './icons/HeroIcons';

// Icon wrapper for consistent styling
const IconWrapper = ({ children, size = 24 }: { children: React.ReactNode; size?: number }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    {children}
  </View>
);

interface BottomNavBarProps {
  activeTab: 'Home' | 'MyGames' | 'MyProfile';
  onProfilePress?: () => void;
}

export default function BottomNavBar({ activeTab, onProfilePress }: BottomNavBarProps) {
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  const handleNavigation = (screen: string) => {
    // Navigate to the appropriate screen
    switch (screen) {
      case 'Home':
        navigation.navigate('Map');
        break;
      case 'MyGames':
        navigation.navigate('MyGames');
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
              <IconWrapper size={24}>
                <MapPinIcon size={24} color="#000000" />
              </IconWrapper>
              <Text style={[
                styles.navLabel,
                activeTab === 'Home' && styles.activeLabel
              ]}>
                {t.bottomNav.map}
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
              <IconWrapper size={24}>
                <TrophyIcon size={24} color="#000000" />
              </IconWrapper>
              <Text style={[
                styles.navLabel,
                activeTab === 'MyGames' && styles.activeLabel
              ]}>
                {t.bottomNav.myGames}
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
              <IconWrapper size={24}>
                <UserIcon size={24} color="#000000" />
              </IconWrapper>
              <Text style={[
                styles.navLabel,
                activeTab === 'MyProfile' && styles.activeLabel
              ]}>
                {t.bottomNav.myProfile}
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
    backgroundColor: '#FFD700', // Matches app-wide Gold/Yellow color
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
