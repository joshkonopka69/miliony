// Design system with consistent styling and theming

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    caption: TextStyle;
    button: TextStyle;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
  };
}

import { TextStyle, ShadowStyle } from 'react-native';

export const lightTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#22d3ee',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    shadow: '#000000',
  },
};

export class DesignSystem {
  private static instance: DesignSystem;
  private currentTheme: Theme = lightTheme;

  static getInstance(): DesignSystem {
    if (!DesignSystem.instance) {
      DesignSystem.instance = new DesignSystem();
    }
    return DesignSystem.instance;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  // Color utilities
  getColor(colorName: keyof Theme['colors']): string {
    return this.currentTheme.colors[colorName];
  }

  // Spacing utilities
  getSpacing(size: keyof Theme['spacing']): number {
    return this.currentTheme.spacing[size];
  }

  // Typography utilities
  getTypography(type: keyof Theme['typography']): TextStyle {
    return this.currentTheme.typography[type];
  }

  // Border radius utilities
  getBorderRadius(size: keyof Theme['borderRadius']): number {
    return this.currentTheme.borderRadius[size];
  }

  // Shadow utilities
  getShadow(size: keyof Theme['shadows']): ShadowStyle {
    return this.currentTheme.shadows[size];
  }

  // Create consistent button styles
  createButtonStyles(variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost') {
    const baseStyle = {
      paddingHorizontal: this.getSpacing('md'),
      paddingVertical: this.getSpacing('sm'),
      borderRadius: this.getBorderRadius('md'),
      ...this.getShadow('sm'),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('primary'),
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('secondary'),
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('success'),
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('danger'),
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: this.getColor('border'),
        };
      default:
        return baseStyle;
    }
  }

  // Create consistent card styles
  createCardStyles() {
    return {
      backgroundColor: this.getColor('surface'),
      borderRadius: this.getBorderRadius('lg'),
      padding: this.getSpacing('md'),
      ...this.getShadow('md'),
    };
  }

  // Create consistent input styles
  createInputStyles() {
    return {
      borderWidth: 1,
      borderColor: this.getColor('border'),
      borderRadius: this.getBorderRadius('md'),
      paddingHorizontal: this.getSpacing('md'),
      paddingVertical: this.getSpacing('sm'),
      backgroundColor: this.getColor('background'),
      ...this.getTypography('body'),
    };
  }

  // Create consistent modal styles
  createModalStyles() {
    return {
      backgroundColor: this.getColor('background'),
      borderRadius: this.getBorderRadius('lg'),
      padding: this.getSpacing('lg'),
      ...this.getShadow('lg'),
    };
  }

  // Create consistent list item styles
  createListItemStyles() {
    return {
      backgroundColor: this.getColor('surface'),
      borderRadius: this.getBorderRadius('md'),
      padding: this.getSpacing('md'),
      marginBottom: this.getSpacing('sm'),
      ...this.getShadow('sm'),
    };
  }

  // Create consistent badge styles
  createBadgeStyles(variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger') {
    const baseStyle = {
      paddingHorizontal: this.getSpacing('sm'),
      paddingVertical: this.getSpacing('xs'),
      borderRadius: this.getBorderRadius('sm'),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('primary'),
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('secondary'),
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('success'),
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('warning'),
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: this.getColor('danger'),
        };
      default:
        return baseStyle;
    }
  }

  // Create consistent spacing utilities
  createSpacingUtils() {
    return {
      marginXs: { margin: this.getSpacing('xs') },
      marginSm: { margin: this.getSpacing('sm') },
      marginMd: { margin: this.getSpacing('md') },
      marginLg: { margin: this.getSpacing('lg') },
      marginXl: { margin: this.getSpacing('xl') },
      paddingXs: { padding: this.getSpacing('xs') },
      paddingSm: { padding: this.getSpacing('sm') },
      paddingMd: { padding: this.getSpacing('md') },
      paddingLg: { padding: this.getSpacing('lg') },
      paddingXl: { padding: this.getSpacing('xl') },
    };
  }

  // Create consistent layout utilities
  createLayoutUtils() {
    return {
      flexRow: { flexDirection: 'row' },
      flexColumn: { flexDirection: 'column' },
      flexCenter: { justifyContent: 'center', alignItems: 'center' },
      flexBetween: { justifyContent: 'space-between', alignItems: 'center' },
      flexAround: { justifyContent: 'space-around', alignItems: 'center' },
      flexWrap: { flexWrap: 'wrap' },
      flexGrow: { flexGrow: 1 },
      flexShrink: { flexShrink: 1 },
    };
  }
}

export const designSystem = DesignSystem.getInstance();


