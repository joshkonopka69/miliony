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

export default function TermsOfServiceScreen() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.sectionText}>
              Permission is granted to temporarily download one copy of the materials on this application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Text>
            <Text style={styles.listItem}>• Modify or copy the materials</Text>
            <Text style={styles.listItem}>• Use the materials for any commercial purpose or for any public display</Text>
            <Text style={styles.listItem}>• Attempt to reverse engineer any software contained in the application</Text>
            <Text style={styles.listItem}>• Remove any copyright or other proprietary notations from the materials</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.sectionText}>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
            <Text style={styles.sectionText}>
              You may not use our application:
            </Text>
            <Text style={styles.listItem}>• For any unlawful purpose or to solicit others to perform unlawful acts</Text>
            <Text style={styles.listItem}>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</Text>
            <Text style={styles.listItem}>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</Text>
            <Text style={styles.listItem}>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</Text>
            <Text style={styles.listItem}>• To submit false or misleading information</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Content</Text>
            <Text style={styles.sectionText}>
              Our application allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the application, including its legality, reliability, and appropriateness.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the application, to understand our practices.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Termination</Text>
            <Text style={styles.sectionText}>
              We may terminate or suspend your account and bar access to the application immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Disclaimer</Text>
            <Text style={styles.sectionText}>
              The information on this application is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our application and the use of this application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Governing Law</Text>
            <Text style={styles.sectionText}>
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which our company is located, without regard to its conflict of law provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Information</Text>
            <Text style={styles.contactText}>
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>support@miliony.com</Text>
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
  },
});



