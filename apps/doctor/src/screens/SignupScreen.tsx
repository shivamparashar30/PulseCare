import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase, uploadDocument } from '../supabase';

interface Props {
  onGoToLogin: () => void;
  onSignupComplete: () => void;
}

interface DocState {
  uri: string | null;
  uploading: boolean;
}

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Orthopedic',
  'Dermatologist',
  'Pediatrician',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Psychiatrist',
  'Dentist',
  'Urologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Oncologist',
  'Endocrinologist',
  'Nephrologist',
  'Rheumatologist',
];

const EXPERIENCE_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  '30+',
];

const PRACTICE_TYPES = ['Hospital', 'Clinic'] as const;

export default function SignupScreen({ onGoToLogin, onSignupComplete }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [practiceType, setPracticeType] = useState<'Hospital' | 'Clinic' | ''>('');
  const [hospitalName, setHospitalName] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  const [govId, setGovId] = useState<DocState>({ uri: null, uploading: false });
  const [medCert, setMedCert] = useState<DocState>({ uri: null, uploading: false });
  const [profilePhoto, setProfilePhoto] = useState<DocState>({ uri: null, uploading: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSpecPicker, setShowSpecPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);

  const pickImage = async (setter: (val: DocState) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setter({ uri: result.assets[0].uri, uploading: false });
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !specialization || !registrationId || !experience || !consultationFee) {
      setError('Please fill all required fields');
      return;
    }
    if (practiceType && !hospitalName) {
      setError(`Please enter the ${practiceType} name`);
      return;
    }
    if (!govId.uri || !medCert.uri || !profilePhoto.uri) {
      setError('Please upload all required documents');
      return;
    }

    setError('');
    setLoading(true);

    const hospitalValue = practiceType && hospitalName ? `${practiceType}: ${hospitalName}` : null;
    const expYears = experience === '30+' ? 30 : parseInt(experience) || 0;
    const fee = parseFloat(consultationFee) || 0;

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: 'doctor' } },
      });
      if (authError) {
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw authError;
      }
      const userId = authData.user?.id;
      if (!userId) throw new Error('Signup failed');

      // 2. Save profile + doctor data via SECURITY DEFINER RPC (bypasses RLS)
      const { error: rpcError } = await supabase.rpc('create_doctor_signup', {
        p_user_id: userId,
        p_email: email,
        p_full_name: name,
        p_phone: phone || null,
        p_specialization: specialization,
        p_registration_id: registrationId,
        p_hospital: hospitalValue,
        p_experience_years: expYears,
        p_consultation_fee: fee,
      });
      if (rpcError) throw rpcError;

      // 4. Upload documents (profile already exists for admin even if this fails)
      try {
        const [govIdUrl, medCertUrl, photoUrl] = await Promise.all([
          uploadDocument(userId, 'government_id', govId.uri!),
          uploadDocument(userId, 'medical_certificate', medCert.uri!),
          uploadDocument(userId, 'profile_photo', profilePhoto.uri!),
        ]);

        await supabase.from('profiles').update({ avatar_url: photoUrl }).eq('id', userId);
        await supabase.from('doctor_profiles').update({
          government_id_url: govIdUrl,
          medical_certificate_url: medCertUrl,
          profile_photo_url: photoUrl,
        }).eq('id', userId);
      } catch (uploadErr: any) {
        console.warn('Document upload failed, registration still submitted:', uploadErr.message);
      }

      Alert.alert(
        'Registration Submitted',
        'Registration submitted successfully. Waiting for Admin approval.',
        [{ text: 'OK', onPress: onSignupComplete }],
      );
    } catch (e: any) {
      setError(e.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const DocUpload = ({ label, doc, setDoc, required = true }: { label: string; doc: DocState; setDoc: (v: DocState) => void; required?: boolean }) => (
    <View style={styles.docCard}>
      <Text style={styles.docLabel}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
      {doc.uri ? (
        <View style={styles.docPreview}>
          <Image source={{ uri: doc.uri }} style={styles.docImage} />
          <TouchableOpacity style={styles.docRemove} onPress={() => setDoc({ uri: null, uploading: false })}>
            <Ionicons name="close-circle" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.docPicker} onPress={() => pickImage(setDoc)}>
          <Ionicons name="cloud-upload-outline" size={24} color="#2563EB" />
          <Text style={styles.docPickText}>Tap to upload</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const PickerModal = ({ visible, onClose, data, onSelect, title }: { visible: boolean; onClose: () => void; data: string[]; onSelect: (v: string) => void; title: string }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
                <Text style={styles.modalItemText}>{title === 'Experience' ? (item === '30+' ? '30+ Years' : `${item} Year${parseInt(item) > 1 ? 's' : ''}`) : item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoToLogin} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Doctor Registration</Text>
          <Text style={styles.subtitle}>Create your account and submit verification documents</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Section: Personal Info */}
        <Text style={styles.section}>PERSONAL INFORMATION</Text>

        <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Dr. John Doe" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="doctor@example.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" />

        <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" placeholderTextColor="#9CA3AF" secureTextEntry />

        {/* Section: Professional Info */}
        <Text style={styles.section}>PROFESSIONAL DETAILS</Text>

        <Text style={styles.label}>Specialization <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowSpecPicker(true)}>
          <Text style={specialization ? styles.dropdownText : styles.dropdownPlaceholder}>
            {specialization || 'Select specialization'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <Text style={styles.label}>Registration ID <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={registrationId} onChangeText={setRegistrationId} placeholder="Medical Council Reg. No." placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Practice Type</Text>
        <View style={styles.toggleRow}>
          {PRACTICE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.toggleBtn, practiceType === type && styles.toggleBtnActive]}
              onPress={() => setPracticeType(practiceType === type ? '' : type)}
            >
              <Text style={[styles.toggleBtnText, practiceType === type && styles.toggleBtnTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {practiceType ? (
          <>
            <Text style={styles.label}>{practiceType} Name <Text style={styles.required}>*</Text></Text>
            <TextInput style={styles.input} value={hospitalName} onChangeText={setHospitalName} placeholder={`Enter ${practiceType.toLowerCase()} name`} placeholderTextColor="#9CA3AF" />
          </>
        ) : null}

        <Text style={styles.label}>Experience <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowExpPicker(true)}>
          <Text style={experience ? styles.dropdownText : styles.dropdownPlaceholder}>
            {experience ? (experience === '30+' ? '30+ Years' : `${experience} Year${parseInt(experience) > 1 ? 's' : ''}`) : 'Select experience'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <Text style={styles.label}>Consultation Fee (₹) <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={consultationFee} onChangeText={setConsultationFee} placeholder="e.g. 500" placeholderTextColor="#9CA3AF" keyboardType="numeric" />

        {/* Section: Documents */}
        <Text style={styles.section}>VERIFICATION DOCUMENTS</Text>

        <DocUpload label="Government ID (Aadhaar/PAN)" doc={govId} setDoc={setGovId} />
        <DocUpload label="Medical License / Certificate" doc={medCert} setDoc={setMedCert} />
        <DocUpload label="Profile Photo" doc={profilePhoto} setDoc={setProfilePhoto} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Registration</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToLogin} style={styles.loginLink}>
          <Text style={styles.loginText}>Already registered? <Text style={styles.loginBold}>Sign In</Text></Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <PickerModal visible={showSpecPicker} onClose={() => setShowSpecPicker(false)} data={SPECIALIZATIONS} onSelect={setSpecialization} title="Specialization" />
      <PickerModal visible={showExpPicker} onClose={() => setShowExpPicker(false)} data={EXPERIENCE_OPTIONS} onSelect={setExperience} title="Experience" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 24 },
  header: { marginBottom: 20, marginTop: 40 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  section: { fontSize: 11, fontWeight: '700', color: '#2563EB', letterSpacing: 1.5, marginTop: 28, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  required: { color: '#DC2626' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#fff', color: '#1F2937' },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, backgroundColor: '#fff' },
  dropdownText: { fontSize: 15, color: '#1F2937' },
  dropdownPlaceholder: { fontSize: 15, color: '#9CA3AF' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center' },
  toggleBtnActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  toggleBtnTextActive: { color: '#2563EB' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 8 },
  errorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  docCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  docLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  docPicker: { alignItems: 'center', padding: 20, borderWidth: 1.5, borderColor: '#DBEAFE', borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#F0F7FF' },
  docPickText: { fontSize: 12, color: '#2563EB', marginTop: 6, fontWeight: '500' },
  docPreview: { position: 'relative' },
  docImage: { width: '100%', height: 140, borderRadius: 10, resizeMode: 'cover' },
  docRemove: { position: 'absolute', top: -8, right: -8 },
  submitBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 28 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: '#64748B' },
  loginBold: { color: '#2563EB', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  modalItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: 15, color: '#374151' },
});
