import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth, AuthError } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import ErrorMessage from './ErrorMessage';

// Types
export interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  onLogin?: () => void;
  style?: any;
}

export interface RegisterFormData {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  favoriteSports: string[];
}

// Custom SM Logo Component
const SMLogo = ({ size = 50 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function RegisterForm({
  onSuccess,
  onError,
  onLogin,
  style,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    displayName: '',
    password: '',
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

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.favoriteSports.length === 0) {
      newErrors.favoriteSports = 'Please select at least one sport';
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
      const result = await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        favoriteSports: formData.favoriteSports,
      });

      if (result.success) {
        onSuccess?.();
      } else {
        if (result.error) {
          setErrors({ general: result.error.message });
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof RegisterFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle sport selection
  const handleSportToggle = (sport: string) => {
    const currentSports = formData.favoriteSports;
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    handleInputChange('favoriteSports', newSports);
  };

  // Focus next field
  const focusNextField = (currentField: string) => {
    const fieldOrder = ['email', 'displayName', 'password', 'confirmPassword'];
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
            <SMLogo size={50} />
            <Text style={styles.title}>{t.register.title}</Text>
            <Text style={styles.subtitle}>{t.register.subtitle}</Text>
          </View>

          {/* General Error */}
          {errors.general && (
            <ErrorMessage message={errors.general} style={styles.errorContainer} />
          )}

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.register.emailLabel}</Text>
              <TextInput
                ref={(ref) => { inputRefs.current.email = ref; }}
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder={t.register.emailPlaceholder}
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

            {/* Display Name Field */}
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.register.passwordLabel}</Text>
              <TextInput
                ref={(ref) => { inputRefs.current.password = ref; }}
                style={[styles.input, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder={t.register.passwordPlaceholder}
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

            {/* Confirm Password Field */}
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

            {/* Sports Selection */}
            <View style={styles.sportsSection}>
              <Text style={styles.sportsLabel}>{t.register.favoriteSports}</Text>
              <Text style={styles.sportsSubtitle}>{t.register.selectSports}</Text>
              <View style={styles.sportsContainer}>
                {sports.map((sport) => {
                  const isSelected = formData.favoriteSports.includes(sport);
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
                <Text style={styles.submitButtonText}>{t.register.createAccount}</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                {t.register.alreadyHaveAccount}{' '}
                <TouchableOpacity onPress={onLogin}>
                  <Text style={styles.loginLink}>{t.register.signIn}</Text>
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
    marginBottom: 16,
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
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
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
    marginBottom: 16,
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
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  loginSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '400',
  },
  loginLink: {
    fontWeight: '600',
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
});
