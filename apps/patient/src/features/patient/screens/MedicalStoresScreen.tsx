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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { EmptyState } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

export default function MedicalStoresScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [showOpen, setShowOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('medical_stores')
      .select('*')
      .order('rating', { ascending: false });

    if (data) {
      // Fetch medicine counts per store
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
        phone: s.phone || '',
        rating: Number(s.rating) || 0,
        isOpen: s.is_open ?? true,
        openTime: s.open_time || '08:00 AM',
        closeTime: s.close_time || '10:00 PM',
        image: s.store_image || '',
        deliveryAvailable: s.delivery_available ?? true,
        deliveryRadiusKm: s.delivery_radius_km ? Number(s.delivery_radius_km) : 5,
        medicineCount: countMap[s.id] || 0,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    let list = stores;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    if (showOpen) list = list.filter(s => s.isOpen);
    return list;
  }, [stores, query, showOpen]);

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
      {/* Store Image */}
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

        <Text style={[styles.storeAddress, { color: colors.textSecondary }]} numberOfLines={2}>{item.address}</Text>

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
            <TouchableOpacity
              style={[styles.callBtn, { borderColor: COLORS.primary }]}
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
            >
              <Ionicons name="call" size={14} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>View Store</Text>
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
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search stores..."
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
  storeAddress: { fontSize: FONT_SIZES.xs, lineHeight: 18, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, backgroundColor: '#F8FAFC',
  },
  metaText: { fontSize: 10, fontWeight: '600', color: '#1E293B' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medCount: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  actionBtns: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  callBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  viewBtnText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
