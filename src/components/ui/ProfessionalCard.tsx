import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

interface ProfessionalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
  margin?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  gradientColors?: string[];
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  margin = 'sm',
  onPress,
  style,
  gradientColors,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    };

    const paddingStyles = {
      sm: { padding: theme.spacing.md },
      md: { padding: theme.spacing.lg },
      lg: { padding: theme.spacing.xl },
    };

    const marginStyles = {
      sm: { margin: theme.spacing.sm },
      md: { margin: theme.spacing.md },
      lg: { margin: theme.spacing.lg },
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.sm,
      },
      elevated: {
        backgroundColor: theme.colors.surface,
        ...theme.shadows.lg,
      },
      outlined: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      gradient: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...variantStyles[variant],
      ...style,
    };
  };

  const renderCard = () => {
    if (variant === 'gradient') {
      const colors = gradientColors || theme.colors.gradient.neutral;
      return (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getCardStyle()}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View style={getCardStyle()}>
        {children}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  // Additional styles if needed
});
