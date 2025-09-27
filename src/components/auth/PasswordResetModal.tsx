import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth, AuthError } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import ErrorMessage from './ErrorMessage';

// Types
export interface PasswordResetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export default function PasswordResetModal({
  visible,
  onClose,
  onSuccess,
  onError,
}: PasswordResetModalProps) {
  const { t } = useTranslation();
  const { sendPasswordReset } = useAuth();
  
  const [email, setEmail] = useState('');
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
      setEmail('');
      setErrors({});
      setIsSuccess(false);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await sendPasswordReset(email);
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
      console.error('Password reset error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // Handle close
  const handleClose = () => {
    setEmail('');
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
              <Text style={styles.title}>Reset Password</Text>
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
                  <Text style={styles.successTitle}>Email Sent!</Text>
                  <Text style={styles.successMessage}>
                    We've sent a password reset link to {email}. 
                    Please check your inbox and follow the instructions.
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
                  <Text style={styles.description}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>

                  {/* General Error */}
                  {errors.general && (
                    <ErrorMessage message={errors.general} style={styles.errorContainer} />
                  )}

                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      value={email}
                      onChangeText={handleEmailChange}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                      placeholderTextColor="#8e8e93"
                      editable={!isLoading}
                    />
                    {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity 
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
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
  container: {
    width: '100%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  fieldError: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    height: 52,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
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
