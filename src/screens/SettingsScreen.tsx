import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Wyloguj się',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Wyloguj', 
          style: 'destructive',
          onPress: () => navigation.navigate('Welcome')
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {rightComponent || <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Ustawienia</Text>
      
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil</Text>
        {renderSettingItem(
          'Edytuj profil',
          'Zmień swoje dane osobowe',
          '👤',
          () => navigation.navigate('ProfileCreation')
        )}
        {renderSettingItem(
          'Moje sporty',
          'Zarządzaj wybranymi sportami',
          '⚽',
          () => navigation.navigate('SportSelection')
        )}
        {renderSettingItem(
          'Moje wydarzenia',
          'Zobacz swoje wydarzenia',
          '📅',
          () => navigation.navigate('Events')
        )}
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencje</Text>
        {renderSettingItem(
          'Powiadomienia',
          'Zarządzaj powiadomieniami',
          '🔔',
          undefined,
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />
        )}
        {renderSettingItem(
          'Usługi lokalizacji',
          'Dostęp do lokalizacji',
          '📍',
          undefined,
          <Switch
            value={locationServices}
            onValueChange={setLocationServices}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
            thumbColor={locationServices ? '#fff' : '#f4f3f4'}
          />
        )}
        {renderSettingItem(
          'Tryb ciemny',
          'Ciemny motyw aplikacji',
          '🌙',
          undefined,
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />
        )}
        {renderSettingItem(
          'Automatyczna synchronizacja',
          'Sync danych w tle',
          '🔄',
          undefined,
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
            thumbColor={autoSync ? '#fff' : '#f4f3f4'}
          />
        )}
      </View>

      {/* App Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aplikacja</Text>
        {renderSettingItem(
          'O aplikacji',
          'Wersja 1.0.0',
          'ℹ️'
        )}
        {renderSettingItem(
          'Pomoc i wsparcie',
          'Centrum pomocy',
          '❓'
        )}
        {renderSettingItem(
          'Polityka prywatności',
          'Regulamin i prywatność',
          '🔒'
        )}
        {renderSettingItem(
          'Warunki użytkowania',
          'Regulamin aplikacji',
          '📋'
        )}
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Wyloguj się</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SportMap v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 Wszystkie prawa zastrzeżone</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  settingArrow: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    margin: 15,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
});

