import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useAuth, AuthError } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import ErrorMessage from './ErrorMessage';

// Types
export interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  userEmail?: string;
}

export default function EmailVerificationModal({
  visible,
  onClose,
  onSuccess,
  onError,
  userEmail,
}: EmailVerificationModalProps) {
  const { t } = useTranslation();
  const { sendEmailVerification } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
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
    } else {
      // Reset values when modal closes
      setErrors({});
      setIsSuccess(false);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  // Handle resend verification
  const handleResendVerification = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await sendEmailVerification();
      if (result.success) {
        setIsSuccess(true);
        onSuccess?.();
      } else {
        if (result.error) {
          setErrors({ general: result.error.message });
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  // Handle continue without verification
  const handleContinue = () => {
    Alert.alert(
      'Continue Without Verification',
      'You can verify your email later in your account settings. Continue to the app?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            handleClose();
            onSuccess?.();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Email</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isSuccess ? (
              // Success State
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Verification Email Sent!</Text>
                <Text style={styles.successMessage}>
                  We've sent a verification link to {userEmail || 'your email'}. 
                  Please check your inbox and click the link to verify your account.
                </Text>
                <TouchableOpacity 
                  style={styles.successButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.successButtonText}>Got it</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Form State
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.emailIcon}>📧</Text>
                </View>
                
                <Text style={styles.description}>
                  We've sent a verification email to {userEmail || 'your email address'}. 
                  Please check your inbox and click the verification link to activate your account.
                </Text>

                <Text style={styles.subDescription}>
                  If you don't see the email, check your spam folder or request a new one.
                </Text>

                {/* General Error */}
                {errors.general && (
                  <ErrorMessage message={errors.general} style={styles.errorContainer} />
                )}

                {/* Action Buttons */}
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity 
                    style={[styles.resendButton, isLoading && styles.resendButtonDisabled]}
                    onPress={handleResendVerification}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" size="small" />
                    ) : (
                      <Text style={styles.resendButtonText}>Resend Verification Email</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Text style={styles.continueButtonText}>Continue Without Verification</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emailIcon: {
    fontSize: 48,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  subDescription: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    marginBottom: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  resendButton: {
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  continueButton: {
    height: 52,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  cancelButton: {
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8e8e93',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
