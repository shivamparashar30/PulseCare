import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useDoctors } from '../../../../../../packages/core/src/hooks';
import { DoctorStackParamList } from '../../../../../../packages/core/src/types';
import { StarRating, EmptyState, DoctorCardSkeleton } from '../../../../../../packages/shared/src/components';

type Nav = NativeStackNavigationProp<DoctorStackParamList, 'DoctorsList'>;

const SPECIALIZATIONS = [
  'All',
  'General',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic',
  'Pediatrician',
  'Gynecologist',
  'Neurologist',
  'Psychiatrist',
  'Ophthalmologist',
];

const SORT_OPTIONS = ['Relevance', 'Rating', 'Experience', 'Fee: Low to High', 'Fee: High to Low'];

export default function DoctorsListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');
  const [activeSort, setActiveSort] = useState('Relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: doctors = [], isLoading, refetch, isRefetching } = useDoctors();

  const filtered = useMemo(() => {
    let list = [...doctors];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q),
      );
    }
    if (activeSpec !== 'All') {
      list = list.filter((d) =>
        d.specialization.toLowerCase().includes(activeSpec.toLowerCase()),
      );
    }
    switch (activeSort) {
      case 'Rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'Experience':
        list.sort((a, b) => b.experience - a.experience);
        break;
      case 'Fee: Low to High':
        list.sort((a, b) => a.fees - b.fees);
        break;
      case 'Fee: High to Low':
        list.sort((a, b) => b.fees - a.fees);
        break;
    }
    return list;
  }, [doctors, search, activeSpec, activeSort]);

  const renderDoctor = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <View style={styles.cardTop}>
          <Text style={[styles.docName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          {item.isAvailable && (
            <View style={styles.availBadge}>
              <Text style={styles.availText}>Available</Text>
            </View>
          )}
        </View>
        <Text style={styles.spec}>{item.specialization}</Text>
        <Text style={[styles.qual, { color: colors.textSecondary }]} numberOfLines={1}>{item.qualification}</Text>
        <Text style={[styles.hospital, { color: colors.textSecondary }]} numberOfLines={1}>
          <Ionicons name="business-outline" size={12} color={colors.textSecondary} /> {item.hospital}
        </Text>
        <View style={styles.cardFooter}>
          <StarRating rating={item.rating} size={12} />
          <Text style={[styles.reviews, { color: colors.textSecondary }]}>({item.reviewCount})</Text>
          <View style={styles.dot} />
          <Text style={[styles.exp, { color: colors.textSecondary }]}>{item.experience} yrs</Text>
          <View style={styles.dot} />
          <Text style={[styles.fee, { color: colors.textPrimary }]}>₹{item.fees}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search doctors, hospitals…"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sortBtn, { backgroundColor: colors.card }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Sort menu overlay */}
      {showSortMenu && (
        <>
          <TouchableOpacity
            style={styles.sortOverlay}
            activeOpacity={1}
            onPress={() => setShowSortMenu(false)}
          />
          <View style={[styles.sortMenu, { backgroundColor: colors.card }]}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setActiveSort(opt); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }, activeSort === opt && styles.sortActive]}>
                  {opt}
                </Text>
                {activeSort === opt && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Specialization chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {SPECIALIZATIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, activeSpec === s && styles.chipActive]}
              onPress={() => setActiveSpec(s)}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }, activeSpec === s && styles.chipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Result count */}
      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>{filtered.length} doctors found</Text>

      {/* List */}
      {isLoading ? (
        <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
          {[1, 2, 3, 4].map((k) => <DoctorCardSkeleton key={k} />)}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="person-outline"
          title="No doctors found"
          subtitle="Try a different search or filter"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  sortBtn: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  sortOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  sortMenu: {
    position: 'absolute',
    top: 52,
    right: SPACING.md,
    left: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.lg,
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  sortOptionText: { fontSize: FONT_SIZES.sm },
  sortActive: { color: COLORS.primary, fontWeight: '600' },
  chipsContainer: {
    height: 48,
    marginBottom: SPACING.xs,
  },
  chips: { paddingHorizontal: SPACING.md, alignItems: 'center', height: 48, gap: SPACING.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  resultCount: {
    fontSize: FONT_SIZES.xs,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  avatar: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md },
  cardInfo: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  docName: { fontSize: FONT_SIZES.md, fontWeight: '700', flex: 1 },
  availBadge: { backgroundColor: '#dcfce7', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  availText: { fontSize: 10, color: '#16a34a', fontWeight: '600' },
  spec: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  qual: { fontSize: FONT_SIZES.xs, marginBottom: 2 },
  hospital: { fontSize: FONT_SIZES.xs, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviews: { fontSize: FONT_SIZES.xs },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textSecondary },
  exp: { fontSize: FONT_SIZES.xs },
  fee: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
