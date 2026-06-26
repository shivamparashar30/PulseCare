import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header } from '../../../../../../packages/shared/src/components';

const FAQS = [
  {
    category: 'Appointments',
    items: [
      { q: 'How do I book an appointment?', a: 'Go to the Doctors tab, select your preferred doctor, choose an available date and time slot, and proceed to payment. Your appointment will be confirmed instantly.' },
      { q: 'Can I reschedule or cancel my appointment?', a: 'Yes, you can reschedule or cancel your appointment up to 2 hours before the scheduled time. Go to Appointments tab and select the appointment to manage it.' },
      { q: 'What happens if a doctor is unavailable?', a: 'If a doctor becomes unavailable, we\'ll notify you immediately via the app and help you reschedule with the same or an alternative doctor.' },
    ],
  },
  {
    category: 'Pharmacy',
    items: [
      { q: 'How long does medicine delivery take?', a: 'Standard delivery takes 2-4 hours for in-stock items. Express delivery (within 1 hour) is available in select areas. You\'ll receive real-time tracking updates.' },
      { q: 'What is the return policy for medicines?', a: 'Medicines can be returned within 7 days of purchase if unopened and in original packaging. Temperature-sensitive and prescription medicines cannot be returned.' },
      { q: 'Can I order without a prescription?', a: 'OTC (Over-The-Counter) medicines can be ordered without a prescription. Prescription medicines require a valid prescription uploaded to the app.' },
    ],
  },
  {
    category: 'Lab Tests',
    items: [
      { q: 'How do I prepare for a lab test?', a: 'Preparation instructions are provided on each test\'s detail page. Common preparations include fasting, avoiding certain medications, or collecting the first morning sample.' },
      { q: 'When will I receive my reports?', a: 'Report delivery time varies by test. Basic blood tests typically take 4-6 hours, while advanced tests may take 24-48 hours. You\'ll receive notifications when ready.' },
      { q: 'Is home sample collection available?', a: 'Yes, we offer home sample collection in most cities. A certified phlebotomist will visit your home at your chosen time slot.' },
    ],
  },
  {
    category: 'Payments & Refunds',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and HealthCare+ wallet. All transactions are secured with 256-bit encryption.' },
      { q: 'How do I get a refund?', a: 'Refunds are processed within 5-7 business days for cancelled services. The amount is credited back to your original payment method.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use bank-grade encryption and never store your card details. All payments are processed through PCI-DSS compliant payment gateways.' },
    ],
  },
];

const CONTACT_OPTIONS = [
  { icon: 'call', label: 'Call Us', value: '1800-XXX-XXXX', color: COLORS.primary, action: () => Linking.openURL('tel:1800XXXXXXX') },
  { icon: 'chatbubbles', label: 'Live Chat', value: 'Available 24/7', color: COLORS.success, action: () => {} },
  { icon: 'mail', label: 'Email Us', value: 'support@healthcare.com', color: '#9B59B6', action: () => Linking.openURL('mailto:support@healthcare.com') },
];

export default function HelpCenterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredFaqs = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !query || item.q.toLowerCase().includes(query.toLowerCase()) || item.a.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Help Center" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero */}
        <LinearGradient colors={[COLORS.primary, '#0099FF']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="help-circle" size={40} color="rgba(255,255,255,0.9)" />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Find answers to frequently asked questions</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textPrimarySecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search your question..."
              placeholderTextColor={colors.textPrimaryTertiary}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </LinearGradient>

        {/* Contact Options */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Us</Text>
        <View style={styles.contactRow}>
          {CONTACT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={opt.action}
            >
              <View style={[styles.contactIcon, { backgroundColor: opt.color + '15' }]}>
                <Ionicons name={opt.icon as any} size={22} color={opt.color} />
              </View>
              <Text style={[styles.contactLabel, { color: colors.textPrimary }]}>{opt.label}</Text>
              <Text style={[styles.contactValue, { color: colors.textPrimarySecondary }]}>{opt.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Frequently Asked Questions</Text>
        {filteredFaqs.map(cat => (
          <View key={cat.category} style={styles.faqCategory}>
            <View style={styles.catHeader}>
              <Ionicons name="folder-open-outline" size={16} color={colors.primary} />
              <Text style={[styles.catTitle, { color: colors.primary }]}>{cat.category}</Text>
            </View>
            <View style={[styles.faqList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {cat.items.map((item, idx) => {
                const key = `${cat.category}-${idx}`;
                const isOpen = openFaq === key;
                return (
                  <View key={key}>
                    <TouchableOpacity
                      style={styles.faqRow}
                      onPress={() => setOpenFaq(isOpen ? null : key)}
                    >
                      <Text style={[styles.faqQ, { color: colors.textPrimary }]} numberOfLines={isOpen ? undefined : 1}>
                        {item.q}
                      </Text>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textPrimarySecondary} />
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                        <Text style={[styles.faqA, { color: colors.textPrimarySecondary }]}>{item.a}</Text>
                      </View>
                    )}
                    {idx < cat.items.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Still need help */}
        <View style={[styles.stillHelp, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="chatbubble-ellipses" size={32} color={colors.primary} />
          <Text style={[styles.stillHelpTitle, { color: colors.textPrimary }]}>Still need help?</Text>
          <Text style={[styles.stillHelpSub, { color: colors.textPrimarySecondary }]}>
            Our support team is available 24/7 to assist you
          </Text>
          <TouchableOpacity style={[styles.chatBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="chatbubbles" size={18} color="#fff" />
            <Text style={styles.chatBtnText}>Start Live Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: SPACING.xxl },
  hero: { margin: SPACING.md, padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', gap: SPACING.sm },
  heroTitle: { color: '#fff', fontSize: FONT_SIZES.xl, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm, width: '100%', marginTop: SPACING.sm },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', paddingHorizontal: SPACING.md, marginBottom: SPACING.md, marginTop: SPACING.sm },
  contactRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.lg },
  contactCard: { flex: 1, alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, gap: SPACING.sm },
  contactIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  contactValue: { fontSize: FONT_SIZES.xs, textAlign: 'center' },
  faqCategory: { marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  catTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  faqList: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  faqRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  faqQ: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '500' },
  faqAnswer: { padding: SPACING.md, borderTopWidth: 1 },
  faqA: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  divider: { height: 1 },
  stillHelp: { margin: SPACING.md, padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, alignItems: 'center', gap: SPACING.sm },
  stillHelpTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  stillHelpSub: { fontSize: FONT_SIZES.sm, textAlign: 'center' },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.sm },
  chatBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
});
