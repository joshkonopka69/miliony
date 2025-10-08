// Utility to fix SafeAreaView deprecation warnings

import * as React from 'react';
import { SafeAreaView as NewSafeAreaView } from 'react-native-safe-area-context';
import { ViewStyle } from 'react-native';

// Export the new SafeAreaView as default
export { NewSafeAreaView as SafeAreaView };

// Type definitions for better type safety
interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

// Create a wrapper component for easy migration
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ 
  children, 
  style,
  backgroundColor,
  ...props 
}) => {
  return React.createElement(
    NewSafeAreaView, 
    { 
      style: [{ backgroundColor }, style],
      ...props 
    }, 
    children
  );
};


