import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Lazy import to avoid crash if native module isn't linked
let Location: any = null;
try { Location = require('expo-location'); } catch {}

// ============================================
// TYPES
// ============================================

export interface AddressData {
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

export const EMPTY_ADDRESS: AddressData = {
  address_line1: '',
  address_line2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  latitude: null,
  longitude: null,
  google_maps_link: '',
};

export function addressFromDB(row: any): AddressData {
  return {
    address_line1: row?.address_line1 || '',
    address_line2: row?.address_line2 || '',
    landmark: row?.landmark || '',
    city: row?.city || '',
    state: row?.state || '',
    pincode: row?.pincode || '',
    country: row?.country || 'India',
    latitude: row?.latitude ? Number(row.latitude) : null,
    longitude: row?.longitude ? Number(row.longitude) : null,
    google_maps_link: row?.google_maps_link || '',
  };
}

export function addressToDBFields(addr: AddressData) {
  return {
    address_line1: addr.address_line1 || null,
    address_line2: addr.address_line2 || null,
    landmark: addr.landmark || null,
    city: addr.city || null,
    state: addr.state || null,
    pincode: addr.pincode || null,
    country: addr.country || 'India',
    latitude: addr.latitude,
    longitude: addr.longitude,
    google_maps_link: addr.latitude && addr.longitude
      ? `https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`
      : null,
  };
}

export function formatFullAddress(addr: AddressData): string {
  return [addr.address_line1, addr.address_line2, addr.landmark, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(', ');
}

// ============================================
// CONSTANTS
// ============================================

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
];

// ============================================
// PROPS
// ============================================

interface Props {
  accentColor: string;
  title?: string;
  address: AddressData;
  editing: boolean;
  onChange: (address: AddressData) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AddressSection({ accentColor, title = 'Address', address, editing, onChange }: Props) {
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const updateField = (key: keyof AddressData, value: any) => {
    const updated = { ...address, [key]: value };
    if (key === 'latitude' || key === 'longitude') {
      const lat = key === 'latitude' ? value : address.latitude;
      const lng = key === 'longitude' ? value : address.longitude;
      if (lat != null && lng != null) {
        updated.google_maps_link = `https://www.google.com/maps?q=${lat},${lng}`;
      }
    }
    onChange(updated);
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

      const updated: AddressData = {
        ...address,
        latitude: lat,
        longitude: lng,
        google_maps_link: `https://www.google.com/maps?q=${lat},${lng}`,
      };

      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geo) {
          if (geo.city) updated.city = geo.city;
          if (geo.region) updated.state = geo.region;
          if (geo.postalCode) updated.pincode = geo.postalCode;
          if (geo.country) updated.country = geo.country;
          if (geo.street || geo.name) {
            updated.address_line1 = [geo.name, geo.street].filter(Boolean).join(', ');
          }
        }
      } catch {}

      onChange(updated);
      Alert.alert('Location Detected', `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}\nAddress fields have been auto-filled.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to detect location');
    } finally {
      setDetectingLocation(false);
    }
  };

  const hasAddress = !!(address.address_line1 || address.city || address.state);
  const hasCoords = address.latitude != null && address.longitude != null;

  // ======== VIEW MODE ========
  if (!editing) {
    return (
      <View style={s.wrapper}>
        <View style={s.titleRow}>
          <Ionicons name="location" size={18} color={accentColor} />
          <Text style={[s.title, { color: accentColor }]}>{title}</Text>
        </View>

        {hasAddress ? (
          <View style={[s.viewCard, { borderColor: accentColor + '25' }]}>
            {address.address_line1 ? (
              <Text style={s.viewLine}>{address.address_line1}</Text>
            ) : null}
            {address.address_line2 ? (
              <Text style={s.viewLineLight}>{address.address_line2}</Text>
            ) : null}
            {address.landmark ? (
              <Text style={s.viewLineLight}>Near {address.landmark}</Text>
            ) : null}
            <Text style={s.viewLine}>
              {[address.city, address.state].filter(Boolean).join(', ')}
              {address.pincode ? ` - ${address.pincode}` : ''}
            </Text>
            {address.country && address.country !== 'India' ? (
              <Text style={s.viewLineLight}>{address.country}</Text>
            ) : null}

            {hasCoords && (
              <View style={s.coordBadge}>
                <Ionicons name="navigate-circle" size={15} color="#059669" />
                <Text style={s.coordText}>
                  {address.latitude!.toFixed(4)}, {address.longitude!.toFixed(4)}
                </Text>
              </View>
            )}

            {address.google_maps_link ? (
              <TouchableOpacity
                style={[s.mapsBtn, { backgroundColor: accentColor + '0A', borderColor: accentColor + '25' }]}
                onPress={() => Linking.openURL(address.google_maps_link)}
              >
                <Ionicons name="map-outline" size={16} color={accentColor} />
                <Text style={[s.mapsBtnText, { color: accentColor }]}>Open in Google Maps</Text>
                <Ionicons name="open-outline" size={13} color={accentColor} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={s.emptyBox}>
            <Ionicons name="location-outline" size={28} color="#CBD5E1" />
            <Text style={s.emptyTitle}>No address added yet</Text>
            <Text style={s.emptySubtitle}>Tap Edit to add your address</Text>
          </View>
        )}
      </View>
    );
  }

  // ======== EDIT MODE ========
  return (
    <View style={s.wrapper}>
      <View style={s.titleRow}>
        <Ionicons name="location" size={18} color={accentColor} />
        <Text style={[s.title, { color: accentColor }]}>{title}</Text>
      </View>

      {/* GPS Detect Button */}
      <TouchableOpacity
        style={[s.detectBtn, { borderColor: accentColor, backgroundColor: accentColor + '08' }]}
        onPress={detectLocation}
        disabled={detectingLocation}
        activeOpacity={0.7}
      >
        {detectingLocation ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <Ionicons name="navigate" size={20} color={accentColor} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[s.detectTitle, { color: accentColor }]}>
            {detectingLocation ? 'Detecting your location...' : hasCoords ? 'Re-detect My Location' : 'Detect My Location'}
          </Text>
          <Text style={s.detectSubtitle}>
            {hasCoords ? 'Update GPS coordinates & auto-fill address' : 'Use GPS to auto-fill your address fields'}
          </Text>
        </View>
        {!detectingLocation && (
          <Ionicons name="chevron-forward" size={18} color={accentColor + '80'} />
        )}
      </TouchableOpacity>

      {/* Coordinates Badge */}
      {hasCoords && (
        <View style={s.coordBadge}>
          <Ionicons name="checkmark-circle" size={15} color="#059669" />
          <Text style={s.coordText}>
            Location: {address.latitude!.toFixed(4)}, {address.longitude!.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Form Fields */}
      <FormField
        label="Address Line 1"
        value={address.address_line1}
        onChangeText={(v) => updateField('address_line1', v)}
        placeholder="Building name, Street"
        required
        accentColor={accentColor}
      />
      <FormField
        label="Address Line 2"
        value={address.address_line2}
        onChangeText={(v) => updateField('address_line2', v)}
        placeholder="Floor, Suite (optional)"
        accentColor={accentColor}
      />
      <FormField
        label="Landmark"
        value={address.landmark}
        onChangeText={(v) => updateField('landmark', v)}
        placeholder="Near, Opposite..."
        accentColor={accentColor}
      />

      {/* City + Pincode Row */}
      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormField
            label="City"
            value={address.city}
            onChangeText={(v) => updateField('city', v)}
            placeholder="City / Town"
            required
            accentColor={accentColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FormField
            label="Pincode"
            value={address.pincode}
            onChangeText={(v) => updateField('pincode', v)}
            placeholder="6-digit"
            keyboardType="number-pad"
            required
            accentColor={accentColor}
          />
        </View>
      </View>

      {/* State Picker */}
      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>
          State <Text style={{ color: '#EF4444' }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[s.pickerBtn, { borderColor: showStatePicker ? accentColor : '#E2E8F0' }]}
          onPress={() => setShowStatePicker(!showStatePicker)}
        >
          <Text style={[s.pickerText, !address.state && { color: '#94A3B8' }]}>
            {address.state || 'Select State'}
          </Text>
          <Ionicons name={showStatePicker ? 'chevron-up' : 'chevron-down'} size={16} color="#64748B" />
        </TouchableOpacity>
        {showStatePicker && (
          <View style={s.stateList}>
            <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator>
              {INDIAN_STATES.map(st => (
                <TouchableOpacity
                  key={st}
                  style={[s.stateItem, address.state === st && { backgroundColor: accentColor + '12' }]}
                  onPress={() => { updateField('state', st); setShowStatePicker(false); }}
                >
                  <Text style={[s.stateItemText, address.state === st && { color: accentColor, fontWeight: '700' }]}>{st}</Text>
                  {address.state === st && <Ionicons name="checkmark" size={16} color={accentColor} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <FormField
        label="Country"
        value={address.country}
        onChangeText={(v) => updateField('country', v)}
        placeholder="Country"
        accentColor={accentColor}
      />

      {/* Google Maps Link */}
      {address.google_maps_link ? (
        <TouchableOpacity
          style={[s.mapsBtn, { backgroundColor: accentColor + '0A', borderColor: accentColor + '25', marginTop: 4 }]}
          onPress={() => Linking.openURL(address.google_maps_link)}
        >
          <Ionicons name="map-outline" size={16} color={accentColor} />
          <Text style={[s.mapsBtnText, { color: accentColor }]}>View on Google Maps</Text>
          <Ionicons name="open-outline" size={13} color={accentColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ============================================
// FORM FIELD HELPER
// ============================================

function FormField({ label, value, onChangeText, placeholder, required, keyboardType, accentColor }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; required?: boolean; keyboardType?: any; accentColor: string;
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>
        {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      <TextInput
        style={s.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const s = StyleSheet.create({
  wrapper: {
    marginTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },

  // View mode
  viewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFBFC',
  },
  viewLine: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    lineHeight: 20,
  },
  viewLineLight: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },

  // Coordinates badge
  coordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  coordText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },

  // Maps button
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  mapsBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  // Detect location button
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 4,
  },
  detectTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  detectSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },

  // Form fields
  row: {
    flexDirection: 'row',
  },
  fieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },

  // State picker
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stateItemText: {
    fontSize: 14,
    color: '#334155',
  },
});
