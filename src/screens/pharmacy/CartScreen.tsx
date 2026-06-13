import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { PharmacyStackParamList } from '../../types';
import { useCart } from '../../context/CartContext';
import { Button, EmptyState } from '../../components/common';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { items, removeFromCart, addToCart, totalAmount, discount, payableAmount, clearCart } = useCart();

  const FREE_DELIVERY_THRESHOLD = 499;
  const deliveryFee = payableAmount >= FREE_DELIVERY_THRESHOLD ? 0 : 49;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          subtitle="Add medicines to continue"
          actionLabel="Browse Medicines"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.medicine.id}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 200 }}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>{items.length} item{items.length > 1 ? 's' : ''} in cart</Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>MRP Total</Text>
              <Text style={styles.rowValue}>₹{totalAmount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Discount</Text>
              <Text style={[styles.rowValue, { color: COLORS.success }]}>-₹{discount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Delivery Fee</Text>
              <Text style={[styles.rowValue, deliveryFee === 0 && { color: COLORS.success }]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </Text>
            </View>
            {payableAmount < FREE_DELIVERY_THRESHOLD && (
              <Text style={styles.freeDeliveryNote}>
                Add ₹{FREE_DELIVERY_THRESHOLD - payableAmount} more for free delivery
              </Text>
            )}
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{payableAmount + deliveryFee}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.savingsBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.savingsText}>You save ₹{discount} on this order</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{
                uri: `https://via.placeholder.com/60x60/${item.medicine.category === 'Tablet' ? '0066CC' : '00A86B'}/ffffff?text=${item.medicine.name.slice(0, 2)}`,
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.medicine.name}</Text>
              <Text style={styles.itemCompany}>{item.medicine.company}</Text>
              <Text style={styles.itemPack}>{item.medicine.packSize}</Text>
              <View style={styles.priceQtyRow}>
                <View>
                  <Text style={styles.itemPrice}>₹{item.medicine.discountedPrice}</Text>
                  {item.medicine.discountPercent > 0 && (
                    <Text style={styles.itemMrp}>MRP ₹{item.medicine.price}</Text>
                  )}
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => removeFromCart(item.medicine.id)}
                  >
                    <Ionicons name="remove" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(item.medicine)}
                  >
                    <Ionicons name="add" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>₹{payableAmount + deliveryFee}</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          size="md"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  clearText: { fontSize: FONT_SIZES.sm, color: COLORS.error, fontWeight: '600' },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  itemImage: { width: 60, height: 60, borderRadius: BORDER_RADIUS.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  itemCompany: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  itemPack: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  itemMrp: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginTop: SPACING.sm,
  },
  summaryTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  rowValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  freeDeliveryNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  savingsText: { fontSize: FONT_SIZES.xs, color: '#166534', fontWeight: '600' },
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
  footerTotal: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
});
