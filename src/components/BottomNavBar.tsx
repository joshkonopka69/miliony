import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';

interface BottomNavBarProps {
  activeTab: 'Home' | 'MyGames';
  onAddPress?: () => void;
}

export default function BottomNavBar({ activeTab, onAddPress }: BottomNavBarProps) {
  const navigation = useAppNavigation();

  const handleNavigation = (screen: string) => {
    // Navigate to the appropriate screen
    switch (screen) {
      case 'Home':
        navigation.navigate('Map');
        break;
      case 'MyGames':
        navigation.navigate('Events');
        break;
    }
  };

  const handleAddPress = () => {
    console.log('🟡 BottomNavBar: Add button pressed!');
    console.log('🟡 onAddPress function exists:', !!onAddPress);
    if (onAddPress) {
      console.log('🟡 Calling onAddPress function...');
      onAddPress();
    } else {
      // Default action - you can customize this
      console.log('🟡 No onAddPress function provided');
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <View style={styles.navContent}>
            {/* Home Tab */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleNavigation('Home')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.navIcon,
                activeTab === 'Home' && styles.activeIcon
              ]}>
                🏠
              </Text>
              <Text style={[
                styles.navLabel,
                activeTab === 'Home' && styles.activeLabel
              ]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* Elevated Add Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPress}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonIcon}>+</Text>
            </TouchableOpacity>

            {/* My Games Tab */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleNavigation('MyGames')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.navIcon,
                activeTab === 'MyGames' && styles.activeIcon
              ]}>
                🏐
              </Text>
              <Text style={[
                styles.navLabel,
                activeTab === 'MyGames' && styles.activeLabel
              ]}>
                My Games
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
  navIcon: {
    fontSize: 24,
    color: '#8C805F', // text-[#8C805F]
  },
  activeIcon: {
    color: '#f9bc06', // text-[var(--primary-color)]
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8C805F', // text-[#8C805F]
    textAlign: 'center',
  },
  activeLabel: {
    fontWeight: '500',
    color: '#f9bc06', // text-[var(--primary-color)]
  },
  addButton: {
    backgroundColor: '#f9bc06', // bg-[var(--primary-color)]
    width: 64, // w-16 equivalent
    height: 64, // h-16 equivalent
    borderRadius: 32, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    marginTop: -24, // -top-6 equivalent to elevate above nav bar
  },
  addButtonIcon: {
    fontSize: 32, // text-3xl equivalent
    fontWeight: 'bold',
    color: '#181611', // text-[#181611]
  },
});
