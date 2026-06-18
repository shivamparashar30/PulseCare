/**
 * Lab Test Detail Screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useLabTest } from '../../../../../../packages/core/src/hooks';
import { HomeStackParamList } from '../../../../../../packages/core/src/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'LabTestDetail'>;
type Route = RouteProp<HomeStackParamList, 'LabTestDetail'>;

export function LabTestDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { testId } = route.params;
  const { data: test, isLoading } = useLabTest(testId);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!test) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Hero */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroIcon}>
            <Ionicons name="flask-outline" size={40} color="#fff" />
          </View>
          <Text style={styles.heroName}>{test.name}</Text>
          <Text style={styles.heroDesc} numberOfLines={2}>{test.description}</Text>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroBadgeText}>{test.reportTime}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="pricetag-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroBadgeText}>{test.category}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Price card */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Test Price</Text>
            <Text style={styles.priceValue}>₹{test.price}</Text>
            {test.discountPercent > 0 && (
              <Text style={styles.discount}>{test.discountPercent}% OFF applied</Text>
            )}
          </View>
          {test.homeCollection ? (
            <View style={styles.homeVisitInfo}>
              <Ionicons name="home-outline" size={16} color={COLORS.success} />
              <Text style={styles.homeVisitText}>Home collection</Text>
            </View>
          ) : (
            <View style={styles.homeVisitInfo}>
              <Ionicons name="business-outline" size={16} color="#7C3AED" />
              <Text style={[styles.homeVisitText, { color: '#7C3AED' }]}>Center visit</Text>
            </View>
          )}
        </View>

        {/* Center info */}
        {test.centerName ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diagnostic Center</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="business-outline" size={16} color="#7C3AED" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{test.centerName}</Text>
                {test.centerAddress ? <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{test.centerAddress}</Text> : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* Preparation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preparation Instructions</Text>
          {test.preparation.map((inst, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{inst}</Text>
            </View>
          ))}
        </View>

        {/* Parameters */}
        {test.includes && test.includes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Parameters Tested</Text>
            <View style={styles.paramGrid}>
              {test.includes.map((p, i) => (
                <View key={i} style={styles.paramChip}>
                  <Text style={styles.paramText}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* What it detects */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What It Detects</Text>
          <Text style={styles.infoText}>{test.detects ?? 'Helps identify various health conditions and abnormalities through laboratory analysis of samples.'}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Price</Text>
          <Text style={styles.footerPrice}>₹{test.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('LabBooking', { testId: test.id })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Book Test</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default LabTestDetailScreen;

// ─── Styles shared ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xl + 20,
    paddingBottom: 32,
    gap: SPACING.sm,
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  heroName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroDesc: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  heroBadges: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  heroBadgeText: { fontSize: FONT_SIZES.xs, color: '#fff', fontWeight: '600' },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    marginTop: -SPACING.lg,
  },
  priceLabel: { fontSize: FONT_SIZES.xs, color: '#64748B' },
  priceValue: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.primary },
  discount: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: '600' },
  homeVisitInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  homeVisitText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 8, alignItems: 'flex-start' },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#64748B', lineHeight: 20 },
  paramGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  paramChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  paramText: { fontSize: FONT_SIZES.xs, color: '#1E40AF', fontWeight: '600' },
  infoText: { fontSize: FONT_SIZES.sm, color: '#64748B', lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...SHADOWS.lg,
  },
  footerLabel: { fontSize: FONT_SIZES.xs, color: '#64748B' },
  footerPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
  },
  bookBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
});
