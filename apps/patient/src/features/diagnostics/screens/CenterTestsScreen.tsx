import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { HomeStackParamList } from '../../../../../../packages/core/src/types';
import { EmptyState } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'CenterTests'>;
type Route_ = RouteProp<HomeStackParamList, 'CenterTests'>;

const CAT_ICONS: Record<string, string> = {
  Hematology: 'water-outline',
  Diabetes: 'fitness-outline',
  Endocrinology: 'body-outline',
  Biochemistry: 'flask-outline',
  Vitamins: 'sunny-outline',
  Pathology: 'flask-outline',
  Imaging: 'scan-outline',
  Cardiac: 'heart-outline',
  Microbiology: 'bug-outline',
};

export default function CenterTestsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route_>();
  const { centerId, centerName } = route.params;
  const { colors } = useTheme();

  const [tests, setTests] = useState<any[]>([]);
  const [centerInfo, setCenterInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    // Fetch center info
    const { data: center } = await supabase
      .from('diagnostics_centers')
      .select('*')
      .eq('id', centerId)
      .single();
    setCenterInfo(center);

    // Fetch tests via center_tests
    const { data: centerTests } = await supabase
      .from('center_tests')
      .select('*, catalog:lab_tests!lab_test_id(name, category, description, preparation, parameters, report_time)')
      .eq('diagnostics_center_id', centerId)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (centerTests && centerTests.length > 0) {
      setTests(centerTests.map((row: any) => {
        const catalog = Array.isArray(row.catalog) ? row.catalog[0] : row.catalog;
        const price = Number(row.price) || 0;
        const discountPercent = row.discount_percentage || 0;
        const discountedPrice = Math.round(price * (1 - discountPercent / 100));
        return {
          id: row.id,
          catalogTestId: row.lab_test_id,
          name: catalog?.name || 'Test',
          category: catalog?.category || 'General',
          description: catalog?.description || '',
          price: discountedPrice,
          originalPrice: price,
          discountPercent,
          reportTime: row.report_time || catalog?.report_time || '24 hours',
          homeCollection: row.home_collection,
          includes: catalog?.parameters || [],
          diagnosticsCenterId: centerId,
          centerName: center?.center_name || centerName,
          centerAddress: center?.address || '',
        };
      }));
    } else {
      // Fallback: legacy lab_tests
      const { data: legacy } = await supabase
        .from('lab_tests')
        .select('*')
        .eq('diagnostics_center_id', centerId)
        .order('name');

      setTests((legacy || []).map((row: any) => {
        const price = Number(row.price) || 0;
        const discountPercent = row.discount_percentage || 0;
        const discountedPrice = Math.round(price * (1 - discountPercent / 100));
        return {
          id: row.id,
          catalogTestId: row.id,
          name: row.name,
          category: row.category || 'General',
          description: row.description || '',
          price: discountedPrice,
          originalPrice: price,
          discountPercent,
          reportTime: row.report_time || '24 hours',
          homeCollection: row.home_collection,
          includes: row.parameters || [],
          diagnosticsCenterId: centerId,
          centerName: center?.center_name || centerName,
          centerAddress: center?.address || '',
        };
      }));
    }
    setLoading(false);
  }, [centerId, centerName]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    if (!search.trim()) return tests;
    const q = search.toLowerCase();
    return tests.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }, [tests, search]);

  const renderTest = ({ item }: any) => {
    const hasDiscount = item.discountPercent > 0;
    return (
      <TouchableOpacity
        style={[styles.testCard, { backgroundColor: colors.card }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('LabTestDetail', { testId: item.id })}
      >
        <View style={styles.testCardTop}>
          <View style={styles.testIconWrap}>
            <View style={[styles.testIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name={(CAT_ICONS[item.category] ?? 'flask-outline') as any} size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.testName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.testCategory, { color: colors.textTertiary }]}>{item.category}</Text>
            </View>
          </View>
          {hasDiscount && (
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text style={[styles.testDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
            <Ionicons name="time-outline" size={12} color="#7C3AED" />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.reportTime}</Text>
          </View>
          {item.homeCollection && (
            <View style={[styles.metaChip, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="home-outline" size={12} color="#059669" />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}>Home</Text>
            </View>
          )}
          {item.includes && item.includes.length > 0 && (
            <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
              <Ionicons name="list-outline" size={12} color="#7C3AED" />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.includes.length} params</Text>
            </View>
          )}
        </View>

        <View style={[styles.testDivider, { backgroundColor: colors.border }]} />

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>Rs. {item.price}</Text>
            {hasDiscount && <Text style={[styles.mrp, { color: colors.textTertiary }]}>Rs. {item.originalPrice}</Text>}
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('LabBooking', { testId: item.id })}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{centerName}</Text>
          {centerInfo?.address && (
            <Text style={[styles.headerSub, { color: colors.textTertiary }]} numberOfLines={1}>{centerInfo.address}</Text>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search tests..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {filtered.length} test{filtered.length !== 1 ? 's' : ''} available
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTest}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />
        }
        ListEmptyComponent={
          <EmptyState icon="flask-outline" title="No tests found" subtitle="This center has no available tests" />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  headerSub: { fontSize: FONT_SIZES.xs, marginTop: 1 },
  searchRow: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.sm, ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm },
  count: { fontSize: FONT_SIZES.xs, fontWeight: '500', paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.base, gap: SPACING.md, paddingBottom: 30 },
  testCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  testCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  testIconWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  testIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  testName: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 2 },
  testCategory: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  discountPill: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, marginLeft: SPACING.sm },
  discountText: { fontSize: 10, fontWeight: '700', color: '#047857' },
  testDesc: { fontSize: FONT_SIZES.xs, lineHeight: 18, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BORDER_RADIUS.full },
  metaText: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  testDivider: { height: 1, marginBottom: SPACING.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#7C3AED' },
  mrp: { fontSize: FONT_SIZES.xs, textDecorationLine: 'line-through', marginTop: 1 },
  bookBtn: {
    backgroundColor: '#7C3AED', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  bookBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700', letterSpacing: 0.3 },
});
