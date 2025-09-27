import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

// Types
export interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: any;
}

export default function ErrorMessage({
  message,
  type = 'error',
  dismissible = false,
  onDismiss,
  style,
}: ErrorMessageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '⚠️';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ffebee';
      case 'warning':
        return '#fff3e0';
      case 'info':
        return '#e3f2fd';
      default:
        return '#ffebee';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return '#ffcdd2';
      case 'warning':
        return '#ffcc02';
      case 'info':
        return '#bbdefb';
      default:
        return '#ffcdd2';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return '#c62828';
      case 'warning':
        return '#ef6c00';
      case 'info':
        return '#1565c0';
      default:
        return '#c62828';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
        {dismissible && (
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={[styles.dismissButtonText, { color: getTextColor() }]}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  dismissButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
