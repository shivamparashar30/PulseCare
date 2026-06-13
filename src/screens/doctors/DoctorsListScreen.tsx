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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useDoctors } from '../../hooks';
import { DoctorsStackParamList } from '../../types';
import { StarRating, EmptyState, DoctorCardSkeleton } from '../../components/common';

type Nav = NativeStackNavigationProp<DoctorsStackParamList, 'DoctorsList'>;
type Route = RouteProp<DoctorsStackParamList, 'DoctorsList'>;

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
  const route = useRoute<Route>();
  const initialSpec = route.params?.specialization ?? 'All';

  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState(initialSpec);
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
      style={styles.card}
      onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <View style={styles.cardTop}>
          <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
          {item.isAvailable && (
            <View style={styles.availBadge}>
              <Text style={styles.availText}>Available</Text>
            </View>
          )}
        </View>
        <Text style={styles.spec}>{item.specialization}</Text>
        <Text style={styles.qual} numberOfLines={1}>{item.qualification}</Text>
        <Text style={styles.hospital} numberOfLines={1}>
          <Ionicons name="business-outline" size={12} color={COLORS.textSecondary} /> {item.hospital}
        </Text>
        <View style={styles.cardFooter}>
          <StarRating rating={item.rating} size={12} />
          <Text style={styles.reviews}>({item.reviewCount})</Text>
          <View style={styles.dot} />
          <Text style={styles.exp}>{item.experience} yrs</Text>
          <View style={styles.dot} />
          <Text style={styles.fee}>₹{item.fees}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, hospitals…"
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Sort menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.sortOption}
              onPress={() => { setActiveSort(opt); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortOptionText, activeSort === opt && styles.sortActive]}>
                {opt}
              </Text>
              {activeSort === opt && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Specialization chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {SPECIALIZATIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, activeSpec === s && styles.chipActive]}
            onPress={() => setActiveSpec(s)}
          >
            <Text style={[styles.chipText, activeSpec === s && styles.chipTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Result count */}
      <Text style={styles.resultCount}>{filtered.length} doctors found</Text>

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
  container: { flex: 1, backgroundColor: COLORS.background },
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  sortBtn: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  sortMenu: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sortOptionText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  sortActive: { color: COLORS.primary, fontWeight: '600' },
  chips: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  chip: {
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
  resultCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  avatar: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.border },
  cardInfo: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  docName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  availBadge: { backgroundColor: '#dcfce7', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  availText: { fontSize: 10, color: '#16a34a', fontWeight: '600' },
  spec: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  qual: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 2 },
  hospital: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviews: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textSecondary },
  exp: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  fee: { fontSize: FONT_SIZES.xs, color: COLORS.text, fontWeight: '700' },
});
