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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useAuth } from '../../../../../../packages/providers/src/AuthProvider';
import { Header, Input, Button } from '../../../../../../packages/shared/src/components';

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

  const update = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateUser(form);
    setSaving(false);
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const AvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>
          {form.name ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
        </Text>
      </View>
      <TouchableOpacity style={[styles.changePhotoBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="camera" size={16} color={colors.primary} />
        <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
      </TouchableOpacity>
    </View>
  );

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
          <AvatarSection />

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
                    <Text style={[styles.bloodText, { color: form.bloodGroup === bg ? (colors.error || '#EF4444') : colors.text }]}>
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
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.md },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  changePhotoText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
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
