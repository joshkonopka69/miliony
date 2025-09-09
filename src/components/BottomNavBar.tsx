import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';

interface BottomNavBarProps {
  activeTab: 'Map' | 'MyGames';
  onAddPress?: () => void;
}

export default function BottomNavBar({ activeTab, onAddPress }: BottomNavBarProps) {
  const navigation = useAppNavigation();

  const handleNavigation = (screen: string) => {
    // Navigate to the appropriate screen
    switch (screen) {
      case 'Map':
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
            {/* Map Tab */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => handleNavigation('Map')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.navIcon,
                activeTab === 'Map' && styles.activeIcon
              ]}>
                🗺️
              </Text>
              <Text style={[
                styles.navLabel,
                activeTab === 'Map' && styles.activeLabel
              ]}>
                Maps
              </Text>
            </TouchableOpacity>

            {/* Green Add Button */}
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
                🎮
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
    zIndex: 1000,
  },
  navBar: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  navIcon: {
    fontSize: 22,
    color: '#6B7280', // gray-500
  },
  activeIcon: {
    color: '#000000',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280', // gray-500
  },
  activeLabel: {
    fontWeight: '700',
    color: '#181710', // --secondary-color
  },
  addButton: {
    backgroundColor: '#ffd400', // yellow (primary color)
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: 20,
  },
  addButtonIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181710', // dark color for better contrast on yellow
    lineHeight: 28,
  },
});
