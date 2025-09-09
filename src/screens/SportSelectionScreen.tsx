import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useAppNavigation } from '../navigation';

interface Sport {
  id: string;
  name: string;
  icon: string;
}

const sports: Sport[] = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'gym', name: 'Gym', icon: '🏋️' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
  { id: 'skiing', name: 'Skiing', icon: '🎿' },
  { id: 'mma', name: 'MMA', icon: '🥊' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'boxing', name: 'Boxing', icon: '🥊' },
  { id: 'baseball', name: 'Baseball', icon: '⚾' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'tabletennis', name: 'Table Tennis', icon: '🏓' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' },
  { id: 'rugby', name: 'Rugby', icon: '🏉' },
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'skateboarding', name: 'Skateboarding', icon: '🛹' },
  { id: 'surfing', name: 'Surfing', icon: '🏄' },
  { id: 'climbing', name: 'Rock Climbing', icon: '🧗' },
  { id: 'archery', name: 'Archery', icon: '🏹' },
  { id: 'fencing', name: 'Fencing', icon: '🤺' },
  { id: 'wrestling', name: 'Wrestling', icon: '🤼' },
  { id: 'karate', name: 'Karate', icon: '🥋' },
  { id: 'judo', name: 'Judo', icon: '🥋' },
  { id: 'taekwondo', name: 'Taekwondo', icon: '🦵' },
  { id: 'crossfit', name: 'CrossFit', icon: '💪' },
  { id: 'pilates', name: 'Pilates', icon: '🤸' },
  { id: 'dance', name: 'Dance', icon: '💃' },
  { id: 'hiking', name: 'Hiking', icon: '🥾' },
  { id: 'fishing', name: 'Fishing', icon: '🎣' },
  { id: 'bowling', name: 'Bowling', icon: '🎳' },
  { id: 'darts', name: 'Darts', icon: '🎯' },
  { id: 'billiards', name: 'Billiards', icon: '🎱' },
];

export default function SportSelectionScreen() {
  const navigation = useAppNavigation();
  const [selectedSports, setSelectedSports] = useState<string[]>(['basketball', 'running']);

  const toggleSport = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter(id => id !== sportId));
    } else {
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  const handleContinue = () => {
    if (selectedSports.length === 0) {
      return;
    }
    navigation.navigate('Map');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* App Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚽</Text>
          </View>
          <Text style={styles.logoText}>SportMap</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Sports</Text>
          <Text style={styles.subtitle}>Choose your favorites to find partners.</Text>
        </View>

        {/* Sports Grid */}
        <View style={styles.sportsGrid}>
          {sports.map((sport) => {
            const isSelected = selectedSports.includes(sport.id);
            return (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportItem,
                  isSelected && styles.selectedSportItem
                ]}
                onPress={() => toggleSport(sport.id)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.sportIcon,
                  isSelected && styles.selectedSportIcon
                ]}>
                  {sport.icon}
                </Text>
                <Text style={[
                  styles.sportName,
                  isSelected && styles.selectedSportName
                ]}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Button */}
        <View style={styles.continueSection}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffd400', // --primary-color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 32,
    color: '#ffffff',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937', // gray-800
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1F2937', // gray-800
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    textAlign: 'center',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  sportItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  selectedSportItem: {
    backgroundColor: '#ffd400', // --primary-color
    borderColor: '#ffd400',
  },
  sportIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#6B7280', // gray-500
  },
  selectedSportIcon: {
    color: '#000000',
  },
  sportName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937', // gray-800
    textAlign: 'center',
  },
  selectedSportName: {
    color: '#000000',
  },
  continueSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffd400', // --primary-color
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937', // gray-900
    textAlign: 'center',
  },
});

