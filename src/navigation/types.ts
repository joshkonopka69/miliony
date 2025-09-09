import { StackScreenProps } from '@react-navigation/stack';

// Root Stack Navigator Types
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  SportSelection: undefined;
  Map: undefined;
  Chat: undefined;
  Events: undefined;
  Settings: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

// Navigation Props for screens
export type WelcomeScreenProps = RootStackScreenProps<'Welcome'>;
export type AuthScreenProps = RootStackScreenProps<'Auth'>;
export type SportSelectionScreenProps = RootStackScreenProps<'SportSelection'>;
export type MapScreenProps = RootStackScreenProps<'Map'>;
export type ChatScreenProps = RootStackScreenProps<'Chat'>;
export type EventsScreenProps = RootStackScreenProps<'Events'>;
export type SettingsScreenProps = RootStackScreenProps<'Settings'>;
export type ProfileScreenProps = RootStackScreenProps<'Profile'>;

// Navigation State Types
export type NavigationState = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentSport: string | null;
  userProfile: {
    name: string;
    age: number;
    sports: string[];
  } | null;
};

// Route Names Constants
export const ROUTES = {
  // Onboarding Routes
  WELCOME: 'Welcome' as const,
  AUTH: 'Auth' as const,
  SPORT_SELECTION: 'SportSelection' as const,
  
  // Main App Routes
  MAP: 'Map' as const,
  CHAT: 'Chat' as const,
  EVENTS: 'Events' as const,
  SETTINGS: 'Settings' as const,
  PROFILE: 'Profile' as const,
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
