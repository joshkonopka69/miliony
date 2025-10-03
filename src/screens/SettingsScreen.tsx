import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, StatusBar, Animated, Dimensions } from 'react-native';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';
import { useTranslation } from '../contexts/TranslationContext';

const { width } = Dimensions.get('window');

// Custom SM Logo Component
const SMLogo = ({ size = 40 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function SettingsScreen() {
  const navigation = useAppNavigation();
  const { t, language, availableLanguages } = useTranslation();
  
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

  // Refresh screen when language changes
  useEffect(() => {
    console.log('SettingsScreen: Language changed to:', language);
    // Force re-render when language changes
  }, [language]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => navigation.navigate('Welcome')
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            navigation.navigate('Welcome');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    showDivider: boolean = true
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, showDivider && styles.settingItemWithDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingTitle}>{title}</Text>
      {rightComponent || <Text style={styles.chevronIcon}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header with Logo and Title */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <SMLogo size={40} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.content}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContainer}>
              {renderSettingItem(
                'Favorite Sports',
                () => console.log('Favorite Sports pressed')
              )}
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.sectionContainer}>
              {renderSettingItem(
                'Language',
                () => navigation.navigate(ROUTES.LANGUAGE),
                <View style={styles.languageContainer}>
                  <Text style={styles.languageText}>
                    {availableLanguages.find(lang => lang.code === language)?.name || 'English'}
                  </Text>
                  <Text style={styles.chevronIcon}>›</Text>
                </View>,
                false
              )}
            </View>
          </View>

          {/* Legal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <View style={styles.sectionContainer}>
              {renderSettingItem(
                'Terms of Service',
                () => navigation.navigate(ROUTES.TERMS_OF_SERVICE)
              )}
              {renderSettingItem(
                'Privacy Policy',
                () => navigation.navigate(ROUTES.PRIVACY_POLICY)
              )}
            </View>
          </View>

          {/* Development Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Development</Text>
            <View style={styles.sectionContainer}>
              {renderSettingItem(
                'Backend Test',
                () => navigation.navigate('BackendTest'),
                <Text style={styles.chevronIcon}>›</Text>
              )}
            </View>
          </View>

          {/* Danger Zone Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
            <View style={styles.dangerContainer}>
              {renderSettingItem(
                'Delete Account',
                handleDeleteAccount,
                <Text style={styles.dangerChevron}>›</Text>,
                false
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Logout Button */}
      <Animated.View 
        style={[
          styles.logoutContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
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
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#181611',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181611',
    letterSpacing: -0.015,
    paddingBottom: 8,
  },
  dangerTitle: {
    color: '#dc2626', // text-red-600
  },
  sectionContainer: {
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: 8,
    overflow: 'hidden',
  },
  dangerContainer: {
    backgroundColor: '#fef2f2', // bg-red-50
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  settingItemWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // divide-gray-100
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#181611',
  },
  chevronIcon: {
    fontSize: 20,
    color: '#9ca3af', // text-gray-400
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#6b7280', // text-gray-500
  },
  dangerChevron: {
    fontSize: 20,
    color: '#ef4444', // text-red-500
  },
  logoutContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

