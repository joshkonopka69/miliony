import { ROUTES } from './types';

// Navigation configuration constants
export const NAVIGATION_CONFIG = {
  // Animation durations
  ANIMATION_DURATION: 300,
  GESTURE_DURATION: 250,
  
  // Tab bar configuration
  TAB_BAR_HEIGHT: 60,
  TAB_BAR_PADDING: 5,
  
  // Header configuration
  HEADER_HEIGHT: 56,
  HEADER_PADDING: 16,
  
  // Safe area insets
  SAFE_AREA_TOP: 44,
  SAFE_AREA_BOTTOM: 34,
} as const;

// Route configurations
export const ROUTE_CONFIG = {
  [ROUTES.WELCOME]: {
    title: 'Witaj',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.AUTH]: {
    title: 'Logowanie',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.SPORT_SELECTION]: {
    title: 'Wybierz Sport',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.MAP]: {
    title: 'Mapa',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.CHAT]: {
    title: 'Chat',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.EVENTS]: {
    title: 'Wydarzenia',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.SETTINGS]: {
    title: 'Ustawienia',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
  [ROUTES.PROFILE]: {
    title: 'Profil',
    headerShown: false,
    gestureEnabled: true,
    animationTypeForReplace: 'push' as const,
  },
} as const;

// Tab bar configurations
export const TAB_CONFIG = {
  [ROUTES.MAP]: {
    title: 'Mapa',
    icon: '🗺️',
    iconSize: 24,
    label: 'Mapa',
    badge: null,
  },
  [ROUTES.CHAT]: {
    title: 'Chat',
    icon: '💬',
    iconSize: 24,
    label: 'Chat',
    badge: null,
  },
  [ROUTES.EVENTS]: {
    title: 'Wydarzenia',
    icon: '📅',
    iconSize: 24,
    label: 'Wydarzenia',
    badge: null,
  },
  [ROUTES.SETTINGS]: {
    title: 'Ustawienia',
    icon: '⚙️',
    iconSize: 24,
    label: 'Ustawienia',
    badge: null,
  },
} as const;

// Navigation flow definitions
export const NAVIGATION_FLOWS = {
  // Onboarding flow
  ONBOARDING: [
    ROUTES.WELCOME,
    ROUTES.AUTH,
    ROUTES.SPORT_SELECTION,
  ],
  
  // Main app flow
  MAIN_APP: [
    ROUTES.MAP,
    ROUTES.CHAT,
    ROUTES.EVENTS,
    ROUTES.SETTINGS,
  ],
  
  // Authentication flow
  AUTH_FLOW: [
    ROUTES.WELCOME,
    ROUTES.AUTH,
  ],
  
  // Profile setup flow
  PROFILE_SETUP: [
    ROUTES.SPORT_SELECTION,
  ],
} as const;

// Deep linking configuration
export const DEEP_LINK_CONFIG = {
  // URL schemes
  SCHEMES: {
    APP: 'sportapp',
    WEB: 'https://sportapp.com',
  },
  
  // Route mappings for deep links
  ROUTE_MAPPINGS: {
    'welcome': ROUTES.WELCOME,
    'auth': ROUTES.AUTH,
    'sport-selection': ROUTES.SPORT_SELECTION,
    'map': ROUTES.MAP,
    'chat': ROUTES.CHAT,
    'events': ROUTES.EVENTS,
    'settings': ROUTES.SETTINGS,
  },
  
  // Default deep link route
  DEFAULT_ROUTE: ROUTES.WELCOME,
} as const;

// Navigation state keys
export const NAVIGATION_STATE_KEYS = {
  IS_AUTHENTICATED: 'isAuthenticated',
  HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
  CURRENT_SPORT: 'currentSport',
  USER_PROFILE: 'userProfile',
  LAST_VISITED_ROUTE: 'lastVisitedRoute',
  NAVIGATION_HISTORY: 'navigationHistory',
} as const;

// Screen transition types
export const TRANSITION_TYPES = {
  SLIDE_FROM_RIGHT: 'slide_from_right',
  SLIDE_FROM_LEFT: 'slide_from_left',
  SLIDE_FROM_BOTTOM: 'slide_from_bottom',
  FADE: 'fade',
  NONE: 'none',
} as const;

// Gesture configuration
export const GESTURE_CONFIG = {
  // Swipe back gesture
  SWIPE_BACK: {
    enabled: true,
    direction: 'horizontal',
    distance: 50,
    velocity: 500,
  },
  
  // Tab switching gesture
  TAB_SWIPE: {
    enabled: true,
    direction: 'horizontal',
    distance: 30,
    velocity: 300,
  },
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
  // Navigation errors
  NAVIGATION_ERRORS: {
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
    INVALID_PARAMS: 'INVALID_PARAMS',
    NAVIGATION_FAILED: 'NAVIGATION_FAILED',
    DEEP_LINK_FAILED: 'DEEP_LINK_FAILED',
  },
  
  // Error messages
  ERROR_MESSAGES: {
    ROUTE_NOT_FOUND: 'Trasa nie została znaleziona',
    INVALID_PARAMS: 'Nieprawidłowe parametry nawigacji',
    NAVIGATION_FAILED: 'Nawigacja nie powiodła się',
    DEEP_LINK_FAILED: 'Nie udało się otworzyć linku',
  },
} as const;
