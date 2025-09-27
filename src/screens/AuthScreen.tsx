import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, StatusBar, Animated, Dimensions } from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm, SocialLoginButtons, PasswordResetModal } from '../components/auth';

const { width } = Dimensions.get('window');

// Custom SM Logo Component (same as WelcomeScreen)
const SMLogo = ({ size = 60 }: { size?: number }) => (
  <View style={[logoStyles.logoContainer, { width: size, height: size }]}>
    <View style={logoStyles.logoBackground}>
      <Text style={[logoStyles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function AuthScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { sendPasswordReset } = useAuth();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  const handleAuthSuccess = () => {
    navigation.navigate('Map');
  };

  const handleAuthError = (error: any) => {
    Alert.alert('Authentication Error', error.message || 'An error occurred during authentication');
  };

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false);
    Alert.alert('Success', 'Password reset email sent! Check your inbox.');
  };

  const handlePasswordResetError = (error: any) => {
    Alert.alert('Error', error.message || 'Failed to send password reset email');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <LoginForm
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
        style={styles.authForm}
      />
      
      <SocialLoginButtons
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        style={styles.socialButtons}
      />
      
      <PasswordResetModal
        visible={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onSuccess={handlePasswordResetSuccess}
        onError={handlePasswordResetError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  authForm: {
    flex: 1,
  },
  socialButtons: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});

const logoStyles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
});
