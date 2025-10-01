import React, { useRef, useEffect } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SmoothTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  duration?: number;
  style?: ViewStyle;
  animationType?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown';
  delay?: number;
}

export default function SmoothTransition({
  children,
  visible,
  duration = 300,
  style,
  animationType = 'fade',
  delay = 0,
}: SmoothTransitionProps) {
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(visible ? 0 : 50)).current;
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0.8)).current;

  useEffect(() => {
    const animate = () => {
      const toValue = visible ? 1 : 0;
      const translateYValue = visible ? 0 : (animationType === 'slideUp' ? -50 : 50);
      const scaleValue = visible ? 1 : 0.8;

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: translateYValue,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: scaleValue,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    };

    if (delay > 0) {
      const timer = setTimeout(animate, delay);
      return () => clearTimeout(timer);
    } else {
      animate();
    }
  }, [visible, duration, delay, animationType]);

  const getTransform = () => {
    switch (animationType) {
      case 'fade':
        return [];
      case 'slide':
        return [{ translateY: translateYAnim }];
      case 'scale':
        return [{ scale: scaleAnim }];
      case 'slideUp':
        return [{ translateY: translateYAnim }];
      case 'slideDown':
        return [{ translateY: translateYAnim }];
      default:
        return [];
    }
  };

  if (!visible && animationType === 'fade') {
    return null;
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}


