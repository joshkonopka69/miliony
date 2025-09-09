import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import {
  WelcomeScreen,
  AuthScreen,
  SportSelectionScreen,
  MapScreen,
  ChatScreen,
  EventsScreen,
  SettingsScreen,
} from '../screens';

// Import navigation utilities and types
import { setNavigationRef } from './utils';
import { RootStackParamList, ROUTES } from './types';
import { ROUTE_CONFIG } from './constants';

const Stack = createStackNavigator<RootStackParamList>();

// Main Stack Navigator
export default function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    setNavigationRef(navigationRef.current);
  }, []);

  const onNavigationStateChange = (state: any) => {
    // Handle navigation state changes
    console.log('Navigation state changed:', state);
  };

  const onReady = () => {
    console.log('Navigation container is ready');
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={onNavigationStateChange}
      onReady={onReady}
    >
      <Stack.Navigator
        initialRouteName={ROUTES.WELCOME}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen 
          name={ROUTES.WELCOME} 
          component={WelcomeScreen}
          options={ROUTE_CONFIG[ROUTES.WELCOME]}
        />
        <Stack.Screen 
          name={ROUTES.AUTH} 
          component={AuthScreen}
          options={ROUTE_CONFIG[ROUTES.AUTH]}
        />
        <Stack.Screen 
          name={ROUTES.SPORT_SELECTION} 
          component={SportSelectionScreen}
          options={ROUTE_CONFIG[ROUTES.SPORT_SELECTION]}
        />
        
        {/* Main App Screens */}
        <Stack.Screen 
          name={ROUTES.MAP} 
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.CHAT} 
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.EVENTS} 
          component={EventsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.SETTINGS} 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        {/* Profile screen to be implemented later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
