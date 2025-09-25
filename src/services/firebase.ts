// Firebase service for real-time features
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { firebaseService as mockFirebaseService } from './firebase-mock';

// Check if Firestore is available
const isFirestoreAvailable = () => {
  try {
    return firestore && typeof firestore.collection === 'function';
  } catch (error) {
    console.warn('⚠️ Firestore not available:', error);
    return false;
  }
};

// Use mock service if Firestore is not available
const useMockService = !isFirestoreAvailable();

export interface LiveEvent {
  id: string;
  supabaseEventId: string;
  name: string;
  activity: string;
  location: {
    latitude: number;
    longitude: number;
    placeId?: string;
    name: string;
  };
  createdBy: string;
  participants: string[];
  maxParticipants: number;
  createdAt: Date;
  status: 'live' | 'past';
  lastActivity: Date;
}

export interface LiveMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
  type: 'text' | 'image' | 'system';
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

// Mock Firebase implementation
class FirebaseService {
  private liveEvents: Map<string, LiveEvent> = new Map();
  private eventMessages: Map<string, LiveMessage[]> = new Map();
  private eventPresence: Map<string, UserPresence[]> = new Map();
  private listeners: Map<string, (data: any) => void> = new Map();

  // Live Events
  async createLiveEvent(eventData: {
    supabaseEventId: string;
    name: string;
    activity: string;
    location: {
      latitude: number;
      longitude: number;
      placeId?: string;
      name: string;
    };
    createdBy: string;
    maxParticipants: number;
  }): Promise<LiveEvent> {
    // Use mock service if Firestore is not available
    if (useMockService) {
      console.log('🔄 Using mock Firebase service');
      return mockFirebaseService.createLiveEvent(eventData);
    }

    try {
      const liveEventData = {
        supabaseEventId: eventData.supabaseEventId,
        name: eventData.name,
        activity: eventData.activity,
        location: eventData.location,
        createdBy: eventData.createdBy,
        participants: [eventData.createdBy],
        maxParticipants: eventData.maxParticipants,
        createdAt: serverTimestamp(),
        status: 'live',
        lastActivity: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, 'liveEvents'), liveEventData);
      
      const liveEvent: LiveEvent = {
        id: docRef.id,
        supabaseEventId: eventData.supabaseEventId,
        name: eventData.name,
        activity: eventData.activity,
        location: eventData.location,
        createdBy: eventData.createdBy,
        participants: [eventData.createdBy],
        maxParticipants: eventData.maxParticipants,
        createdAt: new Date(),
        status: 'live',
        lastActivity: new Date(),
      };

      console.log('Live event created:', liveEvent);
      return liveEvent;
    } catch (error) {
      console.error('Error creating live event:', error);
      throw error;
    }
  }

  async getLiveEvents(): Promise<LiveEvent[]> {
    try {
      const q = query(
        collection(firestore, 'liveEvents'),
        where('status', '==', 'live')
      );
      
      const querySnapshot = await getDocs(q);
      const events: LiveEvent[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          supabaseEventId: data.supabaseEventId,
          name: data.name,
          activity: data.activity,
          location: data.location,
          createdBy: data.createdBy,
          participants: data.participants || [],
          maxParticipants: data.maxParticipants,
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status,
          lastActivity: data.lastActivity?.toDate() || new Date(),
        });
      });
      
      return events;
    } catch (error) {
      console.error('Error fetching live events:', error);
      return [];
    }
  }

  async getLiveEvent(eventId: string): Promise<LiveEvent | null> {
    try {
      const docRef = doc(firestore, 'liveEvents', eventId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          supabaseEventId: data.supabaseEventId,
          name: data.name,
          activity: data.activity,
          location: data.location,
          createdBy: data.createdBy,
          participants: data.participants || [],
          maxParticipants: data.maxParticipants,
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status,
          lastActivity: data.lastActivity?.toDate() || new Date(),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching live event:', error);
      return null;
    }
  }

  async joinLiveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.liveEvents.get(eventId);
    if (!event || event.status !== 'live') {
      return false;
    }

    if (event.participants.length >= event.maxParticipants) {
      return false;
    }

    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
      event.lastActivity = new Date();
      this.liveEvents.set(eventId, event);
      this.notifyListeners('liveEvents', event);
    }

    // Add user presence
    await this.updateUserPresence(eventId, userId, 'online');
    
    console.log('User joined live event:', { eventId, userId });
    return true;
  }

  async leaveLiveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.liveEvents.get(eventId);
    if (!event) {
      return false;
    }

    event.participants = event.participants.filter(id => id !== userId);
    event.lastActivity = new Date();
    this.liveEvents.set(eventId, event);
    this.notifyListeners('liveEvents', event);

    // Update user presence
    await this.updateUserPresence(eventId, userId, 'offline');
    
    console.log('User left live event:', { eventId, userId });
    return true;
  }

  async endLiveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.liveEvents.get(eventId);
    if (!event || event.createdBy !== userId) {
      return false;
    }

    event.status = 'past';
    event.lastActivity = new Date();
    this.liveEvents.set(eventId, event);
    this.notifyListeners('liveEvents', event);
    
    console.log('Live event ended:', { eventId });
    return true;
  }

  // Real-time subscriptions
  subscribeToLiveEvents(callback: (events: LiveEvent[]) => void): () => void {
    const listenerId = `liveEvents_${Date.now()}`;
    this.listeners.set(listenerId, callback);

    // Initial data
    this.getLiveEvents().then(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listenerId);
    };
  }

  subscribeToLiveEvent(eventId: string, callback: (event: LiveEvent | null) => void): () => void {
    const listenerId = `liveEvent_${eventId}_${Date.now()}`;
    
    const wrappedCallback = (data: any) => {
      if (data.id === eventId) {
        callback(data);
      }
    };

    this.listeners.set(listenerId, wrappedCallback);

    // Initial data
    this.getLiveEvent(eventId).then(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listenerId);
    };
  }

  // Messages
  async sendMessage(eventId: string, senderId: string, senderName: string, text: string): Promise<LiveMessage> {
    const message: LiveMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      text,
      createdAt: new Date(),
      type: 'text',
    };

    if (!this.eventMessages.has(eventId)) {
      this.eventMessages.set(eventId, []);
    }

    this.eventMessages.get(eventId)!.push(message);
    this.notifyListeners(`eventMessages_${eventId}`, message);

    // Update event last activity
    const event = this.liveEvents.get(eventId);
    if (event) {
      event.lastActivity = new Date();
      this.liveEvents.set(eventId, event);
    }

    console.log('Message sent:', { eventId, senderId, text });
    return message;
  }

  async getEventMessages(eventId: string, limit: number = 50): Promise<LiveMessage[]> {
    const messages = this.eventMessages.get(eventId) || [];
    return messages.slice(-limit).reverse();
  }

  subscribeToEventMessages(eventId: string, callback: (message: LiveMessage) => void): () => void {
    const listenerId = `eventMessages_${eventId}_${Date.now()}`;
    this.listeners.set(listenerId, callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listenerId);
    };
  }

  // User Presence
  async updateUserPresence(eventId: string, userId: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    if (!this.eventPresence.has(eventId)) {
      this.eventPresence.set(eventId, []);
    }

    const presenceList = this.eventPresence.get(eventId)!;
    const existingIndex = presenceList.findIndex(p => p.userId === userId);

    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date(),
    };

    if (existingIndex >= 0) {
      presenceList[existingIndex] = presence;
    } else {
      presenceList.push(presence);
    }

    this.eventPresence.set(eventId, presenceList);
    this.notifyListeners(`eventPresence_${eventId}`, presenceList);
  }

  async getEventPresence(eventId: string): Promise<UserPresence[]> {
    return this.eventPresence.get(eventId) || [];
  }

  subscribeToEventPresence(eventId: string, callback: (presence: UserPresence[]) => void): () => void {
    const listenerId = `eventPresence_${eventId}_${Date.now()}`;
    this.listeners.set(listenerId, callback);

    // Initial data
    this.getEventPresence(eventId).then(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listenerId);
    };
  }

  // Push Notifications (Mock)
  async sendPushNotification(topic: string, title: string, body: string, data?: any): Promise<void> {
    console.log('Push notification sent:', { topic, title, body, data });
    // In a real implementation, this would use Firebase Cloud Messaging
  }

  async subscribeToTopic(topic: string): Promise<void> {
    console.log('Subscribed to topic:', topic);
    // In a real implementation, this would subscribe to FCM topics
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    console.log('Unsubscribed from topic:', topic);
    // In a real implementation, this would unsubscribe from FCM topics
  }

  // Helper methods
  private notifyListeners(channel: string, data: any): void {
    this.listeners.forEach((callback, listenerId) => {
      if (listenerId.startsWith(channel)) {
        callback(data);
      }
    });
  }

  // Cleanup method
  cleanup(): void {
    this.listeners.clear();
    this.liveEvents.clear();
    this.eventMessages.clear();
    this.eventPresence.clear();
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
