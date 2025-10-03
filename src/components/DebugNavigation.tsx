import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';

const DebugNavigation: React.FC = () => {
  const navigation = useAppNavigation();

  const testNavigation = (route: string) => {
    try {
      console.log(`Attempting to navigate to: ${route}`);
      navigation.navigate(route as any);
      console.log(`Successfully navigated to: ${route}`);
    } catch (error) {
      console.error(`Error navigating to ${route}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Navigation</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => testNavigation(ROUTES.SETTINGS)}
      >
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testNavigation('BackendTest')}
      >
        <Text style={styles.buttonText}>Go to Backend Test</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testNavigation(ROUTES.MAP)}
      >
        <Text style={styles.buttonText}>Go to Map</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => testNavigation(ROUTES.PROFILE)}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebugNavigation;



