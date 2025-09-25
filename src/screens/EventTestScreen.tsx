import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { eventService, IntegratedEvent } from '../services/eventService';
import { supabaseService } from '../services/supabase';
import { firebaseService, LiveEvent, LiveMessage } from '../services/firebase';

export default function EventTestScreen() {
  const [events, setEvents] = useState<IntegratedEvent[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Form states for creating events
  const [eventForm, setEventForm] = useState({
    name: '',
    activity: 'Football',
    description: '',
    maxParticipants: 10,
    locationName: 'Test Location',
    latitude: 51.1079,
    longitude: 17.0385,
  });

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = async () => {
    try {
      console.log('🧪 Initializing Event Test...');
      
      // Test Supabase connection
      const sports = await supabaseService.getSports();
      console.log('✅ Supabase connected, sports:', sports.length);
      
      // Test Firebase connection
      const firebaseEvents = await firebaseService.getLiveEvents();
      console.log('✅ Firebase connected, live events:', firebaseEvents.length);
      
      // Load events
      await loadEvents();
      
      // Subscribe to live events
      const unsubscribe = firebaseService.subscribeToLiveEvents((liveEvents) => {
        console.log('🔥 Live events updated:', liveEvents.length);
        setLiveEvents(liveEvents);
      });
      
      setIsConnected(true);
      
      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Test initialization failed:', error);
      Alert.alert('Connection Error', 'Failed to connect to services');
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
      console.log('📊 Loaded events:', eventsData.length);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const createEvent = async () => {
    try {
      if (!eventForm.name.trim()) {
        Alert.alert('Error', 'Please enter event name');
        return;
      }

      console.log('🏗️ Creating event...');
      
      const eventData = {
        name: eventForm.name,
        activity: eventForm.activity,
        description: eventForm.description,
        max_participants: eventForm.maxParticipants,
        location_name: eventForm.locationName,
        latitude: eventForm.latitude,
        longitude: eventForm.longitude,
        created_by: 'test-user-123', // Mock user ID
      };

      const newEvent = await eventService.createEvent(eventData);
      
      if (newEvent) {
        Alert.alert('Success', 'Event created successfully!');
        setEventForm({
          name: '',
          activity: 'Football',
          description: '',
          maxParticipants: 10,
          locationName: 'Test Location',
          latitude: 51.1079,
          longitude: 17.0385,
        });
        await loadEvents();
      } else {
        Alert.alert('Error', 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      console.log('🤝 Joining event:', eventId);
      const success = await eventService.joinEvent(eventId, 'test-user-123');
      
      if (success) {
        Alert.alert('Success', 'You joined the event!');
        await loadEvents();
      } else {
        Alert.alert('Error', 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event');
    }
  };

  const leaveEvent = async (eventId: string) => {
    try {
      console.log('👋 Leaving event:', eventId);
      const success = await eventService.leaveEvent(eventId, 'test-user-123');
      
      if (success) {
        Alert.alert('Success', 'You left the event');
        await loadEvents();
      } else {
        Alert.alert('Error', 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event');
    }
  };

  const selectEvent = async (eventId: string) => {
    setSelectedEvent(eventId);
    
    // Load messages for this event
    try {
      const eventMessages = await firebaseService.getEventMessages(eventId);
      setMessages(eventMessages);
      
      // Subscribe to new messages
      const unsubscribe = firebaseService.subscribeToEventMessages(eventId, (message) => {
        console.log('💬 New message:', message);
        setMessages(prev => [message, ...prev]);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedEvent || !newMessage.trim()) return;
    
    try {
      console.log('📤 Sending message:', newMessage);
      const message = await eventService.sendMessage(
        selectedEvent,
        'test-user-123',
        'Test User',
        newMessage
      );
      
      if (message) {
        setNewMessage('');
        console.log('✅ Message sent successfully');
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderEvent = ({ item }: { item: IntegratedEvent }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventName}>{item.name}</Text>
      <Text style={styles.eventActivity}>{item.activity}</Text>
      <Text style={styles.eventLocation}>{item.location_name}</Text>
      <Text style={styles.eventParticipants}>
        {item.participants_count}/{item.max_participants} participants
      </Text>
      <Text style={styles.eventStatus}>
        Status: {item.status} | Live: {item.isLive ? 'Yes' : 'No'}
      </Text>
      
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => joinEvent(item.id)}
        >
          <Text style={styles.buttonText}>Join</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => leaveEvent(item.id)}
        >
          <Text style={styles.buttonText}>Leave</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => selectEvent(item.id)}
        >
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: LiveMessage }) => (
    <View style={styles.messageCard}>
      <Text style={styles.messageSender}>{item.senderName}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Connection Status</Text>
          <Text style={[styles.statusText, { color: isConnected ? 'green' : 'red' }]}>
            {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </Text>
          <Text style={styles.statusText}>
            Events: {events.length} | Live: {liveEvents.length}
          </Text>
        </View>

        {/* Create Event Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create Test Event</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            value={eventForm.name}
            onChangeText={(text) => setEventForm(prev => ({ ...prev, name: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Activity"
            value={eventForm.activity}
            onChangeText={(text) => setEventForm(prev => ({ ...prev, activity: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={eventForm.description}
            onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Max Participants"
            value={eventForm.maxParticipants.toString()}
            onChangeText={(text) => setEventForm(prev => ({ ...prev, maxParticipants: parseInt(text) || 10 }))}
            keyboardType="numeric"
          />
          
          <TouchableOpacity style={styles.createButton} onPress={createEvent}>
            <Text style={styles.buttonText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.eventsCard}>
          <Text style={styles.eventsTitle}>Events ({events.length})</Text>
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id}
            style={styles.eventsList}
          />
        </View>

        {/* Live Events */}
        <View style={styles.liveCard}>
          <Text style={styles.liveTitle}>Live Events ({liveEvents.length})</Text>
          {liveEvents.map((event) => (
            <View key={event.id} style={styles.liveEventCard}>
              <Text style={styles.liveEventName}>{event.name}</Text>
              <Text style={styles.liveEventActivity}>{event.activity}</Text>
              <Text style={styles.liveEventParticipants}>
                {event.participants.length}/{event.maxParticipants} participants
              </Text>
            </View>
          ))}
        </View>

        {/* Chat Section */}
        {selectedEvent && (
          <View style={styles.chatCard}>
            <Text style={styles.chatTitle}>Chat - Event {selectedEvent}</Text>
            
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              inverted
            />
            
            <View style={styles.messageInput}>
              <TextInput
                style={styles.messageTextInput}
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  formCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventsList: {
    maxHeight: 300,
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventActivity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventParticipants: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventStatus: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  chatButton: {
    backgroundColor: '#17a2b8',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  liveCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  liveEventCard: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  liveEventName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  liveEventActivity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  liveEventParticipants: {
    fontSize: 14,
    color: '#666',
  },
  chatCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messagesList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  messageCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
