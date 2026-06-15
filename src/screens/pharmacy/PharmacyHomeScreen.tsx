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
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, MEDICINE_CATEGORIES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { useMedicines } from '../../hooks';
import { PharmacyStackParamList } from '../../types';
import { useCart } from '../../context/CartContext';
import { MedicineCardSkeleton, EmptyState, DiscountBadge, PriceDisplay } from '../../components/common';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'PharmacyHome'>;

export default function PharmacyHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: medicines = [], isLoading, refetch, isRefetching } = useMedicines();
  const { addToCart, isInCart, totalItems } = useCart();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);

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

  const popularMeds = useMemo(
    () => medicines.filter((m) => m.discountPercent >= 15).slice(0, 10),
    [medicines],
  );

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search + Cart header */}
      <View style={styles.header}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search medicines, brands…"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
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
      </View>

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
        {!search && activeCategory === 'All' && (
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

        {/* Popular / Search results */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
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
  medCompany: { fontSize: FONT_SIZES.xs, marginBottom: SPACING.xs },
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
