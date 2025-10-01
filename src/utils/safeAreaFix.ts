// Utility to fix SafeAreaView deprecation warnings

import { SafeAreaView as RNSafeAreaView } from 'react-native';
import { SafeAreaProvider, SafeAreaView as NewSafeAreaView } from 'react-native-safe-area-context';

// Export the new SafeAreaView as default
export { SafeAreaProvider, NewSafeAreaView as SafeAreaView };

// Create a wrapper component for easy migration
export const SafeAreaWrapper = ({ children, ...props }: any) => (
  <SafeAreaProvider>
    <NewSafeAreaView {...props}>
      {children}
    </NewSafeAreaView>
  </SafeAreaProvider>
);


