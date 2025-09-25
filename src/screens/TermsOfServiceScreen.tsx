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
  Dimensions
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';

const { width } = Dimensions.get('window');

// Custom SM Logo Component
const SMLogo = ({ size = 50 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function TermsOfServiceScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
            <SMLogo size={50} />
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.subtitle}>
              Please read these terms carefully before using our service
            </Text>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By accessing and using SportMap, you accept and agree to be bound by the terms and provision of this agreement.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Use License</Text>
              <Text style={styles.sectionText}>
                Permission is granted to temporarily download one copy of SportMap for personal, non-commercial transitory viewing only.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.sectionText}>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
              <Text style={styles.sectionText}>
                You may not use our service:
              </Text>
              <Text style={styles.listItem}>• For any unlawful purpose or to solicit others to perform unlawful acts</Text>
              <Text style={styles.listItem}>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</Text>
              <Text style={styles.listItem}>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</Text>
              <Text style={styles.listItem}>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Content</Text>
              <Text style={styles.sectionText}>
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
              <Text style={styles.sectionText}>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Changes</Text>
              <Text style={styles.sectionText}>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Contact Information</Text>
              <Text style={styles.sectionText}>
                If you have any questions about these Terms of Service, please contact us at:
              </Text>
              <Text style={styles.contactEmail}>support@miliony.com</Text>
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
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
  contentSection: {
    flex: 1,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181611',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 4,
    paddingLeft: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#fbbf24',
    fontWeight: '600',
    marginTop: 8,
  },
});