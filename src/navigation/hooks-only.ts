import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { 
  RootStackParamList, 
  RootStackScreenProps
} from './types';
import { NavigationUtils } from './utils';

// Type-safe navigation hooks
export const useAppNavigation = () => {
  return useNavigation<any>();
};

export const useAppRoute = <T extends keyof RootStackParamList>() => {
  return useRoute<RootStackScreenProps<T>['route']>();
};

// Custom navigation hooks
export const useNavigationUtils = () => {
  return NavigationUtils;
};

// Hook for handling back button on Android
export const useBackHandler = (onBackPress: () => boolean) => {
  useFocusEffect(
    useCallback(() => {
      const onBackPressHandler = () => {
        return onBackPress();
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPressHandler);

      return () => subscription.remove();
    }, [onBackPress])
  );
};

// Hook for preventing back navigation
export const usePreventBackNavigation = (prevent: boolean = true) => {
  useBackHandler(() => {
    if (prevent) {
      return true; // Prevent default back action
    }
    return false; // Allow default back action
  });
};

// Hook for navigation state tracking
export const useNavigationState = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const getCurrentRouteName = useCallback(() => {
    return route.name;
  }, [route.name]);

  const getCurrentRouteParams = useCallback(() => {
    return route.params;
  }, [route.params]);

  const canGoBack = useCallback(() => {
    return navigation.canGoBack();
  }, [navigation]);

  return {
    currentRouteName: getCurrentRouteName(),
    currentRouteParams: getCurrentRouteParams(),
    canGoBack: canGoBack(),
    navigation,
    route,
  };
};

// Hook for deep linking
export const useDeepLinking = () => {
  const navigation = useNavigation();

  const handleDeepLink = useCallback((url: string) => {
    // Parse and handle deep link URL
    console.log('Handling deep link:', url);
    // Implementation would depend on your deep linking setup
  }, [navigation]);

  return {
    handleDeepLink,
  };
};

// Hook for navigation analytics
export const useNavigationAnalytics = () => {
  const route = useRoute();

  useEffect(() => {
    // Track screen view
    console.log('Screen viewed:', route.name, route.params);
    
    // You can integrate with analytics services here
    // Example: Analytics.track('screen_view', { screen_name: route.name });
  }, [route.name, route.params]);

  const trackNavigationEvent = useCallback((event: string, properties?: any) => {
    console.log('Navigation event:', event, properties);
    // Track navigation events
  }, []);

  return {
    trackNavigationEvent,
  };
};

// Hook for navigation persistence
export const useNavigationPersistence = () => {
  const navigation = useNavigation();

  const saveNavigationState = useCallback((state: any) => {
    try {
      // Save navigation state to storage
      console.log('Saving navigation state:', state);
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }, []);

  const restoreNavigationState = useCallback(() => {
    try {
      // Restore navigation state from storage
      console.log('Restoring navigation state');
      return null;
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
      return null;
    }
  }, []);

  return {
    saveNavigationState,
    restoreNavigationState,
  };
};

// Hook for conditional navigation
export const useConditionalNavigation = () => {
  const navigation = useNavigation();

  const navigateIf = useCallback((
    condition: boolean,
    routeName: keyof RootStackParamList,
    params?: any
  ) => {
    if (condition) {
      navigation.navigate(routeName as any, params);
      return true;
    }
    return false;
  }, [navigation]);

  const resetIf = useCallback((
    condition: boolean,
    routeName: keyof RootStackParamList,
    params?: any
  ) => {
    if (condition) {
      navigation.reset({
        index: 0,
        routes: [{ name: routeName as any, params }],
      });
      return true;
    }
    return false;
  }, [navigation]);

  return {
    navigateIf,
    resetIf,
  };
};

// Hook for navigation timing
export const useNavigationTiming = () => {
  const navigationStartTime = useRef<number>(Date.now());

  const getNavigationDuration = useCallback(() => {
    return Date.now() - navigationStartTime.current;
  }, []);

  const resetNavigationTimer = useCallback(() => {
    navigationStartTime.current = Date.now();
  }, []);

  return {
    getNavigationDuration,
    resetNavigationTimer,
  };
};

// Hook for navigation validation
export const useNavigationValidation = () => {
  const validateRoute = useCallback((
    routeName: string,
    params?: any
  ) => {
    // Add validation logic for specific routes
    switch (routeName) {
      case 'Register':
        return true; // No specific params required
      default:
        return true;
    }
  }, []);

  const validateNavigation = useCallback((
    routeName: string,
    params?: any
  ) => {
    const isValid = validateRoute(routeName, params);
    if (!isValid) {
      console.warn('Invalid navigation parameters:', { routeName, params });
    }
    return isValid;
  }, [validateRoute]);

  return {
    validateRoute,
    validateNavigation,
  };
};

