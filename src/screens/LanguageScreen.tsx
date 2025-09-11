import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
}

export default function LanguageScreen() {
  const navigation = useAppNavigation();
  
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages: Language[] = [
    {
      id: 'en',
      name: 'English',
      nativeName: 'English',
      code: 'en',
      flag: '🇺🇸',
    },
    {
      id: 'pl',
      name: 'Polish',
      nativeName: 'Polski',
      code: 'pl',
      flag: '🇵🇱',
    },
    {
      id: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      code: 'es',
      flag: '🇪🇸',
    },
    {
      id: 'fr',
      name: 'French',
      nativeName: 'Français',
      code: 'fr',
      flag: '🇫🇷',
    },
    {
      id: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      code: 'de',
      flag: '🇩🇪',
    },
    {
      id: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      code: 'it',
      flag: '🇮🇹',
    },
    {
      id: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      code: 'pt',
      flag: '🇵🇹',
    },
    {
      id: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      code: 'ru',
      flag: '🇷🇺',
    },
    {
      id: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      code: 'ja',
      flag: '🇯🇵',
    },
    {
      id: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      code: 'ko',
      flag: '🇰🇷',
    },
    {
      id: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      code: 'zh',
      flag: '🇨🇳',
    },
    {
      id: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      code: 'ar',
      flag: '🇸🇦',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language.id);
    
    // Simulate language change
    Alert.alert(
      'Language Changed',
      `App language has been changed to ${language.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Here you would typically save the language preference
            // and reload the app with the new language
            console.log('Language changed to:', language.code);
          }
        }
      ]
    );
  };

  const renderLanguageItem = (language: Language) => {
    const isSelected = selectedLanguage === language.id;
    
    return (
      <TouchableOpacity
        key={language.id}
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => handleLanguageSelect(language)}
        activeOpacity={0.7}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{language.flag}</Text>
          <View style={styles.languageDetails}>
            <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
              {language.name}
            </Text>
            <Text style={[styles.nativeName, isSelected && styles.nativeNameSelected]}>
              {language.nativeName}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Current Language Info */}
          <View style={styles.currentLanguageSection}>
            <Text style={styles.sectionTitle}>Current Language</Text>
            <View style={styles.currentLanguageCard}>
              <Text style={styles.flag}>
                {languages.find(lang => lang.id === selectedLanguage)?.flag}
              </Text>
              <View style={styles.currentLanguageDetails}>
                <Text style={styles.currentLanguageName}>
                  {languages.find(lang => lang.id === selectedLanguage)?.name}
                </Text>
                <Text style={styles.currentNativeName}>
                  {languages.find(lang => lang.id === selectedLanguage)?.nativeName}
                </Text>
              </View>
            </View>
          </View>

          {/* Available Languages */}
          <View style={styles.languagesSection}>
            <Text style={styles.sectionTitle}>Available Languages</Text>
            <View style={styles.languagesList}>
              {languages.map(renderLanguageItem)}
            </View>
          </View>

          {/* Language Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Language Settings</Text>
            <Text style={styles.infoText}>
              Changing the language will update the app interface. Some features may require an app restart to fully apply the new language.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#27272a', // text-zinc-800
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    letterSpacing: -0.015,
    paddingRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 24,
  },
  currentLanguageSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    letterSpacing: -0.015,
    paddingBottom: 8,
  },
  currentLanguageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  currentLanguageDetails: {
    flex: 1,
  },
  currentLanguageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  currentNativeName: {
    fontSize: 14,
    color: '#71717a',
  },
  languagesSection: {
    gap: 8,
  },
  languagesList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  languageItemSelected: {
    backgroundColor: '#fef3c7', // bg-yellow-100
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  languageNameSelected: {
    color: '#18181b',
  },
  nativeName: {
    fontSize: 14,
    color: '#71717a',
  },
  nativeNameSelected: {
    color: '#71717a',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f9bc06',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#71717a',
    lineHeight: 20,
  },
});
