import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { Header, Button } from '../../components/common';
import { HEALTH_PACKAGES } from '../../data';
import { HealthPackage } from '../../types';
import { formatCurrency } from '../../utils';

const PACKAGE_COLORS: Record<string, [string, string]> = {
  basic: ['#0066CC', '#0099FF'],
  essential: ['#00A86B', '#00D084'],
  comprehensive: ['#9B59B6', '#BDC3E7'],
  premium: ['#F39C12', '#F5CBA7'],
  women: ['#E91E63', '#F48FB1'],
  senior: ['#1565C0', '#42A5F5'],
};

const CATEGORIES = ['All', 'Basic', 'Essential', 'Comprehensive', 'Premium', "Women's", 'Senior'] as const;

export default function HealthPackagesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [selectedCat, setSelectedCat] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = selectedCat === 'All'
    ? HEALTH_PACKAGES
    : HEALTH_PACKAGES.filter(p => p.category.toLowerCase() === selectedCat.toLowerCase().replace("'s", '').replace('senior', 'senior'));

  const getGradient = (pkg: HealthPackage): [string, string] => {
    const key = pkg.category.toLowerCase().replace("'s", '').split(' ')[0];
    return PACKAGE_COLORS[key] || ['#0066CC', '#0099FF'];
  };

  const renderPackage = ({ item }: { item: HealthPackage }) => {
    const isExpanded = expandedId === item.id;
    const [c1, c2] = getGradient(item);
    const discountPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Gradient Header */}
        <LinearGradient colors={[c1, c2]} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* Top row: category + badges */}
          <View style={styles.gradientTopRow}>
            <Text style={styles.packageCategory}>{item.category.toUpperCase()}</Text>
            <View style={styles.badgeRow}>
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={10} color="#F39C12" />
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              {discountPct > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
                </View>
              )}
            </View>
          </View>

          {/* Package name */}
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packageTests}>{item.tests.length} Tests Included</Text>

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatCurrency(item.price)}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
            )}
          </View>
        </LinearGradient>

        {/* Included Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="home-outline" size={16} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>Home Sample Collection</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>Report in {item.reportTime}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>Doctor Consultation Included</Text>
          </View>
        </View>

        {/* Tests List */}
        <TouchableOpacity
          style={[styles.testsToggle, { borderTopColor: colors.border }]}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <Text style={[styles.testsToggleText, { color: colors.primary }]}>
            {isExpanded ? 'Hide' : 'View'} All Tests
          </Text>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.testsList, { borderTopColor: colors.border }]}>
            {item.tests.map((t, i) => (
              <View key={i} style={styles.testRow}>
                <View style={[styles.testDot, { backgroundColor: c1 }]} />
                <Text style={[styles.testName, { color: colors.text }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={[styles.cta, { borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.savingsText, { color: colors.success || '#00A86B' }]}>
              You save {formatCurrency(item.originalPrice - item.price)}
            </Text>
            <Text style={[styles.freeReport, { color: colors.textSecondary }]}>
              Free home collection + e-report
            </Text>
          </View>
          <Button
            title="Book Now"
            onPress={() => navigation.navigate('LabBooking', { packageId: item.id })}
            style={styles.bookBtn}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Health Packages" onBack={() => navigation.goBack()} />

      {/* Banner */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark || '#004499']}
        style={styles.banner}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        <View>
          <Text style={styles.bannerTitle}>Preventive Health Checkups</Text>
          <Text style={styles.bannerSub}>Comprehensive packages at best prices</Text>
        </View>
        <Ionicons name="heart-circle" size={48} color="rgba(255,255,255,0.3)" />
      </LinearGradient>

      {/* Category Filters */}
      <View style={styles.catsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, { borderColor: colors.border, backgroundColor: colors.card },
                selectedCat === cat && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catText, { color: colors.textSecondary },
                selectedCat === cat && { color: '#fff' }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderPackage}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  bannerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm, marginTop: 2 },
  catsWrapper: { marginBottom: SPACING.sm },
  cats: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  catText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  card: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  cardGradient: { padding: SPACING.lg },
  gradientTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  packageCategory: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1.5 },
  packageName: { color: '#fff', fontSize: FONT_SIZES.xl, fontWeight: '800', marginBottom: 4 },
  packageTests: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  discountBadge: { backgroundColor: '#FF6B35', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm },
  discountBadgeText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  currentPrice: { color: '#fff', fontSize: FONT_SIZES['2xl'], fontWeight: '900' },
  originalPrice: { color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZES.md, textDecorationLine: 'line-through' },
  popularBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm },
  popularText: { color: '#F39C12', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  features: { padding: SPACING.md, gap: SPACING.sm },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  featureText: { fontSize: FONT_SIZES.sm },
  testsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, gap: 4 },
  testsToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  testsList: { padding: SPACING.md, borderTopWidth: 1, gap: 8 },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  testDot: { width: 6, height: 6, borderRadius: 3 },
  testName: { fontSize: FONT_SIZES.sm },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderTopWidth: 1 },
  savingsText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  freeReport: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  bookBtn: { paddingHorizontal: SPACING.xl },
});
