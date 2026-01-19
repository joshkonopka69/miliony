import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface DialogConfig {
  type: DialogType;
  title: string;
  message: string;
  icon?: string;
  buttons?: DialogButton[];
  autoHide?: boolean;
  autoHideDuration?: number;
}

interface CustomDialogProps {
  visible: boolean;
  config: DialogConfig | null;
  onDismiss: () => void;
}

const DIALOG_ICONS: Record<DialogType, string> = {
  success: '🎉',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  confirm: '❓',
};

const DIALOG_GRADIENTS: Record<DialogType, [string, string]> = {
  success: ['#FFD700', '#FFC000'], // Gold gradient - aligned with app accent
  error: ['#FF6B6B', '#EE5A5A'],
  warning: ['#FFB347', '#FFA500'],
  info: ['#74B9FF', '#0984E3'],
  confirm: ['#A29BFE', '#6C5CE7'],
};

export default function CustomDialog({ visible, config, onDismiss }: CustomDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && config) {
      // Show animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide if configured
      if (config.autoHide !== false && config.type !== 'confirm') {
        const duration = config.autoHideDuration || 3000;
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, config]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleButtonPress = (button: DialogButton) => {
    if (button.onPress) {
      button.onPress();
    }
    handleDismiss();
  };

  if (!visible || !config) return null;

  const icon = config.icon || DIALOG_ICONS[config.type];
  const gradientColors = DIALOG_GRADIENTS[config.type];
  const buttons = config.buttons || [{ text: 'OK', style: 'default' as const }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={config.type !== 'confirm' ? handleDismiss : undefined}
        >
          <Animated.View
            style={[
              styles.dialogContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header with gradient */}
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
              >
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.title}>{config.title}</Text>
              </LinearGradient>

              {/* Message */}
              <View style={styles.content}>
                <Text style={styles.message}>{config.message}</Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      buttons.length === 1 && styles.singleButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  message: {
    fontSize: 16,
    color: '#4A4A4A',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  singleButton: {
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  destructiveButton: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700', // Gold text on dark button
  },
  cancelButtonText: {
    color: '#666666',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});
