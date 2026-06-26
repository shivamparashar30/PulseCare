import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useUserLocation } from '../../../../../../packages/providers/src/UserLocationProvider';
import { useDoctors } from '../../../../../../packages/core/src/hooks';
import { getDistanceKm, formatDistance, buildDirectionsLink } from '../../../../../../packages/core/src/utils/location';
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

const SORT_OPTIONS = ['Relevance', 'Rating', 'Experience', 'Fee: Low to High', 'Fee: High to Low', 'Distance: Nearest', 'Distance: Farthest'];

const DISTANCE_FILTERS = ['Any', '< 5 km', '< 10 km', '< 25 km', '< 50 km'];

export default function DoctorsListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { location: userLocation } = useUserLocation();

  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');
  const [activeSort, setActiveSort] = useState('Relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState('Any');

  const { data: doctors = [], isLoading, refetch, isRefetching } = useDoctors();

  // Enrich doctors with distance
  const enriched = useMemo(() => {
    return doctors.map((d: any) => {
      let distance: number | null = null;
      if (userLocation && d.latitude && d.longitude) {
        distance = getDistanceKm(userLocation.latitude, userLocation.longitude, d.latitude, d.longitude);
      }
      return { ...d, distance };
    });
  }, [doctors, userLocation]);

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q) ||
          (d.city && d.city.toLowerCase().includes(q)),
      );
    }
    if (activeSpec !== 'All') {
      list = list.filter((d) =>
        d.specialization.toLowerCase().includes(activeSpec.toLowerCase()),
      );
    }
    // Distance filter
    if (distanceFilter !== 'Any') {
      const maxKm = parseInt(distanceFilter.replace(/[^0-9]/g, ''));
      list = list.filter(d => d.distance !== null && d.distance <= maxKm);
    }
    // Sort
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
      case 'Distance: Nearest':
        list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        break;
      case 'Distance: Farthest':
        list.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
        break;
    }
    return list;
  }, [enriched, search, activeSpec, activeSort, distanceFilter]);

  const openDirections = (item: any) => {
    if (!userLocation || !item.latitude || !item.longitude) return;
    const url = buildDirectionsLink(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
    Linking.openURL(url);
  };

  const renderDoctor = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('DoctorDetail', { doctorId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.avatar || item.image }} style={styles.avatar} />
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

        {/* Address + Distance Row */}
        {(item.fullAddress || item.distance !== null) && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.locationText, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.fullAddress || item.hospitalAddress}
            </Text>
            {item.distance !== null && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate-outline" size={10} color="#0066CC" />
                <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <StarRating rating={item.rating} size={12} />
          <Text style={[styles.reviews, { color: colors.textSecondary }]}>({item.reviewCount})</Text>
          <View style={styles.dot} />
          <Text style={[styles.exp, { color: colors.textSecondary }]}>{item.experience} yrs</Text>
          <View style={styles.dot} />
          <Text style={[styles.fee, { color: colors.textPrimary }]}>₹{item.fees || item.fee}</Text>
        </View>

        {/* Directions button */}
        {item.distance !== null && (
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => openDirections(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={12} color="#0066CC" />
            <Text style={styles.directionsBtnText}>Directions</Text>
          </TouchableOpacity>
        )}
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
            placeholder="Search doctors, hospitals, city..."
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
            <Text style={[styles.sortMenuTitle, { color: colors.textTertiary }]}>Sort By</Text>
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
            <View style={[styles.sortDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sortMenuTitle, { color: colors.textTertiary }]}>Distance</Text>
            {DISTANCE_FILTERS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setDistanceFilter(opt); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }, distanceFilter === opt && styles.sortActive]}>
                  {opt}
                </Text>
                {distanceFilter === opt && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
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

      {/* Active filters indicator */}
      {distanceFilter !== 'Any' && (
        <View style={styles.activeFilterRow}>
          <View style={styles.activeFilterChip}>
            <Ionicons name="location" size={12} color="#0066CC" />
            <Text style={styles.activeFilterText}>{distanceFilter}</Text>
            <TouchableOpacity onPress={() => setDistanceFilter('Any')}>
              <Ionicons name="close-circle" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    paddingVertical: SPACING.sm,
  },
  sortMenuTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  sortDivider: {
    height: 1,
    marginVertical: 4,
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
  activeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
  },
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
  hospital: { fontSize: FONT_SIZES.xs, marginBottom: 4 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0066CC',
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviews: { fontSize: FONT_SIZES.xs },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textSecondary },
  exp: { fontSize: FONT_SIZES.xs },
  fee: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066CC',
  },
});
