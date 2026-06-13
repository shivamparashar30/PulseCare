import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, MEDICINE_CATEGORIES } from '../../constants';
import { useMedicines } from '../../hooks';
import { PharmacyStackParamList } from '../../types';
import { useCart } from '../../context/CartContext';
import { MedicineCardSkeleton, EmptyState, DiscountBadge, PriceDisplay } from '../../components/common';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'PharmacyHome'>;

export default function PharmacyHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: medicines = [], isLoading, refetch, isRefetching } = useMedicines();
  const { addToCart, isInCart, totalItems } = useCart();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = [...medicines];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q),
      );
    }
    if (activeCategory !== 'All') {
      list = list.filter((m) =>
        m.category.toLowerCase().includes(activeCategory.toLowerCase()),
      );
    }
    return list;
  }, [medicines, search, activeCategory]);

  const popularMeds = useMemo(
    () => medicines.filter((m) => m.discountPercent >= 15).slice(0, 10),
    [medicines],
  );

  const renderMedicineCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.medCard}
      onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.id })}
      activeOpacity={0.9}
    >
      {item.discountPercent > 0 && <DiscountBadge percent={item.discountPercent} />}
      <Image
        source={{ uri: `https://via.placeholder.com/80x80/${item.category === 'Tablet' ? '0066CC' : '00A86B'}/ffffff?text=${item.name.slice(0, 2)}` }}
        style={styles.medImage}
      />
      <Text style={styles.medName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.medCompany} numberOfLines={1}>{item.company}</Text>
      <PriceDisplay price={item.price} discountedPrice={item.discountedPrice} compact />
      {item.stock === 0 ? (
        <View style={styles.outOfStockBtn}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addBtn, isInCart(item.id) && styles.addBtnActive]}
          onPress={() => addToCart(item)}
        >
          <Ionicons
            name={isInCart(item.id) ? 'checkmark' : 'add'}
            size={16}
            color="#fff"
          />
          <Text style={styles.addBtnText}>{isInCart(item.id) ? 'Added' : 'Add'}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search + Cart header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, brands…"
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
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {['All', ...MEDICINE_CATEGORIES].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo banner */}
        {!search && activeCategory === 'All' && (
          <View style={styles.promoBanner}>
            <View>
              <Text style={styles.promoTitle}>🏥 Upload Prescription</Text>
              <Text style={styles.promoSub}>Get medicines delivered at home</Text>
            </View>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Popular / Search results */}
        <Text style={styles.sectionTitle}>
          {search ? `Results (${filtered.length})` : activeCategory !== 'All' ? `${activeCategory} (${filtered.length})` : 'All Medicines'}
        </Text>

        {isLoading ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((k) => <MedicineCardSkeleton key={k} />)}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="medical-outline"
            title="No medicines found"
            subtitle="Try a different search term"
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderMedicineCard}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
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
  cartBtn: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
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
  promoBanner: {
    margin: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
  promoSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  promoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  promoBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  grid: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  row: { gap: SPACING.md, marginBottom: SPACING.md },
  medCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  medImage: {
    width: '100%',
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.border,
  },
  medName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  medCompany: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  addBtnActive: { backgroundColor: COLORS.success },
  addBtnText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  outOfStockBtn: {
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  outOfStockText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
