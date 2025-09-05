import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.backgroundImage}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>SportMap</Text>
            <Text style={styles.subtitle}>Znajdź partnerów do treningu</Text>
            <Text style={styles.debugText}>App is working! 🎉</Text>
            <Text style={styles.description}>
              Łącz się z innymi sportowcami, organizuj wydarzenia i odkrywaj nowe miejsca do treningu
            </Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.buttonText}>Rozpocznij</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2E7D32',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
});

