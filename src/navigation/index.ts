// Export all navigation components and utilities
export { default as AppNavigator } from './AppNavigator';

// Export types
export type {
  RootStackParamList,
  RootStackScreenProps,
  WelcomeScreenProps,
  AuthScreenProps,
  RegisterScreenProps,
  MapScreenProps,
  ChatScreenProps,
  EventsScreenProps,
  SettingsScreenProps,
  ProfileScreenProps,
  NavigationState,
  RouteNames,
} from './types';

// Export constants
export {
  ROUTES,
} from './types';

export {
  NAVIGATION_CONFIG,
  ROUTE_CONFIG,
  TAB_CONFIG,
  NAVIGATION_FLOWS,
  DEEP_LINK_CONFIG,
  NAVIGATION_STATE_KEYS,
  TRANSITION_TYPES,
  GESTURE_CONFIG,
  ERROR_CONFIG,
} from './constants';

// Export utilities
export {
  setNavigationRef,
  NavigationUtils,
  RouteValidation,
  DeepLinkUtils,
  NavigationPersistence,
  TransitionUtils,
} from './utils';

// Export hooks
export {
  useAppNavigation,
  useAppRoute,
  useNavigationUtils,
  useBackHandler,
  usePreventBackNavigation,
  useNavigationState,
  useDeepLinking,
  useNavigationAnalytics,
  useNavigationPersistence,
  useConditionalNavigation,
  useNavigationTiming,
  useNavigationValidation,
} from './hooks';
