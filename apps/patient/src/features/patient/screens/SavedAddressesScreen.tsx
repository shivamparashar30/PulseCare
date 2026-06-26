import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Modal,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

// Lazy import
let Location: any = null;
try { Location = require('expo-location'); } catch {}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
];

interface SavedAddr {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

const EMPTY_FORM = { label: 'Home', line1: '', line2: '', landmark: '', city: '', state: '', pincode: '', latitude: null as number | null, longitude: null as number | null };

export default function SavedAddressesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [addresses, setAddresses] = useState<SavedAddr[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const loadAddresses = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadAddresses(); }, [loadAddresses]));

  const onRefresh = async () => { setRefreshing(true); await loadAddresses(); setRefreshing(false); };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (addr: SavedAddr) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2 || '',
      landmark: '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setShowModal(true);
  };

  const detectLocation = async () => {
    if (!Location) {
      Alert.alert('Unavailable', 'Location services are not available on this device.');
      return;
    }
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings.');
        setDetectingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      const updated = { ...form, latitude: lat, longitude: lng };

      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geo) {
          if (geo.city) updated.city = geo.city;
          if (geo.region) updated.state = geo.region;
          if (geo.postalCode) updated.pincode = geo.postalCode;
          if (geo.street || geo.name) updated.line1 = [geo.name, geo.street].filter(Boolean).join(', ');
        }
      } catch {}

      setForm(updated);
      Alert.alert('Location Detected', `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}\nAddress fields auto-filled.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to detect location');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!form.line1.trim()) { Alert.alert('Required', 'Address Line 1 is required.'); return; }
    if (!form.city.trim()) { Alert.alert('Required', 'City is required.'); return; }
    if (!form.state.trim()) { Alert.alert('Required', 'State is required.'); return; }
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) { Alert.alert('Required', 'Enter a valid 6-digit pincode.'); return; }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const payload = {
        user_id: session.user.id,
        label: form.label || 'Home',
        line1: form.line1.trim(),
        line2: form.line2?.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        is_default: addresses.length === 0,
      };

      if (editingId) {
        const { is_default, user_id, ...updatePayload } = payload;
        const { error } = await supabase.from('saved_addresses').update(updatePayload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('saved_addresses').insert(payload);
        if (error) throw error;
      }

      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadAddresses();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('saved_addresses').update({ is_default: false }).eq('user_id', session.user.id);
    await supabase.from('saved_addresses').update({ is_default: true }).eq('id', id);
    loadAddresses();
  };

  const deleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('saved_addresses').delete().eq('id', id);
          loadAddresses();
        }
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Saved Addresses" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Saved Addresses" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="location-outline" size={48} color="#CBD5E1" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Saved Addresses</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              Add your home, work, or other addresses for quick checkout
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAddModal}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[styles.addrCard, { backgroundColor: colors.card, borderColor: addr.is_default ? COLORS.primary + '40' : colors.border }]}>
              {/* Header Row */}
              <View style={styles.addrCardHeader}>
                <View style={styles.addrLabelRow}>
                  <Ionicons
                    name={addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'briefcase' : 'location'}
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={[styles.addrLabel, { color: colors.textPrimary }]}>{addr.label}</Text>
                  {addr.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(addr)}>
                    <Ionicons name="create-outline" size={16} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => deleteAddress(addr.id)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Address Text */}
              <Text style={[styles.addrText, { color: colors.textPrimary }]}>{addr.line1}</Text>
              {addr.line2 ? <Text style={[styles.addrTextLight, { color: colors.textSecondary }]}>{addr.line2}</Text> : null}
              <Text style={[styles.addrText, { color: colors.textPrimary }]}>
                {addr.city}, {addr.state} - {addr.pincode}
              </Text>

              {/* Coordinates */}
              {addr.latitude != null && addr.longitude != null && (
                <View style={styles.coordRow}>
                  <Ionicons name="navigate-circle" size={14} color="#059669" />
                  <Text style={styles.coordText}>{addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}</Text>
                </View>
              )}

              {/* Set Default */}
              {!addr.is_default && (
                <TouchableOpacity style={styles.setDefaultBtn} onPress={() => setDefault(addr.id)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.setDefaultText}>Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB - Add Address */}
      {addresses.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.85}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Address Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </Text>
                  <TouchableOpacity onPress={() => { setShowModal(false); setShowStatePicker(false); }}>
                    <Ionicons name="close-circle" size={28} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                {/* Detect Location */}
                <TouchableOpacity
                  style={styles.detectBtn}
                  onPress={detectLocation}
                  disabled={detectingLocation}
                  activeOpacity={0.7}
                >
                  {detectingLocation ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons name="navigate" size={20} color={COLORS.primary} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detectTitle}>
                      {detectingLocation ? 'Detecting your location...' : form.latitude ? 'Re-detect My Location' : 'Use My Current Location'}
                    </Text>
                    <Text style={styles.detectSubtitle}>Auto-fill address using GPS</Text>
                  </View>
                  {!detectingLocation && <Ionicons name="chevron-forward" size={16} color={COLORS.primary + '60'} />}
                </TouchableOpacity>

                {form.latitude != null && form.longitude != null && (
                  <View style={styles.coordBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.coordBadgeText}>Location: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</Text>
                  </View>
                )}

                {/* Label Selector */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Address Label</Text>
                <View style={styles.labelsRow}>
                  {['Home', 'Work', 'Other'].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={[styles.labelChip, { borderColor: colors.border }, form.label === label && styles.labelChipActive]}
                      onPress={() => setForm(p => ({ ...p, label }))}
                    >
                      <Ionicons
                        name={label === 'Home' ? 'home-outline' : label === 'Work' ? 'briefcase-outline' : 'location-outline'}
                        size={14}
                        color={form.label === label ? '#fff' : colors.textSecondary}
                      />
                      <Text style={[styles.labelChipText, { color: colors.textSecondary }, form.label === label && { color: '#fff' }]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Form Fields */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Address Line 1 <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Building, Street, Area"
                  placeholderTextColor={colors.textTertiary}
                  value={form.line1}
                  onChangeText={(t) => setForm(p => ({ ...p, line1: t }))}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Address Line 2</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="Floor, Suite (optional)"
                  placeholderTextColor={colors.textTertiary}
                  value={form.line2}
                  onChangeText={(t) => setForm(p => ({ ...p, line2: t }))}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>City <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="City"
                      placeholderTextColor={colors.textTertiary}
                      value={form.city}
                      onChangeText={(t) => setForm(p => ({ ...p, city: t }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Pincode <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="6-digit"
                      placeholderTextColor={colors.textTertiary}
                      value={form.pincode}
                      onChangeText={(t) => setForm(p => ({ ...p, pincode: t }))}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* State Picker */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>State <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <TouchableOpacity
                  style={[styles.pickerBtn, { borderColor: showStatePicker ? COLORS.primary : colors.border, backgroundColor: colors.background }]}
                  onPress={() => setShowStatePicker(!showStatePicker)}
                >
                  <Text style={[styles.pickerText, !form.state && { color: colors.textTertiary }]}>
                    {form.state || 'Select State'}
                  </Text>
                  <Ionicons name={showStatePicker ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
                </TouchableOpacity>
                {showStatePicker && (
                  <View style={[styles.stateList, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled showsVerticalScrollIndicator>
                      {INDIAN_STATES.map(st => (
                        <TouchableOpacity
                          key={st}
                          style={[styles.stateItem, form.state === st && { backgroundColor: COLORS.primary + '12' }]}
                          onPress={() => { setForm(p => ({ ...p, state: st })); setShowStatePicker(false); }}
                        >
                          <Text style={[styles.stateItemText, { color: colors.textPrimary }, form.state === st && { color: COLORS.primary, fontWeight: '700' }]}>{st}</Text>
                          {form.state === st && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>{editingId ? 'Update Address' : 'Save Address'}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Address card
  addrCard: {
    borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12,
    ...SHADOWS.sm,
  },
  addrCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabel: { fontSize: 15, fontWeight: '700' },
  defaultBadge: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  addrText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  addrTextLight: { fontSize: 13, lineHeight: 18 },
  coordRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  coordText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  setDefaultBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  setDefaultText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.lg,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },

  // Detect button
  detectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: COLORS.primary + '08', marginBottom: 12,
  },
  detectTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  detectSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 1 },

  // Coord badge
  coordBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12, alignSelf: 'flex-start' },
  coordBadgeText: { fontSize: 12, color: '#059669', fontWeight: '600' },

  // Labels
  labelsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  labelChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  labelChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  labelChipText: { fontSize: 13, fontWeight: '600' },

  // Form
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 5, marginTop: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, marginBottom: 10 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 4 },
  pickerText: { fontSize: 14 },
  stateList: { borderWidth: 1, borderRadius: 10, marginBottom: 10, marginTop: 4 },
  stateItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stateItemText: { fontSize: 14 },

  // Save
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
