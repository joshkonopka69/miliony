import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Clean SportsMap Toast Colors - Gold/Black/White Premium Theme
const TOAST_COLORS = {
  success: {
    background: '#1A1A1A',
    border: '#FFD700',
    accent: '#FFD700',
    text: '#FFFFFF',
    icon: '✓',
    iconBg: '#FFD700',
    iconColor: '#000000',
  },
  error: {
    background: '#1A1A1A',
    border: '#FF4444',
    accent: '#FF4444',
    text: '#FFFFFF',
    icon: '✕',
    iconBg: '#FF4444',
    iconColor: '#FFFFFF',
  },
  warning: {
    background: '#1A1A1A',
    border: '#FFD700',
    accent: '#FFD700',
    text: '#FFFFFF',
    icon: '!',
    iconBg: '#FFD700',
    iconColor: '#000000',
  },
  info: {
    background: '#1A1A1A',
    border: '#FFD700',
    accent: '#FFD700',
    text: '#FFFFFF',
    icon: 'i',
    iconBg: '#FFD700',
    iconColor: '#000000',
  },
};

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
  onHide: () => void;
  onPress?: () => void;
}

export default function Toast({
  visible,
  message,
  title,
  type,
  duration = 3000,
  onHide,
  onPress
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      // Show animation with spring effect
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getColors = () => TOAST_COLORS[type] || TOAST_COLORS.info;

  const getDefaultTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Notice';
    }
  };

  if (!visible) return null;

  const colors = getColors();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress || hideToast}
        style={styles.touchable}
      >
        <View style={[styles.toast, { backgroundColor: colors.background, borderLeftColor: colors.border }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
            <Text style={{fontSize: 18, color: colors.iconColor}}>{colors.icon}</Text>
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title || getDefaultTitle()}
            </Text>
            <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
              {message}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
            <Text style={{fontSize: 16, color: '#999999'}}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
  },
  touchable: {
    width: '100%',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderBottomWidth: 3,
    borderBottomColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
    lineHeight: 18,
  },
  closeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  closeText: {
    fontSize: 22,
    color: '#999999',
    fontWeight: '300',
  },
});
