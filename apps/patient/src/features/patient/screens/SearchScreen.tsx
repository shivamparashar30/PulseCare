import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { StarRating, Badge } from '../../../../../../packages/shared/src/components';
import { useDoctors, useMedicines, useLabTests } from '../../../../../../packages/core/src/hooks';
import { formatCurrency } from '../../../../../../packages/core/src/utils';
import { supabase } from '../../../../../../packages/supabase/src/client';

type TabType = 'all' | 'doctors' | 'medicines' | 'tests' | 'centers';

const SEARCH_HISTORY_KEY = '@app_search_history';
const MAX_HISTORY = 15;

const POPULAR_SEARCHES = [
  { label: 'General Physician', icon: 'person' },
  { label: 'Dermatologist', icon: 'person' },
  { label: 'Paracetamol', icon: 'medical' },
  { label: 'Vitamin D Test', icon: 'flask' },
  { label: 'Crocin', icon: 'medical' },
  { label: 'CBC Test', icon: 'flask' },
  { label: 'Pathology Lab', icon: 'business' },
  { label: 'Blood Sugar', icon: 'water' },
];

interface DiagCenter {
  id: string;
  center_name: string;
  address: string;
  phone: string;
}

export default function SearchScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const inputRef = useRef<TextInput>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [allCenters, setAllCenters] = useState<DiagCenter[]>([]);

  // All data from Supabase via React Query hooks
  const { data: allDoctors = [], isLoading: loadingDoctors } = useDoctors();
  const { data: allMedicines = [], isLoading: loadingMedicines } = useMedicines();
  const { data: allLabTests = [], isLoading: loadingTests } = useLabTests();

  const isDataLoading = loadingDoctors || loadingMedicines || loadingTests;

  // Load search history + diagnostics centers on mount
  useEffect(() => {
    AsyncStorage.getItem(SEARCH_HISTORY_KEY).then((val) => {
      if (val) setSearchHistory(JSON.parse(val));
    });
    supabase
      .from('diagnostics_centers')
      .select('id, center_name, address, phone')
      .order('center_name')
      .then(({ data }) => {
        if (data) setAllCenters(data);
      });
  }, []);

  const saveHistory = useCallback(async (history: string[]) => {
    setSearchHistory(history);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  }, []);

  const addToHistory = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    const updated = [trimmed, ...searchHistory.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_HISTORY);
    await saveHistory(updated);
  }, [searchHistory, saveHistory]);

  const removeFromHistory = useCallback(async (term: string) => {
    await saveHistory(searchHistory.filter((h) => h !== term));
  }, [searchHistory, saveHistory]);

  const clearHistory = useCallback(async () => {
    await saveHistory([]);
  }, [saveHistory]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleSubmit = useCallback(() => {
    if (query.trim().length >= 2) addToHistory(query.trim());
  }, [query, addToHistory]);

  const handleHistoryTap = useCallback((term: string) => {
    setQuery(term);
    addToHistory(term);
  }, [addToHistory]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'medicines', label: 'Medicines' },
    { key: 'tests', label: 'Lab Tests' },
    { key: 'centers', label: 'Centers' },
  ];

  const q = query.toLowerCase().trim();

  const doctorResults = q.length >= 2 ? allDoctors.filter(
    (d: any) => d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const medicineResults = q.length >= 2 ? allMedicines.filter(
    (m: any) => m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const testResults = q.length >= 2 ? allLabTests.filter(
    (t: any) => (t.name || '').toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const centerResults = q.length >= 2 ? allCenters.filter(
    c => c.center_name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
  ).slice(0, 5) : [];

  const showDoctors = activeTab === 'all' || activeTab === 'doctors';
  const showMedicines = activeTab === 'all' || activeTab === 'medicines';
  const showTests = activeTab === 'all' || activeTab === 'tests';
  const showCenters = activeTab === 'all' || activeTab === 'centers';

  const hasResults = (showDoctors && doctorResults.length > 0) ||
    (showMedicines && medicineResults.length > 0) ||
    (showTests && testResults.length > 0) ||
    (showCenters && centerResults.length > 0);

  const DoctorResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        addToHistory(query.trim());
        navigation.getParent()?.navigate('Doctors', { screen: 'DoctorDetail', params: { doctorId: item.id } });
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.doctorPhoto} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.specialization}</Text>
        <View style={styles.resultMeta}>
          <StarRating rating={item.rating} size={12} />
          <Text style={[styles.resultFee, { color: COLORS.primary }]}>{formatCurrency(item.fees)}</Text>
        </View>
      </View>
      <Badge label="Doctor" color={COLORS.primary} size="sm" />
    </TouchableOpacity>
  );

  const MedicineResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        addToHistory(query.trim());
        navigation.getParent()?.navigate('Pharmacy', { screen: 'MedicineDetail', params: { medicineId: item.id } });
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.medIcon} />
      ) : (
        <View style={[styles.medIcon, { backgroundColor: COLORS.primaryUltraLight, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="medical" size={24} color={COLORS.primary} />
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.company}</Text>
        {item.storeName ? (
          <Text style={styles.storeLabel} numberOfLines={1}>{item.storeName}</Text>
        ) : null}
        <Text style={[styles.resultFee, { color: COLORS.primary }]}>
          {formatCurrency(item.discountedPrice || item.price)}
        </Text>
      </View>
      <Badge label={item.discountPercent > 0 ? `${item.discountPercent}% OFF` : 'Medicine'} color={COLORS.success} size="sm" />
    </TouchableOpacity>
  );

  const TestResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        addToHistory(query.trim());
        navigation.navigate('LabTestDetail', { testId: item.id });
      }}
    >
      <View style={[styles.testIcon, { backgroundColor: '#FF6B3515' }]}>
        <Ionicons name="flask" size={24} color="#FF6B35" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}>{item.category}</Text>
        {item.centerName ? (
          <Text style={styles.centerLabel} numberOfLines={1}>{item.centerName}</Text>
        ) : null}
        <Text style={[styles.resultFee, { color: '#FF6B35' }]}>
          {formatCurrency(item.discountedPrice || item.price)}
        </Text>
      </View>
      <Badge label="Lab Test" color="#FF6B35" size="sm" />
    </TouchableOpacity>
  );

  const CenterResult = ({ item }: { item: DiagCenter }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        addToHistory(query.trim());
        navigation.navigate('CenterTests', { centerId: item.id, centerName: item.center_name });
      }}
    >
      <View style={[styles.testIcon, { backgroundColor: '#8B5CF615' }]}>
        <Ionicons name="business" size={24} color="#8B5CF6" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>{item.center_name}</Text>
        <Text style={[styles.resultSub, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
        {item.phone ? (
          <Text style={[styles.resultFee, { color: '#8B5CF6' }]}>{item.phone}</Text>
        ) : null}
      </View>
      <Badge label="Center" color="#8B5CF6" size="sm" />
    </TouchableOpacity>
  );

  const isSearching = q.length >= 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Bar */}
      <View style={[styles.searchHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search doctors, medicines, tests..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setActiveTab('all'); }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs - always visible when searching */}
      {isSearching && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={[styles.tabsBar, { borderBottomColor: colors.border }]}
        >
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === t.key ? COLORS.primary : colors.textSecondary },
                activeTab === t.key && styles.tabTextActive,
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!isSearching ? (
          <>
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {searchHistory.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={[styles.recentRow, { borderBottomColor: colors.border }]}
                    onPress={() => handleHistoryTap(term)}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.recentText, { color: colors.textPrimary }]}>{term}</Text>
                    <TouchableOpacity
                      onPress={() => removeFromHistory(term)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Popular Searches</Text>
              <View style={styles.popularGrid}>
                {POPULAR_SEARCHES.map(s => (
                  <TouchableOpacity
                    key={s.label}
                    style={[styles.popularChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleHistoryTap(s.label)}
                  >
                    <Ionicons name={s.icon as any} size={14} color={COLORS.primary} />
                    <Text style={[styles.popularText, { color: colors.textPrimary }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : isDataLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
          </View>
        ) : !hasResults ? (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.noResultsTitle, { color: colors.textPrimary }]}>No results found</Text>
            <Text style={[styles.noResultsSub, { color: colors.textSecondary }]}>
              Try different keywords or check your spelling
            </Text>
          </View>
        ) : (
          <>
            {/* Doctors section */}
            {showDoctors && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Doctors ({doctorResults.length})
                </Text>
                {doctorResults.length > 0 ? (
                  doctorResults.map((d: any) => <DoctorResult key={d.id} item={d} />)
                ) : (
                  <View style={[styles.emptySection, { backgroundColor: colors.card }]}>
                    <Ionicons name="person-outline" size={24} color={colors.textTertiary} />
                    <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                      No doctors match "{query}"
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Medicines section */}
            {showMedicines && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Medicines ({medicineResults.length})
                </Text>
                {medicineResults.length > 0 ? (
                  medicineResults.map((m: any) => <MedicineResult key={m.id} item={m} />)
                ) : (
                  <View style={[styles.emptySection, { backgroundColor: colors.card }]}>
                    <Ionicons name="medical-outline" size={24} color={colors.textTertiary} />
                    <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                      No medicines match "{query}"
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Lab Tests section */}
            {showTests && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Lab Tests ({testResults.length})
                </Text>
                {testResults.length > 0 ? (
                  testResults.map((t: any) => <TestResult key={t.id} item={t} />)
                ) : (
                  <View style={[styles.emptySection, { backgroundColor: colors.card }]}>
                    <Ionicons name="flask-outline" size={24} color={colors.textTertiary} />
                    <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                      No lab tests match "{query}"
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Diagnostics Centers section */}
            {showCenters && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Diagnostics Centers ({centerResults.length})
                </Text>
                {centerResults.length > 0 ? (
                  centerResults.map(c => <CenterResult key={c.id} item={c} />)
                ) : (
                  <View style={[styles.emptySection, { backgroundColor: colors.card }]}>
                    <Ionicons name="business-outline" size={24} color={colors.textTertiary} />
                    <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                      No centers match "{query}"
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  tabsBar: {
    borderBottomWidth: 1,
    maxHeight: 48,
  },
  tabsContent: {
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING['3xl'],
    flexGrow: 1,
  },
  section: { marginBottom: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  clearText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.error },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: SPACING.sm,
  },
  recentText: { flex: 1, fontSize: FONT_SIZES.md },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xs },
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
  loadingContainer: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  loadingText: { fontSize: FONT_SIZES.sm },
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
  medIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
  testIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  resultSub: { fontSize: FONT_SIZES.sm, marginVertical: 2 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  resultFee: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  storeLabel: { fontSize: 11, color: COLORS.accent, fontWeight: '500' },
  centerLabel: { fontSize: 11, color: '#8B5CF6', fontWeight: '500' },
  noResults: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  noResultsTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  noResultsSub: { fontSize: FONT_SIZES.sm, textAlign: 'center' },
  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptySectionText: { fontSize: FONT_SIZES.sm },
});
