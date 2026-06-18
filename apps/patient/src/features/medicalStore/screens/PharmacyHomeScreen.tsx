import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  Alert,
  Modal,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, MEDICINE_CATEGORIES } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useMedicines } from '../../../../../../packages/core/src/hooks';
import { PharmacyStackParamList, Medicine } from '../../../../../../packages/core/src/types';
import { useCart } from '../context/CartContext';
import { MedicineCardSkeleton, EmptyState, DiscountBadge, PriceDisplay } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'PharmacyHome'>;

const SEARCH_HISTORY_KEY = '@medicine_search_history';
const MAX_HISTORY = 15;
const DEBOUNCE_MS = 300;

const TRENDING_SEARCHES = ['Dolo 650', 'Crocin', 'Paracetamol', 'Amoxicillin', 'Cetirizine', 'Pan 40'];

export default function PharmacyHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: medicines = [], isLoading, refetch, isRefetching } = useMedicines();
  const { addToCart, isInCart, totalItems } = useCart();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);

  // Search overlay state
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Load search history on mount
  useEffect(() => {
    AsyncStorage.getItem(SEARCH_HISTORY_KEY).then((val) => {
      if (val) setSearchHistory(JSON.parse(val));
    });
  }, []);

  const saveHistory = useCallback(async (history: string[]) => {
    setSearchHistory(history);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  }, []);

  const addToHistory = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_HISTORY);
    await saveHistory(updated);
  }, [searchHistory, saveHistory]);

  const removeFromHistory = useCallback(async (term: string) => {
    const updated = searchHistory.filter((h) => h !== term);
    await saveHistory(updated);
  }, [searchHistory, saveHistory]);

  const clearHistory = useCallback(async () => {
    await saveHistory([]);
  }, [saveHistory]);

  // Real-time search with debounce
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*, store:medical_stores!medicines_store_fk(store_name)')
        .eq('approval_status', 'approved')
        .eq('in_stock', true)
        .or(`name.ilike.%${q.trim()}%,manufacturer.ilike.%${q.trim()}%,category.ilike.%${q.trim()}%`)
        .order('name')
        .limit(20);

      if (!error && data) {
        setSearchResults(data.map((row: any) => {
          const store = Array.isArray(row.store) ? row.store[0] : row.store;
          const price = Number(row.price) || 0;
          const discountPercent = row.discount_percentage || 0;
          return {
            id: row.id,
            name: row.name,
            company: row.manufacturer || '',
            category: row.category || 'General',
            price,
            discountPercent,
            discountedPrice: Math.round(price * (1 - discountPercent / 100)),
            stock: row.stock_quantity ?? 100,
            description: row.description || '',
            uses: row.uses || [],
            sideEffects: row.side_effects || [],
            image: row.image_url || '',
            requiresPrescription: row.requires_prescription || false,
            dosageForm: row.dosage_form || 'Tablet',
            strength: row.strength || '',
            packSize: row.pack_size || '',
            storeId: row.store_id,
            storeName: store?.store_name || '',
          };
        }));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    }
    setSearchLoading(false);
  }, []);

  const onSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), DEBOUNCE_MS);
  }, [doSearch]);

  const onSearchSubmit = useCallback(() => {
    if (search.trim().length > 1) {
      addToHistory(search.trim());
    }
  }, [search, addToHistory]);

  const onHistoryTap = useCallback((term: string) => {
    setSearch(term);
    doSearch(term);
    addToHistory(term);
  }, [doSearch, addToHistory]);

  const onResultTap = useCallback((item: Medicine) => {
    addToHistory(search.trim());
    setSearchFocused(false);
    Keyboard.dismiss();
    navigation.navigate('MedicineDetail', { medicineId: item.id });
  }, [search, addToHistory, navigation]);

  const closeSearch = useCallback(() => {
    setSearchFocused(false);
    Keyboard.dismiss();
  }, []);

  const handleUploadPrescription = () => {
    Alert.alert('Upload Prescription', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Permission needed', 'Camera access is required to take a photo.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
          });
          if (!result.canceled && result.assets[0]) {
            setPrescriptionImage(result.assets[0].uri);
            setShowPrescription(true);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Permission needed', 'Gallery access is required to pick an image.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          });
          if (!result.canceled && result.assets[0]) {
            setPrescriptionImage(result.assets[0].uri);
            setShowPrescription(true);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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

  const renderMedicineCard = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.medCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.id })}
      activeOpacity={0.9}
    >
      {item.discountPercent > 0 && <DiscountBadge percent={item.discountPercent} />}
      <Image
        source={{ uri: item.image }}
        style={[styles.medImage, { backgroundColor: colors.background }]}
      />
      <Text style={[styles.medName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.medCompany, { color: colors.textSecondary }]} numberOfLines={1}>{item.company}</Text>
      {item.storeName ? <Text style={[styles.medStore, { color: colors.textTertiary }]} numberOfLines={1}>{item.storeName}</Text> : null}
      <PriceDisplay price={item.price} discountedPrice={item.discountedPrice} size="sm" />
      {item.stock === 0 ? (
        <View style={[styles.outOfStockBtn, { backgroundColor: colors.border }]}>
          <Text style={[styles.outOfStockText, { color: colors.textSecondary }]}>Out of Stock</Text>
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

  // Search result item
  const renderSearchResult = ({ item }: { item: Medicine }) => (
    <TouchableOpacity
      style={[styles.searchResultItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={() => onResultTap(item)}
      activeOpacity={0.7}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.searchResultImage} />
      ) : (
        <View style={[styles.searchResultImage, { backgroundColor: COLORS.primaryUltraLight, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="medical" size={18} color={COLORS.primary} />
        </View>
      )}
      <View style={styles.searchResultInfo}>
        <Text style={[styles.searchResultName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.searchResultMeta, { color: colors.textTertiary }]} numberOfLines={1}>
          {item.company} {item.strength ? `· ${item.strength}` : ''}
        </Text>
        {item.storeName ? (
          <Text style={styles.searchResultStore} numberOfLines={1}>
            <Ionicons name="storefront-outline" size={10} color={COLORS.accent} /> {item.storeName}
          </Text>
        ) : null}
      </View>
      <View style={styles.searchResultPriceCol}>
        <Text style={styles.searchResultPrice}>Rs. {Math.round(item.discountedPrice)}</Text>
        {item.discountPercent > 0 && (
          <Text style={styles.searchResultDiscount}>{item.discountPercent}% off</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search + Cart header */}
      <View style={styles.header}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: searchFocused ? COLORS.primary : 'transparent', borderWidth: 1.5 }]}>
          <Ionicons name="search" size={18} color={searchFocused ? COLORS.primary : colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search medicines, brands..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            onFocus={() => setSearchFocused(true)}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSearchResults([]); }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {searchFocused && (
            <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        {!searchFocused && (
          <>
            <TouchableOpacity
              style={[styles.cartBtn, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('MyOrders' as any)}
            >
              <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cartBtn, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Search overlay */}
      {searchFocused && (
        <View style={[styles.searchOverlay, { backgroundColor: colors.background }]}>
          {search.trim().length < 2 ? (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Recent searches */}
              {searchHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={styles.historySectionHeader}>
                    <Text style={[styles.historySectionTitle, { color: colors.textPrimary }]}>Recent Searches</Text>
                    <TouchableOpacity onPress={clearHistory}>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                  {searchHistory.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={[styles.historyItem, { borderBottomColor: colors.border }]}
                      onPress={() => onHistoryTap(term)}
                    >
                      <Ionicons name="time-outline" size={16} color={colors.textTertiary} />
                      <Text style={[styles.historyText, { color: colors.textPrimary }]} numberOfLines={1}>{term}</Text>
                      <TouchableOpacity onPress={() => removeFromHistory(term)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Trending searches */}
              <View style={styles.historySection}>
                <Text style={[styles.historySectionTitle, { color: colors.textPrimary }]}>Trending Searches</Text>
                <View style={styles.trendingChips}>
                  {TRENDING_SEARCHES.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={[styles.trendingChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => onHistoryTap(term)}
                    >
                      <Ionicons name="trending-up" size={12} color={COLORS.accent} />
                      <Text style={[styles.trendingChipText, { color: colors.textPrimary }]}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : searchLoading ? (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.searchLoadingText, { color: colors.textSecondary }]}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListHeaderComponent={
                <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </Text>
              }
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
              <Text style={[styles.noResultsTitle, { color: colors.textPrimary }]}>No results found</Text>
              <Text style={[styles.noResultsSubtitle, { color: colors.textSecondary }]}>
                Try a different spelling or search term
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Main content (hidden when search overlay is active) */}
      {!searchFocused && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
        >
          {/* Category chips */}
          <View style={styles.chipsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {MEDICINE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, activeCategory === cat && styles.chipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: colors.textSecondary }, activeCategory === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Promo banner */}
          {activeCategory === 'All' && (
            <View style={[styles.promoBanner, { backgroundColor: COLORS.primaryUltraLight }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Upload Prescription</Text>
                <Text style={[styles.promoSub, { color: colors.textSecondary }]}>Get medicines delivered at home</Text>
              </View>
              <TouchableOpacity style={styles.promoBtn} onPress={handleUploadPrescription}>
                <Text style={styles.promoBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Uploaded prescription preview */}
          {prescriptionImage && (
            <TouchableOpacity
              style={[styles.prescriptionPreview, { backgroundColor: colors.card }]}
              onPress={() => setShowPrescription(true)}
            >
              <Image source={{ uri: prescriptionImage }} style={styles.prescriptionThumb} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.prescriptionTitle, { color: colors.textPrimary }]}>Prescription Uploaded</Text>
                <Text style={[styles.prescriptionSub, { color: colors.textSecondary }]}>Tap to view full image</Text>
              </View>
              <TouchableOpacity onPress={() => { setPrescriptionImage(null); setShowPrescription(false); }}>
                <Ionicons name="close-circle" size={22} color={COLORS.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Prescription full view modal */}
          <Modal visible={showPrescription} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Prescription</Text>
                  <TouchableOpacity onPress={() => setShowPrescription(false)}>
                    <Ionicons name="close" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
                {prescriptionImage && (
                  <Image source={{ uri: prescriptionImage }} style={styles.prescriptionFull} resizeMode="contain" />
                )}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalBtn} onPress={handleUploadPrescription}>
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                    <Text style={styles.modalBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: COLORS.success }]}
                    onPress={() => {
                      setShowPrescription(false);
                      Alert.alert('Submitted', 'Your prescription has been submitted. Our pharmacist will review it and prepare your order.');
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.modalBtnText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </Modal>

          {/* All Medicines */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {activeCategory !== 'All' ? `${activeCategory} (${filtered.length})` : 'All Medicines'}
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  cancelBtn: { paddingLeft: SPACING.xs },
  cancelText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  cartBtn: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    position: 'relative' as const,
  },
  cartBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' as const },

  // Search overlay
  searchOverlay: { flex: 1 },
  historySection: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  historySectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  historySectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  clearAllText: { fontSize: FONT_SIZES.xs, color: COLORS.error, fontWeight: '600' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: SPACING.sm,
  },
  historyText: { flex: 1, fontSize: FONT_SIZES.sm },
  trendingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  trendingChipText: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  searchLoadingContainer: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  searchLoadingText: { fontSize: FONT_SIZES.sm },
  resultCount: { fontSize: FONT_SIZES.xs, fontWeight: '500', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xs },
  noResultsContainer: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  noResultsTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  noResultsSubtitle: { fontSize: FONT_SIZES.sm },

  // Search result items
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: SPACING.md,
  },
  searchResultImage: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  searchResultMeta: { fontSize: 11, marginTop: 1 },
  searchResultStore: { fontSize: 10, color: COLORS.accent, fontWeight: '500', marginTop: 1 },
  searchResultPriceCol: { alignItems: 'flex-end' },
  searchResultPrice: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.primary },
  searchResultDiscount: { fontSize: 10, color: COLORS.success, fontWeight: '600' },

  // Main content styles
  chipsContainer: { height: 48, marginBottom: SPACING.xs },
  chips: { paddingHorizontal: SPACING.md, alignItems: 'center' as const, height: 48, gap: SPACING.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZES.sm, fontWeight: '500' as const },
  chipTextActive: { color: '#fff' },
  promoBanner: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  promoTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' as const, color: COLORS.primary },
  promoSub: { fontSize: FONT_SIZES.xs },
  promoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  promoBtnText: { color: '#fff', fontWeight: '700' as const, fontSize: FONT_SIZES.sm },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700' as const,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  skeletonGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  grid: { paddingHorizontal: SPACING.md, paddingBottom: 20 },
  row: { gap: SPACING.md, marginBottom: SPACING.md },
  medCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  medImage: {
    width: '100%' as any,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    resizeMode: 'cover' as const,
    marginBottom: SPACING.sm,
  },
  medName: { fontSize: FONT_SIZES.sm, fontWeight: '700' as const, marginBottom: 2 },
  medCompany: { fontSize: FONT_SIZES.xs, marginBottom: 2 },
  medStore: { fontSize: 9, fontWeight: '500', marginBottom: SPACING.xs },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    marginTop: SPACING.sm,
  },
  addBtnActive: { backgroundColor: COLORS.success },
  addBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' as const },
  outOfStockBtn: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center' as const,
    marginTop: SPACING.sm,
  },
  outOfStockText: { fontSize: FONT_SIZES.sm, fontWeight: '600' as const },
  prescriptionPreview: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  prescriptionThumb: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
  },
  prescriptionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
  },
  prescriptionSub: {
    fontSize: FONT_SIZES.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'space-between' as const,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modalTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700' as const,
  },
  prescriptionFull: {
    flex: 1,
    width: '100%' as any,
    marginVertical: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  modalBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600' as const,
  },
});
