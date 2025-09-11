import { CommonActions, NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList, ROUTES } from './types';

// Navigation reference for programmatic navigation
let navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

export const setNavigationRef = (ref: NavigationContainerRef<RootStackParamList> | null) => {
  navigationRef = ref;
};

// Navigation utilities
export const NavigationUtils = {
  // Navigate to a specific screen
  navigate: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ) => {
    if (navigationRef?.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  // Reset navigation stack
  reset: (routeName: keyof RootStackParamList, params?: any) => {
    if (navigationRef?.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        })
      );
    }
  },

  // Go back
  goBack: () => {
    if (navigationRef?.canGoBack()) {
      navigationRef.goBack();
    }
  },

  // Get current route name
  getCurrentRoute: () => {
    return navigationRef?.getCurrentRoute()?.name;
  },

  // Check if can go back
  canGoBack: () => {
    return navigationRef?.canGoBack() || false;
  },
};

// Route validation helpers
export const RouteValidation = {
  // Check if user can access main app
  canAccessMainApp: (isAuthenticated: boolean, hasCompletedOnboarding: boolean) => {
    return isAuthenticated && hasCompletedOnboarding;
  },

  // Get initial route based on user state
  getInitialRoute: (isAuthenticated: boolean, hasCompletedOnboarding: boolean) => {
    if (!isAuthenticated) {
      return ROUTES.WELCOME;
    }
    if (!hasCompletedOnboarding) {
      return ROUTES.REGISTER;
    }
    return ROUTES.MAP;
  },

  // Validate navigation parameters
  validateParams: (routeName: string, params: any) => {
    // Add validation logic for specific routes
    switch (routeName) {
      case ROUTES.REGISTER:
        return true; // No specific params required
      default:
        return true;
    }
  },
};

// Deep linking utilities
export const DeepLinkUtils = {
  // Parse deep link URL
  parseUrl: (url: string) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\//, '');
      const params = Object.fromEntries(parsed.searchParams);
      
      return {
        path,
        params,
        isValid: true,
      };
    } catch (error) {
      return {
        path: '',
        params: {},
        isValid: false,
      };
    }
  },

  // Convert route to deep link URL
  routeToUrl: (routeName: string, params?: any) => {
    const baseUrl = 'sportapp://';
    let url = `${baseUrl}${routeName.toLowerCase()}`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  },
};

// Navigation state persistence
export const NavigationPersistence = {
  // Save navigation state
  saveState: (state: any) => {
    try {
      // In a real app, you might save to AsyncStorage
      console.log('Navigation state saved:', state);
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  },

  // Restore navigation state
  restoreState: () => {
    try {
      // In a real app, you might restore from AsyncStorage
      return null;
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
      return null;
    }
  },
};

// Screen transition utilities
export const TransitionUtils = {
  // Get screen options for different transitions
  getScreenOptions: (routeName: string) => {
    const commonOptions = {
      headerShown: false,
      gestureEnabled: true,
    };

    switch (routeName) {
      case ROUTES.WELCOME:
        return {
          ...commonOptions,
          animationTypeForReplace: 'push' as const,
        };
      case ROUTES.MAP:
        return {
          ...commonOptions,
          animationTypeForReplace: 'pop' as const,
        };
      default:
        return commonOptions;
    }
  },

  // Get tab bar options
  getTabBarOptions: () => ({
    activeTintColor: '#4CAF50',
    inactiveTintColor: '#999',
    style: {
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#eee',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    labelStyle: {
      fontSize: 12,
      fontWeight: '500',
    },
    iconStyle: {
      marginBottom: 2,
    },
  }),
};




