import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../../../../../../packages/providers/src/AuthProvider';
import { Button } from '../../../../../../packages/shared/src/components';
import { simulateRazorpayPayment, uid } from '../../../../../../packages/core/src/utils';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'Checkout'>;

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / GPay', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' },
];

export default function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { items, payableAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  const deliveryFee = payableAmount >= 499 ? 0 : 49;
  const total = payableAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    setPaying(true);
    try {
      const orderId = 'ORD_' + uid().toUpperCase();
      const result = await simulateRazorpayPayment(total, orderId);
      clearCart();
      navigation.replace('OrderSuccess', {
        orderId,
        paymentId: result.paymentId,
        total,
        itemCount: items.length,
      });
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressName}>{user?.name}</Text>
          <Text style={styles.addressText}>
            {user?.address?.line1}, {user?.address?.city}, {user?.address?.state} -{' '}
            {user?.address?.pincode}
          </Text>
          <TouchableOpacity style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change Address</Text>
          </TouchableOpacity>
        </View>

        {/* Order items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Order Items ({items.length})</Text>
          </View>
          {items.map((item) => (
            <View key={item.medicine.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{item.medicine.name}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.medicine.discountedPrice * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Price summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Price Details</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{payableAmount}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={[styles.priceValue, deliveryFee === 0 && { color: COLORS.success }]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontWeight: '700', color: COLORS.text }]}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.methodRow}
              onPress={() => setSelectedMethod(m.id)}
            >
              <Ionicons name={m.icon as any} size={18} color={COLORS.primary} />
              <Text style={styles.methodLabel}>{m.label}</Text>
              <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>
                {selectedMethod === m.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.testBadge}>
          <Text style={styles.testText}>🧪 Test Mode — No real payment charged</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>₹{total}</Text>
        </View>
        <Button
          title={paying ? 'Placing Order…' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={paying}
          size="md"
        />
      </View>

      {paying && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayText}>Placing your order…</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  addressName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  addressText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20, marginTop: 2 },
  changeBtn: { marginTop: SPACING.sm },
  changeBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemName: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  itemQty: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginHorizontal: SPACING.sm },
  itemPrice: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  priceValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  testBadge: {
    margin: SPACING.md,
    backgroundColor: '#f0fdf4',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  testText: { fontSize: FONT_SIZES.xs, color: '#166534' },
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  overlayText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
});
