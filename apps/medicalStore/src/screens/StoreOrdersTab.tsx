import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import ChatScreen from '../../../../packages/shared/src/components/ChatScreen';

interface Props { profile: any; }

const GREEN = '#059669';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
  ready: '#14B8A6', out_for_delivery: '#F97316', delivered: '#10B981',
  cancelled: '#6B7280', rejected: '#EF4444',
};

const STATUS_BG: Record<string, string> = {
  pending: '#FEF3C7', confirmed: '#DBEAFE', processing: '#EDE9FE',
  ready: '#CCFBF1', out_for_delivery: '#FFEDD5', delivered: '#D1FAE5',
  cancelled: '#F3F4F6', rejected: '#FEE2E2',
};

const FILTERS = ['All', 'Pending', 'Active', 'Completed'];

export default function StoreOrdersTab({ profile }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [otpModal, setOtpModal] = useState(false);
  const [otpOrderId, setOtpOrderId] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Chat modal state
  const [chatModal, setChatModal] = useState(false);
  const [chatOrderId, setChatOrderId] = useState('');
  const [chatCustomerName, setChatCustomerName] = useState('');

  // Accept order modal
  const [acceptModal, setAcceptModal] = useState(false);
  const [acceptOrderId, setAcceptOrderId] = useState('');
  const [estTime, setEstTime] = useState('30');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(id, quantity, price, medicine:medicines!medicine_id(name)), patient:profiles!patient_id(full_name)')
      .eq('store_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data.map((o: any) => ({
        ...o,
        itemCount: o.items?.length || 0,
        itemsList: (o.items || []).map((it: any) => {
          const med = Array.isArray(it.medicine) ? it.medicine[0] : it.medicine;
          return `${med?.name || 'Item'} x${it.quantity}`;
        }),
      })));
    }
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    if (filter === 'All') return orders;
    if (filter === 'Pending') return orders.filter((o) => o.status === 'pending');
    if (filter === 'Active') return orders.filter((o) =>
      ['confirmed', 'processing', 'ready', 'out_for_delivery'].includes(o.status)
    );
    if (filter === 'Completed') return orders.filter((o) =>
      ['delivered', 'cancelled', 'rejected'].includes(o.status)
    );
    return orders;
  }, [orders, filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      note: `Status changed to ${newStatus} by store`,
    });
    load();
  };

  const handleAccept = (orderId: string) => {
    setAcceptOrderId(orderId);
    setEstTime('30');
    setAcceptModal(true);
  };

  const confirmAccept = async () => {
    const minutes = Number(estTime) || 30;
    await supabase.from('orders').update({
      status: 'confirmed',
      estimated_delivery_minutes: minutes,
    }).eq('id', acceptOrderId);
    await supabase.from('order_status_history').insert({
      order_id: acceptOrderId,
      status: 'confirmed',
      note: `Order accepted. Estimated delivery: ${minutes} minutes`,
    });
    setAcceptModal(false);
    load();
  };

  const handleReject = (orderId: string) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus(orderId, 'rejected') },
    ]);
  };

  const handleDispatch = async (orderId: string) => {
    const { data, error } = await supabase.rpc('dispatch_order', { p_order_id: orderId });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      const otp = data;
      Alert.alert('Order Dispatched', `Delivery OTP: ${otp}\n\nShare this OTP with the delivery person.`);
      load();
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit OTP');
      return;
    }
    setVerifying(true);
    const { data, error } = await supabase.rpc('verify_delivery_otp', {
      p_order_id: otpOrderId,
      p_otp: otpInput,
    });
    setVerifying(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data === true) {
      Alert.alert('Success', 'Delivery verified! Order marked as delivered.');
      setOtpModal(false);
      setOtpInput('');
      load();
    } else {
      Alert.alert('Invalid OTP', 'The OTP does not match. Please try again.');
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={GREEN} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && { backgroundColor: GREEN, borderColor: GREEN }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
                <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[item.status] || '#F3F4F6' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#6B7280' }]}>
                  {item.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            {/* Items preview */}
            <View style={styles.itemsPreview}>
              {item.itemsList.slice(0, 3).map((name: string, i: number) => (
                <Text key={i} style={styles.itemPreviewText}>· {name}</Text>
              ))}
              {item.itemCount > 3 && (
                <Text style={styles.itemPreviewMore}>+{item.itemCount - 3} more</Text>
              )}
            </View>

            <View style={styles.orderBottom}>
              <Text style={styles.orderTotal}>Rs. {item.total_amount}</Text>
              <Text style={styles.orderItemCount}>{item.itemCount} item{item.itemCount !== 1 ? 's' : ''}</Text>
            </View>

            {item.estimated_delivery_minutes && !['delivered', 'cancelled', 'rejected'].includes(item.status) && (
              <View style={styles.estBanner}>
                <Ionicons name="time-outline" size={14} color="#059669" />
                <Text style={styles.estText}>Est. delivery: {item.estimated_delivery_minutes} min</Text>
              </View>
            )}

            {/* Action buttons */}
            {item.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                  <Ionicons name="close" size={16} color="#EF4444" />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === 'confirmed' && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item.id, 'processing')}>
                <Ionicons name="flask-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Start Processing</Text>
              </TouchableOpacity>
            )}
            {item.status === 'processing' && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(item.id, 'ready')}>
                <Ionicons name="bag-check-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Ready for Delivery</Text>
              </TouchableOpacity>
            )}
            {item.status === 'ready' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F97316' }]} onPress={() => handleDispatch(item.id)}>
                <Ionicons name="bicycle-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Dispatch Order</Text>
              </TouchableOpacity>
            )}
            {item.status === 'out_for_delivery' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                onPress={() => { setOtpOrderId(item.id); setOtpInput(''); setOtpModal(true); }}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Verify Delivery OTP</Text>
              </TouchableOpacity>
            )}
            {/* Chat button for active orders */}
            {['confirmed', 'processing', 'ready', 'out_for_delivery'].includes(item.status) && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#2563EB', marginTop: item.status === 'confirmed' || item.status === 'processing' || item.status === 'ready' || item.status === 'out_for_delivery' ? 6 : 10 }]}
                onPress={() => {
                  const patient = Array.isArray(item.patient) ? item.patient[0] : item.patient;
                  setChatOrderId(item.id);
                  setChatCustomerName(patient?.full_name || 'Customer');
                  setChatModal(true);
                }}
              >
                <Ionicons name="chatbubbles" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Chat with Customer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Accept Order Modal */}
      <Modal visible={acceptModal} transparent animationType="fade">
        <View style={styles.otpOverlay}>
          <View style={styles.otpCard}>
            <Text style={styles.otpTitle}>Accept Order</Text>
            <Text style={styles.otpDesc}>Set estimated delivery time for the customer.</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', alignSelf: 'flex-start', marginBottom: 8 }}>Estimated Delivery (minutes)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['15', '30', '45', '60'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, estTime === t && { backgroundColor: GREEN, borderColor: GREEN }]}
                  onPress={() => setEstTime(t)}
                >
                  <Text style={[styles.timeChipText, estTime === t && { color: '#fff' }]}>{t} min</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.otpInput}
              value={estTime}
              onChangeText={setEstTime}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor="#D1D5DB"
            />
            <View style={styles.otpActions}>
              <TouchableOpacity style={styles.otpCancel} onPress={() => setAcceptModal(false)}>
                <Text style={styles.otpCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.otpVerify, { backgroundColor: GREEN }]} onPress={confirmAccept}>
                <Text style={styles.otpVerifyText}>Accept Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal visible={chatModal} animationType="slide">
        <ChatScreen
          entityType="order"
          entityId={chatOrderId}
          otherPersonName={chatCustomerName}
          isBusiness={true}
          accentColor="#059669"
          onBack={() => setChatModal(false)}
        />
      </Modal>

      {/* OTP Verification Modal */}
      <Modal visible={otpModal} transparent animationType="fade">
        <View style={styles.otpOverlay}>
          <View style={styles.otpCard}>
            <Text style={styles.otpTitle}>Verify Delivery OTP</Text>
            <Text style={styles.otpDesc}>Enter the 4-digit OTP from the customer to confirm delivery.</Text>
            <TextInput
              style={styles.otpInput}
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="numeric"
              maxLength={4}
              placeholder="----"
              placeholderTextColor="#D1D5DB"
            />
            <View style={styles.otpActions}>
              <TouchableOpacity style={styles.otpCancel} onPress={() => setOtpModal(false)}>
                <Text style={styles.otpCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.otpVerify} onPress={handleVerifyOtp} disabled={verifying}>
                {verifying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.otpVerifyText}>Verify</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 30 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, color: '#9CA3AF', marginTop: 8 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  orderDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  itemsPreview: { marginBottom: 10, paddingLeft: 4 },
  itemPreviewText: { fontSize: 12, color: '#64748B', lineHeight: 20 },
  itemPreviewMore: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  orderItemCount: { fontSize: 12, color: '#9CA3AF' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#FCA5A5',
  },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, borderRadius: 10, backgroundColor: GREEN,
  },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 10, backgroundColor: GREEN, marginTop: 10,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  estBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 8 },
  estText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  timeChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  // OTP Modal
  otpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  otpCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  otpTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  otpDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  otpInput: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 14, padding: 16,
    fontSize: 28, fontWeight: '800', color: '#1F2937', textAlign: 'center',
    width: '60%', letterSpacing: 12,
  },
  otpActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  otpCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  otpCancelText: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  otpVerify: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#10B981', alignItems: 'center' },
  otpVerifyText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
