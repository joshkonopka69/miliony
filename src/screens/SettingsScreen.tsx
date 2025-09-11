import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';

export default function SettingsScreen() {
  const navigation = useAppNavigation();

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContainer}>
              {renderSettingItem(
                'Edit Profile',
                () => navigation.navigate(ROUTES.PROFILE)
              )}
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
                  <Text style={styles.languageText}>English</Text>
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
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181611',
    letterSpacing: -0.5,
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

