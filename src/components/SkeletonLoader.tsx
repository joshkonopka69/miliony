import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Skeleton components for different content types
export function PlaceInfoSkeleton() {
  return (
    <View style={styles.placeInfoSkeleton}>
      <SkeletonLoader width="80%" height={24} borderRadius={8} />
      <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonLoader width="100%" height={120} borderRadius={8} style={{ marginTop: 16 }} />
      <View style={styles.actionsSkeleton}>
        <SkeletonLoader width="30%" height={40} borderRadius={20} />
        <SkeletonLoader width="30%" height={40} borderRadius={20} />
        <SkeletonLoader width="30%" height={40} borderRadius={20} />
      </View>
    </View>
  );
}

export function MapSkeleton() {
  return (
    <View style={styles.mapSkeleton}>
      <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e2e8f0',
  },
  placeInfoSkeleton: {
    padding: 20,
  },
  actionsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  mapSkeleton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
});


