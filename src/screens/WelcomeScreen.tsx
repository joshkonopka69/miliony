import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Animated, Dimensions, Modal } from 'react-native';
import { useAppNavigation } from '../navigation/hooks-only';
import { useTranslation, Language } from '../contexts/TranslationContext';

const { width } = Dimensions.get('window');

// Custom SM Logo Component
const SMLogo = ({ size = 80 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

// Custom Google Icon Component - Simple and clean
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <View style={[styles.googleIconContainer, { width: size, height: size }]}>
    <View style={styles.googleIcon}>
      <Text style={[styles.googleIconText, { fontSize: size * 0.7 }]}>G</Text>
    </View>
  </View>
);

// Custom Apple Icon Component - Black square icon
const AppleIcon = ({ size = 20 }: { size?: number }) => (
  <View style={[styles.appleIconContainer, { width: size, height: size }]}>
    <View style={styles.appleIcon}>
      <View style={[styles.appleSquare, {
        width: size * 0.8,
        height: size * 0.8,
        backgroundColor: '#000000',
        borderRadius: size * 0.1,
      }]} />
    </View>
  </View>
);

export default function WelcomeScreen() {
  const navigation = useAppNavigation();
  const { t, language, setLanguage, availableLanguages } = useTranslation();
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

  const handleGoogleAuth = () => {
    navigation.navigate('Auth');
  };

  const handleAppleAuth = () => {
    navigation.navigate('Auth');
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

  const handleTestScreen = () => {
    navigation.navigate('EventTest');
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
          <SMLogo size={72} />
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
              <GoogleIcon size={20} />
              <Text style={styles.googleButtonText}>{t.welcome.continueWithGoogle}</Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity 
              style={styles.appleButton}
              onPress={handleAppleAuth}
              activeOpacity={0.7}
            >
              <AppleIcon size={20} />
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

            {/* Test Button */}
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestScreen}
              activeOpacity={0.8}
            >
              <Text style={styles.testIcon}>🧪</Text>
              <Text style={styles.testButtonText}>Test Events & Chat</Text>
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
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -1,
    fontFamily: 'System',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  googleIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4285F4',
    textAlign: 'center',
    lineHeight: 12,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appleIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleSquare: {
    alignItems: 'center',
    justifyContent: 'center',
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
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    backgroundColor: '#6c757d',
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  testIcon: {
    fontSize: 20,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.24,
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

