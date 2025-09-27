import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView, 
  StatusBar, 
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { RegisterForm, SocialLoginButtons, EmailVerificationModal } from '../components/auth';

const { width } = Dimensions.get('window');

// Custom SM Logo Component (consistent with other screens)
const SMLogo = ({ size = 50 }: { size?: number }) => (
  <View style={[logoStyles.logoContainer, { width: size, height: size }]}>
    <View style={logoStyles.logoBackground}>
      <Text style={[logoStyles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { sendEmailVerification } = useAuth();
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <RegisterForm
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        onLogin={() => navigation.goBack()}
        style={styles.authForm}
      />
      
      <SocialLoginButtons
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        style={styles.socialButtons}
      />
      
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
});