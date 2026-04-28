import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePurchases } from '../context/PurchasesContext';

// Optional deps (the UI will still render without them installed)
function getLucideIcon(name: 'Crown' | 'Check', size: number, color: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const lucide = require('lucide-react-native');
    const Comp = lucide?.[name];
    if (!Comp) return null;
    return <Comp width={size} height={size} color={color} />;
  } catch {
    return null;
  }
}

function MotiCard({ children }: { children: React.ReactNode }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MotiView } = require('moti');
    return (
      <MotiView
        from={{ translateY: 24, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        {children}
      </MotiView>
    );
  } catch {
    return <View style={{ transform: [{ translateY: 0 }] }}>{children}</View>;
  }
}

export default function PaywallScreen() {
  const { isPro, isReady, isBusy, monthlyPackage, purchasePackage, restorePurchases } =
    usePurchases();

  const priceCopy = useMemo(() => {
    const price = monthlyPackage?.storeProduct?.priceString;
    if (price) return `${price}/mo after trial. Cancel anytime.`;
    return '$4.99/mo after trial. Cancel anytime.';
  }, [monthlyPackage?.storeProduct?.priceString]);

  const canPurchase = isReady && !!monthlyPackage && !isBusy;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0f172a', '#020617']} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              {getLucideIcon('Crown', 22, '#FCD34D') || <Text style={styles.fallbackIcon}>👑</Text>}
            </View>
            <Text style={styles.title}>Unlock PRO</Text>
            <Text style={styles.subtitle}>
              Unlimited clients, automatic reminders, and revenue analytics.
            </Text>
          </View>

          <View style={styles.features}>
            {[
              'Unlimited Clients',
              'Automatic SMS reminders',
              'Revenue analytics dashboard',
              'Priority support',
              'Exportable reports',
            ].map((label) => (
              <View key={label} style={styles.featureRow}>
                <View style={styles.checkWrap}>
                  {getLucideIcon('Check', 18, '#34D399') || (
                    <Text style={{fontSize: 14, color: '#34D399'}}>✓</Text>
                  )}
                </View>
                <Text style={styles.featureText}>{label}</Text>
              </View>
            ))}
          </View>

          <MotiCard>
            <View style={styles.cardOuter}>
              <LinearGradient
                colors={['rgba(255,215,0,0.18)', 'rgba(59,130,246,0.10)', 'rgba(15,23,42,0)']}
                style={styles.cardGlow}
              />

              <View style={styles.card}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>7-DAY FREE TRIAL</Text>
                </View>

                <Text style={styles.cardTitle}>Start 7-Day Free Trial</Text>
                <Text style={styles.cardSubtitle}>{priceCopy}</Text>

                <Pressable
                  style={[styles.cta, !canPurchase && styles.ctaDisabled]}
                  disabled={!canPurchase}
                  onPress={() => monthlyPackage && purchasePackage(monthlyPackage)}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#0b1220" />
                  ) : (
                    <Text style={styles.ctaText}>Continue</Text>
                  )}
                </Pressable>

                {!monthlyPackage && (
                  <Text style={styles.warning}>
                    Subscription products not loaded yet. Check your RevenueCat Offering and package
                    identifier ($rc_monthly).
                  </Text>
                )}
              </View>
            </View>
          </MotiCard>

          <View style={styles.footer}>
            <Pressable style={styles.restore} disabled={isBusy} onPress={restorePurchases}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </Pressable>

            <View style={styles.legalRow}>
              <Text style={styles.legalText}>By continuing you agree to </Text>
              <Pressable
                onPress={() => {
                  // Replace with real links/screens when ready
                  void Linking.openURL('https://example.com/terms');
                }}
              >
                <Text style={styles.legalLink}>Terms</Text>
              </Pressable>
              <Text style={styles.legalText}> & </Text>
              <Pressable
                onPress={() => {
                  // Replace with real links/screens when ready
                  void Linking.openURL('https://example.com/privacy');
                }}
              >
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </Pressable>
              <Text style={styles.legalText}>.</Text>
            </View>

            {isPro && <Text style={styles.proTag}>PRO is active on this account.</Text>}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  bg: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 18,
  },
  header: { gap: 10 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252,211,77,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.18)',
  },
  fallbackIcon: { color: '#FCD34D', fontSize: 18 },
  title: { color: '#F8FAFC', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(226,232,240,0.82)', fontSize: 15, lineHeight: 22 },

  features: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    backgroundColor: 'rgba(2,6,23,0.55)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52,211,153,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.18)',
  },
  fallbackCheck: { color: '#34D399', fontWeight: '800' },
  featureText: { color: '#E2E8F0', fontSize: 14 },

  cardOuter: { borderRadius: 22, overflow: 'hidden' },
  cardGlow: { position: 'absolute', inset: 0 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    backgroundColor: 'rgba(2,6,23,0.70)',
    padding: 18,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(250,204,21,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.32)',
  },
  badgeText: { color: '#FDE68A', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  cardTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  cardSubtitle: { color: 'rgba(226,232,240,0.82)', fontSize: 13, lineHeight: 18 },
  cta: {
    marginTop: 6,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCD34D',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#0b1220', fontSize: 16, fontWeight: '900' },
  warning: { color: 'rgba(248,113,113,0.95)', fontSize: 12, lineHeight: 18, marginTop: 4 },

  footer: { alignItems: 'center', gap: 10, paddingTop: 6 },
  restore: { paddingVertical: 10, paddingHorizontal: 14 },
  restoreText: { color: '#E2E8F0', fontSize: 14, fontWeight: '700' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  legalText: { color: 'rgba(226,232,240,0.70)', fontSize: 12 },
  legalLink: { color: '#93C5FD', fontSize: 12, fontWeight: '800' },
  proTag: { color: '#34D399', fontSize: 12, fontWeight: '800' },
});


