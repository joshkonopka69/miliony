// Mock Firebase service for development when Firestore is not available
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

class MockFirebaseService {
  private mockEvents: LiveEvent[] = [];
  private mockMessages: { [eventId: string]: LiveMessage[] } = {};

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
    const liveEvent: LiveEvent = {
      id: `mock-event-${Date.now()}`,
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

    this.mockEvents.push(liveEvent);
    console.log('✅ Mock live event created:', liveEvent);
    return liveEvent;
  }

  async getLiveEvents(): Promise<LiveEvent[]> {
    console.log('✅ Mock live events retrieved:', this.mockEvents.length);
    return this.mockEvents.filter(event => event.status === 'live');
  }

  async getLiveEvent(eventId: string): Promise<LiveEvent | null> {
    const event = this.mockEvents.find(e => e.id === eventId);
    console.log('✅ Mock live event retrieved:', event ? 'found' : 'not found');
    return event || null;
  }

  async joinLiveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event && !event.participants.includes(userId)) {
      event.participants.push(userId);
      event.lastActivity = new Date();
      console.log('✅ Mock user joined event:', userId);
      return true;
    }
    return false;
  }

  async leaveLiveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event) {
      event.participants = event.participants.filter(id => id !== userId);
      event.lastActivity = new Date();
      console.log('✅ Mock user left event:', userId);
      return true;
    }
    return false;
  }

  async endLiveEvent(eventId: string): Promise<boolean> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event) {
      event.status = 'past';
      event.lastActivity = new Date();
      console.log('✅ Mock event ended:', eventId);
      return true;
    }
    return false;
  }

  async sendMessage(eventId: string, message: {
    senderId: string;
    senderName: string;
    text: string;
    type?: 'text' | 'image' | 'system';
  }): Promise<LiveMessage> {
    const liveMessage: LiveMessage = {
      id: `mock-message-${Date.now()}`,
      senderId: message.senderId,
      senderName: message.senderName,
      text: message.text,
      createdAt: new Date(),
      type: message.type || 'text',
    };

    if (!this.mockMessages[eventId]) {
      this.mockMessages[eventId] = [];
    }
    this.mockMessages[eventId].push(liveMessage);

    console.log('✅ Mock message sent:', liveMessage);
    return liveMessage;
  }

  async getEventMessages(eventId: string): Promise<LiveMessage[]> {
    const messages = this.mockMessages[eventId] || [];
    console.log('✅ Mock messages retrieved:', messages.length);
    return messages;
  }

  // Mock subscription methods
  subscribeToLiveEvents(callback: (events: LiveEvent[]) => void): () => void {
    console.log('✅ Mock subscription to live events started');
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback(this.mockEvents.filter(event => event.status === 'live'));
    }, 2000);
    
    return () => {
      clearInterval(interval);
      console.log('✅ Mock subscription to live events stopped');
    };
  }

  subscribeToLiveEvent(eventId: string, callback: (event: LiveEvent | null) => void): () => void {
    console.log('✅ Mock subscription to live event started:', eventId);
    const interval = setInterval(() => {
      const event = this.mockEvents.find(e => e.id === eventId);
      callback(event || null);
    }, 2000);
    
    return () => {
      clearInterval(interval);
      console.log('✅ Mock subscription to live event stopped:', eventId);
    };
  }

  subscribeToEventMessages(eventId: string, callback: (messages: LiveMessage[]) => void): () => void {
    console.log('✅ Mock subscription to event messages started:', eventId);
    const interval = setInterval(() => {
      const messages = this.mockMessages[eventId] || [];
      callback(messages);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      console.log('✅ Mock subscription to event messages stopped:', eventId);
    };
  }

  subscribeToEventPresence(eventId: string, callback: (presence: UserPresence[]) => void): () => void {
    console.log('✅ Mock subscription to event presence started:', eventId);
    const interval = setInterval(() => {
      const event = this.mockEvents.find(e => e.id === eventId);
      if (event) {
        const presence: UserPresence[] = event.participants.map(userId => ({
          userId,
          status: 'online' as const,
          lastSeen: new Date(),
        }));
        callback(presence);
      } else {
        callback([]);
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      console.log('✅ Mock subscription to event presence stopped:', eventId);
    };
  }
}

export const firebaseService = new MockFirebaseService();
export default firebaseService;

