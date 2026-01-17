import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation, Language } from '../contexts/TranslationContext';
import { SMLogo } from '../components';

const { width } = Dimensions.get('window');

export default function LanguageScreen() {
  const navigation = useAppNavigation();
  const { language, setLanguage, availableLanguages, t } = useTranslation();

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageSelect = (langCode: Language) => {
    console.log('LanguageScreen: Setting language to:', langCode);
    setLanguage(langCode);
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
        <Text style={styles.headerTitle}>{t.languageScreen.headerTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo and Title */}
          <View style={styles.titleSection}>
            <SMLogo size={50} style={{ marginBottom: 16 }} />
            <Text style={styles.title}>{t.languageScreen.title}</Text>
            <Text style={styles.subtitle}>
              {t.languageScreen.subtitle}
            </Text>
          </View>

          {/* Language Selection Section */}
          <View style={styles.languageSection}>
            <View style={styles.languagesContainer}>
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    language === lang.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.languageName,
                    language === lang.code && styles.selectedLanguageName
                  ]}>
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#181611',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#181611',
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#181611',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  languageSection: {
    flex: 1,
  },
  languagesContainer: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedLanguageItem: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181611',
  },
  selectedLanguageName: {
    color: '#000000',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
});