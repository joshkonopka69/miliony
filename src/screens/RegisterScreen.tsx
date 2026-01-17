import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { useTranslation } from '../contexts/TranslationContext';
import { RegisterForm, EmailVerificationModal } from '../components/auth';


const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
    setShowEmailVerification(true);
  };

  const handleAuthError = (error: any) => {
    Alert.alert('Registration Error', error.message || 'An error occurred during registration');
  };

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerification(false);
    navigation.navigate('Map');
  };

  const handleEmailVerificationError = (error: any) => {
    Alert.alert('Error', error.message || 'Failed to send verification email');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t.auth.createAccount}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
          onLogin={() => navigation.goBack()}
          style={styles.authForm}
        />
      </Animated.ScrollView>

      <EmailVerificationModal
        visible={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onSuccess={handleEmailVerificationSuccess}
        onError={handleEmailVerificationError}
        userEmail={userEmail}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  authForm: {
    // Moved padding to scrollView contentContainer
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});