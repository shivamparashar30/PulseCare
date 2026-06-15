import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useMedicine } from '../../../../../../packages/core/src/hooks';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { useCart } from '../context/CartContext';
import { Button, PriceDisplay, DiscountBadge } from '../../../../../../packages/shared/src/components';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'MedicineDetail'>;
type Route = RouteProp<PharmacyStackParamList, 'MedicineDetail'>;

export default function MedicineDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { medicineId } = route.params;

  const { data: medicine, isLoading } = useMedicine(medicineId);
  const { addToCart, removeFromCart, isInCart, items } = useCart();
  const [activeTab, setActiveTab] = useState<'uses' | 'side' | 'how'>('uses');

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!medicine) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Medicine not found</Text>
      </View>
    );
  }

  const inCart = isInCart(medicine.id);
  const cartItem = items.find((i) => i.medicine.id === medicine.id);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image section */}
        <View style={styles.imageSection}>
          {medicine.discountPercent > 0 && (
            <View style={styles.discountLabel}>
              <Text style={styles.discountText}>{medicine.discountPercent}% OFF</Text>
            </View>
          )}
          <Image
            source={{
              uri: `https://via.placeholder.com/200x200/${medicine.category === 'Tablet' ? '0066CC' : '00A86B'}/ffffff?text=${medicine.name.slice(0, 3)}`,
            }}
            style={styles.image}
            resizeMode="cover"
          />
          {medicine.requiresPrescription && (
            <View style={styles.rxBadge}>
              <Ionicons name="document-text-outline" size={12} color={COLORS.warning} />
              <Text style={styles.rxText}>Prescription Required</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{medicine.name}</Text>
          <Text style={styles.company}>{medicine.company}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{medicine.category}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{medicine.dosageForm}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{medicine.strength}</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaText}>{medicine.packSize}</Text>
            </View>
          </View>
          <PriceDisplay price={medicine.price} discountedPrice={medicine.discountedPrice} />
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                { backgroundColor: medicine.stock > 0 ? COLORS.success : COLORS.error },
              ]}
            />
            <Text
              style={[
                styles.stockText,
                { color: medicine.stock > 0 ? COLORS.success : COLORS.error },
              ]}
            >
              {medicine.stock > 0 ? `In Stock (${medicine.stock} units)` : 'Out of Stock'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>{medicine.description}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {([['uses', 'Uses'], ['side', 'Side Effects'], ['how', 'How to Use']] as const).map(
            ([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.tab, activeTab === key && styles.tabActive]}
                onPress={() => setActiveTab(key)}
              >
                <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <View style={styles.card}>
          {activeTab === 'uses' &&
            medicine.uses.map((u, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{u}</Text>
              </View>
            ))}
          {activeTab === 'side' &&
            medicine.sideEffects.map((s, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
          {activeTab === 'how' && (
            <Text style={styles.description}>
              Take as directed by your physician. Do not exceed the recommended dosage.
              {medicine.dosageForm === 'Tablet' || medicine.dosageForm === 'Capsule'
                ? ' Swallow with a full glass of water.'
                : ' Apply externally as instructed.'}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Price</Text>
          <Text style={styles.footerPrice}>₹{medicine.discountedPrice}</Text>
        </View>
        {inCart ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => removeFromCart(medicine.id)}
            >
              <Ionicons name="remove" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyCount}>{cartItem?.quantity ?? 0}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(medicine)}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            title="Add to Cart"
            onPress={() => addToCart(medicine)}
            disabled={medicine.stock === 0}
            size="md"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageSection: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    padding: SPACING.xl,
    position: 'relative',
  },
  image: { width: 160, height: 160, borderRadius: BORDER_RADIUS.lg },
  discountLabel: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '800' },
  rxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    backgroundColor: '#fef9c3',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  rxText: { fontSize: FONT_SIZES.xs, color: '#854d0e', fontWeight: '600' },
  infoSection: { padding: SPACING.md },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  company: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  metaChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.xs },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  description: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  tabs: { flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.xs },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 8, alignItems: 'flex-start' },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  footerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  footerPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyCount: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, minWidth: 24, textAlign: 'center' },
});
