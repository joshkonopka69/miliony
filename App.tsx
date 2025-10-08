import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TranslationProvider } from './src/contexts/TranslationContext';
import { AuthProvider } from './src/contexts/AuthContext';
// Temporarily disable problematic providers
// import { AnalyticsProvider } from './src/contexts/AnalyticsContext';
// import { ModerationProvider } from './src/contexts/ModerationContext';
// import { GroupProvider } from './src/contexts/GroupContext';
// import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TranslationProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </TranslationProvider>
    </SafeAreaProvider>
  );
}
