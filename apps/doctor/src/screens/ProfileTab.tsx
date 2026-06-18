import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Image,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props {
  profile: any;
  onLogout: () => void;
}

export default function ProfileTab({ profile, onLogout }: Props) {
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [hospital, setHospital] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [about, setAbout] = useState('');
  const [phone, setPhone] = useState('');

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from('doctor_profiles').select('*').eq('id', profile.id).single();
    setDoctorProfile(data);
    if (data) {
      setHospital(data.hospital || '');
      setConsultationFee(data.consultation_fee?.toString() || '');
      setAbout(data.about || '');
    }
    setPhone(profile.phone || '');
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: dpError } = await supabase
        .from('doctor_profiles')
        .update({
          hospital,
          consultation_fee: consultationFee ? Number(consultationFee) : null,
          about,
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

  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Dr')}&background=2563EB&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
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
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setEditing(false); load(); }}>
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
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#2563EB', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  spec: { fontSize: 14, color: '#2563EB', fontWeight: '600', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 },
  section: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  editBtn: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 13, color: '#64748B', width: 110 },
  infoValue: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right' },
  infoInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  infoPrefix: { fontSize: 14, color: '#64748B' },
  infoInput: { fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right', borderBottomWidth: 1, borderBottomColor: '#2563EB', paddingVertical: 2, minWidth: 80 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 12, marginBottom: 4 },
  aboutInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#1E293B', minHeight: 80, textAlignVertical: 'top' },
  aboutText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
