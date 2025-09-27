import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';

// Types
export interface AuthLoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

export default function AuthLoadingSpinner({
  message = 'Loading...',
  size = 'large',
  color = '#FFD700',
  style,
}: AuthLoadingSpinnerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View 
        style={[
          styles.spinnerContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <ActivityIndicator size={size} color={color} />
      </Animated.View>
      
      {message && (
        <Animated.Text 
          style={[
            styles.message,
            { opacity: fadeAnim },
          ]}
        >
          {message}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
