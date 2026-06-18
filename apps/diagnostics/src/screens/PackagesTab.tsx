import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

const ACCENT = '#7C3AED';
const CATEGORIES = ['Basic', 'Essential', 'Comprehensive', 'Premium', "Women's", 'Senior'];

interface Props { profile: any; }

export default function PackagesTab({ profile }: Props) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Basic');
  const [description, setDescription] = useState('');
  const [tests, setTests] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [reportTime, setReportTime] = useState('24 hours');
  const [isPopular, setIsPopular] = useState(false);
  const [homeCollection, setHomeCollection] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('health_packages')
      .select('*')
      .eq('diagnostics_center_id', profile.id)
      .order('created_at', { ascending: false });
    setPackages(data || []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCategory('Basic');
    setDescription('');
    setTests('');
    setPrice('');
    setOriginalPrice('');
    setReportTime('24 hours');
    setIsPopular(false);
    setHomeCollection(true);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (pkg: any) => {
    setEditId(pkg.id);
    setName(pkg.name);
    setCategory(pkg.category);
    setDescription(pkg.description || '');
    const testList = typeof pkg.tests === 'string' ? JSON.parse(pkg.tests) : (pkg.tests || []);
    setTests(testList.join(', '));
    setPrice(String(pkg.price));
    setOriginalPrice(String(pkg.original_price));
    setReportTime(pkg.report_time || '24 hours');
    setIsPopular(pkg.is_popular || false);
    setHomeCollection(pkg.home_collection ?? true);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !originalPrice.trim()) {
      Alert.alert('Required', 'Package name, price, and original price are required.');
      return;
    }
    const testArray = tests.split(',').map(t => t.trim()).filter(Boolean);
    if (testArray.length === 0) {
      Alert.alert('Required', 'Add at least one test (comma-separated).');
      return;
    }

    setSaving(true);
    const priceNum = Number(price);
    const origNum = Number(originalPrice);
    const discPct = origNum > 0 ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;

    const payload = {
      diagnostics_center_id: profile.id,
      name: name.trim(),
      category,
      description: description.trim(),
      tests: testArray,
      price: priceNum,
      original_price: origNum,
      discount_percentage: discPct,
      report_time: reportTime.trim(),
      is_popular: isPopular,
      home_collection: homeCollection,
      is_active: true,
    };

    if (editId) {
      const { error } = await supabase.from('health_packages').update(payload).eq('id', editId);
      if (error) Alert.alert('Error', error.message);
    } else {
      const { error } = await supabase.from('health_packages').insert(payload);
      if (error) Alert.alert('Error', error.message);
    }

    setSaving(false);
    setShowModal(false);
    load();
  };

  const toggleActive = async (pkg: any) => {
    await supabase.from('health_packages').update({ is_active: !pkg.is_active }).eq('id', pkg.id);
    load();
  };

  const deletePackage = (pkg: any) => {
    Alert.alert('Delete Package', `Delete "${pkg.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('health_packages').delete().eq('id', pkg.id);
          load();
        },
      },
    ]);
  };

  const renderPackage = ({ item }: { item: any }) => {
    const testList = typeof item.tests === 'string' ? JSON.parse(item.tests) : (item.tests || []);
    const discPct = Number(item.discount_percentage) || 0;

    return (
      <View style={[styles.card, !item.is_active && styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={styles.cardBadgeRow}>
              <View style={[styles.catBadge, { backgroundColor: ACCENT + '15' }]}>
                <Text style={[styles.catBadgeText, { color: ACCENT }]}>{item.category}</Text>
              </View>
              {item.is_popular && (
                <View style={[styles.catBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star" size={10} color="#D97706" />
                  <Text style={[styles.catBadgeText, { color: '#D97706' }]}>Popular</Text>
                </View>
              )}
              {!item.is_active && (
                <View style={[styles.catBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.catBadgeText, { color: '#DC2626' }]}>Inactive</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <Ionicons name="create-outline" size={18} color={ACCENT} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deletePackage(item)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}

        <View style={styles.cardTestRow}>
          <Ionicons name="flask-outline" size={14} color="#64748B" />
          <Text style={styles.cardTestText}>{testList.length} tests: {testList.slice(0, 3).join(', ')}{testList.length > 3 ? ` +${testList.length - 3} more` : ''}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardPrice}>₹{Number(item.price).toLocaleString()}</Text>
            {discPct > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.cardOrigPrice}>₹{Number(item.original_price).toLocaleString()}</Text>
                <Text style={styles.cardDiscount}>{discPct}% off</Text>
              </View>
            )}
          </View>
          <View style={styles.cardMetaRight}>
            <View style={styles.cardMetaItem}>
              <Ionicons name="time-outline" size={12} color="#64748B" />
              <Text style={styles.cardMetaText}>{item.report_time}</Text>
            </View>
            {item.home_collection && (
              <View style={styles.cardMetaItem}>
                <Ionicons name="home-outline" size={12} color="#059669" />
                <Text style={[styles.cardMetaText, { color: '#059669' }]}>Home</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardToggle}>
          <Text style={styles.toggleLabel}>Active</Text>
          <Switch
            value={item.is_active}
            onValueChange={() => toggleActive(item)}
            trackColor={{ false: '#D1D5DB', true: ACCENT + '60' }}
            thumbColor={item.is_active ? ACCENT : '#9CA3AF'}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Packages</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New Package</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item) => item.id}
        renderItem={renderPackage}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ACCENT]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No packages yet</Text>
            <Text style={styles.emptySubtitle}>Create health packages for patients to book</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
              <Text style={styles.emptyBtnText}>Create First Package</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editId ? 'Edit Package' : 'New Package'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.saveBtn, saving && { opacity: 0.5 }]}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Package Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Full Body Checkup" />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.catChip, category === c && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.catChipText, category === c && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Package description..."
              multiline
            />

            <Text style={styles.label}>Tests Included * (comma-separated)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={tests}
              onChangeText={setTests}
              placeholder="CBC, Blood Sugar, Lipid Profile, LFT..."
              multiline
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="2999" keyboardType="numeric" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Original Price (₹) *</Text>
                <TextInput style={styles.input} value={originalPrice} onChangeText={setOriginalPrice} placeholder="4999" keyboardType="numeric" />
              </View>
            </View>
            {price && originalPrice && Number(originalPrice) > Number(price) && (
              <Text style={styles.discountPreview}>
                Discount: {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% off
              </Text>
            )}

            <Text style={styles.label}>Report Time</Text>
            <TextInput style={styles.input} value={reportTime} onChangeText={setReportTime} placeholder="24 hours" />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Mark as Popular</Text>
              <Switch
                value={isPopular}
                onValueChange={setIsPopular}
                trackColor={{ false: '#D1D5DB', true: ACCENT + '60' }}
                thumbColor={isPopular ? ACCENT : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Home Sample Collection</Text>
              <Switch
                value={homeCollection}
                onValueChange={setHomeCollection}
                trackColor={{ false: '#D1D5DB', true: '#05966960' }}
                thumbColor={homeCollection ? '#059669' : '#9CA3AF'}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  cardBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  catBadgeText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
  cardDesc: { fontSize: 13, color: '#64748B', marginBottom: 8, lineHeight: 18 },
  cardTestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 12 },
  cardTestText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 17 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardPrice: { fontSize: 20, fontWeight: '800', color: ACCENT },
  cardOrigPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  cardDiscount: { fontSize: 11, fontWeight: '700', color: '#059669' },
  cardMetaRight: { alignItems: 'flex-end', gap: 4 },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  cardToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF' },
  emptyBtn: { marginTop: 16, backgroundColor: ACCENT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  saveBtn: { fontSize: 15, fontWeight: '700', color: ACCENT },
  modalContent: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  catScroll: { marginBottom: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  row: { flexDirection: 'row', gap: 12 },
  halfCol: { flex: 1 },
  discountPreview: { fontSize: 12, fontWeight: '600', color: '#059669', marginTop: 4 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
});
