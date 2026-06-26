import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Lazy import to avoid crash if expo-location native module isn't fully linked
let Location: any = null;
try {
  Location = require('expo-location');
} catch {}


interface AddressData {
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  google_maps_link: string;
}

interface Props {
  accentColor: string;
  role: string; // 'Doctor' | 'Medical Store' | 'Diagnostics Center'
  existingAddress?: Partial<AddressData>;
  onSave: (address: AddressData) => Promise<void>;
  onLogout: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
];

export default function AddressCompletionScreen({ accentColor, role, existingAddress, onSave, onLogout }: Props) {
  const [form, setForm] = useState<AddressData>({
    address_line1: existingAddress?.address_line1 || '',
    address_line2: existingAddress?.address_line2 || '',
    landmark: existingAddress?.landmark || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    pincode: existingAddress?.pincode || '',
    country: existingAddress?.country || 'India',
    latitude: existingAddress?.latitude ?? null,
    longitude: existingAddress?.longitude ?? null,
    google_maps_link: existingAddress?.google_maps_link || '',
  });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const updateField = (key: keyof AddressData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const detectLocation = async () => {
    if (!Location) {
      Alert.alert('Unavailable', 'Location services are not available. Please enter coordinates manually.');
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings.');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      setForm(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        google_maps_link: `https://www.google.com/maps?q=${lat},${lng}`,
      }));

      // Try reverse geocoding
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geo) {
          setForm(prev => ({
            ...prev,
            city: geo.city || prev.city,
            state: geo.region || prev.state,
            pincode: geo.postalCode || prev.pincode,
            country: geo.country || prev.country,
          }));
        }
      } catch {}
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to detect location');
    } finally {
      setLocating(false);
    }
  };

  const validate = (): string | null => {
    if (!form.address_line1.trim()) return 'Address Line 1 is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    if (!form.pincode.trim()) return 'Pincode is required';
    if (form.pincode.length !== 6 || !/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit pincode';
    if (form.latitude === null || form.longitude === null) return 'Please detect your location using the button above';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing Information', error);
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label: string, key: keyof AddressData, placeholder: string, required = false, multiline = false, keyboardType: any = 'default') => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={String(form[key] || '')}
        onChangeText={(v) => updateField(key, v)}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: accentColor }]}>
          <Ionicons name="location" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Complete Your Address</Text>
          <Text style={styles.headerSubtitle}>
            Your {role.toLowerCase()} address is required before you can access the dashboard.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {/* Detect Location Button */}
          <TouchableOpacity
            style={[styles.detectBtn, { borderColor: accentColor }]}
            onPress={detectLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color={accentColor} />
            ) : (
              <Ionicons name="navigate" size={20} color={accentColor} />
            )}
            <Text style={[styles.detectBtnText, { color: accentColor }]}>
              {locating ? 'Detecting...' : form.latitude ? 'Re-detect My Location' : 'Detect My Location'}
            </Text>
          </TouchableOpacity>

          {form.latitude && form.longitude && (
            <View style={styles.coordBox}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.coordText}>
                Location detected: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {renderInput('Address Line 1', 'address_line1', 'Building, Street, Area', true)}
          {renderInput('Address Line 2', 'address_line2', 'Floor, Suite (optional)')}
          {renderInput('Landmark', 'landmark', 'Near, Opposite (optional)')}
          {renderInput('City', 'city', 'City / Town', true)}

          {/* State Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>State <Text style={{ color: '#EF4444' }}>*</Text></Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerBtn]}
              onPress={() => setShowStatePicker(!showStatePicker)}
            >
              <Text style={[styles.pickerText, !form.state && { color: '#94A3B8' }]}>
                {form.state || 'Select State'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>
            {showStatePicker && (
              <View style={styles.stateList}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {INDIAN_STATES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.stateItem, form.state === s && { backgroundColor: accentColor + '15' }]}
                      onPress={() => { updateField('state', s); setShowStatePicker(false); }}
                    >
                      <Text style={[styles.stateItemText, form.state === s && { color: accentColor, fontWeight: '700' }]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {renderInput('Pincode', 'pincode', '6-digit pincode', true, false, 'number-pad')}
          {renderInput('Country', 'country', 'Country', false)}

          {/* Google Maps Link (auto-generated) */}
          {form.google_maps_link ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Google Maps Link</Text>
              <TouchableOpacity
                style={[styles.mapsLinkBox, { borderColor: accentColor + '40' }]}
                onPress={() => Linking.openURL(form.google_maps_link)}
              >
                <Ionicons name="map-outline" size={16} color={accentColor} />
                <Text style={[styles.mapsLinkText, { color: accentColor }]} numberOfLines={1}>
                  Open in Google Maps
                </Text>
                <Ionicons name="open-outline" size={14} color={accentColor} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: accentColor }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Address & Continue</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutLink} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    lineHeight: 18,
  },
  form: {
    padding: 20,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 8,
  },
  detectBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  coordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  coordText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1E293B',
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 14,
    color: '#1E293B',
  },
  stateList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginTop: 4,
  },
  stateItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stateItemText: {
    fontSize: 14,
    color: '#334155',
  },
  mapsLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  mapsLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
