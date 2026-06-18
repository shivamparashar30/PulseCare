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

export default function DiagnosticsProfileTab({ profile, onLogout }: Props) {
  const [centerInfo, setCenterInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [centerName, setCenterName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from('diagnostics_centers').select('*').eq('id', profile.id).single();
    setCenterInfo(data);
    if (data) {
      setCenterName(data.center_name || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
    }
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('diagnostics_centers')
        .update({ center_name: centerName, address, phone })
        .eq('id', profile.id);

      if (error) throw error;

      // Also update profile full_name to keep in sync
      await supabase.from('profiles').update({ full_name: centerName, phone }).eq('id', profile.id);

      Alert.alert('Saved', 'Profile updated successfully.');
      setEditing(false);
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'DC')}&background=7C3AED&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.name}>{centerInfo?.center_name || profile?.full_name || 'Diagnostics Center'}</Text>
          <Text style={styles.spec}>Diagnostics Center</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Reg. ID', value: centerInfo?.registration_id || '-' },
            { label: 'Phone', value: phone || '-' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue} numberOfLines={1}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Center Information</Text>
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
          <InfoRow icon="business-outline" label="Center Name" value={centerName} editable={editing} onChangeText={setCenterName} />
          <InfoRow icon="call-outline" label="Phone" value={phone} editable={editing} onChangeText={setPhone} />
          <InfoRow icon="location-outline" label="Address" value={address} editable={editing} onChangeText={setAddress} />
          <InfoRow icon="document-text-outline" label="Registration ID" value={centerInfo?.registration_id || '-'} />

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

function InfoRow({ icon, label, value, editable, onChangeText }: {
  icon: string; label: string; value: string;
  editable?: boolean; onChangeText?: (t: string) => void;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color="#64748B" />
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && onChangeText ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={styles.infoValue}>{value || '-'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#7C3AED', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  spec: { fontSize: 14, color: '#7C3AED', fontWeight: '600', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 },
  section: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  editBtn: { fontSize: 14, fontWeight: '600', color: '#7C3AED' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 13, color: '#64748B', width: 110 },
  infoValue: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right' },
  infoInput: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right', borderBottomWidth: 1, borderBottomColor: '#7C3AED', paddingVertical: 2, minWidth: 80 },
  saveBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
