// Event Types for My Events Screen

export type SportActivity =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'volleyball'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'gym'
  | 'judo'
  | 'wrestling'
  | 'muay thai'
  | 'kickboxing'
  | 'rollerblading'
  | 'ice skating'
  | 'skating'
  | 'padel'
  | 'squash'
  | 'bouldering'
  | 'table tennis'
  | 'yoga'
  | 'pilates'
  | 'crossfit'
  | 'badminton';

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
  avatar_url?: string;
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
  requiresApproval?: boolean;
  placeId?: string | null;
}

export interface GroupedEvents {
  group: EventGroup;
  events: MyEvent[];
}

// Sport colors for visual consistency
export const SPORT_COLORS: Record<SportActivity, string> = {
  football: '#FFD700',    // Gold (Standardized)
  basketball: '#F97316', // Orange
  tennis: '#10B981',     // Green
  volleyball: '#3B82F6', // Blue
  running: '#EF4444',    // Red
  cycling: '#8B5CF6',    // Purple
  swimming: '#06B6D4',   // Cyan
  gym: '#6B7280',        // Gray
  judo: '#1F2937',       // Dark Gray/Black
  wrestling: '#991B1B',  // Dark Red
  'muay thai': '#B91C1C', // Red
  kickboxing: '#DC2626',  // Bright Red
  rollerblading: '#F59E0B', // Amber
  'ice skating': '#BAE6FD', // Light Blue
  skating: '#FBBF24',     // Yellow
  padel: '#4ADE80',       // Light Green
  squash: '#166534',      // Forest Green
  bouldering: '#78350F',  // Brown
  'table tennis': '#F87171', // Coral
  yoga: '#A78BFA',        // Light Purple
  pilates: '#F472B6',     // Pink
  crossfit: '#4B5563',    // Slate
  badminton: '#FCD34D',   // Amber/Yellow
};

// Status colors
export const STATUS_COLORS = {
  live: '#EF4444',       // Red
  upcoming: '#6B7280',   // Gray
  completed: '#10B981',  // Green
  cancelled: '#9CA3AF',  // Light gray
};

