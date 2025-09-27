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
  EventTest: undefined;
  
  // Analytics Routes
  AnalyticsDashboard: undefined;
  UserAnalytics: undefined;
  EventAnalytics: undefined;
  SocialAnalytics: undefined;
  PerformanceAnalytics: undefined;
  
  // Security/Moderation Routes
  ReportContent: { contentId: string; contentType: string; contentData: any };
  ModerationQueue: undefined;
  SecuritySettings: undefined;
  BlockedUsers: undefined;
  Appeal: undefined;
  ModerationDashboard: undefined;
  
  // Group Routes
  GroupDetails: { groupId: string };
  GroupMembers: { groupId: string };
  
  // Notification Routes
  Notifications: undefined;
  NotificationSettings: undefined;
  
  // Search Routes
  EventSearchResults: { searchQuery: string; events: any[] };
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
  EVENT_TEST: 'EventTest' as const,
  
  // Analytics Routes
  ANALYTICS_DASHBOARD: 'AnalyticsDashboard' as const,
  USER_ANALYTICS: 'UserAnalytics' as const,
  EVENT_ANALYTICS: 'EventAnalytics' as const,
  SOCIAL_ANALYTICS: 'SocialAnalytics' as const,
  PERFORMANCE_ANALYTICS: 'PerformanceAnalytics' as const,
  
  // Security/Moderation Routes
  REPORT_CONTENT: 'ReportContent' as const,
  MODERATION_QUEUE: 'ModerationQueue' as const,
  SECURITY_SETTINGS: 'SecuritySettings' as const,
  BLOCKED_USERS: 'BlockedUsers' as const,
  APPEAL: 'Appeal' as const,
  MODERATION_DASHBOARD: 'ModerationDashboard' as const,
  
  // Group Routes
  GROUP_DETAILS: 'GroupDetails' as const,
  GROUP_MEMBERS: 'GroupMembers' as const,
  
  // Notification Routes
  NOTIFICATIONS: 'Notifications' as const,
  NOTIFICATION_SETTINGS: 'NotificationSettings' as const,
  
  // Search Routes
  EVENT_SEARCH_RESULTS: 'EventSearchResults' as const,
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
