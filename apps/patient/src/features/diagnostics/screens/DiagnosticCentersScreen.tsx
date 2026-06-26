import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useUserLocation } from '../../../../../../packages/providers/src/UserLocationProvider';
import { HomeStackParamList } from '../../../../../../packages/core/src/types';
import { EmptyState } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';
import { getDistanceKm, formatDistance, buildMapsLink, buildDirectionsLink } from '../../../../../../packages/core/src/utils/location';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DiagnosticCenters'>;

interface DiagnosticCenter {
  id: string;
  center_name: string;
  address: string;
  fullAddress: string;
  city: string;
  phone: string;
  testCount: number;
  avatar_url?: string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
}

const SORT_OPTIONS = ['Name', 'Tests', 'Distance: Nearest', 'Distance: Farthest'];
const DISTANCE_FILTERS = ['Any', '< 5 km', '< 10 km', '< 25 km', '< 50 km'];

export default function DiagnosticCentersScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { location: userLocation } = useUserLocation();
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSort, setActiveSort] = useState('Name');
  const [distanceFilter, setDistanceFilter] = useState('Any');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const loadCenters = useCallback(async () => {
    const { data: centerTests } = await supabase
      .from('center_tests')
      .select('diagnostics_center_id')
      .eq('is_available', true);

    const countMap: Record<string, number> = {};
    (centerTests || []).forEach((ct: any) => {
      countMap[ct.diagnostics_center_id] = (countMap[ct.diagnostics_center_id] || 0) + 1;
    });

    let centerIds = Object.keys(countMap);

    // Fallback to legacy
    if (centerIds.length === 0) {
      const { data: legacyCenters } = await supabase
        .from('diagnostics_centers')
        .select('id, center_name, address, phone, latitude, longitude, address_line1, city, state, pincode, landmark')
        .order('center_name');

      if (legacyCenters && legacyCenters.length > 0) {
        const { data: legacyTests } = await supabase
          .from('lab_tests')
          .select('diagnostics_center_id')
          .not('diagnostics_center_id', 'is', null);

        const legacyCount: Record<string, number> = {};
        (legacyTests || []).forEach((t: any) => {
          legacyCount[t.diagnostics_center_id] = (legacyCount[t.diagnostics_center_id] || 0) + 1;
        });

        const ids = legacyCenters.map(c => c.id);
        const { data: profiles } = await supabase.from('profiles').select('id, avatar_url').in('id', ids);
        const avatarMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => { avatarMap[p.id] = p.avatar_url; });

        setCenters(legacyCenters.filter(c => (legacyCount[c.id] || 0) > 0).map(c => ({
          ...c,
          testCount: legacyCount[c.id] || 0,
          avatar_url: avatarMap[c.id],
          fullAddress: [c.address_line1, c.landmark, c.city, c.state, c.pincode].filter(Boolean).join(', ') || c.address || '',
          city: c.city || '',
          latitude: c.latitude ? Number(c.latitude) : null,
          longitude: c.longitude ? Number(c.longitude) : null,
          distance: null,
        })));
      } else {
        setCenters([]);
      }
      setLoading(false);
      return;
    }

    const { data: centerData } = await supabase
      .from('diagnostics_centers')
      .select('id, center_name, address, phone, latitude, longitude, address_line1, city, state, pincode, landmark')
      .in('id', centerIds)
      .order('center_name');

    const { data: profiles } = await supabase.from('profiles').select('id, avatar_url').in('id', centerIds);
    const avatarMap: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { avatarMap[p.id] = p.avatar_url; });

    setCenters((centerData || []).map(c => ({
      ...c,
      testCount: countMap[c.id] || 0,
      avatar_url: avatarMap[c.id],
      fullAddress: [c.address_line1, c.landmark, c.city, c.state, c.pincode].filter(Boolean).join(', ') || c.address || '',
      city: c.city || '',
      latitude: c.latitude ? Number(c.latitude) : null,
      longitude: c.longitude ? Number(c.longitude) : null,
      distance: null,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { loadCenters(); }, [loadCenters]);
  const onRefresh = async () => { setRefreshing(true); await loadCenters(); setRefreshing(false); };

  // Enrich with distance
  const enriched = useMemo(() => {
    return centers.map(c => {
      let distance: number | null = null;
      if (userLocation && c.latitude && c.longitude) {
        distance = getDistanceKm(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude);
      }
      return { ...c, distance };
    });
  }, [centers, userLocation]);

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.center_name.toLowerCase().includes(q) || c.fullAddress.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    if (distanceFilter !== 'Any') {
      const maxKm = parseInt(distanceFilter.replace(/[^0-9]/g, ''));
      list = list.filter(c => c.distance !== null && c.distance <= maxKm);
    }
    switch (activeSort) {
      case 'Name':
        list.sort((a, b) => a.center_name.localeCompare(b.center_name));
        break;
      case 'Tests':
        list.sort((a, b) => b.testCount - a.testCount);
        break;
      case 'Distance: Nearest':
        list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        break;
      case 'Distance: Farthest':
        list.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
        break;
    }
    return list;
  }, [enriched, search, activeSort, distanceFilter]);

  const openInMaps = (item: DiagnosticCenter) => {
    if (!item.latitude || !item.longitude) return;
    Linking.openURL(buildMapsLink(item.latitude, item.longitude, item.center_name));
  };

  const openDirections = (item: DiagnosticCenter) => {
    if (!userLocation || !item.latitude || !item.longitude) return;
    Linking.openURL(buildDirectionsLink(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude));
  };

  const renderCenter = ({ item }: { item: DiagnosticCenter }) => {
    const initials = item.center_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CenterTests', { centerId: item.id, centerName: item.center_name })}
      >
        <View style={styles.cardRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.centerName, { color: colors.textPrimary }]}>{item.center_name}</Text>
            {item.fullAddress ? (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>{item.fullAddress}</Text>
              </View>
            ) : null}
            {/* Distance */}
            {item.distance !== null && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate-outline" size={10} color="#7C3AED" />
                <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="flask-outline" size={14} color="#7C3AED" />
            <Text style={styles.metaText}>{item.testCount} tests</Text>
          </View>
          {item.phone ? (
            <TouchableOpacity style={styles.metaChip} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
              <Ionicons name="call-outline" size={14} color="#059669" />
              <Text style={[styles.metaText, { color: '#059669' }]}>{item.phone}</Text>
            </TouchableOpacity>
          ) : null}

          {/* Map buttons */}
          <View style={{ flex: 1 }} />
          {item.latitude && item.longitude && (
            <TouchableOpacity style={styles.mapIconBtn} onPress={() => openInMaps(item)}>
              <Ionicons name="map-outline" size={16} color="#7C3AED" />
            </TouchableOpacity>
          )}
          {item.distance !== null && (
            <TouchableOpacity style={styles.mapIconBtn} onPress={() => openDirections(item)}>
              <Ionicons name="navigate" size={16} color="#0066CC" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Diagnostic Centers</Text>
        <TouchableOpacity onPress={() => setShowSortMenu(!showSortMenu)}>
          <Ionicons name="funnel-outline" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* Sort menu */}
      {showSortMenu && (
        <>
          <TouchableOpacity style={styles.sortOverlay} activeOpacity={1} onPress={() => setShowSortMenu(false)} />
          <View style={[styles.sortMenuBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.sortMenuTitle, { color: colors.textTertiary }]}>Sort By</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setActiveSort(opt); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }, activeSort === opt && { color: '#7C3AED', fontWeight: '600' }]}>{opt}</Text>
                {activeSort === opt && <Ionicons name="checkmark" size={16} color="#7C3AED" />}
              </TouchableOpacity>
            ))}
            <View style={[styles.sortDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sortMenuTitle, { color: colors.textTertiary }]}>Distance</Text>
            {DISTANCE_FILTERS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setDistanceFilter(opt); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }, distanceFilter === opt && { color: '#7C3AED', fontWeight: '600' }]}>{opt}</Text>
                {distanceFilter === opt && <Ionicons name="checkmark" size={16} color="#7C3AED" />}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search centers, city..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Active filters */}
      {distanceFilter !== 'Any' && (
        <View style={styles.activeFilterRow}>
          <View style={styles.activeFilterChip}>
            <Ionicons name="location" size={12} color="#7C3AED" />
            <Text style={[styles.activeFilterText, { color: '#7C3AED' }]}>{distanceFilter}</Text>
            <TouchableOpacity onPress={() => setDistanceFilter('Any')}>
              <Ionicons name="close-circle" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
        {filtered.length} center{filtered.length !== 1 ? 's' : ''} found
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCenter}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState icon="business-outline" title="No centers found" subtitle="No diagnostic centers available at the moment" />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', letterSpacing: 0.3 },
  sortOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
  },
  sortMenuBox: {
    position: 'absolute', top: 52, right: SPACING.md, left: SPACING.md,
    borderRadius: BORDER_RADIUS.md, ...SHADOWS.lg, zIndex: 100, paddingVertical: SPACING.sm,
  },
  sortMenuTitle: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
  },
  sortDivider: { height: 1, marginVertical: 4 },
  sortOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1,
  },
  sortOptionText: { fontSize: FONT_SIZES.sm },
  searchRow: {
    paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.sm, ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  activeFilterRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base, marginBottom: SPACING.xs, gap: SPACING.sm,
  },
  activeFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F3FF', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  activeFilterText: { fontSize: 11, fontWeight: '600' },
  resultCount: {
    fontSize: FONT_SIZES.xs, fontWeight: '500', paddingHorizontal: SPACING.base, marginBottom: SPACING.sm,
  },
  list: { paddingHorizontal: SPACING.base, gap: SPACING.md, paddingBottom: 30 },
  card: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F5F3FF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#7C3AED' },
  centerName: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  addressText: { fontSize: FONT_SIZES.xs, lineHeight: 16, flex: 1 },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 6, paddingVertical: 2,
    marginTop: 4,
  },
  distanceText: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  divider: { height: 1, marginVertical: SPACING.sm },
  metaRow: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#7C3AED' },
  mapIconBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    justifyContent: 'center', alignItems: 'center',
  },
});
