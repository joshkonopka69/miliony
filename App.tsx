import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TranslationProvider } from './src/contexts/TranslationContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { AnalyticsProvider } from './src/contexts/AnalyticsContext';
import { ModerationProvider } from './src/contexts/ModerationContext';
import { GroupProvider } from './src/contexts/GroupContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { DialogProvider } from './src/contexts/DialogContext';

export default function App() {
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
                      <StatusBar style="auto" />
                      <AppNavigator />
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
