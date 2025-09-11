import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { useAppNavigation } from '../navigation';

export default function PrivacyPolicyScreen() {
  const navigation = useAppNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
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
            <Text style={styles.listItem}>• Communicate with you about products, services, and events</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </Text>
            <Text style={styles.listItem}>• With your explicit consent</Text>
            <Text style={styles.listItem}>• To comply with legal obligations</Text>
            <Text style={styles.listItem}>• To protect our rights and safety</Text>
            <Text style={styles.listItem}>• In connection with a business transfer</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Location Information</Text>
            <Text style={styles.sectionText}>
              We may collect and use location information to provide location-based services. You can control location sharing through your device settings or app permissions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
            <Text style={styles.sectionText}>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
            <Text style={styles.sectionText}>
              Our application may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:
            </Text>
            <Text style={styles.listItem}>• Access your personal information</Text>
            <Text style={styles.listItem}>• Correct inaccurate information</Text>
            <Text style={styles.listItem}>• Delete your account and data</Text>
            <Text style={styles.listItem}>• Opt out of marketing communications</Text>
            <Text style={styles.listItem}>• Data portability</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. International Transfers</Text>
            <Text style={styles.sectionText}>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your personal information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>privacy@miliony.com</Text>
            <Text style={styles.contactText}>
              Or write to us at:
            </Text>
            <Text style={styles.contactAddress}>
              Miliony Inc.{'\n'}
              123 Sports Street{'\n'}
              City, State 12345{'\n'}
              United States
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // border-gray-100
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#374151', // text-gray-700
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // pr-10 equivalent
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
    textAlign: 'center',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // text-gray-700
    marginTop: 8,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
    marginLeft: 8,
    marginBottom: 4,
  },
  contactSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#10b981', // text-emerald-500
    fontWeight: '500',
    marginBottom: 8,
  },
  contactAddress: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    lineHeight: 24,
  },
});
