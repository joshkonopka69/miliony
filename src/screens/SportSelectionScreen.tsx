import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

interface SportSelectionScreenProps {
  navigation: any;
}

const sports = [
  'Piłka nożna', 'Koszykówka', 'Tenis', 'Bieganie', 'Rower', 
  'Pływanie', 'Siłownia', 'Joga', 'CrossFit', 'Boks',
  'MMA', 'Karate', 'Taekwondo', 'Pilates', 'Zumba'
];

export default function SportSelectionScreen({ navigation }: SportSelectionScreenProps) {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleContinue = () => {
    if (selectedSports.length === 0) {
      return;
    }
    navigation.navigate('ProfileCreation');
  };

  const filteredSports = sports.filter(sport =>
    sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz swoje sporty</Text>
      <Text style={styles.subtitle}>
        Wybierz sporty, które uprawiasz lub chcesz uprawiać
      </Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Wyszukaj sport..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <ScrollView style={styles.sportsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sportsGrid}>
          {filteredSports.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[
                styles.sportButton,
                selectedSports.includes(sport) && styles.selectedSport
              ]}
              onPress={() => toggleSport(sport)}
            >
              <Text style={[
                styles.sportText,
                selectedSports.includes(sport) && styles.selectedSportText
              ]}>
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[
          styles.continueButton,
          selectedSports.length === 0 && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={selectedSports.length === 0}
      >
        <Text style={styles.continueButtonText}>
          Kontynuuj ({selectedSports.length} wybranych)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sportsContainer: {
    flex: 1,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    minWidth: '48%',
  },
  selectedSport: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sportText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

