import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Animated } from 'react-native';
import { useAppNavigation } from '../navigation';

export default function WelcomeScreen() {
  const navigation = useAppNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Fade in animation on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleAuth = () => {
    // TODO: Implement Google authentication
    navigation.navigate('Auth');
  };

  const handleAppleAuth = () => {
    // TODO: Implement Apple authentication
    navigation.navigate('Auth');
  };

  const handleEmailAuth = () => {
    navigation.navigate('Auth');
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.content}>
        {/* Main Content */}
        <Animated.View 
          style={[
            styles.main,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Location Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.locationIcon}>📍</Text>
          </View>

          {/* Title and Subtitle */}
          <Text style={styles.title}>Sportsmap</Text>
          <Text style={styles.subtitle}>Find games and players nearby</Text>
        </Animated.View>

        {/* Authentication Buttons */}
        <View style={styles.authSection}>
          <View style={styles.buttonContainer}>
            {/* Google Button */}
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity 
              style={styles.appleButton}
              onPress={handleAppleAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.appleIcon}>🍎</Text>
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            {/* Email Button */}
            <TouchableOpacity 
              style={styles.emailButton}
              onPress={handleEmailAuth}
              activeOpacity={0.8}
            >
              <Text style={styles.emailIcon}>✉️</Text>
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
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
    paddingTop: 64,
    paddingBottom: 32,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 64,
    color: '#f9bc06',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#181611',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#575757',
    textAlign: 'center',
    lineHeight: 24,
  },
  authSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 384,
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#575757',
    letterSpacing: 0.24,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  appleIcon: {
    fontSize: 20,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.24,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    backgroundColor: '#f9bc06',
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  emailIcon: {
    fontSize: 20,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181611',
    letterSpacing: 0.24,
  },
  termsText: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 320,
    lineHeight: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});

