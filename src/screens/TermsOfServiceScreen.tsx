import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';

export default function TermsOfServiceScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing and using SportMap, you accept and agree to be bound by the terms and provision of this agreement.
        </Text>

        <Text style={styles.sectionTitle}>2. Use License</Text>
        <Text style={styles.text}>
          Permission is granted to temporarily download one copy of SportMap per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </Text>
        <Text style={styles.bulletPoint}>• modify or copy the materials</Text>
        <Text style={styles.bulletPoint}>• use the materials for any commercial purpose or for any public display</Text>
        <Text style={styles.bulletPoint}>• attempt to reverse engineer any software contained in SportMap</Text>
        <Text style={styles.bulletPoint}>• remove any copyright or other proprietary notations from the materials</Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.text}>
          When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Content</Text>
        <Text style={styles.text}>
          Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the Service, including its legality, reliability, and appropriateness.
        </Text>

        <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
        <Text style={styles.text}>
          You may not use our Service:
        </Text>
        <Text style={styles.bulletPoint}>• For any unlawful purpose or to solicit others to perform unlawful acts</Text>
        <Text style={styles.bulletPoint}>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</Text>
        <Text style={styles.bulletPoint}>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</Text>
        <Text style={styles.bulletPoint}>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</Text>

        <Text style={styles.sectionTitle}>6. Privacy Policy</Text>
        <Text style={styles.text}>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
        </Text>

        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.text}>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Disclaimer</Text>
        <Text style={styles.text}>
          The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms relating to our Service and the use of this Service.
        </Text>

        <Text style={styles.sectionTitle}>9. Governing Law</Text>
        <Text style={styles.text}>
          These Terms shall be interpreted and governed by the laws of the jurisdiction in which SportMap operates, without regard to its conflict of law provisions.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes</Text>
        <Text style={styles.text}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
        </Text>

        <Text style={styles.contactText}>
          If you have any questions about these Terms of Service, please contact us.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginLeft: 10,
    marginBottom: 5,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
