import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SPACING, FONT_SIZES, BORDER_RADIUS, COLORS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useAuth } from '../../../../../../packages/providers/src/AuthProvider';
import { Header, Input, Button } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';
import { uploadAvatar } from '../../../../../../packages/supabase/src/auth';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || 'O+',
    height: user?.height || '',
    weight: user?.weight || '',
    allergies: user?.allergies || '',
    emergencyContact: user?.emergencyContact || '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const update = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }));

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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const publicUrl = await uploadAvatar(authUser.id, result.assets[0].base64);
      setAvatarUri(publicUrl);
      updateUser({ avatar: publicUrl });
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    setSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.name.trim(),
          phone: form.phone.trim() || null,
        })
        .eq('id', authUser.id);

      if (error) throw error;

      updateUser(form);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name ? form.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Edit Profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploadingPhoto} activeOpacity={0.8}>
              <View style={styles.avatarWrap}>
                {avatarUri && !avatarUri.includes('randomuser.me') ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
                <View style={[styles.cameraOverlay, { backgroundColor: COLORS.primary }]}>
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#fff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              {uploadingPhoto ? 'Uploading...' : 'Tap to change photo'}
            </Text>
          </View>

          <SectionTitle title="PERSONAL INFORMATION" />
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Input label="Full Name" value={form.name} onChangeText={v => update('name', v)} placeholder="Your full name" leftIcon="person-outline" />
            <Input label="Email Address" value={form.email} onChangeText={v => update('email', v)} placeholder="Email address" keyboardType="email-address" leftIcon="mail-outline" />
            <Input label="Phone Number" value={form.phone} onChangeText={v => update('phone', v)} placeholder="Phone number" keyboardType="phone-pad" leftIcon="call-outline" />
            <Input label="Date of Birth" value={form.dob} onChangeText={v => update('dob', v)} placeholder="DD/MM/YYYY" leftIcon="calendar-outline" />

            {/* Gender */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Gender</Text>
              <View style={styles.optionsRow}>
                {['Male', 'Female', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.optionChip, { borderColor: colors.border, backgroundColor: colors.background },
                      form.gender === g && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                    onPress={() => update('gender', g)}
                  >
                    <Ionicons
                      name={g === 'Male' ? 'male' : g === 'Female' ? 'female' : 'person'}
                      size={14}
                      color={form.gender === g ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.optionText, { color: form.gender === g ? colors.primary : colors.textSecondary }]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <SectionTitle title="HEALTH INFORMATION" />
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Blood Group */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Blood Group</Text>
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map(bg => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodChip, { borderColor: colors.border, backgroundColor: colors.background },
                      form.bloodGroup === bg && { borderColor: colors.error || '#EF4444', backgroundColor: (colors.error || '#EF4444') + '15' }]}
                    onPress={() => update('bloodGroup', bg)}
                  >
                    <Text style={[styles.bloodText, { color: form.bloodGroup === bg ? (colors.error || '#EF4444') : colors.textPrimary }]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Input label="Height (cm)" value={form.height} onChangeText={v => update('height', v)} placeholder="e.g. 170" keyboardType="numeric" leftIcon="resize-outline" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Weight (kg)" value={form.weight} onChangeText={v => update('weight', v)} placeholder="e.g. 70" keyboardType="numeric" leftIcon="barbell-outline" />
              </View>
            </View>

            <Input
              label="Known Allergies"
              value={form.allergies}
              onChangeText={v => update('allergies', v)}
              placeholder="e.g. Penicillin, Dust"
              leftIcon="alert-circle-outline"
              multiline
            />
          </View>

          <SectionTitle title="EMERGENCY CONTACT" />
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Input
              label="Emergency Contact Number"
              value={form.emergencyContact}
              onChangeText={v => update('emergencyContact', v)}
              placeholder="Emergency contact phone"
              keyboardType="phone-pad"
              leftIcon="shield-checkmark-outline"
            />
          </View>

          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  avatarWrap: { position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#E2E8F0' },
  avatarFallback: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  changePhotoText: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 0.8, marginTop: SPACING.lg, marginBottom: SPACING.sm, paddingBottom: SPACING.sm, borderBottomWidth: 1 },
  section: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, padding: SPACING.md, gap: SPACING.sm },
  inputWrapper: { marginBottom: SPACING.sm },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: SPACING.sm },
  optionsRow: { flexDirection: 'row', gap: SPACING.sm },
  optionChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5 },
  optionText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  bloodChip: { width: '22%', alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1.5 },
  bloodText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  twoCol: { flexDirection: 'row', gap: SPACING.sm },
  saveBtn: { marginTop: SPACING.xl },
});
