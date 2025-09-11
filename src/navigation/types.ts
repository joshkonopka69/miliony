import { StackScreenProps } from '@react-navigation/stack';

// Root Stack Navigator Types
export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Register: undefined;
  Map: undefined;
  Chat: undefined;
  Events: undefined;
  EventDetails: { game?: any };
  Settings: undefined;
  Profile: undefined;
  AddFriend: undefined;
  CreateGroup: undefined;
  MyGroups: undefined;
  Language: undefined;
  GameChat: { game?: any };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

// Navigation Props for screens
export type WelcomeScreenProps = RootStackScreenProps<'Welcome'>;
export type AuthScreenProps = RootStackScreenProps<'Auth'>;
export type RegisterScreenProps = RootStackScreenProps<'Register'>;
export type MapScreenProps = RootStackScreenProps<'Map'>;
export type ChatScreenProps = RootStackScreenProps<'Chat'>;
export type EventsScreenProps = RootStackScreenProps<'Events'>;
export type EventDetailsScreenProps = RootStackScreenProps<'EventDetails'>;
export type SettingsScreenProps = RootStackScreenProps<'Settings'>;
export type ProfileScreenProps = RootStackScreenProps<'Profile'>;
export type AddFriendScreenProps = RootStackScreenProps<'AddFriend'>;
export type CreateGroupScreenProps = RootStackScreenProps<'CreateGroup'>;
export type MyGroupsScreenProps = RootStackScreenProps<'MyGroups'>;
export type LanguageScreenProps = RootStackScreenProps<'Language'>;
export type GameChatScreenProps = RootStackScreenProps<'GameChat'>;
export type TermsOfServiceScreenProps = RootStackScreenProps<'TermsOfService'>;
export type PrivacyPolicyScreenProps = RootStackScreenProps<'PrivacyPolicy'>;

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
  REGISTER: 'Register' as const,
  
  // Main App Routes
  MAP: 'Map' as const,
  CHAT: 'Chat' as const,
  EVENTS: 'Events' as const,
  SETTINGS: 'Settings' as const,
  PROFILE: 'Profile' as const,
  ADD_FRIEND: 'AddFriend' as const,
  CREATE_GROUP: 'CreateGroup' as const,
  MY_GROUPS: 'MyGroups' as const,
  LANGUAGE: 'Language' as const,
  GAME_CHAT: 'GameChat' as const,
  EVENT_DETAILS: 'EventDetails' as const,
  TERMS_OF_SERVICE: 'TermsOfService' as const,
  PRIVACY_POLICY: 'PrivacyPolicy' as const,
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
