import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { useCart } from '../context/CartContext';
import { MEDICINES } from '../services/medicineData';
import { EmptyState, PriceDisplay } from '../../../../../../packages/shared/src/components';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'Wishlist'>;

export default function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { addToCart, isInCart } = useCart();
  const wishlisted = MEDICINES.filter((m) => m.isWishlisted);

  if (wishlisted.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <EmptyState
          icon="heart-outline"
          title="No saved medicines"
          subtitle="Add medicines to your wishlist"
          actionLabel="Browse Medicines"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={wishlisted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.id })}
            activeOpacity={0.9}
          >
            <Image
              source={{
                uri: `https://via.placeholder.com/70x70/${item.category === 'Tablet' ? '0066CC' : '00A86B'}/ffffff?text=${item.name.slice(0, 2)}`,
              }}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.company}>{item.company}</Text>
              <Text style={styles.pack}>{item.packSize}</Text>
              <PriceDisplay price={item.price} discountedPrice={item.discountedPrice} compact />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.heartBtn}>
                <Ionicons name="heart" size={20} color={COLORS.error} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cartBtn, isInCart(item.id) && styles.cartBtnActive]}
                onPress={() => addToCart(item)}
              >
                <Ionicons
                  name={isInCart(item.id) ? 'checkmark' : 'cart-outline'}
                  size={16}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    alignItems: 'center',
  },
  image: { width: 70, height: 70, borderRadius: BORDER_RADIUS.md },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  company: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  pack: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: 2 },
  actions: { gap: SPACING.sm, alignItems: 'center' },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtnActive: { backgroundColor: COLORS.success },
});
