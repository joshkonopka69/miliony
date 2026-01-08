import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { SMLogo } from '../components';

const { width } = Dimensions.get('window');

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
            <SMLogo size={50} style={{ marginBottom: 16 }} />
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>
              How we collect, use, and protect your information
            </Text>
            <Text style={styles.lastUpdated}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Content Sections */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.text}>
              We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.
            </Text>
            <Text style={styles.subsectionTitle}>Personal Information:</Text>
            <Text style={styles.bulletPoint}>• Name and email address</Text>
            <Text style={styles.bulletPoint}>• Profile information and preferences</Text>
            <Text style={styles.bulletPoint}>• Location data (with your permission)</Text>
            <Text style={styles.bulletPoint}>• Sports interests and activity preferences</Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.text}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
            <Text style={styles.bulletPoint}>• Send technical notices, updates, and support messages</Text>
            <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
            <Text style={styles.bulletPoint}>• Personalize your experience</Text>

            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.text}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </Text>
            <Text style={styles.subsectionTitle}>We may share your information:</Text>
            <Text style={styles.bulletPoint}>• With your consent</Text>
            <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
            <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
            <Text style={styles.bulletPoint}>• In connection with a business transfer</Text>

            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.text}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Text>

            <Text style={styles.sectionTitle}>5. Location Data</Text>
            <Text style={styles.text}>
              SportMap uses location data to show you nearby sports facilities and events. You can control location sharing in your device settings. We only collect location data when you grant permission.
            </Text>

            <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
            <Text style={styles.text}>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie settings in your browser.
            </Text>

            <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
            <Text style={styles.text}>
              Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
            </Text>

            <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            <Text style={styles.text}>
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
            </Text>

            <Text style={styles.sectionTitle}>9. Your Rights</Text>
            <Text style={styles.text}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Delete your account and data</Text>
            <Text style={styles.bulletPoint}>• Opt out of marketing communications</Text>
            <Text style={styles.bulletPoint}>• Withdraw consent for data processing</Text>

            <Text style={styles.sectionTitle}>10. Data Retention</Text>
            <Text style={styles.text}>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </Text>

            <Text style={styles.sectionTitle}>11. International Transfers</Text>
            <Text style={styles.text}>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this policy.
            </Text>

            <Text style={styles.sectionTitle}>12. Changes to This Policy</Text>
            <Text style={styles.text}>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </Text>

            <Text style={styles.contactText}>
              If you have any questions about this Privacy Policy, please contact us at privacy@sportmap.com
            </Text>
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
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  contentSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181611',
    marginTop: 24,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181611',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginLeft: 12,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginTop: 24,
    marginBottom: 32,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
