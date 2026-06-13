import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { Header, StarRating, Badge } from '../../components/common';
import { MEDICAL_STORES } from '../../data';
import { MedicalStore } from '../../types';

type SortType = 'distance' | 'rating' | 'name';

export default function MedicalStoresScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortType>('distance');
  const [showOpen, setShowOpen] = useState(false);

  const filtered = MEDICAL_STORES
    .filter(s => {
      const q = query.toLowerCase();
      const matchQuery = s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
      const matchOpen = !showOpen || s.isOpen;
      return matchQuery && matchOpen;
    })
    .sort((a, b) => {
      if (sort === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (sort === 'rating') return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  const callStore = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderStore = ({ item }: { item: MedicalStore }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={[styles.storeIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="storefront" size={26} color={colors.primary} />
        </View>
        <View style={styles.storeInfo}>
          <Text style={[styles.storeName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.storeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.address}
          </Text>
          <View style={styles.metaRow}>
            <StarRating rating={item.rating} size={12} showCount count={item.reviewCount} />
            <View style={styles.dot} />
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.distance, { color: colors.textSecondary }]}>{item.distance}</Text>
          </View>
        </View>
        <Badge
          text={item.isOpen ? 'Open' : 'Closed'}
          color={item.isOpen ? '#00A86B' : '#EF4444'}
          size="sm"
        />
      </View>

      {/* Services */}
      {item.services && (
        <View style={styles.servicesRow}>
          {item.services.slice(0, 3).map(svc => (
            <View key={svc} style={[styles.servicePill, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.serviceText, { color: colors.primary }]}>{svc}</Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <Text style={[styles.moreServices, { color: colors.textSecondary }]}>+{item.services.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Timing & Delivery */}
      <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.timing}</Text>
        </View>
        {item.homeDelivery && (
          <View style={styles.infoItem}>
            <Ionicons name="bicycle-outline" size={14} color={colors.success || '#00A86B'} />
            <Text style={[styles.infoText, { color: colors.success || '#00A86B' }]}>Home Delivery</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.callBtn, { borderColor: colors.primary }]}
          onPress={() => callStore(item.phone)}
        >
          <Ionicons name="call" size={16} color={colors.primary} />
          <Text style={[styles.callText, { color: colors.primary }]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dirBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="navigate" size={16} color={colors.textSecondary} />
          <Text style={[styles.dirText, { color: colors.textSecondary }]}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Pharmacy')}
        >
          <Text style={styles.orderText}>Order Online</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Nearby Medical Stores" onBack={() => navigation.goBack()} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search stores..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterPill,
            { borderColor: showOpen ? colors.success : colors.border },
            showOpen && { backgroundColor: (colors.success || '#00A86B') + '15' }
          ]}
          onPress={() => setShowOpen(!showOpen)}
        >
          <View style={[styles.statusDot, { backgroundColor: showOpen ? colors.success : colors.border }]} />
          <Text style={[styles.filterPillText,
            { color: showOpen ? (colors.success || '#00A86B') : colors.textSecondary }]}>
            Open Now
          </Text>
        </TouchableOpacity>

        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort:</Text>
          {(['distance', 'rating', 'name'] as SortType[]).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip,
                { borderColor: sort === s ? colors.primary : colors.border },
                sort === s && { backgroundColor: colors.primary + '15' }
              ]}
              onPress={() => setSort(s)}
            >
              <Text style={[styles.sortChipText,
                { color: sort === s ? colors.primary : colors.textSecondary }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Count */}
      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {filtered.length} stores found near you
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderStore}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md },
  filtersRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm, flexWrap: 'wrap' },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  filterPillText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sortLabel: { fontSize: FONT_SIZES.sm },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  sortChipText: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  count: { fontSize: FONT_SIZES.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  card: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md, alignItems: 'flex-start' },
  storeIcon: { width: 50, height: 50, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  storeInfo: { flex: 1 },
  storeName: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 2 },
  storeAddress: { fontSize: FONT_SIZES.sm, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
  distance: { fontSize: FONT_SIZES.xs },
  servicesRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, flexWrap: 'wrap', gap: SPACING.sm },
  servicePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm },
  serviceText: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  moreServices: { fontSize: FONT_SIZES.xs, alignSelf: 'center' },
  infoRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, gap: SPACING.lg },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: FONT_SIZES.xs },
  actions: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, borderTopWidth: 0 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5 },
  callText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dirBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  dirText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  orderBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg },
  orderText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
