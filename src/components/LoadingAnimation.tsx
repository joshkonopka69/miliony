import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'wave';
}

export default function LoadingAnimation({
  size = 'medium',
  color = '#3b82f6',
  text,
  type = 'spinner',
}: LoadingAnimationProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const waveValues = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    switch (type) {
      case 'spinner':
        startSpinnerAnimation();
        break;
      case 'pulse':
        startPulseAnimation();
        break;
      case 'wave':
        startWaveAnimation();
        break;
      case 'dots':
        startDotsAnimation();
        break;
    }
  }, [type]);

  const startSpinnerAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    const createWaveAnimation = (index: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(waveValues[index], {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(waveValues[index], {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    waveValues.forEach((value, index) => {
      setTimeout(() => {
        createWaveAnimation(index).start();
      }, index * 150);
    });
  };

  const startDotsAnimation = () => {
    // Dots animation is handled in the render method
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 20, height: 20 };
      case 'medium':
        return { width: 40, height: 40 };
      case 'large':
        return { width: 60, height: 60 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const renderSpinner = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.spinner,
          getSizeStyles(),
          { borderColor: color, transform: [{ rotate: spin }] },
        ]}
      />
    );
  };

  const renderPulse = () => {
    return (
      <Animated.View
        style={[
          styles.pulse,
          getSizeStyles(),
          { backgroundColor: color, transform: [{ scale: pulseValue }] },
        ]}
      />
    );
  };

  const renderWave = () => {
    return (
      <View style={styles.waveContainer}>
        {waveValues.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                backgroundColor: color,
                height: 20,
                width: 4,
                opacity: value,
                transform: [{ scaleY: value }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: color,
                width: 8,
                height: 8,
                opacity: waveValues[index],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderAnimation = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'pulse':
        return renderPulse();
      case 'wave':
        return renderWave();
      case 'dots':
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={styles.container}>
      {renderAnimation()}
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRadius: 50,
  },
  pulse: {
    borderRadius: 50,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  waveBar: {
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 4,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});


