import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { TranslationProvider } from './src/contexts/TranslationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TranslationProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </TranslationProvider>
    </SafeAreaProvider>
  );
}
