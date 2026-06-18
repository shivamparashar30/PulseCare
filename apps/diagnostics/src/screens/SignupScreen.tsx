import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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

export default function SignupScreen({ onGoToLogin, onSignupComplete }: Props) {
  const [centerName, setCenterName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [address, setAddress] = useState('');

  const [govId, setGovId] = useState<DocState>({ uri: null, uploading: false });
  const [centerPhoto, setCenterPhoto] = useState<DocState>({ uri: null, uploading: false });
  const [regCert, setRegCert] = useState<DocState>({ uri: null, uploading: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!centerName || !ownerName || !email || !password || !registrationId) {
      setError('Please fill all required fields');
      return;
    }
    if (!govId.uri || !centerPhoto.uri || !regCert.uri) {
      setError('Please upload all required documents');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: ownerName, role: 'diagnostics' } },
      });
      if (authError) {
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw authError;
      }
      const userId = authData.user?.id;
      if (!userId) throw new Error('Signup failed');

      // 2. Save profile + center data via SECURITY DEFINER RPC (bypasses RLS)
      const { error: rpcError } = await supabase.rpc('create_diagnostics_signup', {
        p_user_id: userId,
        p_email: email,
        p_full_name: ownerName,
        p_phone: phone || null,
        p_center_name: centerName,
        p_registration_id: registrationId,
        p_address: address || null,
      });
      if (rpcError) throw rpcError;

      // 4. Upload documents (profile already exists for admin even if this fails)
      try {
        const [govIdUrl, centerPhotoUrl, regCertUrl] = await Promise.all([
          uploadDocument(userId, 'government_id', govId.uri!),
          uploadDocument(userId, 'center_photo', centerPhoto.uri!),
          uploadDocument(userId, 'registration_certificate', regCert.uri!),
        ]);

        // 5. Update records with document URLs
        await supabase.from('profiles').update({ avatar_url: centerPhotoUrl }).eq('id', userId);
        await supabase.from('diagnostics_centers').update({
          government_id_url: govIdUrl,
          center_photo_url: centerPhotoUrl,
          registration_certificate_url: regCertUrl,
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

  const DocUpload = ({ label, doc, setDoc }: { label: string; doc: DocState; setDoc: (v: DocState) => void }) => (
    <View style={styles.docCard}>
      <Text style={styles.docLabel}>{label} <Text style={styles.required}>*</Text></Text>
      {doc.uri ? (
        <View style={styles.docPreview}>
          <Image source={{ uri: doc.uri }} style={styles.docImage} />
          <TouchableOpacity style={styles.docRemove} onPress={() => setDoc({ uri: null, uploading: false })}>
            <Ionicons name="close-circle" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.docPicker} onPress={() => pickImage(setDoc)}>
          <Ionicons name="cloud-upload-outline" size={24} color="#7C3AED" />
          <Text style={styles.docPickText}>Tap to upload</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoToLogin} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Center Registration</Text>
          <Text style={styles.subtitle}>Create your account and submit verification documents</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.section}>CENTER INFORMATION</Text>

        <Text style={styles.label}>Center Name <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={centerName} onChangeText={setCenterName} placeholder="e.g. City Diagnostics Lab" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Owner / Manager Name <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="Full name" placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="center@example.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" />

        <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min 6 characters" placeholderTextColor="#9CA3AF" secureTextEntry />

        <Text style={styles.section}>REGISTRATION DETAILS</Text>

        <Text style={styles.label}>Registration ID <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={registrationId} onChangeText={setRegistrationId} placeholder="Lab Registration No." placeholderTextColor="#9CA3AF" />

        <Text style={styles.label}>Center Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Full center address" placeholderTextColor="#9CA3AF" multiline />

        <Text style={styles.section}>VERIFICATION DOCUMENTS</Text>

        <DocUpload label="Government ID (Aadhaar/PAN)" doc={govId} setDoc={setGovId} />
        <DocUpload label="Center Photo" doc={centerPhoto} setDoc={setCenterPhoto} />
        <DocUpload label="Registration Certificate" doc={regCert} setDoc={setRegCert} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Registration</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToLogin} style={styles.loginLink}>
          <Text style={styles.loginText}>Already registered? <Text style={styles.loginBold}>Sign In</Text></Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  section: { fontSize: 11, fontWeight: '700', color: '#7C3AED', letterSpacing: 1.5, marginTop: 28, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  required: { color: '#DC2626' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#fff', color: '#1F2937' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 8 },
  errorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  docCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  docLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  docPicker: { alignItems: 'center', padding: 20, borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#F5F3FF' },
  docPickText: { fontSize: 12, color: '#7C3AED', marginTop: 6, fontWeight: '500' },
  docPreview: { position: 'relative' },
  docImage: { width: '100%', height: 140, borderRadius: 10, resizeMode: 'cover' },
  docRemove: { position: 'absolute', top: -8, right: -8 },
  submitBtn: { backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 28 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: '#64748B' },
  loginBold: { color: '#7C3AED', fontWeight: '700' },
});
