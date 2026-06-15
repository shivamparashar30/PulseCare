import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header, EmptyState } from '../../../../../../packages/shared/src/components';
import { SAMPLE_APPOINTMENTS } from '../../../../../../packages/core/src/api/mockData';
import { formatCurrency } from '../../../../../../packages/core/src/utils';

type RecordTab = 'visits' | 'prescriptions' | 'labReports' | 'orders' | 'payments';

const LAB_REPORTS = [
  { id: 'lr1', testName: 'Complete Blood Count (CBC)', date: '10 Jun 2025', lab: 'Apollo Diagnostics', status: 'completed', parameter: 'Hemoglobin: 13.5 g/dL (Normal)' },
  { id: 'lr2', testName: 'Blood Sugar (Fasting)', date: '22 May 2025', lab: 'Dr. Lal PathLabs', status: 'completed', parameter: 'Glucose: 92 mg/dL (Normal)' },
  { id: 'lr3', testName: 'Thyroid Profile (TSH)', date: '5 Apr 2025', lab: 'Metropolis Healthcare', status: 'completed', parameter: 'TSH: 2.1 mIU/L (Normal)' },
  { id: 'lr4', testName: 'Vitamin D3', date: '1 Mar 2025', lab: 'SRL Diagnostics', status: 'completed', parameter: 'Vit D: 18 ng/mL (Deficient)' },
];

const ORDERS = [
  { id: 'ord1', items: 'Crocin 500mg, Vitamin D3 Sachet', date: '12 Jun 2025', total: 285, status: 'Delivered', pharmacy: 'MedPlus Pharmacy' },
  { id: 'ord2', items: 'Azithromycin 500mg, Omeprazole 20mg', date: '28 May 2025', total: 420, status: 'Delivered', pharmacy: 'Apollo Pharmacy' },
  { id: 'ord3', items: 'Metformin 500mg, Glimepiride 1mg', date: '3 May 2025', total: 650, status: 'Delivered', pharmacy: 'MedPlus Pharmacy' },
];

const PAYMENTS = [
  { id: 'pay1', description: 'Consultation - Dr. Priya Sharma', date: '12 Jun 2025', amount: 700, method: 'UPI', type: 'consultation' },
  { id: 'pay2', description: 'CBC + Sugar Test', date: '10 Jun 2025', amount: 650, method: 'Card', type: 'lab' },
  { id: 'pay3', description: 'Medicine Order #ORD001', date: '12 Jun 2025', amount: 285, method: 'UPI', type: 'medicine' },
  { id: 'pay4', description: 'Consultation - Dr. Rahul Gupta', date: '1 Mar 2025', amount: 1000, method: 'Net Banking', type: 'consultation' },
];

const tabs: { key: RecordTab; label: string; icon: string }[] = [
  { key: 'visits', label: 'Visits', icon: 'calendar' },
  { key: 'prescriptions', label: 'Rx', icon: 'document-text' },
  { key: 'labReports', label: 'Reports', icon: 'flask' },
  { key: 'orders', label: 'Orders', icon: 'bag' },
  { key: 'payments', label: 'Payments', icon: 'card' },
];

export default function HealthRecordsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<RecordTab>('visits');

  const completedVisits = SAMPLE_APPOINTMENTS.filter(a => a.status === 'completed');

  const renderVisit = ({ item }: { item: typeof SAMPLE_APPOINTMENTS[0] }) => (
    <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.recordIcon, { backgroundColor: COLORS.primary + '15' }]}>
        <Ionicons name="person" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.text }]}>{item.doctorName}</Text>
        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>{item.doctorSpecialization}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{item.date} · {item.time}</Text>
        {item.prescription && (
          <Text style={[styles.prescriptionNote, { color: COLORS.success }]}>
            Prescription available
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Appointments', { screen: 'AppointmentDetail', params: { appointmentId: item.id } })}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderPrescription = ({ item }: { item: typeof SAMPLE_APPOINTMENTS[0] }) => {
    if (!item.prescription) return null;
    return (
      <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.recordIcon, { backgroundColor: '#9B59B6' + '15' }]}>
          <Ionicons name="document-text" size={20} color="#9B59B6" />
        </View>
        <View style={styles.recordInfo}>
          <Text style={[styles.recordTitle, { color: colors.text }]}>Prescription</Text>
          <Text style={[styles.recordSub, { color: colors.textSecondary }]}>Dr. {item.doctorName} · {item.date}</Text>
          <Text style={[styles.recordDate, { color: colors.textTertiary }]}>
            {item.prescription.medicines.length} medicines prescribed
          </Text>
        </View>
        <TouchableOpacity style={[styles.viewBtn, { borderColor: '#9B59B6' }]}>
          <Text style={[styles.viewBtnText, { color: '#9B59B6' }]}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReport = ({ item }: { item: typeof LAB_REPORTS[0] }) => (
    <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.recordIcon, { backgroundColor: '#FF6B35' + '15' }]}>
        <Ionicons name="flask" size={20} color="#FF6B35" />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.text }]}>{item.testName}</Text>
        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>{item.lab}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{item.date}</Text>
        <Text style={[styles.prescriptionNote, { color: item.parameter.includes('Deficient') || item.parameter.includes('High') ? '#EF4444' : COLORS.success }]}>
          {item.parameter}
        </Text>
      </View>
      <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: COLORS.primary + '15' }]}>
        <Ionicons name="download" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderOrder = ({ item }: { item: typeof ORDERS[0] }) => (
    <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.recordIcon, { backgroundColor: COLORS.success + '15' }]}>
        <Ionicons name="bag" size={20} color={COLORS.success} />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>{item.items}</Text>
        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>{item.pharmacy}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{item.date}</Text>
        <Text style={[styles.prescriptionNote, { color: COLORS.success }]}>✓ {item.status}</Text>
      </View>
      <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.total)}</Text>
    </View>
  );

  const renderPayment = ({ item }: { item: typeof PAYMENTS[0] }) => {
    const typeColors: Record<string, string> = { consultation: COLORS.primary, lab: '#FF6B35', medicine: COLORS.success };
    const tc = typeColors[item.type] || COLORS.primary;
    return (
      <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.recordIcon, { backgroundColor: tc + '15' }]}>
          <Ionicons name="card" size={20} color={tc} />
        </View>
        <View style={styles.recordInfo}>
          <Text style={[styles.recordTitle, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
          <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{item.date} · {item.method}</Text>
        </View>
        <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(item.amount)}</Text>
      </View>
    );
  };

  const prescriptionsData = SAMPLE_APPOINTMENTS.filter(a => !!a.prescription);
  const totalSpend = PAYMENTS.reduce((s, p) => s + p.amount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Health Records" onBack={() => navigation.goBack()} />

      {/* Stats Banner */}
      <LinearGradient colors={[COLORS.primary, '#0099FF']} style={styles.statsBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {[
          { value: String(SAMPLE_APPOINTMENTS.length), label: 'Total Visits' },
          { value: String(LAB_REPORTS.length), label: 'Lab Reports' },
          { value: String(ORDERS.length), label: 'Orders' },
          { value: `₹${(totalSpend / 1000).toFixed(1)}k`, label: 'Total Spend' },
        ].map((stat, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </LinearGradient>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { borderColor: colors.border, backgroundColor: colors.card },
              activeTab === tab.key && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={14} color={activeTab === tab.key ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#fff' : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {activeTab === 'visits' && (
        <FlatList
          data={SAMPLE_APPOINTMENTS}
          keyExtractor={i => i.id}
          renderItem={renderVisit}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No Visit Records" subtitle="Your past doctor visits will appear here." />}
        />
      )}
      {activeTab === 'prescriptions' && (
        <FlatList
          data={prescriptionsData}
          keyExtractor={i => i.id}
          renderItem={renderPrescription}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="No Prescriptions" subtitle="Your prescriptions will appear here." />}
        />
      )}
      {activeTab === 'labReports' && (
        <FlatList
          data={LAB_REPORTS}
          keyExtractor={i => i.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      )}
      {activeTab === 'orders' && (
        <FlatList
          data={ORDERS}
          keyExtractor={i => i.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      )}
      {activeTab === 'payments' && (
        <FlatList
          data={PAYMENTS}
          keyExtractor={i => i.id}
          renderItem={renderPayment}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListFooterComponent={
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Healthcare Spend</Text>
              <Text style={[styles.totalAmount, { color: colors.text }]}>{formatCurrency(totalSpend)}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBanner: { flexDirection: 'row', margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.xs, textAlign: 'center', marginTop: 2 },
  tabsScroll: { maxHeight: 50 },
  tabsContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  recordCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, gap: SPACING.md },
  recordIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', marginBottom: 2 },
  recordSub: { fontSize: FONT_SIZES.sm, marginBottom: 2 },
  recordDate: { fontSize: FONT_SIZES.xs },
  prescriptionNote: { fontSize: FONT_SIZES.xs, marginTop: 2, fontWeight: '500' },
  viewBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: BORDER_RADIUS.sm, borderWidth: 1 },
  viewBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  downloadBtn: { width: 34, height: 34, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  amount: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.md, marginTop: SPACING.md, borderTopWidth: 1 },
  totalLabel: { fontSize: FONT_SIZES.md },
  totalAmount: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
});
