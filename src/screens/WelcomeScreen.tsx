import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Animated } from 'react-native';
import { useAppNavigation } from '../navigation';

export default function WelcomeScreen() {
  const navigation = useAppNavigation();
  const buttonScale = useRef(new Animated.Value(1)).current;
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

  const handleButtonPress = () => {
    // Button press animation with scale effect
    Animated.sequence([
      // Scale down
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      // Scale back up
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation completes
      navigation.navigate('Auth');
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header with Language Selector */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageIcon}>🌐</Text>
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
        </View>

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
          {/* Logo Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>⚽</Text>
            </View>
          </View>

          {/* Title and Subtitle */}
          <Text style={styles.title}>SportMap</Text>
          <Text style={styles.subtitle}>Find your next game or training partner</Text>
        </Animated.View>

        {/* Footer with Get Started Button */}
        <View style={styles.footer}>
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleButtonPress}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // --bg-white
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 24,
    zIndex: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageIcon: {
    fontSize: 20,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181711', // --text-primary
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#f9d006', // --primary-color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 48,
    color: '#ffffff',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#181711', // --text-primary
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#575757', // --text-secondary
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 32,
  },
  buttonContainer: {
    width: '100%',
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: '#f9d006', // --primary-color
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181711', // --text-primary
    textAlign: 'center',
  },
});

