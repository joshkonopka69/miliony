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

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>
              Your privacy is important to us. Please read this policy carefully.
            </Text>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect information you provide directly to us, such as when you create an account, participate in activities, or contact us for support.
              </Text>
              <Text style={styles.subsectionTitle}>Personal Information:</Text>
              <Text style={styles.listItem}>• Name and email address</Text>
              <Text style={styles.listItem}>• Profile information and preferences</Text>
              <Text style={styles.listItem}>• Location data (with your permission)</Text>
              <Text style={styles.listItem}>• Photos and content you share</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use the information we collect to:
              </Text>
              <Text style={styles.listItem}>• Provide, maintain, and improve our services</Text>
              <Text style={styles.listItem}>• Process transactions and send related information</Text>
              <Text style={styles.listItem}>• Send technical notices and support messages</Text>
              <Text style={styles.listItem}>• Respond to your comments and questions</Text>
              <Text style={styles.listItem}>• Communicate with you about products and services</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Information Sharing</Text>
              <Text style={styles.sectionText}>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Data Security</Text>
              <Text style={styles.sectionText}>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Cookies and Tracking</Text>
              <Text style={styles.sectionText}>
                We use cookies and similar tracking technologies to enhance your experience and analyze how our service is used.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Your Rights</Text>
              <Text style={styles.sectionText}>
                You have the right to:
              </Text>
              <Text style={styles.listItem}>• Access your personal information</Text>
              <Text style={styles.listItem}>• Correct inaccurate information</Text>
              <Text style={styles.listItem}>• Delete your personal information</Text>
              <Text style={styles.listItem}>• Object to processing of your information</Text>
              <Text style={styles.listItem}>• Data portability</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
              <Text style={styles.sectionText}>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
              <Text style={styles.sectionText}>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have any questions about this Privacy Policy, please contact us at:
              </Text>
              <Text style={styles.contactEmail}>privacy@miliony.com</Text>
              <Text style={styles.sectionText}>
                Or by mail at:
              </Text>
              <Text style={styles.contactAddress}>
                123 Sports Street{'\n'}
                City, State 12345{'\n'}
                United States
              </Text>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181611',
    marginTop: 12,
    marginBottom: 8,
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
  contactAddress: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginTop: 8,
    fontStyle: 'italic',
  },
});