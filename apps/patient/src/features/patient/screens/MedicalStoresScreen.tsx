import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useUserLocation } from '../../../../../../packages/providers/src/UserLocationProvider';
import { EmptyState } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';
import { getDistanceKm, formatDistance, buildMapsLink, buildDirectionsLink } from '../../../../../../packages/core/src/utils/location';

const SORT_OPTIONS = ['Rating', 'Distance: Nearest', 'Distance: Farthest'];
const DISTANCE_FILTERS = ['Any', '< 5 km', '< 10 km', '< 25 km', '< 50 km'];

export default function MedicalStoresScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { location: userLocation } = useUserLocation();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [showOpen, setShowOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Rating');
  const [distanceFilter, setDistanceFilter] = useState('Any');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('medical_stores')
      .select('*')
      .order('rating', { ascending: false });

    if (data) {
      const storeIds = data.map((s: any) => s.id);
      const { data: counts } = await supabase
        .from('medicines')
        .select('store_id')
        .in('store_id', storeIds)
        .eq('approval_status', 'approved')
        .eq('in_stock', true);

      const countMap: Record<string, number> = {};
      (counts || []).forEach((m: any) => {
        countMap[m.store_id] = (countMap[m.store_id] || 0) + 1;
      });

      setStores(data.map((s: any) => ({
        id: s.id,
        name: s.store_name,
        address: s.address || '',
        fullAddress: [s.address_line1, s.landmark, s.city, s.state, s.pincode].filter(Boolean).join(', ') || s.address || '',
        city: s.city || '',
        phone: s.phone || '',
        rating: Number(s.rating) || 0,
        isOpen: s.is_open ?? true,
        openTime: s.open_time || '08:00 AM',
        closeTime: s.close_time || '10:00 PM',
        image: s.store_image || '',
        deliveryAvailable: s.delivery_available ?? true,
        deliveryRadiusKm: s.delivery_radius_km ? Number(s.delivery_radius_km) : 5,
        medicineCount: countMap[s.id] || 0,
        latitude: s.latitude ? Number(s.latitude) : null,
        longitude: s.longitude ? Number(s.longitude) : null,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Enrich with distance
  const enriched = useMemo(() => {
    return stores.map(s => {
      let distance: number | null = null;
      if (userLocation && s.latitude && s.longitude) {
        distance = getDistanceKm(userLocation.latitude, userLocation.longitude, s.latitude, s.longitude);
      }
      return { ...s, distance };
    });
  }, [stores, userLocation]);

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.fullAddress.toLowerCase().includes(q) || s.city.toLowerCase().includes(q));
    }
    if (showOpen) list = list.filter(s => s.isOpen);
    // Distance filter
    if (distanceFilter !== 'Any') {
      const maxKm = parseInt(distanceFilter.replace(/[^0-9]/g, ''));
      list = list.filter(s => s.distance !== null && s.distance <= maxKm);
    }
    // Sort
    switch (activeSort) {
      case 'Rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'Distance: Nearest':
        list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
        break;
      case 'Distance: Farthest':
        list.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
        break;
    }
    return list;
  }, [enriched, query, showOpen, activeSort, distanceFilter]);

  const openInMaps = (item: any) => {
    if (!item.latitude || !item.longitude) return;
    Linking.openURL(buildMapsLink(item.latitude, item.longitude, item.name));
  };

  const openDirections = (item: any) => {
    if (!userLocation || !item.latitude || !item.longitude) return;
    Linking.openURL(buildDirectionsLink(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude));
  };

  const renderStore = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.9}
      onPress={() => {
        const parent = navigation.getParent();
        if (parent) parent.navigate('Pharmacy', { screen: 'StoreDetail', params: { storeId: item.id } });
        else navigation.navigate('StoreDetail', { storeId: item.id });
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.storeImage} />
      ) : (
        <View style={[styles.storeImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="storefront" size={40} color={COLORS.primary} />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.isOpen ? '#D1FAE5' : '#FEE2E2' }]}>
            <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#10B981' : '#EF4444' }]} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: item.isOpen ? '#047857' : '#B91C1C' }}>
              {item.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Full Address */}
        <Text style={[styles.storeAddress, { color: colors.textSecondary }]} numberOfLines={2}>
          <Ionicons name="location-outline" size={12} color={colors.textTertiary} /> {item.fullAddress}
        </Text>

        {/* Distance Badge */}
        {item.distance !== null && (
          <View style={styles.distanceRow}>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={11} color="#0066CC" />
              <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
            </View>
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>{item.openTime} - {item.closeTime}</Text>
          </View>
          {item.deliveryAvailable && (
            <View style={[styles.metaChip, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="bicycle-outline" size={12} color="#059669" />
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#059669' }}>Delivery</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.medCount, { color: colors.textTertiary }]}>
            {item.medicineCount} medicines available
          </Text>
          <View style={styles.actionBtns}>
            {/* Open in Maps */}
            {item.latitude && item.longitude && (
              <TouchableOpacity
                style={[styles.mapBtn, { borderColor: '#059669' }]}
                onPress={() => openInMaps(item)}
              >
                <Ionicons name="map-outline" size={14} color="#059669" />
              </TouchableOpacity>
            )}
            {/* Directions */}
            {item.distance !== null && (
              <TouchableOpacity
                style={[styles.mapBtn, { borderColor: '#0066CC' }]}
                onPress={() => openDirections(item)}
              >
                <Ionicons name="navigate" size={14} color="#0066CC" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.callBtn, { borderColor: COLORS.primary }]}
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
            >
              <Ionicons name="call" size={14} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View</Text>
              <Ionicons name="arrow-forward" size={12} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Medical Stores</Text>
        <TouchableOpacity onPress={() => setShowSortMenu(!showSortMenu)}>
          <Ionicons name="funnel-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Sort menu */}
      {showSortMenu && (
        <>
          <TouchableOpacity style={styles.sortOverlay} activeOpacity={1} onPress={() => setShowSortMenu(false)} />
          <View style={[styles.sortMenu, { backgroundColor: colors.card }]}>
            <Text style={[styles.sortMenuTitle, { color: colors.textTertiary }]}>Sort By</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortOption, { borderBottomColor: colors.border }]}
                onPress={() => { setActiveSort(opt); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }, activeSort === opt && { color: COLORS.primary, fontWeight: '600' }]}>{opt}</Text>
                {activeSort === opt && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
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
                <Text style={[styles.sortOptionText, { color: colors.textPrimary }, distanceFilter === opt && { color: COLORS.primary, fontWeight: '600' }]}>{opt}</Text>
                {distanceFilter === opt && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
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
            placeholder="Search stores, city..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterChip, showOpen && { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}
          onPress={() => setShowOpen(!showOpen)}
        >
          <Text style={[styles.filterText, showOpen && { color: '#047857' }]}>Open Now</Text>
        </TouchableOpacity>
      </View>

      {/* Active filters */}
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

      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {filtered.length} store{filtered.length !== 1 ? 's' : ''} found
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderStore}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <EmptyState icon="storefront-outline" title="No stores found" subtitle="Try changing your search or filters" />
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
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  sortOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
  },
  sortMenu: {
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
    flexDirection: 'row', paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm, gap: SPACING.sm,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.sm, ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  filterChip: {
    paddingHorizontal: SPACING.md, justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#64748B' },
  activeFilterRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base, marginBottom: SPACING.xs, gap: SPACING.sm,
  },
  activeFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  activeFilterText: { fontSize: 11, fontWeight: '600', color: '#0066CC' },
  count: { fontSize: FONT_SIZES.xs, fontWeight: '500', paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.base, gap: SPACING.md, paddingBottom: 30 },
  card: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
  storeImage: { width: '100%', height: 140 },
  cardBody: { padding: SPACING.md },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  storeName: { fontSize: FONT_SIZES.md, fontWeight: '700', flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, marginLeft: SPACING.sm,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  storeAddress: { fontSize: FONT_SIZES.xs, lineHeight: 18, marginBottom: SPACING.xs },
  distanceRow: { marginBottom: SPACING.sm },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: BORDER_RADIUS.full, paddingHorizontal: 8, paddingVertical: 3,
  },
  distanceText: { fontSize: 11, fontWeight: '700', color: '#0066CC' },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, backgroundColor: '#F8FAFC',
  },
  metaText: { fontSize: 10, fontWeight: '600', color: '#1E293B' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medCount: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  actionBtns: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  mapBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  callBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: 8,
  },
  viewBtnText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
