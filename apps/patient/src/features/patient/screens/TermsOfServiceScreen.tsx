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
    title: '1. Acceptance of Terms',
    icon: 'checkmark-circle-outline',
    content: `By downloading, installing, or using HealthCare+ ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.

These terms constitute a legally binding agreement between you and HealthCare+ Technologies Pvt. Ltd. ("we", "us", "our").`,
  },
  {
    title: '2. Eligibility',
    icon: 'person-outline',
    content: `To use our services, you must:

• Be at least 18 years of age (or have parental/guardian consent)
• Provide accurate registration information
• Maintain the security of your account credentials
• Not use the App for any unlawful purpose

For family accounts, the primary account holder is responsible for all activity under their account.`,
  },
  {
    title: '3. Healthcare Services',
    icon: 'medkit-outline',
    content: `HealthCare+ is a platform connecting patients with healthcare providers. Important disclaimers:

• We are NOT a healthcare provider. We facilitate connections between patients and independent healthcare professionals.
• Doctors, labs, and pharmacies on our platform are independent practitioners/entities.
• The App does not replace emergency medical services. In an emergency, call 112 or visit the nearest hospital.
• Treatment decisions are between you and your healthcare provider.
• We do not guarantee the availability of any specific doctor, medicine, or service.`,
  },
  {
    title: '4. Appointments & Bookings',
    icon: 'calendar-outline',
    content: `When booking appointments through our platform:

• Appointment requests are subject to doctor availability and confirmation.
• Cancellation policies vary by provider. Check individual provider policies.
• No-shows may result in charges as per the provider's policy.
• Video consultations require a stable internet connection; we are not responsible for connectivity issues.
• Appointment fees are set by healthcare providers; we may charge a platform/convenience fee.`,
  },
  {
    title: '5. Pharmacy & Orders',
    icon: 'cart-outline',
    content: `For medicine orders through the App:

• Prescription medicines require a valid prescription from a licensed doctor.
• Medicine availability and prices are set by partner pharmacies.
• Orders once confirmed may be subject to cancellation fees.
• Delivery timelines are estimates and may vary due to external factors.
• We verify pharmacy licenses but do not manufacture or directly sell medicines.
• Returns and refunds are subject to applicable pharmacy regulations.`,
  },
  {
    title: '6. Payments & Refunds',
    icon: 'card-outline',
    content: `Payment terms:

• All payments are processed securely through Razorpay.
• Prices are displayed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.
• Refunds for cancelled appointments/orders are processed within 5-7 business days.
• We reserve the right to modify pricing with prior notice.
• Failed transactions will be reversed within 3-5 business days.
• Payment disputes should be reported within 30 days of the transaction.`,
  },
  {
    title: '7. User Responsibilities',
    icon: 'shield-outline',
    content: `As a user, you agree to:

• Provide accurate and complete health information
• Not misuse or exploit the platform
• Not impersonate another person
• Not share your account credentials
• Respect healthcare providers and other users
• Not upload malicious content or attempt to compromise app security
• Comply with all applicable laws and regulations`,
  },
  {
    title: '8. Intellectual Property',
    icon: 'bulb-outline',
    content: `All content, trademarks, and intellectual property in the App are owned by HealthCare+ Technologies Pvt. Ltd. or its licensors.

• You may not copy, modify, or distribute any part of the App.
• Health records and personal data remain your property.
• User-generated content (reviews, ratings) grants us a license to display it on the platform.
• The HealthCare+ name, logo, and branding are our registered trademarks.`,
  },
  {
    title: '9. Limitation of Liability',
    icon: 'alert-circle-outline',
    content: `To the maximum extent permitted by law:

• We are not liable for any medical outcomes resulting from services obtained through the App.
• Our total liability shall not exceed the amount paid by you in the preceding 12 months.
• We are not responsible for third-party service quality (doctors, labs, pharmacies).
• We do not guarantee uninterrupted or error-free service.
• Force majeure events relieve us of obligations during their duration.`,
  },
  {
    title: '10. Termination',
    icon: 'close-circle-outline',
    content: `We may suspend or terminate your account if:

• You violate these Terms of Service
• You engage in fraudulent or harmful activity
• Your account is inactive for more than 24 months
• Required by law or regulatory authority

Upon termination, you may request export of your health records within 30 days.`,
  },
  {
    title: '11. Governing Law',
    icon: 'globe-outline',
    content: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.

For arbitration: Disputes may be resolved through arbitration under the Arbitration and Conciliation Act, 1996.`,
  },
  {
    title: '12. Contact Us',
    icon: 'mail-outline',
    content: `For questions about these Terms of Service:

Email: legal@healthcare.com
Phone: 1800-XXX-XXXX (Mon-Fri, 9am-6pm IST)
Address: HealthCare+ Technologies Pvt. Ltd., 123 Medical Tower, Bangalore, Karnataka 560001`,
  },
];

export default function TermsOfServiceScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Terms of Service" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header Banner */}
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="document-text" size={40} color={colors.primary} />
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Terms of Service</Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Effective: June 1, 2025 · Version 2.0
            </Text>
          </View>
        </View>

        {/* Intro */}
        <Text style={[styles.intro, { color: colors.textSecondary, backgroundColor: colors.card, borderColor: colors.border }]}>
          Please read these Terms of Service carefully before using HealthCare+. By using our services, you agree to be bound by these terms and our Privacy Policy.
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
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              {isOpen && (
                <View style={[styles.sectionContent, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {section.content}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            By using HealthCare+, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            &copy; 2025 HealthCare+ Technologies Pvt. Ltd. All rights reserved.
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
