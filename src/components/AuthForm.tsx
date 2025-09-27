import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth, AuthError } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

// Types
export interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  onModeChange?: (mode: 'login' | 'register') => void;
  onForgotPassword?: () => void;
  style?: any;
}

export interface AuthFormData {
  email: string;
  password: string;
  displayName?: string;
  confirmPassword?: string;
  favoriteSports?: string[];
}

// Custom SM Logo Component
const SMLogo = ({ size = 50 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function AuthForm({
  mode,
  onSuccess,
  onError,
  onModeChange,
  onForgotPassword,
  style,
}: AuthFormProps) {
  const { t } = useTranslation();
  const { login, register, loginWithGoogle, loginWithApple } = useAuth();
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: '',
    favoriteSports: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sports options
  const sports = [
    t.sports.boxing, t.sports.calisthenics, t.sports.gym, t.sports.basketball, t.sports.rollerSkating,
    t.sports.football, t.sports.volleyball, t.sports.bjj, t.sports.chess, t.sports.pingPong,
    t.sports.tennis, t.sports.badminton, t.sports.squash, t.sports.mma, t.sports.judo
  ];

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!formData.displayName) {
        newErrors.displayName = 'Display name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.favoriteSports || formData.favoriteSports.length === 0) {
        newErrors.favoriteSports = 'Please select at least one sport';
      }
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
      let result;

      if (mode === 'login') {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || '',
          favoriteSports: formData.favoriteSports || [],
        });
      }

      if (result.success) {
        onSuccess?.();
      } else {
        if (result.error) {
          setErrors({ general: result.error.message });
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Auth form error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        onSuccess?.();
      } else {
        if (result.error) {
          setErrors({ general: result.error.message });
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Apple sign-in
  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginWithApple();
      if (result.success) {
        onSuccess?.();
      } else {
        if (result.error) {
          setErrors({ general: result.error.message });
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof AuthFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle sport selection
  const handleSportToggle = (sport: string) => {
    const currentSports = formData.favoriteSports || [];
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    handleInputChange('favoriteSports', newSports);
  };

  // Focus next field
  const focusNextField = (currentField: string) => {
    const fieldOrder = mode === 'register' 
      ? ['email', 'displayName', 'password', 'confirmPassword']
      : ['email', 'password'];
    
    const currentIndex = fieldOrder.indexOf(currentField);
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1];
      inputRefs.current[nextField]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo and Title */}
          <View style={styles.header}>
            <SMLogo size={60} />
            <Text style={styles.title}>
              {mode === 'login' ? t.auth.title : t.register.title}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login' ? t.auth.subtitle : t.register.subtitle}
            </Text>
          </View>

          {/* General Error */}
          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {mode === 'login' ? t.auth.emailPlaceholder : t.register.emailLabel}
              </Text>
              <TextInput
                ref={(ref) => { inputRefs.current.email = ref; }}
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder={t.auth.emailPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => focusNextField('email')}
                placeholderTextColor="#8e8e93"
                editable={!isLoading}
              />
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            </View>

            {/* Display Name Field (Register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.register.displayNameLabel}</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.displayName = ref; }}
                  style={[styles.input, errors.displayName && styles.inputError]}
                  value={formData.displayName}
                  onChangeText={(value) => handleInputChange('displayName', value)}
                  placeholder={t.register.displayNamePlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('displayName')}
                  placeholderTextColor="#8e8e93"
                  editable={!isLoading}
                />
                {errors.displayName && <Text style={styles.fieldError}>{errors.displayName}</Text>}
              </View>
            )}

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {mode === 'login' ? t.auth.passwordPlaceholder : t.register.passwordLabel}
              </Text>
              <TextInput
                ref={(ref) => { inputRefs.current.password = ref; }}
                style={[styles.input, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder={t.auth.passwordPlaceholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => focusNextField('password')}
                placeholderTextColor="#8e8e93"
                editable={!isLoading}
              />
              {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Field (Register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.register.confirmPasswordLabel}</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.confirmPassword = ref; }}
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder={t.register.confirmPasswordPlaceholder}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  placeholderTextColor="#8e8e93"
                  editable={!isLoading}
                />
                {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
              </View>
            )}

            {/* Sports Selection (Register only) */}
            {mode === 'register' && (
              <View style={styles.sportsSection}>
                <Text style={styles.sportsLabel}>{t.register.favoriteSports}</Text>
                <Text style={styles.sportsSubtitle}>{t.register.selectSports}</Text>
                <View style={styles.sportsContainer}>
                  {sports.map((sport) => {
                    const isSelected = formData.favoriteSports?.includes(sport) || false;
                    return (
                      <TouchableOpacity
                        key={sport}
                        style={[
                          styles.sportChip,
                          isSelected && styles.sportChipSelected
                        ]}
                        onPress={() => handleSportToggle(sport)}
                        activeOpacity={0.7}
                        disabled={isLoading}
                      >
                        <Text style={[
                          styles.sportChipText,
                          isSelected && styles.sportChipTextSelected
                        ]}>
                          {sport}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.favoriteSports && <Text style={styles.fieldError}>{errors.favoriteSports}</Text>}
              </View>
            )}

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
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? t.auth.signIn : t.register.createAccount}
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password (Login only) */}
            {mode === 'login' && (
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={onForgotPassword}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>{t.auth.forgotPassword}</Text>
              </TouchableOpacity>
            )}

            {/* Social Sign-In */}
            <View style={styles.socialSection}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity 
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleSignIn}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mode Switch */}
            <View style={styles.modeSwitch}>
              <Text style={styles.modeSwitchText}>
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <TouchableOpacity onPress={() => onModeChange?.(mode === 'login' ? 'register' : 'login')}>
                  <Text style={styles.modeSwitchLink}>
                    {mode === 'login' ? t.auth.createAccount : t.register.signIn}
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.8,
    fontFamily: 'System',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  fieldError: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
  },
  sportsSection: {
    marginTop: 8,
  },
  sportsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sportsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '400',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sportChipSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  sportChipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.2,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  socialSection: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  dividerText: {
    fontSize: 13,
    color: '#8e8e93',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e1e5e9',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  modeSwitch: {
    alignItems: 'center',
    marginTop: 24,
  },
  modeSwitchText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  modeSwitchLink: {
    fontWeight: '600',
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
});
