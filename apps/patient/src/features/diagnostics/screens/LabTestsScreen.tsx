import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useLabTests } from '../../../../../../packages/core/src/hooks';
import { HomeStackParamList } from '../../../../../../packages/core/src/types';
import { EmptyState } from '../../../../../../packages/shared/src/components';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'LabTests'>;

const CATEGORIES = ['All', 'Blood Tests', 'Diabetes', 'Thyroid', 'Vitamins', 'Urine Tests', 'Imaging', 'Cardiac'];

const CAT_ICONS: Record<string, string> = {
  'All': 'apps-outline',
  'Blood Tests': 'water-outline',
  'Diabetes': 'fitness-outline',
  'Thyroid': 'body-outline',
  'Vitamins': 'sunny-outline',
  'Urine Tests': 'flask-outline',
  'Imaging': 'scan-outline',
  'Cardiac': 'heart-outline',
};

export default function LabTestsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: tests = [], isLoading, refetch, isRefetching } = useLabTests();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = [...tests];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (activeCategory !== 'All') {
      list = list.filter((t) => t.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    return list;
  }, [tests, search, activeCategory]);

  const renderTest = ({ item }: any) => {
    const hasDiscount = item.discountPercent > 0;
    const originalPrice = hasDiscount ? Math.round(item.price / (1 - item.discountPercent / 100)) : item.price;

    return (
      <TouchableOpacity
        style={[styles.testCard, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('LabTestDetail', { testId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.testCardTop}>
          <View style={styles.testIconWrap}>
            <View style={[styles.testIcon, { backgroundColor: COLORS.primaryUltraLight }]}>
              <Ionicons name={(CAT_ICONS[item.category] ?? 'flask-outline') as any} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.testTitleBlock}>
              <Text style={[styles.testName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.testCategoryLabel, { color: colors.textTertiary }]}>{item.category}</Text>
            </View>
          </View>
          {hasDiscount && (
            <View style={styles.discountPill}>
              <Text style={styles.discountPillText}>{item.discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <Text style={[styles.testDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>

        <View style={[styles.testDivider, { backgroundColor: colors.border }]} />

        <View style={styles.testCardBottom}>
          <View style={styles.testMetaRow}>
            <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
              <Ionicons name="time-outline" size={12} color={COLORS.primary} />
              <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{item.reportTime}</Text>
            </View>
            {item.includes && (
              <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
                <Ionicons name="list-outline" size={12} color={COLORS.primary} />
                <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{item.includes.length} params</Text>
              </View>
            )}
          </View>
          <View style={styles.testPriceAction}>
            <View>
              <Text style={styles.testPrice}>₹{item.discountedPrice || item.price}</Text>
              {hasDiscount && (
                <Text style={[styles.testMrp, { color: colors.textTertiary }]}>₹{originalPrice}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LabTestDetail', { testId: item.id })}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Lab Tests</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search tests, packages..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                activeCategory === cat && styles.chipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Ionicons
                name={(CAT_ICONS[cat] ?? 'medical-outline') as any}
                size={14}
                color={activeCategory === cat ? '#fff' : COLORS.primary}
              />
              <Text style={[styles.chipText, { color: colors.textSecondary }, activeCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Home Collection Banner */}
      {!search && activeCategory === 'All' && (
        <View style={styles.bannerWrap}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <View style={styles.promoIconCircle}>
                <Ionicons name="home-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Home Sample Collection</Text>
                <Text style={styles.promoSub}>Get tested from the comfort of your home</Text>
              </View>
            </View>
            <View style={styles.promoChip}>
              <Text style={styles.promoChipText}>FREE</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Result count */}
      <View style={styles.resultRow}>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {filtered.length} {filtered.length === 1 ? 'test' : 'tests'} available
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTest}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState icon="flask-outline" title="No tests found" subtitle="Try a different search or category" />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  searchRow: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  chipsContainer: { height: 48, marginBottom: SPACING.xs },
  chips: {
    paddingHorizontal: SPACING.base,
    alignItems: 'center',
    height: 48,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  bannerWrap: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  promoBanner: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  promoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#fff',
  },
  promoSub: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  promoChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  promoChipText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.sm, letterSpacing: 0.5 },
  resultRow: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  count: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
    paddingBottom: 30,
  },
  testCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  testCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  testIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  testIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testTitleBlock: {
    flex: 1,
  },
  testName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  testCategoryLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  discountPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  testDesc: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  testDivider: {
    height: 1,
    marginBottom: SPACING.md,
  },
  testCardBottom: {
    gap: SPACING.md,
  },
  testMetaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  metaChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  testPriceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  testMrp: {
    fontSize: FONT_SIZES.xs,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
