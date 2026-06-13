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

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useDoctor } from '../../hooks';
import { DoctorsStackParamList } from '../../types';
import { StarRating, Button } from '../../components/common';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.textSecondary }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
          <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.spec}>{doctor.specialization}</Text>
          <Text style={styles.qual}>{doctor.qualification}</Text>
          <StarRating rating={doctor.rating} size={16} color="#facc15" showCount reviewCount={doctor.reviewCount} />
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {INFO_ITEMS.map(({ key, label, icon, suffix }) => (
            <View key={key} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name={icon as any} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                {doctor[key as keyof typeof doctor]}{suffix}
              </Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Hospital */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.infoLabel}>Hospital</Text>
              <Text style={styles.infoValue}>{doctor.hospital}</Text>
              <Text style={styles.infoSub}>{doctor.hospitalAddress}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: SPACING.md }]}>
            <Ionicons name="language-outline" size={18} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.infoLabel}>Languages</Text>
              <Text style={styles.infoValue}>{doctor.languages.join(', ')}</Text>
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
            {/* Sample reviews */}
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

        {/* Available Timings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Days</Text>
          <View style={styles.daysRow}>
            {doctor.availableDays.map((day) => (
              <View key={day} style={styles.dayChip}>
                <Text style={styles.dayText}>{day.slice(0, 3)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.timings}> {doctor.availableTimings}</Text>
          </View>
        </View>

        {/* Fee */}
        <View style={styles.feeRow}>
          <View>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>₹{doctor.fees}</Text>
          </View>
          <Button
            title="Book Appointment"
            onPress={() => navigation.navigate('BookAppointment', { doctorId: doctor.id })}
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: SPACING.sm,
  },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: '#fff' },
  spec: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  qual: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: -SPACING.lg,
    ...SHADOWS.md,
    padding: SPACING.md,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  infoSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  tabs: { flexDirection: 'row', marginHorizontal: SPACING.md, marginTop: SPACING.xs },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  about: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  ratingBig: { alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.xs },
  ratingNum: { fontSize: 48, fontWeight: '800', color: COLORS.text },
  ratingTotal: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  reviewName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  reviewComment: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  dayChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  dayText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  timings: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  feeLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  feeValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
});
