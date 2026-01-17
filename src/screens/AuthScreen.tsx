import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, Animated, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm, SocialLoginButtons, PasswordResetModal } from '../components/auth';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();
  const { user } = useAuth(); // Removed non-existent sendPasswordReset for now
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
    Alert.alert('Authentication Error', error?.message || 'An error occurred during authentication');
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

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
      </Animated.ScrollView>

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
    // Moved padding to scrollView contentContainer
  },
  socialButtons: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

