import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header } from '../../../../../../packages/shared/src/components';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    icon: 'information-circle-outline',
    content: `We collect information you provide directly to us, including:

• Personal identification information (name, email, phone number, date of birth)
• Health information (medical history, prescriptions, lab results, allergies)
• Payment information (processed securely via Razorpay; we do not store card numbers)
• Device information (device type, OS version, unique device identifiers)
• Usage data (features used, screens visited, actions taken in the app)
• Location data (with your permission, for finding nearby services)`,
  },
  {
    title: '2. How We Use Your Information',
    icon: 'analytics-outline',
    content: `Your information is used to:

• Provide, maintain, and improve our healthcare services
• Process appointments, orders, and payments
• Send appointment reminders and health notifications
• Personalize your experience and recommend relevant services
• Communicate service updates and important notices
• Comply with legal obligations and resolve disputes
• Detect and prevent fraudulent or unauthorized activity`,
  },
  {
    title: '3. Information Sharing',
    icon: 'share-social-outline',
    content: `We do not sell, trade, or rent your personal information. We may share information with:

• Healthcare providers: Doctors and labs you book through our platform receive necessary appointment information.
• Service partners: Pharmacies and delivery partners receive order details.
• Payment processors: Razorpay processes payments under their own privacy policy.
• Legal requirements: When required by law, court order, or government authority.
• Business transfers: In the event of a merger or acquisition, with appropriate notice.`,
  },
  {
    title: '4. Data Security',
    icon: 'shield-checkmark-outline',
    content: `We implement industry-standard security measures:

• 256-bit AES encryption for data at rest
• TLS 1.3 encryption for data in transit
• Regular security audits and penetration testing
• Two-factor authentication for account access
• Role-based access controls for staff
• HIPAA-compliant data handling practices
• Secure data centers with physical access controls`,
  },
  {
    title: '5. Your Rights',
    icon: 'person-outline',
    content: `You have the right to:

• Access: Request a copy of your personal data
• Correction: Update or correct inaccurate information
• Deletion: Request deletion of your account and data
• Portability: Export your health records in standard formats
• Opt-out: Unsubscribe from marketing communications
• Restriction: Limit how we process your information

To exercise these rights, contact us at privacy@healthcare.com`,
  },
  {
    title: '6. Health Data',
    icon: 'heart-outline',
    content: `Your health information receives special protection:

• Medical records are encrypted and access-logged
• Only authorized healthcare providers can access clinical data
• You control which health information is shared
• Health data is retained for a minimum of 7 years as required by medical regulations
• De-identified health data may be used for research to improve healthcare outcomes`,
  },
  {
    title: '7. Cookies & Tracking',
    icon: 'browsers-outline',
    content: `We use minimal tracking technologies:

• Session tokens: To keep you logged in securely
• Analytics: Anonymous usage statistics to improve the app
• Push notifications: With your explicit permission only
• Crash reporting: To fix bugs and improve stability

We do not use third-party advertising cookies or sell your data to advertisers.`,
  },
  {
    title: '8. Children\'s Privacy',
    icon: 'people-outline',
    content: `Our services are designed for users 18 years and older. We do not knowingly collect personal information from children under 18. If we become aware that a child has provided personal information, we will delete it immediately.

For family accounts, a parent or guardian must create and manage the account on behalf of minors.`,
  },
  {
    title: '9. Policy Updates',
    icon: 'refresh-outline',
    content: `We may update this policy periodically. When we make significant changes:

• We will notify you through the app with at least 30 days notice
• We will update the "Last Updated" date at the top of this policy
• Continued use after the effective date constitutes acceptance
• For material changes affecting your rights, we may require re-consent`,
  },
  {
    title: '10. Contact Us',
    icon: 'mail-outline',
    content: `For privacy-related questions or to exercise your rights:

Privacy Officer: privacy@healthcare.com
Phone: 1800-XXX-XXXX (Mon-Fri, 9am-6pm IST)
Address: HealthCare+ Privacy Team, 123 Medical Tower, Bangalore, Karnataka 560001

For data breaches or urgent security issues: security@healthcare.com`,
  },
];

export default function PrivacyPolicyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header Banner */}
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Your Privacy Matters</Text>
            <Text style={[styles.bannerSub, { color: colors.textPrimarySecondary }]}>
              Last updated: June 1, 2025 · Version 3.2
            </Text>
          </View>
        </View>

        {/* Intro */}
        <Text style={[styles.intro, { color: colors.textPrimarySecondary, backgroundColor: colors.card, borderColor: colors.border }]}>
          HealthCare+ is committed to protecting your privacy and handling your health information with the utmost care and security. This policy explains how we collect, use, and protect your personal and health data.
        </Text>

        {/* Sections */}
        {SECTIONS.map((section, idx) => {
          const isOpen = openSection === idx;
          return (
            <View key={idx} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setOpenSection(isOpen ? null : idx)}
              >
                <View style={[styles.sectionIconBox, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={section.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]} numberOfLines={isOpen ? undefined : 1}>
                  {section.title}
                </Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textPrimarySecondary} />
              </TouchableOpacity>
              {isOpen && (
                <View style={[styles.sectionContent, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sectionText, { color: colors.textPrimarySecondary }]}>
                    {section.content}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textPrimaryTertiary }]}>
            By using HealthCare+, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
          <Text style={[styles.footerText, { color: colors.textPrimaryTertiary }]}>
            © 2025 HealthCare+ Technologies Pvt. Ltd. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.sm },
  banner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, gap: SPACING.md },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  bannerSub: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  intro: { fontSize: FONT_SIZES.sm, lineHeight: 22, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderLeftWidth: 4, borderLeftColor: '#0066CC' },
  section: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  sectionIconBox: { width: 36, height: 36, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600' },
  sectionContent: { padding: SPACING.md, borderTopWidth: 1 },
  sectionText: { fontSize: FONT_SIZES.sm, lineHeight: 22 },
  footer: { paddingTop: SPACING.lg, borderTopWidth: 1, gap: SPACING.sm, alignItems: 'center' },
  footerText: { fontSize: FONT_SIZES.xs, textAlign: 'center', lineHeight: 18 },
});
