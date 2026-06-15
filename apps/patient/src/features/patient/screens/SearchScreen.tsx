import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { StarRating, Badge } from '../../../../../../packages/shared/src/components';
import { DOCTORS } from '../../doctor/services/doctorData';
import { MEDICINES } from '../../medicalStore/services/medicineData';
import { LAB_TESTS } from '../../../../../../packages/core/src/api/mockData';
import { formatCurrency } from '../../../../../../packages/core/src/utils';

type TabType = 'all' | 'doctors' | 'medicines' | 'tests';

const RECENT_SEARCHES = ['Cardiologist', 'Paracetamol', 'Blood Test', 'Dr. Sharma', 'CBC Test'];

const POPULAR_SEARCHES = [
  { label: 'General Physician', icon: 'person' },
  { label: 'Dermatologist', icon: 'person' },
  { label: 'Vitamin D Test', icon: 'flask' },
  { label: 'Crocin', icon: 'medical' },
  { label: 'MRI Scan', icon: 'scan' },
  { label: 'Blood Sugar', icon: 'water' },
];

export default function SearchScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const inputRef = useRef<TextInput>(null);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'medicines', label: 'Medicines' },
    { key: 'tests', label: 'Lab Tests' },
  ];

  const q = query.toLowerCase();

  const doctorResults = DOCTORS.filter(
    d => d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q)
  ).slice(0, 5);

  const medicineResults = MEDICINES.filter(
    m => m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
  ).slice(0, 5);

  const testResults = LAB_TESTS.filter(
    t => t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  ).slice(0, 5);

  const hasResults = doctorResults.length > 0 || medicineResults.length > 0 || testResults.length > 0;

  const DoctorResult = ({ item }: { item: typeof DOCTORS[0] }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.getParent()?.navigate('Doctors', { screen: 'DoctorDetail', params: { doctorId: item.id } })}
    >
      <Image source={{ uri: item.photo }} style={styles.doctorPhoto} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.specialization}</Text>
        <View style={styles.resultMeta}>
          <StarRating rating={item.rating} size={12} />
          <Text style={[styles.resultFee, { color: colors.primary }]}>₹{item.fee}</Text>
        </View>
      </View>
      <Badge text="Doctor" color={COLORS.primary} size="sm" />
    </TouchableOpacity>
  );

  const MedicineResult = ({ item }: { item: typeof MEDICINES[0] }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.getParent()?.navigate('Pharmacy', { screen: 'MedicineDetail', params: { medicineId: item.id } })}
    >
      <View style={[styles.medIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="medical" size={24} color={colors.primary} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.company}</Text>
        <Text style={[styles.resultFee, { color: colors.primary }]}>
          {formatCurrency(item.price - (item.price * item.discount / 100))}
        </Text>
      </View>
      <Badge text={item.discount > 0 ? `${item.discount}% OFF` : 'Medicine'} color={COLORS.success} size="sm" />
    </TouchableOpacity>
  );

  const TestResult = ({ item }: { item: typeof LAB_TESTS[0] }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('LabTestDetail', { testId: item.id })}
    >
      <View style={[styles.medIcon, { backgroundColor: '#FF6B35' + '15' }]}>
        <Ionicons name="flask" size={24} color="#FF6B35" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.category}</Text>
        <Text style={[styles.resultFee, { color: '#FF6B35' }]}>{formatCurrency(item.price)}</Text>
      </View>
      <Badge text="Lab Test" color="#FF6B35" size="sm" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Bar */}
      <View style={[styles.searchHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search doctors, medicines, tests..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.emptyContent}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
              <TouchableOpacity>
                <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            </View>
            {RECENT_SEARCHES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.recentRow, { borderBottomColor: colors.border }]}
                onPress={() => setQuery(s)}
              >
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.recentText, { color: colors.text }]}>{s}</Text>
                <Ionicons name="arrow-up-outline" size={14} color={colors.textTertiary} style={styles.arrowIcon} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Searches</Text>
            <View style={styles.popularGrid}>
              {POPULAR_SEARCHES.map(s => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.popularChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setQuery(s.label)}
                >
                  <Ionicons name={s.icon as any} size={14} color={colors.primary} />
                  <Text style={[styles.popularText, { color: colors.text }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}
            contentContainerStyle={styles.tabsContent}>
            {tabs.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                onPress={() => setActiveTab(t.key)}
              >
                <Text style={[styles.tabText, { color: activeTab === t.key ? colors.primary : colors.textSecondary }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={[1]}
            keyExtractor={() => 'results'}
            contentContainerStyle={styles.resultsList}
            renderItem={() => (
              <View>
                {!hasResults && (
                  <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                    <Text style={[styles.noResultsTitle, { color: colors.text }]}>No results found</Text>
                    <Text style={[styles.noResultsSub, { color: colors.textSecondary }]}>
                      Try different keywords or check your spelling
                    </Text>
                  </View>
                )}

                {/* Doctors */}
                {(activeTab === 'all' || activeTab === 'doctors') && doctorResults.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Doctors ({doctorResults.length})
                    </Text>
                    {doctorResults.map(d => <DoctorResult key={d.id} item={d} />)}
                  </View>
                )}

                {/* Medicines */}
                {(activeTab === 'all' || activeTab === 'medicines') && medicineResults.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Medicines ({medicineResults.length})
                    </Text>
                    {medicineResults.map(m => <MedicineResult key={m.id} item={m} />)}
                  </View>
                )}

                {/* Lab Tests */}
                {(activeTab === 'all' || activeTab === 'tests') && testResults.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Lab Tests ({testResults.length})
                    </Text>
                    {testResults.map(t => <TestResult key={t.id} item={t} />)}
                  </View>
                )}
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  backBtn: { padding: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md },
  emptyContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: SPACING.md },
  clearText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  recentText: { flex: 1, fontSize: FONT_SIZES.md },
  arrowIcon: { transform: [{ rotate: '45deg' }] },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  popularText: { fontSize: FONT_SIZES.sm },
  tabsRow: { borderBottomWidth: 1 },
  tabsContent: { paddingHorizontal: SPACING.md },
  tab: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginRight: 4 },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  resultsList: { padding: SPACING.md, paddingBottom: SPACING.xl },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  doctorPhoto: { width: 44, height: 44, borderRadius: 22 },
  medIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  resultSub: { fontSize: FONT_SIZES.sm, marginVertical: 2 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  resultFee: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  noResults: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  noResultsTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  noResultsSub: { fontSize: FONT_SIZES.sm, textAlign: 'center' },
});
