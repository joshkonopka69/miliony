// Type declarations for Expo modules that don't have built-in types

declare module 'react-native-safe-area-context' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';
  
  export interface SafeAreaViewProps extends ViewProps {
    children?: React.ReactNode;
  }
  
  export class SafeAreaView extends Component<SafeAreaViewProps> {}
  export function useSafeAreaInsets(): { top: number; right: number; bottom: number; left: number };
}

declare module '@expo/vector-icons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';
  
  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  
  export class Ionicons extends Component<IconProps> {}
  export class MaterialIcons extends Component<IconProps> {}
  export class FontAwesome extends Component<IconProps> {}
}

declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }
  
  export interface LocationPermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
    canAskAgain: boolean;
    granted: boolean;
  }
  
  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: any): Promise<LocationObject>;
}
