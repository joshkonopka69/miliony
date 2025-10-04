// Event Types for My Events Screen

export type SportActivity = 
  | 'Football' 
  | 'Basketball' 
  | 'Tennis' 
  | 'Volleyball' 
  | 'Running'
  | 'Cycling'
  | 'Swimming'
  | 'Gym';

export type EventStatus = 
  | 'upcoming' 
  | 'live' 
  | 'completed' 
  | 'cancelled';

export type UserRole = 
  | 'joined' 
  | 'created' 
  | 'invited';

export type EventGroup = 
  | 'TODAY' 
  | 'TOMORROW' 
  | 'THIS_WEEK' 
  | 'NEXT_WEEK' 
  | 'LATER';

export interface EventLocation {
  name: string;
  address: string;
  distance?: number; // km from user
  lat: number;
  lng: number;
}

export interface EventParticipants {
  current: number;
  max: number;
  users?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface EventCreator {
  id: string;
  name: string;
  avatar?: string;
}

export interface MyEvent {
  id: string;
  name: string;
  activity: SportActivity;
  startTime: Date;
  endTime: Date;
  location: EventLocation;
  participants: EventParticipants;
  status: EventStatus;
  role: UserRole;
  chatEnabled: boolean;
  createdBy: EventCreator;
  description?: string;
}

export interface GroupedEvents {
  group: EventGroup;
  events: MyEvent[];
}

// Sport colors for visual consistency
export const SPORT_COLORS: Record<SportActivity, string> = {
  Football: '#FDB924',    // Yellow
  Basketball: '#F97316', // Orange
  Tennis: '#10B981',     // Green
  Volleyball: '#3B82F6', // Blue
  Running: '#EF4444',    // Red
  Cycling: '#8B5CF6',    // Purple
  Swimming: '#06B6D4',   // Cyan
  Gym: '#6B7280',        // Gray
};

// Status colors
export const STATUS_COLORS = {
  live: '#EF4444',       // Red
  upcoming: '#6B7280',   // Gray
  completed: '#10B981',  // Green
  cancelled: '#9CA3AF',  // Light gray
};

