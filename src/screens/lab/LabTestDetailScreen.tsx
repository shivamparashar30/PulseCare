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

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useLabTest } from '../../hooks';
import { LabStackParamList } from '../../types';
import { Button } from '../../components/common';

type Nav = NativeStackNavigationProp<LabStackParamList, 'LabTestDetail'>;
type Route = RouteProp<LabStackParamList, 'LabTestDetail'>;

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
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
              <Ionicons name="water-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroBadgeText}>{test.sampleType}</Text>
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
          <View style={styles.homeVisitInfo}>
            <Ionicons name="home-outline" size={16} color={COLORS.success} />
            <Text style={styles.homeVisitText}>Home collection available</Text>
          </View>
        </View>

        {/* Preparation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preparation Instructions</Text>
          {test.preparationInstructions.map((inst, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{inst}</Text>
            </View>
          ))}
        </View>

        {/* Parameters */}
        {test.parameters && test.parameters.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Parameters Tested</Text>
            <View style={styles.paramGrid}>
              {test.parameters.map((p, i) => (
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
        <Button
          title="Book Test"
          onPress={() => navigation.navigate('LabBooking', { testId: test.id })}
          size="md"
        />
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
    paddingBottom: SPACING.xxl ?? 32,
    gap: SPACING.sm,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  heroBadgeText: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.9)' },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    marginTop: -SPACING.lg,
  },
  priceLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  priceValue: { fontSize: FONT_SIZES.xxl ?? 24, fontWeight: '900', color: COLORS.primary },
  discount: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: '600' },
  homeVisitInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  homeVisitText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 8, alignItems: 'flex-start' },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  paramGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  paramChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  paramText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  footerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  footerPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
});
