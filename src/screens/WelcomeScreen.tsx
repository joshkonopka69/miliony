import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Animated, Dimensions, Modal, Alert, Image } from 'react-native';
import { useAppNavigation } from '../navigation/hooks-only';
import { useTranslation, Language } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

// Google Icon using PNG from assets
const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <Image 
    source={require('../../assets/google.png')}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);

// Apple Icon using PNG from assets
const AppleIcon = ({ size = 24 }: { size?: number }) => (
  <Image 
    source={require('../../assets/apple.png')}
    style={{ width: size, height: size, tintColor: '#FFFFFF' }}
    resizeMode="contain"
  />
);

export default function WelcomeScreen() {
  const navigation = useAppNavigation();
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { loginWithGoogle, loginWithApple } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Staggered animation sequence for more natural feel
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGoogleAuth = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigation.navigate('Map');
      } else {
        Alert.alert('Authentication Error', result.error?.message || 'Google sign-in failed');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'An error occurred during Google sign-in');
    }
  };

  const handleAppleAuth = async () => {
    try {
      const result = await loginWithApple();
      if (result.success) {
        navigation.navigate('Map');
      } else {
        Alert.alert('Authentication Error', result.error?.message || 'Apple sign-in failed');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'An error occurred during Apple sign-in');
    }
  };

  const handleEmailAuth = () => {
    navigation.navigate('Auth');
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };

  const getCurrentLanguageName = () => {
    const currentLang = availableLanguages.find(lang => lang.code === language);
    return currentLang?.name || 'English';
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.content}>
        {/* Header with Logo and Title */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t.welcome.title}</Text>
          <Text style={styles.subtitle}>
            {t.welcome.subtitle}
          </Text>
        </Animated.View>

        {/* Authentication Section */}
        <Animated.View 
          style={[
            styles.authSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.buttonContainer}>
            {/* Google Button */}
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleAuth}
              activeOpacity={0.7}
            >
              <GoogleIcon size={24} />
              <Text style={styles.googleButtonText}>{t.welcome.continueWithGoogle}</Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity 
              style={styles.appleButton}
              onPress={handleAppleAuth}
              activeOpacity={0.7}
            >
              <AppleIcon size={24} />
              <Text style={styles.appleButtonText}>{t.welcome.continueWithApple}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Button */}
            <TouchableOpacity 
              style={styles.emailButton}
              onPress={handleEmailAuth}
              activeOpacity={0.7}
            >
              <Text style={styles.emailButtonText}>{t.welcome.signUpWithEmail}</Text>
            </TouchableOpacity>

          </View>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            {t.welcome.termsText}{' '}
            <Text style={styles.linkText}>{t.welcome.termsOfService}</Text> and{' '}
            <Text style={styles.linkText}>{t.welcome.privacyPolicy}</Text>
          </Text>

          {/* Language Selection */}
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.languageButtonText}>🌐 {getCurrentLanguageName()}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.welcome.selectLanguage}</Text>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === lang.code && styles.languageOptionTextSelected
                ]}>
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  authSection: {
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3c4043',
    letterSpacing: 0.2,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
  emailButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.2,
  },
  termsText: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  languageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  languageOptionSelected: {
    backgroundColor: '#fbbf24',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  languageOptionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    backgroundColor: '#e1e5e9',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
});

