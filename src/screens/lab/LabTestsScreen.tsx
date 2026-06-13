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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useLabTests } from '../../hooks';
import { LabStackParamList } from '../../types';
import { EmptyState } from '../../components/common';

type Nav = NativeStackNavigationProp<LabStackParamList, 'LabTests'>;

const CATEGORIES = ['All', 'Blood', 'Imaging', 'Cardiac', 'Urine', 'Other'];

const CAT_ICONS: Record<string, string> = {
  Blood: 'water-outline',
  Imaging: 'scan-outline',
  Cardiac: 'heart-outline',
  Urine: 'flask-outline',
  Other: 'medical-outline',
};

export default function LabTestsScreen() {
  const navigation = useNavigation<Nav>();
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
      list = list.filter((t) => t.category === activeCategory);
    }
    return list;
  }, [tests, search, activeCategory]);

  const renderTest = ({ item }: any) => (
    <TouchableOpacity
      style={styles.testCard}
      onPress={() => navigation.navigate('LabTestDetail', { testId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.testIcon}>
        <Ionicons name={(CAT_ICONS[item.category] ?? 'flask-outline') as any} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.testInfo}>
        <Text style={styles.testName}>{item.name}</Text>
        <Text style={styles.testDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.testMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.reportTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.sampleType}</Text>
          </View>
        </View>
      </View>
      <View style={styles.testRight}>
        <Text style={styles.testPrice}>₹{item.price}</Text>
        {item.discountPercent > 0 && (
          <Text style={styles.testMrp}>₹{Math.round(item.price / (1 - item.discountPercent / 100))}</Text>
        )}
        <View style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Book</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lab tests…"
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            {cat !== 'All' && (
              <Ionicons
                name={(CAT_ICONS[cat] ?? 'medical-outline') as any}
                size={14}
                color={activeCategory === cat ? '#fff' : COLORS.primary}
              />
            )}
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promo */}
      {!search && activeCategory === 'All' && (
        <View style={styles.promoBanner}>
          <View>
            <Text style={styles.promoTitle}>🏠 Home Sample Collection</Text>
            <Text style={styles.promoSub}>Get tested from the comfort of your home</Text>
          </View>
          <View style={styles.promoChip}>
            <Text style={styles.promoChipText}>FREE</Text>
          </View>
        </View>
      )}

      <Text style={styles.count}>{filtered.length} tests available</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTest}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState icon="flask-outline" title="No tests found" subtitle="Try a different search" />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchRow: { padding: SPACING.md, paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  chips: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  promoBanner: {
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  promoSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  promoChip: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  promoChipText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.sm },
  count: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 80 },
  testCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testInfo: { flex: 1 },
  testName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  testDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, lineHeight: 18, marginBottom: SPACING.xs },
  testMeta: { flexDirection: 'row', gap: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  testRight: { alignItems: 'flex-end', gap: 2 },
  testPrice: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary },
  testMrp: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  bookBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginTop: SPACING.xs,
  },
  bookBtnText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
