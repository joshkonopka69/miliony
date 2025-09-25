import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import {
  WelcomeScreen,
  AuthScreen,
  RegisterScreen,
  MapScreen,
  ChatScreen,
  EventsScreen,
  EventDetailsScreen,
  EventSearchResultsScreen,
  SettingsScreen,
  ProfileScreen,
  AddFriendScreen,
  CreateGroupScreen,
  MyGroupsScreen,
  LanguageScreen,
  GameChatScreen,
  TermsOfServiceScreen,
  PrivacyPolicyScreen,
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
          name={ROUTES.REGISTER} 
          component={RegisterScreen}
          options={ROUTE_CONFIG[ROUTES.REGISTER]}
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
          name={ROUTES.EVENT_DETAILS} 
          component={EventDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.EVENT_SEARCH_RESULTS} 
          component={EventSearchResultsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.SETTINGS} 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.PROFILE} 
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.ADD_FRIEND} 
          component={AddFriendScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.CREATE_GROUP} 
          component={CreateGroupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.MY_GROUPS} 
          component={MyGroupsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.LANGUAGE} 
          component={LanguageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.GAME_CHAT} 
          component={GameChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.TERMS_OF_SERVICE} 
          component={TermsOfServiceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name={ROUTES.PRIVACY_POLICY} 
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
