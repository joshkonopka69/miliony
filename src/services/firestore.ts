// Firestore service for handling events and user data
// Note: This is a mock implementation. In a real app, you would use Firebase SDK

export interface Event {
  id: string;
  creatorId: string;
  activity: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
  placeName: string;
  address: string;
  description: string;
  maxParticipants: number;
  participants: string[];
  time: string;
  createdAt: string;
  geohash?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  favoriteSports: string[];
  createdAt: string;
}

class FirestoreService {
  private events: Event[] = [];
  private users: User[] = [];
  private currentUserId: string = 'user123'; // Mock current user

  // Event methods
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'participants'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [eventData.creatorId],
      createdAt: new Date().toISOString(),
    };

    this.events.push(newEvent);
    console.log('Event created:', newEvent);
    return newEvent;
  }

  async getEventsInBounds(
    northEast: { lat: number; lng: number },
    southWest: { lat: number; lng: number }
  ): Promise<Event[]> {
    // Mock implementation - filter events by bounds
    return this.events.filter(event => {
      if (event.coordinates) {
        return event.coordinates.lat >= southWest.lat &&
               event.coordinates.lat <= northEast.lat &&
               event.coordinates.lng >= southWest.lng &&
               event.coordinates.lng <= northEast.lng;
      }
      return false;
    });
  }

  async getEventById(eventId: string): Promise<Event | null> {
    return this.events.find(event => event.id === eventId) || null;
  }

  async joinEvent(eventId: string, userId: string): Promise<void> {
    const event = this.events.find(e => e.id === eventId);
    if (event && !event.participants.includes(userId) && event.participants.length < event.maxParticipants) {
      event.participants.push(userId);
      console.log('User joined event:', eventId, userId);
    } else {
      throw new Error('Cannot join event');
    }
  }

  async leaveEvent(eventId: string, userId: string): Promise<void> {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.participants = event.participants.filter(id => id !== userId);
      console.log('User left event:', eventId, userId);
    }
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1 && this.events[eventIndex].creatorId === userId) {
      this.events.splice(eventIndex, 1);
      console.log('Event deleted:', eventId);
    } else {
      throw new Error('Cannot delete event');
    }
  }

  // User methods
  async getCurrentUser(): Promise<User | null> {
    return this.users.find(user => user.id === this.currentUserId) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: this.currentUserId,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    console.log('User created:', newUser);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      console.log('User updated:', userId, updates);
    }
  }

  // Mock data for testing
  async seedMockData(): Promise<void> {
    // Add some mock events
    const mockEvents: Event[] = [
      {
        id: 'event_1',
        creatorId: 'user123',
        activity: 'Football',
        placeId: 'ChIJ123456789',
        placeName: 'Central Park',
        address: 'Central Park, New York, NY',
        description: 'Weekly football game, all skill levels welcome!',
        maxParticipants: 10,
        participants: ['user123', 'user456'],
        time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        createdAt: new Date().toISOString(),
        coordinates: { lat: 40.7829, lng: -73.9654 },
      },
      {
        id: 'event_2',
        creatorId: 'user789',
        activity: 'Yoga',
        placeId: 'ChIJ987654321',
        placeName: 'Sunset Yoga Studio',
        address: '123 Main St, New York, NY',
        description: 'Morning yoga session for beginners',
        maxParticipants: 15,
        participants: ['user789'],
        time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        createdAt: new Date().toISOString(),
        coordinates: { lat: 40.7589, lng: -73.9851 },
      },
    ];

    this.events = mockEvents;

    // Add mock user
    const mockUser: User = {
      id: 'user123',
      email: 'user@example.com',
      nickname: 'SportsLover',
      favoriteSports: ['Football', 'Basketball', 'Tennis'],
      createdAt: new Date().toISOString(),
    };

    this.users = [mockUser];
  }

  // Utility methods
  generateGeohash(lat: number, lng: number, precision: number = 7): string {
    // Mock geohash implementation
    return `${lat.toFixed(3)}_${lng.toFixed(3)}`;
  }

  async getEventsByActivity(activity: string): Promise<Event[]> {
    return this.events.filter(event => 
      event.activity.toLowerCase().includes(activity.toLowerCase())
    );
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return this.events.filter(event => 
      event.creatorId === userId || event.participants.includes(userId)
    );
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
