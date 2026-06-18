import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { PharmacyStackParamList, Medicine } from '../../../../../../packages/core/src/types';
import { supabase } from '../../../../../../packages/supabase/src/client';
import { useCart } from '../context/CartContext';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'StoreDetail'>;
type Route_ = RouteProp<PharmacyStackParamList, 'StoreDetail'>;

export default function StoreDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route_>();
  const { storeId } = route.params;
  const { colors } = useTheme();
  const { addToCart, isInCart, totalItems } = useCart();

  const [store, setStore] = useState<any>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const load = useCallback(async () => {
    const [storeRes, medRes] = await Promise.all([
      supabase.from('medical_stores').select('*').eq('id', storeId).single(),
      supabase
        .from('medicines')
        .select('*')
        .eq('store_id', storeId)
        .eq('approval_status', 'approved')
        .eq('in_stock', true)
        .order('name'),
    ]);

    if (storeRes.data) setStore(storeRes.data);

    if (medRes.data) {
      const storeName = storeRes.data?.store_name || '';
      setMedicines(
        medRes.data.map((m: any) => ({
          id: m.id,
          name: m.name,
          company: m.manufacturer,
          category: m.category,
          price: Number(m.price),
          discountPercent: Number(m.discount_percentage) || 0,
          discountedPrice: Number(m.price) * (1 - (Number(m.discount_percentage) || 0) / 100),
          stock: m.stock_quantity || 100,
          description: m.description || '',
          uses: m.uses || [],
          sideEffects: m.side_effects || [],
          image: m.image || '',
          requiresPrescription: m.requires_prescription || false,
          dosageForm: m.dosage_form || '',
          strength: m.strength || '',
          packSize: m.pack_size || '',
          storeId: m.store_id,
          storeName,
        }))
      );
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const categories = useMemo(() => {
    const cats = new Set(medicines.map((m) => m.category));
    return ['All', ...Array.from(cats)];
  }, [medicines]);

  const filtered = useMemo(() => {
    let list = medicines;
    if (selectedCategory !== 'All') list = list.filter((m) => m.category === selectedCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.company.toLowerCase().includes(q));
    }
    return list;
  }, [medicines, selectedCategory, query]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderMedicine = ({ item }: { item: Medicine }) => {
    const inCart = isInCart(item.id);
    return (
      <TouchableOpacity
        style={[styles.medCard, { backgroundColor: colors.card }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.id })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.medImage} />
        ) : (
          <View style={[styles.medImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="medical" size={24} color={COLORS.primary} />
          </View>
        )}
        <View style={styles.medInfo}>
          <Text style={[styles.medName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.medCompany, { color: colors.textTertiary }]}>{item.company}</Text>
          <View style={styles.medPriceRow}>
            <Text style={styles.medPrice}>Rs. {Math.round(item.discountedPrice)}</Text>
            {item.discountPercent > 0 && (
              <>
                <Text style={styles.medMrp}>Rs. {item.price}</Text>
                <View style={styles.discBadge}>
                  <Text style={styles.discText}>{item.discountPercent}% OFF</Text>
                </View>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, inCart && { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}
          onPress={() => addToCart(item)}
        >
          <Ionicons name={inCart ? 'checkmark' : 'add'} size={18} color={inCart ? '#10B981' : COLORS.primary} />
        </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {store?.store_name || 'Store'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={22} color={colors.textPrimary} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Store Info */}
      <View style={[styles.storeInfo, { backgroundColor: colors.card }]}>
        {store?.store_image ? (
          <Image source={{ uri: store.store_image }} style={styles.storeImage} />
        ) : (
          <View style={[styles.storeImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="storefront" size={48} color={COLORS.primary} />
          </View>
        )}
        <View style={styles.storeDetails}>
          <View style={styles.storeNameRow}>
            <Text style={[styles.storeName, { color: colors.textPrimary }]}>{store?.store_name}</Text>
            <View style={[styles.openBadge, { backgroundColor: store?.is_open ? '#D1FAE5' : '#FEE2E2' }]}>
              <View style={[styles.openDot, { backgroundColor: store?.is_open ? '#10B981' : '#EF4444' }]} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: store?.is_open ? '#047857' : '#B91C1C' }}>
                {store?.is_open ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>{store?.address}</Text>
          <View style={styles.storeMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.metaValue}>{Number(store?.rating || 0).toFixed(1)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
              <Text style={[styles.metaValue, { color: colors.textTertiary }]}>
                {store?.open_time || '08:00 AM'} - {store?.close_time || '10:00 PM'}
              </Text>
            </View>
            {store?.delivery_available && (
              <View style={[styles.metaItem, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="bicycle-outline" size={12} color="#059669" />
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#059669' }}>Delivery</Text>
              </View>
            )}
          </View>
          {store?.phone && (
            <TouchableOpacity style={styles.callRow} onPress={() => Linking.openURL(`tel:${store.phone}`)}>
              <Ionicons name="call" size={14} color={COLORS.primary} />
              <Text style={styles.callText}>{store.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search medicines..."
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
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catChip,
              selectedCategory === cat && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.catText,
                selectedCategory === cat && { color: '#fff' },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {filtered.length} medicine{filtered.length !== 1 ? 's' : ''} available
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicine}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No medicines found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try changing your search or filters</Text>
          </View>
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
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', flex: 1, marginHorizontal: SPACING.sm },
  cartBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.error,
    borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  storeInfo: { margin: SPACING.base, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
  storeImage: { width: '100%', height: 150 },
  storeDetails: { padding: SPACING.md },
  storeNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  storeName: { fontSize: FONT_SIZES.lg, fontWeight: '700', flex: 1 },
  openBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, marginLeft: SPACING.sm,
  },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  storeAddress: { fontSize: FONT_SIZES.xs, lineHeight: 18, marginBottom: SPACING.sm },
  storeMetaRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, backgroundColor: '#F8FAFC',
  },
  metaValue: { fontSize: 10, fontWeight: '600', color: '#1E293B' },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  callText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  searchRow: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.sm, ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  catRow: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm, gap: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: '#E2E8F0',
  },
  catText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#64748B' },
  count: { fontSize: FONT_SIZES.xs, fontWeight: '500', paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.base, gap: SPACING.sm, paddingBottom: 30 },
  medCard: {
    flexDirection: 'row', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    ...SHADOWS.sm, gap: SPACING.md, alignItems: 'center',
  },
  medImage: { width: 60, height: 60, borderRadius: BORDER_RADIUS.md },
  medInfo: { flex: 1 },
  medName: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  medCompany: { fontSize: 10, marginBottom: 4 },
  medPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  medPrice: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary },
  medMrp: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  discText: { fontSize: 9, fontWeight: '700', color: '#EF4444' },
  addBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5,
    borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  emptyContainer: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', marginTop: SPACING.md },
  emptySubtitle: { fontSize: FONT_SIZES.sm, marginTop: 4 },
});
