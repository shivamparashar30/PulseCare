import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  status: 'pending' | 'rejected';
  rejectionReason?: string;
  onLogout: () => void;
}

export default function PendingScreen({ status, rejectionReason, onLogout }: Props) {
  const isPending = status === 'pending';

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: isPending ? '#FEF3C7' : '#FEE2E2' }]}>
        <Ionicons
          name={isPending ? 'time-outline' : 'close-circle-outline'}
          size={56}
          color={isPending ? '#D97706' : '#DC2626'}
        />
      </View>

      <Text style={styles.title}>
        {isPending ? 'Verification Pending' : 'Registration Rejected'}
      </Text>

      <Text style={styles.desc}>
        {isPending
          ? 'Your store verification is under review. Please wait for Admin approval. You will be notified once your account is verified.'
          : 'Unfortunately, your store registration has been rejected by the admin.'}
      </Text>

      {rejectionReason ? (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>
      ) : null}

      {!isPending && (
        <Text style={styles.helpText}>
          Please contact support if you believe this was a mistake or to resubmit your documents.
        </Text>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#64748B" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 32 },
  iconWrap: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  reasonBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, width: '100%', marginBottom: 16 },
  reasonLabel: { fontSize: 13, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#991B1B', lineHeight: 20 },
  helpText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
});
