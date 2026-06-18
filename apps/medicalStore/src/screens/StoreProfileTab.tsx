import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props { onLogout: () => void; profile: any; }

const GREEN = '#059669';

export default function StoreProfileTab({ onLogout, profile }: Props) {
  const [store, setStore] = useState<any>(null);
  const [stats, setStats] = useState({ medicines: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    const [storeRes, medCount, orderCount] = await Promise.all([
      supabase.from('medical_stores').select('*').eq('id', profile.id).single(),
      supabase.from('medicines').select('id', { count: 'exact', head: true }).eq('store_id', profile.id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', profile.id),
    ]);

    if (storeRes.data) setStore(storeRes.data);
    setStats({ medicines: medCount.count || 0, orders: orderCount.count || 0 });
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={GREEN} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Store Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="storefront" size={40} color={GREEN} />
          </View>
          <Text style={styles.storeName}>{store?.store_name || 'My Store'}</Text>
          <Text style={styles.ownerName}>{profile.full_name}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color={GREEN} />
            <Text style={styles.verifiedText}>Verified Store</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Medicines', value: stats.medicines, icon: 'medical' },
            { label: 'Orders', value: stats.orders, icon: 'receipt' },
            { label: 'Rating', value: Number(store?.rating || 0).toFixed(1), icon: 'star' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={stat.icon as any} size={18} color={GREEN} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Store Information</Text>
          {[
            { icon: 'mail-outline', label: 'Email', value: profile.email },
            { icon: 'call-outline', label: 'Phone', value: store?.phone || profile.phone || 'Not set' },
            { icon: 'location-outline', label: 'Address', value: store?.address || 'Not set' },
            { icon: 'document-text-outline', label: 'License', value: store?.license_number || 'Not set' },
            { icon: 'time-outline', label: 'Hours', value: `${store?.open_time || '08:00 AM'} - ${store?.close_time || '10:00 PM'}` },
            { icon: 'bicycle-outline', label: 'Delivery', value: store?.delivery_available ? `Available (${store?.delivery_radius_km || 5} km)` : 'Not available' },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.infoRow}>
              <Ionicons name={icon as any} size={18} color="#9CA3AF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          {[
            { icon: 'create-outline', label: 'Edit Store Info', color: '#3B82F6' },
            { icon: 'help-circle-outline', label: 'Contact Support', color: '#8B5CF6' },
          ].map(({ icon, label, color }) => (
            <TouchableOpacity key={label} style={styles.settingsRow} onPress={() => Alert.alert('Coming Soon', 'This feature is under development.')}>
              <Ionicons name={icon as any} size={20} color={color} />
              <Text style={styles.settingsLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  scroll: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  storeName: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  ownerName: { fontSize: 14, color: '#64748B', marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8,
    backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: GREEN },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    justifyContent: 'space-around', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#F0F4F8',
  },
  infoLabel: { fontSize: 11, color: '#9CA3AF' },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '500', marginTop: 2 },
  settingsCard: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F4F8',
  },
  settingsLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#FCA5A5',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
