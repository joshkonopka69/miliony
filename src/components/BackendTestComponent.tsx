import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { enhancedEventService } from '../services/enhancedEventService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { realtimeEventService } from '../services/realtimeEventService';

const BackendTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Initialize notifications
      addResult('Testing notification initialization...');
      await notificationService.initialize();
      addResult('✅ Notifications initialized');

      // Test 2: Check auth service
      addResult('Testing auth service...');
      const currentUser = authService.getCurrentUser();
      addResult(`✅ Auth service working. Current user: ${currentUser ? 'Logged in' : 'Not logged in'}`);

      // Test 3: Test event service
      addResult('Testing event service...');
      const events = await enhancedEventService.getEvents({
        bounds: {
          north: 52.5,
          south: 52.0,
          east: 21.2,
          west: 20.8,
        }
      });
      addResult(`✅ Event service working. Found ${events.length} events`);

      // Test 4: Test real-time service
      addResult('Testing real-time service...');
      const unsubscribe = realtimeEventService.subscribeToAreaEvents(
        {
          north: 52.5,
          south: 52.0,
          east: 21.2,
          west: 20.8,
        },
        (update) => {
          addResult(`✅ Real-time update received: ${update.type}`);
        }
      );
      addResult('✅ Real-time service subscribed');
      
      // Clean up subscription after 5 seconds
      setTimeout(() => {
        unsubscribe();
        addResult('✅ Real-time subscription cleaned up');
      }, 5000);

      addResult('🎉 All backend services are working!');
      
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateEvent = async () => {
    try {
      const result = await enhancedEventService.createEvent({
        name: 'Test Event',
        description: 'This is a test event',
        activity: 'Football',
        max_participants: 10,
        location_name: 'Test Location',
        latitude: 52.2297,
        longitude: 21.0122,
      });

      if (result.success) {
        addResult('✅ Test event created successfully');
      } else {
        addResult(`❌ Failed to create event: ${result.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Error creating event: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Integration Test</Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Run Backend Tests'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={testCreateEvent}
      >
        <Text style={styles.buttonText}>Test Create Event</Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default BackendTestComponent;



