import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { HomeStackParamList } from '../../../../../../packages/core/src/types';
import { EmptyState } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'DiagnosticCenters'>;

interface DiagnosticCenter {
  id: string;
  center_name: string;
  address: string;
  phone: string;
  testCount: number;
  avatar_url?: string;
}

export default function DiagnosticCentersScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCenters = useCallback(async () => {
    // Get all centers that have at least one available test
    const { data: centerTests } = await supabase
      .from('center_tests')
      .select('diagnostics_center_id')
      .eq('is_available', true);

    // Count tests per center
    const countMap: Record<string, number> = {};
    (centerTests || []).forEach((ct: any) => {
      countMap[ct.diagnostics_center_id] = (countMap[ct.diagnostics_center_id] || 0) + 1;
    });

    const centerIds = Object.keys(countMap);
    if (centerIds.length === 0) {
      // Fallback: try legacy lab_tests with diagnostics_center_id
      const { data: legacyCenters } = await supabase
        .from('diagnostics_centers')
        .select('id, center_name, address, phone')
        .order('center_name');

      if (legacyCenters && legacyCenters.length > 0) {
        // Count legacy tests
        const { data: legacyTests } = await supabase
          .from('lab_tests')
          .select('diagnostics_center_id')
          .not('diagnostics_center_id', 'is', null);

        const legacyCount: Record<string, number> = {};
        (legacyTests || []).forEach((t: any) => {
          legacyCount[t.diagnostics_center_id] = (legacyCount[t.diagnostics_center_id] || 0) + 1;
        });

        // Get avatar URLs
        const ids = legacyCenters.map(c => c.id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .in('id', ids);
        const avatarMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => { avatarMap[p.id] = p.avatar_url; });

        setCenters(legacyCenters.filter(c => (legacyCount[c.id] || 0) > 0).map(c => ({
          ...c,
          testCount: legacyCount[c.id] || 0,
          avatar_url: avatarMap[c.id],
        })));
      } else {
        setCenters([]);
      }
      setLoading(false);
      return;
    }

    // Fetch center details
    const { data: centerData } = await supabase
      .from('diagnostics_centers')
      .select('id, center_name, address, phone')
      .in('id', centerIds)
      .order('center_name');

    // Get avatar URLs
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', centerIds);
    const avatarMap: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { avatarMap[p.id] = p.avatar_url; });

    setCenters((centerData || []).map(c => ({
      ...c,
      testCount: countMap[c.id] || 0,
      avatar_url: avatarMap[c.id],
    })));
    setLoading(false);
  }, []);

  useEffect(() => { loadCenters(); }, [loadCenters]);

  const onRefresh = async () => { setRefreshing(true); await loadCenters(); setRefreshing(false); };

  const renderCenter = ({ item }: { item: DiagnosticCenter }) => {
    const initials = item.center_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CenterTests', { centerId: item.id, centerName: item.center_name })}
      >
        <View style={styles.cardRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.centerName, { color: colors.textPrimary }]}>{item.center_name}</Text>
            {item.address ? (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>{item.address}</Text>
              </View>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="flask-outline" size={14} color="#7C3AED" />
            <Text style={styles.metaText}>{item.testCount} tests</Text>
          </View>
          {item.phone ? (
            <View style={styles.metaChip}>
              <Ionicons name="call-outline" size={14} color="#059669" />
              <Text style={[styles.metaText, { color: '#059669' }]}>{item.phone}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Diagnostic Centers</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
        {centers.length} center{centers.length !== 1 ? 's' : ''} near you
      </Text>

      <FlatList
        data={centers}
        keyExtractor={(item) => item.id}
        renderItem={renderCenter}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState icon="business-outline" title="No centers found" subtitle="No diagnostic centers available at the moment" />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '700', letterSpacing: 0.3,
  },
  resultCount: {
    fontSize: FONT_SIZES.xs, fontWeight: '500',
    paddingHorizontal: SPACING.base, marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
    paddingBottom: 30,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {
    fontSize: 16, fontWeight: '800', color: '#7C3AED',
  },
  centerName: {
    fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 3,
  },
  addressRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 4,
  },
  addressText: {
    fontSize: FONT_SIZES.xs, lineHeight: 16, flex: 1,
  },
  divider: {
    height: 1, marginVertical: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row', gap: SPACING.md,
  },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#7C3AED',
  },
});
