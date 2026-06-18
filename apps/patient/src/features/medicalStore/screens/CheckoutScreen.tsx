import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, RAZORPAY_KEY } from '../../../../../../packages/core/src/constants';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { useCart } from '../context/CartContext';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { RazorpayWebCheckout } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'Checkout'>;

export default function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { items, totalAmount, discount, deliveryFee, payableAmount, storeId, storeName, clearCart } = useCart();
  const { colors } = useTheme();

  const [paying, setPaying] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
    if (profile) setUserName(profile.full_name || '');

    const { data } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('is_default', { ascending: false });

    if (data && data.length > 0) {
      setAddresses(data);
      setSelectedAddress(data.find((a: any) => a.is_default) || data[0]);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      Alert.alert('Missing Fields', 'Please fill in all required address fields.');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('saved_addresses')
      .insert({
        user_id: session.user.id,
        label: newAddr.label || 'Home',
        line1: newAddr.line1,
        line2: newAddr.line2 || null,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (error) { Alert.alert('Error', error.message); return; }
    setShowAddAddress(false);
    setNewAddr({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });
    loadAddresses();
    if (data) setSelectedAddress(data);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Add Address', 'Please add a delivery address to continue.');
      setShowAddAddress(true);
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }
    setPaymentModal(true);
  };

  const onPaymentSuccess = async (paymentId: string) => {
    setPaymentModal(false);
    setPaying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not logged in');

      const addressStr = `${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;

      // Calculate estimated delivery (30-60 min)
      const estimatedMinutes = 30 + Math.floor(Math.random() * 30);

      // Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          patient_id: session.user.id,
          store_id: storeId,
          status: 'pending',
          total_amount: payableAmount,
          subtotal: totalAmount,
          discount_amount: discount,
          delivery_fee: deliveryFee,
          delivery_address: addressStr,
          payment_status: 'paid',
          payment_id: paymentId,
          estimated_delivery_minutes: estimatedMinutes,
        })
        .select()
        .single();

      if (orderErr || !order) throw new Error(orderErr?.message || 'Failed to create order');

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        medicine_id: item.medicine.id,
        quantity: item.quantity,
        price: item.medicine.discountedPrice,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) console.warn('Order items insert error:', itemsErr.message);

      // Insert initial status history
      await supabase.from('order_status_history').insert({
        order_id: order.id,
        status: 'pending',
        note: 'Order placed successfully',
      });

      clearCart();
      navigation.replace('OrderSuccess', { orderId: order.id });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to place order. Payment was successful — contact support.');
    } finally {
      setPaying(false);
    }
  };

  const onPaymentCancel = () => setPaymentModal(false);
  const onPaymentError = (error: string) => {
    setPaymentModal(false);
    Alert.alert('Payment Failed', error || 'Please try again.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Store Info */}
        {storeName && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardRow}>
              <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Ordering from</Text>
            </View>
            <Text style={[styles.storeName, { color: colors.textPrimary }]}>{storeName}</Text>
          </View>
        )}

        {/* Delivery Address */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Delivery Address</Text>
          </View>
          {selectedAddress ? (
            <>
              <View style={styles.addrLabelRow}>
                <View style={styles.addrLabelBadge}>
                  <Text style={styles.addrLabelText}>{selectedAddress.label}</Text>
                </View>
                <Text style={[styles.addrName, { color: colors.textPrimary }]}>{userName}</Text>
              </View>
              <Text style={[styles.addrText, { color: colors.textSecondary }]}>
                {selectedAddress.line1}{selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </Text>
              <TouchableOpacity style={styles.changeBtn} onPress={() => setShowAddAddress(true)}>
                <Text style={styles.changeBtnText}>Change / Add Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.addAddrBtn} onPress={() => setShowAddAddress(true)}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addAddrText}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}

          {/* Address picker */}
          {addresses.length > 1 && (
            <View style={{ marginTop: SPACING.sm }}>
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addrOption, selectedAddress?.id === addr.id && styles.addrOptionActive]}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <View style={[styles.radioOuter, selectedAddress?.id === addr.id && styles.radioOuterActive]}>
                    {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addrOptionLabel, { color: colors.textPrimary }]}>{addr.label}</Text>
                    <Text style={[styles.addrOptionText, { color: colors.textTertiary }]} numberOfLines={1}>
                      {addr.line1}, {addr.city}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardRow}>
            <Ionicons name="bag-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Order Items ({items.length})</Text>
          </View>
          {items.map((item) => (
            <View key={item.medicine.id} style={styles.itemRow}>
              <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.medicine.name}</Text>
              <Text style={[styles.itemQty, { color: colors.textTertiary }]}>x{item.quantity}</Text>
              <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>Rs. {item.medicine.discountedPrice * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Price Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardRow}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Price Details</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Item Total</Text>
            <Text style={[styles.priceValue, { color: colors.textPrimary }]}>Rs. {totalAmount}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Discount</Text>
              <Text style={[styles.priceValue, { color: '#10B981' }]}>-Rs. {discount}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.priceValue, deliveryFee === 0 ? { color: '#10B981' } : { color: colors.textPrimary }]}>
              {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontWeight: '700', color: colors.textPrimary }]}>Total</Text>
            <Text style={styles.totalValue}>Rs. {payableAmount}</Text>
          </View>
        </View>

        {/* Estimated Delivery */}
        <View style={[styles.deliveryBanner, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="bicycle-outline" size={20} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1E40AF' }}>Estimated Delivery</Text>
            <Text style={{ fontSize: FONT_SIZES.xs, color: '#3B82F6', marginTop: 2 }}>30-60 minutes after store confirms</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.footerLabel, { color: colors.textTertiary }]}>Total</Text>
          <Text style={styles.footerTotal}>Rs. {payableAmount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, paying && { opacity: 0.6 }]}
          onPress={handlePlaceOrder}
          disabled={paying}
          activeOpacity={0.85}
        >
          {paying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="card-outline" size={18} color="#fff" />
              <Text style={styles.payBtnText}>Pay Rs. {payableAmount}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Razorpay Payment Modal */}
      <Modal visible={paymentModal} animationType="slide" onRequestClose={onPaymentCancel}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
          <RazorpayWebCheckout
            amount={payableAmount}
            razorpayKey={RAZORPAY_KEY}
            name="PulseCare Pharmacy"
            description={`Order from ${storeName || 'Medical Store'}`}
            themeColor={COLORS.primary}
            onSuccess={onPaymentSuccess}
            onCancel={onPaymentCancel}
            onError={onPaymentError}
          />
        </SafeAreaView>
      </Modal>

      {/* Add Address Modal */}
      <Modal visible={showAddAddress} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Address</Text>
              <TouchableOpacity onPress={() => setShowAddAddress(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Label selector */}
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
              {['Home', 'Work', 'Other'].map((label) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.labelChip, newAddr.label === label && styles.labelChipActive]}
                  onPress={() => setNewAddr((p) => ({ ...p, label }))}
                >
                  <Text style={[styles.labelChipText, newAddr.label === label && { color: '#fff' }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Address Line 1 *"
              placeholderTextColor={colors.textTertiary}
              value={newAddr.line1}
              onChangeText={(t) => setNewAddr((p) => ({ ...p, line1: t }))}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Address Line 2 (optional)"
              placeholderTextColor={colors.textTertiary}
              value={newAddr.line2}
              onChangeText={(t) => setNewAddr((p) => ({ ...p, line2: t }))}
            />
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <TextInput
                style={[styles.input, { flex: 1, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="City *"
                placeholderTextColor={colors.textTertiary}
                value={newAddr.city}
                onChangeText={(t) => setNewAddr((p) => ({ ...p, city: t }))}
              />
              <TextInput
                style={[styles.input, { flex: 1, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="State *"
                placeholderTextColor={colors.textTertiary}
                value={newAddr.state}
                onChangeText={(t) => setNewAddr((p) => ({ ...p, state: t }))}
              />
            </View>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Pincode *"
              placeholderTextColor={colors.textTertiary}
              value={newAddr.pincode}
              onChangeText={(t) => setNewAddr((p) => ({ ...p, pincode: t }))}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity style={styles.saveAddrBtn} onPress={handleSaveAddress} activeOpacity={0.85}>
              <Text style={styles.saveAddrBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {paying && (
        <View style={styles.overlay}>
          <View style={[styles.overlayCard, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.overlayText, { color: colors.textPrimary }]}>Creating your order...</Text>
          </View>
        </View>
      )}
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
  card: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  storeName: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  addrLabelBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  addrLabelText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  addrName: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  addrText: { fontSize: FONT_SIZES.xs, lineHeight: 18 },
  changeBtn: { marginTop: SPACING.sm },
  changeBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  addAddrBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  addAddrText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  addrOption: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  addrOptionActive: {},
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1',
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addrOptionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  addrOptionText: { fontSize: FONT_SIZES.xs },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemName: { flex: 1, fontSize: FONT_SIZES.sm },
  itemQty: { fontSize: FONT_SIZES.sm, marginHorizontal: SPACING.sm },
  itemPrice: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: FONT_SIZES.sm },
  priceValue: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  divider: { height: 1, marginVertical: SPACING.sm },
  totalValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  deliveryBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
  },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, paddingBottom: SPACING.lg,
    borderTopWidth: 1, ...SHADOWS.lg,
  },
  footerLabel: { fontSize: FONT_SIZES.xs },
  footerTotal: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  payBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  payBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: SPACING.lg, paddingBottom: SPACING['2xl'],
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  labelChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: '#CBD5E1',
  },
  labelChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  labelChipText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#64748B' },
  input: {
    borderWidth: 1, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.sm, marginBottom: SPACING.sm,
  },
  saveAddrBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm,
  },
  saveAddrBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  overlayCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl,
    alignItems: 'center', gap: SPACING.md,
  },
  overlayText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
});
