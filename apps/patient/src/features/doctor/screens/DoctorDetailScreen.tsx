import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useDoctor } from '../../../../../../packages/core/src/hooks';
import { DoctorsStackParamList } from '../../../../../../packages/core/src/types';
import { StarRating } from '../../../../../../packages/shared/src/components';

type Nav = NativeStackNavigationProp<DoctorsStackParamList, 'DoctorDetail'>;
type Route = RouteProp<DoctorsStackParamList, 'DoctorDetail'>;

const INFO_ITEMS = [
  { key: 'experience', label: 'Experience', icon: 'ribbon-outline', suffix: ' yrs' },
  { key: 'reviewCount', label: 'Reviews', icon: 'chatbubbles-outline', suffix: '+' },
  { key: 'rating', label: 'Rating', icon: 'star-outline', suffix: '/5' },
];

export default function DoctorDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctorId } = route.params;

  const { data: doctor, isLoading } = useDoctor(doctorId);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero with back button */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.spec}>{doctor.specialization}</Text>
          <Text style={styles.qual}>{doctor.qualification}</Text>
          <StarRating rating={doctor.rating} size={16} color="#facc15" showCount reviewCount={doctor.reviewCount} />
        </LinearGradient>

        {/* Stats row - floating card */}
        <View style={styles.statsRow}>
          {INFO_ITEMS.map(({ key, label, icon, suffix }) => (
            <View key={key} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name={icon as any} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                {doctor[key as keyof typeof doctor]}{suffix}
              </Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Hospital & Languages */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="business-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Hospital</Text>
              <Text style={styles.infoValue}>{doctor.hospital || 'Not specified'}</Text>
              {doctor.hospitalAddress ? <Text style={styles.infoSub}>{doctor.hospitalAddress}</Text> : null}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="language-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Languages</Text>
              <Text style={styles.infoValue}>{doctor.languages.join(', ')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Consultation Fee</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>₹{doctor.fees}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['about', 'reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'about' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.about}>{doctor.about}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Reviews</Text>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingNum}>{doctor.rating}</Text>
              <StarRating rating={doctor.rating} size={20} />
              <Text style={styles.ratingTotal}>Based on {doctor.reviewCount} reviews</Text>
            </View>
            {[
              { name: 'Priya S.', comment: 'Very knowledgeable and patient. Explained everything clearly.', rating: 5 },
              { name: 'Rahul M.', comment: 'Great experience, quick diagnosis. Highly recommended.', rating: 4 },
              { name: 'Anita K.', comment: 'Excellent doctor, very thorough and caring.', rating: 5 },
            ].map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{r.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <StarRating rating={r.rating} size={12} />
                  </View>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Available Days & Timings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.daysRow}>
            {doctor.availableDays.map((day) => (
              <View key={day} style={styles.dayChip}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.infoRow, { marginTop: SPACING.sm }]}>
            <View style={styles.infoIcon}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.timingsText}>
              {doctor.availableTimings.length > 0
                ? `${doctor.availableTimings[0].time} - ${doctor.availableTimings[doctor.availableTimings.length - 1].time}`
                : 'No timings available'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={styles.bottomFee}>
          <Text style={styles.bottomFeeLabel}>Consultation Fee</Text>
          <Text style={styles.bottomFeeValue}>₹{doctor.fees}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id })}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    alignItems: 'center',
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: SPACING.sm,
  },
  name: { fontSize: 22, fontWeight: '800', color: '#fff' },
  spec: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  qual: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: -SPACING.lg,
    ...SHADOWS.md,
    padding: SPACING.base,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 1 },
  infoValue: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '600' },
  infoSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  about: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  ratingBig: { alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.xs },
  ratingNum: { fontSize: 44, fontWeight: '800', color: COLORS.textPrimary },
  ratingTotal: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  reviewName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  reviewComment: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  dayChip: {
    backgroundColor: COLORS.primaryUltraLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '30',
  },
  dayText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '700' },
  timingsText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, fontWeight: '500' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
    gap: SPACING.md,
  },
  bottomFee: { flex: 1 },
  bottomFeeLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  bottomFeeValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  bookBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
});
