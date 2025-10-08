import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnimation = new Animated.Value(0);

  React.useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, []);

  const opacity = shimmerAnimation.interpolate({
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
};

// Event Card Skeleton
export const EventCardSkeleton: React.FC = () => (
  <View style={styles.eventCardSkeleton}>
    <SkeletonLoader width="100%" height={120} borderRadius={12} />
    <View style={styles.eventCardContent}>
      <SkeletonLoader width="70%" height={20} borderRadius={4} />
      <SkeletonLoader width="50%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
      <View style={styles.eventCardFooter}>
        <SkeletonLoader width="30%" height={16} borderRadius={4} />
        <SkeletonLoader width="20%" height={16} borderRadius={4} />
      </View>
    </View>
  </View>
);

// Map Skeleton
export const MapSkeleton: React.FC = () => (
  <View style={styles.mapSkeleton}>
    <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    <View style={styles.mapOverlay}>
      <SkeletonLoader width={200} height={40} borderRadius={20} />
    </View>
  </View>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <View style={styles.profileSkeleton}>
    <SkeletonLoader width={80} height={80} borderRadius={40} />
    <View style={styles.profileInfo}>
      <SkeletonLoader width="60%" height={24} borderRadius={4} />
      <SkeletonLoader width="40%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  eventCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCardContent: {
    padding: 16,
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mapSkeleton: {
    flex: 1,
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  profileSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
});