import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Image,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';
import { AddressSection, addressFromDB, addressToDBFields, EMPTY_ADDRESS } from '../../../../packages/shared/src/components';
import type { AddressData } from '../../../../packages/shared/src/components';

const BLUE = '#2563EB';

const ALL_TIME_SLOTS = [
  '07:00 AM','07:30 AM','08:00 AM','08:30 AM',
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','01:00 PM','01:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM',
  '06:00 PM','06:30 PM','07:00 PM','07:30 PM',
  '08:00 PM','08:30 PM','09:00 PM',
];

interface Props {
  profile: any;
  onLogout: () => void;
}

export default function ProfileTab({ profile, onLogout }: Props) {
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Editable fields
  const [hospital, setHospital] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [about, setAbout] = useState('');
  const [phone, setPhone] = useState('');
  const [availableStartTime, setAvailableStartTime] = useState('09:00 AM');
  const [availableEndTime, setAvailableEndTime] = useState('06:00 PM');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // Address (single object)
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from('doctor_profiles').select('*').eq('id', profile.id).single();
    setDoctorProfile(data);
    if (data) {
      setHospital(data.hospital || '');
      setConsultationFee(data.consultation_fee?.toString() || '');
      setAbout(data.about || '');
      setAvailableStartTime(data.available_start_time || '09:00 AM');
      setAvailableEndTime(data.available_end_time || '06:00 PM');
      setAddress(addressFromDB(data));
    }
    setPhone(profile.phone || '');
    setAvatarUrl(profile.avatar_url || null);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

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
    setSaving(true);
    try {
      const addrFields = addressToDBFields(address);
      const { error: dpError } = await supabase
        .from('doctor_profiles')
        .update({
          hospital,
          consultation_fee: consultationFee ? Number(consultationFee) : null,
          about,
          available_start_time: availableStartTime,
          available_end_time: availableEndTime,
          ...addrFields,
          location: [address.city, address.state].filter(Boolean).join(', '),
        })
        .eq('id', profile.id);

      const { error: pError } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', profile.id);

      if (dpError || pError) throw dpError || pError;
      Alert.alert('Saved', 'Profile updated successfully.');
      setEditing(false);
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const displayAvatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Dr')}&background=2563EB&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} disabled={uploadingPhoto} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: displayAvatarUrl }} style={styles.avatar} />
              <View style={[styles.cameraOverlay, { backgroundColor: BLUE }]}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={14} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.tapText}>{uploadingPhoto ? 'Uploading...' : 'Tap to change photo'}</Text>
          <Text style={styles.name}>{profile?.full_name || 'Doctor'}</Text>
          <Text style={styles.spec}>{doctorProfile?.specialization || 'Doctor'}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Experience', value: `${doctorProfile?.experience_years || 0} yrs` },
            { label: 'Rating', value: doctorProfile?.rating ? `${Number(doctorProfile.rating).toFixed(1)}` : 'N/A' },
            { label: 'Reviews', value: `${doctorProfile?.total_reviews || 0}` },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtnWrap}>
                <Ionicons name="create-outline" size={16} color={BLUE} />
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setEditing(false); load(); }} style={styles.editBtnWrap}>
                <Ionicons name="close-outline" size={16} color="#DC2626" />
                <Text style={[styles.editBtn, { color: '#DC2626' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <InfoRow icon="mail-outline" label="Email" value={profile?.email || '-'} />
          <InfoRow icon="call-outline" label="Phone" value={phone} editable={editing} onChangeText={setPhone} />
          <InfoRow icon="school-outline" label="Qualification" value={doctorProfile?.qualification || '-'} />
          <InfoRow icon="document-text-outline" label="Registration ID" value={doctorProfile?.registration_id || '-'} />
          <InfoRow icon="business-outline" label="Hospital" value={hospital} editable={editing} onChangeText={setHospital} />
          <InfoRow icon="cash-outline" label="Consultation Fee" value={consultationFee} editable={editing} onChangeText={setConsultationFee} prefix="Rs. " keyboardType="numeric" />
          <InfoRow icon="globe-outline" label="Languages" value={doctorProfile?.languages?.join(', ') || '-'} />
          <InfoRow icon="calendar-outline" label="Available Days" value={doctorProfile?.available_days?.join(', ') || '-'} />

          {/* Available Time Slots */}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#64748B" />
            <Text style={styles.infoLabel}>Available Hours</Text>
            {editing ? (
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                  onPress={() => setShowStartPicker(!showStartPicker)}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: BLUE }}>{availableStartTime}</Text>
                </TouchableOpacity>
                <Text style={{ color: '#64748B', fontWeight: '600' }}>to</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                  onPress={() => setShowEndPicker(!showEndPicker)}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: BLUE }}>{availableEndTime}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoValue}>{availableStartTime} - {availableEndTime}</Text>
            )}
          </View>

          {editing && showStartPicker && (
            <TimePicker
              selected={availableStartTime}
              onSelect={(t) => { setAvailableStartTime(t); setShowStartPicker(false); }}
              label="Select Start Time"
            />
          )}
          {editing && showEndPicker && (
            <TimePicker
              selected={availableEndTime}
              onSelect={(t) => { setAvailableEndTime(t); setShowEndPicker(false); }}
              label="Select End Time"
            />
          )}

          {editing && (
            <>
              <Text style={styles.fieldLabel}>About</Text>
              <TextInput
                style={styles.aboutInput}
                value={about}
                onChangeText={setAbout}
                multiline
                placeholder="Tell patients about yourself..."
              />
            </>
          )}

          {!editing && about ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.fieldLabel}>About</Text>
              <Text style={styles.aboutText}>{about}</Text>
            </View>
          ) : null}

          {/* Address Section */}
          <AddressSection
            accentColor={BLUE}
            title="Clinic / Hospital Address"
            address={address}
            editing={editing}
            onChange={setAddress}
          />

          {editing && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => {
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: onLogout },
          ]);
        }}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimePicker({ selected, onSelect, label }: { selected: string; onSelect: (t: string) => void; label: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {ALL_TIME_SLOTS.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => onSelect(t)}
              style={{
                paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                backgroundColor: selected === t ? BLUE : '#F1F5F9',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: selected === t ? '#fff' : '#374151' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, editable, onChangeText, prefix, keyboardType }: {
  icon: string; label: string; value: string;
  editable?: boolean; onChangeText?: (t: string) => void;
  prefix?: string; keyboardType?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color="#64748B" />
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && onChangeText ? (
        <View style={styles.infoInputWrap}>
          {prefix ? <Text style={styles.infoPrefix}>{prefix}</Text> : null}
          <TextInput
            style={styles.infoInput}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType as any || 'default'}
          />
        </View>
      ) : (
        <Text style={styles.infoValue}>{prefix && value ? `${prefix}${value}` : value || '-'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: BLUE },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  tapText: { fontSize: 12, color: BLUE, fontWeight: '600', marginTop: 6, marginBottom: 8 },
  name: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  spec: { fontSize: 14, color: BLUE, fontWeight: '600', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 },
  section: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  editBtnWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#EFF6FF' },
  editBtn: { fontSize: 14, fontWeight: '600', color: BLUE },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 13, color: '#64748B', width: 110 },
  infoValue: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right' },
  infoInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  infoPrefix: { fontSize: 14, color: '#64748B' },
  infoInput: { fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right', borderBottomWidth: 1, borderBottomColor: BLUE, paddingVertical: 2, minWidth: 80 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 12, marginBottom: 4 },
  aboutInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#1E293B', minHeight: 80, textAlignVertical: 'top' },
  aboutText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  saveBtn: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
