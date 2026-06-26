import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Switch,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';
import { AddressSection, addressFromDB, addressToDBFields, formatFullAddress, EMPTY_ADDRESS } from '../../../../packages/shared/src/components';
import type { AddressData } from '../../../../packages/shared/src/components';

interface Props { onLogout: () => void; profile: any; }

const GREEN = '#059669';

export default function StoreProfileTab({ onLogout, profile }: Props) {
  const [store, setStore] = useState<any>(null);
  const [stats, setStats] = useState({ medicines: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Editable fields
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryRadius, setDeliveryRadius] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // Address (single object)
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS);

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    const [storeRes, medCount, orderCount] = await Promise.all([
      supabase.from('medical_stores').select('*').eq('id', profile.id).single(),
      supabase.from('medicines').select('id', { count: 'exact', head: true }).eq('store_id', profile.id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', profile.id),
    ]);

    if (storeRes.data) {
      setStore(storeRes.data);
      populateForm(storeRes.data);
    }
    setStats({ medicines: medCount.count || 0, orders: orderCount.count || 0 });
    setOwnerName(profile.full_name || '');
    setAvatarUrl(profile.avatar_url || null);
    setLoading(false);
  };

  const populateForm = (s: any) => {
    setStoreName(s.store_name || '');
    setPhone(s.phone || profile.phone || '');
    setOpenTime(s.open_time || '08:00 AM');
    setCloseTime(s.close_time || '10:00 PM');
    setDeliveryAvailable(!!s.delivery_available);
    setDeliveryRadius(String(s.delivery_radius_km || 5));
    setAddress(addressFromDB(s));
  };

  const handleEdit = () => {
    if (store) populateForm(store);
    setOwnerName(profile.full_name || '');
    setEditing(true);
  };

  const handleCancel = () => {
    if (store) populateForm(store);
    setOwnerName(profile.full_name || '');
    setEditing(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    setUploadingPhoto(true);
    try {
      const base64 = result.assets[0].base64;
      const fileName = `${profile.id}/${Date.now()}.jpg`;
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Store name is required.');
      return;
    }
    setSaving(true);
    try {
      const addrFields = addressToDBFields(address);
      const fullAddr = formatFullAddress(address) || store?.address || '';
      const { error: storeErr } = await supabase
        .from('medical_stores')
        .update({
          store_name: storeName.trim(),
          phone: phone.trim() || null,
          address: fullAddr || null,
          open_time: openTime.trim() || '08:00 AM',
          close_time: closeTime.trim() || '10:00 PM',
          delivery_available: deliveryAvailable,
          delivery_radius_km: parseFloat(deliveryRadius) || 5,
          ...addrFields,
        })
        .eq('id', profile.id);

      if (storeErr) throw storeErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: ownerName.trim() || profile.full_name,
          phone: phone.trim() || null,
        })
        .eq('id', profile.id);

      if (profileErr) throw profileErr;

      const { data: updated } = await supabase.from('medical_stores').select('*').eq('id', profile.id).single();
      if (updated) {
        setStore(updated);
        populateForm(updated);
      }

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
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

  const displayAvatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(store?.store_name || 'MS')}&background=059669&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Store Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploadingPhoto} activeOpacity={0.8}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: displayAvatarUrl }} style={styles.avatarImage} />
                <View style={[styles.cameraOverlay, { backgroundColor: GREEN }]}>
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={14} color="#fff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.tapText}>{uploadingPhoto ? 'Uploading...' : 'Tap to change photo'}</Text>
            {editing ? (
              <TextInput
                style={styles.editStoreName}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="Store Name"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.storeName}>{store?.store_name || 'My Store'}</Text>
            )}
            {editing ? (
              <TextInput
                style={styles.editOwnerName}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="Owner Name"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.ownerName}>{profile.full_name}</Text>
            )}
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
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>Store Information</Text>
              {!editing ? (
                <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
                  <Ionicons name="create-outline" size={16} color={GREEN} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleCancel} style={[styles.editBtn, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="close-outline" size={16} color="#DC2626" />
                  <Text style={[styles.editBtnText, { color: '#DC2626' }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {editing ? (
              <View style={styles.editForm}>
                <EditField label="Email" value={profile.email} editable={false} />
                <EditField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <EditField label="License" value={store?.license_number || 'Not set'} editable={false} />
                <EditField label="Open Time" value={openTime} onChangeText={setOpenTime} placeholder="e.g. 08:00 AM" />
                <EditField label="Close Time" value={closeTime} onChangeText={setCloseTime} placeholder="e.g. 10:00 PM" />

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.editLabel}>Delivery Available</Text>
                    <Text style={styles.editSublabel}>{deliveryAvailable ? 'Customers can order delivery' : 'Pickup only'}</Text>
                  </View>
                  <Switch
                    value={deliveryAvailable}
                    onValueChange={setDeliveryAvailable}
                    trackColor={{ true: GREEN + '60', false: '#E2E8F0' }}
                    thumbColor={deliveryAvailable ? GREEN : '#CBD5E1'}
                  />
                </View>

                {deliveryAvailable && (
                  <EditField label="Delivery Radius (km)" value={deliveryRadius} onChangeText={setDeliveryRadius} keyboardType="numeric" />
                )}

                {/* Address Section */}
                <AddressSection
                  accentColor={GREEN}
                  title="Store Address"
                  address={address}
                  editing={true}
                  onChange={setAddress}
                />

                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {[
                  { icon: 'mail-outline', label: 'Email', value: profile.email },
                  { icon: 'call-outline', label: 'Phone', value: store?.phone || profile.phone || 'Not set' },
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

                {/* Address Section (view mode) */}
                <AddressSection
                  accentColor={GREEN}
                  title="Store Address"
                  address={address}
                  editing={false}
                  onChange={setAddress}
                />
              </>
            )}
          </View>

          {/* Settings */}
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsRow} onPress={() => Alert.alert('Coming Soon', 'This feature is under development.')}>
              <Ionicons name="help-circle-outline" size={20} color="#8B5CF6" />
              <Text style={styles.settingsLabel}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EditField({ label, value, onChangeText, editable = true, multiline, keyboardType, placeholder }: {
  label: string; value: string; onChangeText?: (t: string) => void;
  editable?: boolean; multiline?: boolean; keyboardType?: any; placeholder?: string;
}) {
  return (
    <View style={styles.editFieldWrap}>
      <Text style={styles.editLabel}>{label}</Text>
      <TextInput
        style={[styles.editInput, !editable && styles.editInputDisabled, multiline && { minHeight: 60, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  scroll: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative' },
  avatarImage: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: GREEN },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  tapText: { fontSize: 12, color: GREEN, fontWeight: '600', marginTop: 6, marginBottom: 8 },
  storeName: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  editStoreName: {
    fontSize: 22, fontWeight: '800', color: '#1E293B', textAlign: 'center',
    borderBottomWidth: 1.5, borderBottomColor: GREEN, paddingBottom: 4, minWidth: 200,
  },
  ownerName: { fontSize: 14, color: '#64748B', marginTop: 2 },
  editOwnerName: {
    fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center',
    borderBottomWidth: 1, borderBottomColor: '#CBD5E1', paddingBottom: 2, minWidth: 150,
  },
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
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#ECFDF5' },
  editBtnText: { fontSize: 13, fontWeight: '600', color: GREEN },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#F0F4F8',
  },
  infoLabel: { fontSize: 11, color: '#9CA3AF' },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '500', marginTop: 2 },
  editForm: { gap: 12 },
  editFieldWrap: {},
  editLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  editSublabel: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  editInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC',
  },
  editInputDisabled: { backgroundColor: '#F1F5F9', color: '#94A3B8' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F4F8',
  },
  saveBtn: {
    alignItems: 'center', paddingVertical: 14, borderRadius: 12,
    backgroundColor: GREEN, marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
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
