import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import { TranslationProvider } from './src/contexts/TranslationContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { AnalyticsProvider } from './src/contexts/AnalyticsContext';
import { ModerationProvider } from './src/contexts/ModerationContext';
import { GroupProvider } from './src/contexts/GroupContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { DialogProvider } from './src/contexts/DialogContext';
import { ToastProvider, ConfirmationProvider } from './src/components';
import { supabase } from './src/config/supabase';

export default function App() {
  useEffect(() => {
    // Handle deep links when app opens
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      console.log('App opened with URL:', url);

      // Check if the URL contains auth tokens (from email links)
      if (url.includes('access_token') || url.includes('refresh_token')) {
        try {
          // Extract tokens from URL hash
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('Setting session from deep link tokens');
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        } catch (error) {
          console.error('Error handling deep link auth:', error);
        }
      }
    };

    // Get initial URL (app opened from link)
    Linking.getInitialURL().then(handleDeepLink);

    // Listen for URL events (app already open)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <TranslationProvider>
        <AuthProvider>
          <UserProvider>
            <AnalyticsProvider>
              <ModerationProvider>
                <GroupProvider>
                  <NotificationProvider>
                    <DialogProvider>
                      <ToastProvider>
                        <ConfirmationProvider>
                          <StatusBar style="auto" />
                          <AppNavigator />
                        </ConfirmationProvider>
                      </ToastProvider>
                    </DialogProvider>
                  </NotificationProvider>
                </GroupProvider>
              </ModerationProvider>
            </AnalyticsProvider>
          </UserProvider>
        </AuthProvider>
      </TranslationProvider>
    </SafeAreaProvider>
  );
}
