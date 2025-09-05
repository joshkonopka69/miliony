import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

interface ProfileCreationScreenProps {
  navigation: any;
}

export default function ProfileCreationScreen({ navigation }: ProfileCreationScreenProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');

  const handleCreateProfile = () => {
    if (!name || !age || !bio) {
      Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola');
      return;
    }

    // Here you would typically save the profile
    // For now, just navigate to main app
    navigation.navigate('MainApp');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Stwórz swój profil</Text>
      <Text style={styles.subtitle}>
        Opisz siebie, aby inni sportowcy mogli Cię poznać
      </Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Imię *</Text>
          <TextInput
            style={styles.input}
            placeholder="Twoje imię"
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wiek *</Text>
          <TextInput
            style={styles.input}
            placeholder="Twój wiek"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>O mnie *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Opisz siebie, swoje zainteresowania sportowe, cele..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doświadczenie sportowe</Text>
          <TextInput
            style={styles.input}
            placeholder="np. 3 lata w piłce nożnej, początkujący w tenisie"
            value={experience}
            onChangeText={setExperience}
          />
        </View>
      </View>
      
      <TouchableOpacity style={styles.createButton} onPress={handleCreateProfile}>
        <Text style={styles.createButtonText}>Stwórz profil</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.navigate('MainApp')}
      >
        <Text style={styles.skipButtonText}>Pomiń na razie</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  createButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 15,
  },
  skipButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});

