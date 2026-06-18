import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props { profile: any; }

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

export default function ManageTestsTab({ profile }: Props) {
  const [centerTests, setCenterTests] = useState<any[]>([]);
  const [catalogTests, setCatalogTests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add test modal
  const [addModal, setAddModal] = useState(false);
  const [selectedCatalogTest, setSelectedCatalogTest] = useState<any>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('0');
  const [newHomeCollection, setNewHomeCollection] = useState(false);
  const [newReportTime, setNewReportTime] = useState('24 hours');
  const [saving, setSaving] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editHomeCollection, setEditHomeCollection] = useState(false);
  const [editReportTime, setEditReportTime] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);

  const load = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    // Load center's current tests
    const { data: myTests } = await supabase
      .from('center_tests')
      .select('*, catalog:lab_tests!lab_test_id(name, category, description, parameters)')
      .eq('diagnostics_center_id', userId)
      .order('created_at', { ascending: false });

    setCenterTests(myTests || []);

    // Load catalog tests (predefined, diagnostics_center_id IS NULL)
    const { data: catalog } = await supabase
      .from('lab_tests')
      .select('*')
      .is('diagnostics_center_id', null)
      .order('name');

    setCatalogTests(catalog || []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Get catalog tests not already added
  const availableCatalog = catalogTests.filter(
    ct => !centerTests.some(mt => mt.lab_test_id === ct.id)
  );

  const openAddModal = (catalogTest: any) => {
    setSelectedCatalogTest(catalogTest);
    setNewPrice(catalogTest.price?.toString() || '');
    setNewDiscount(catalogTest.discount_percentage?.toString() || '0');
    setNewHomeCollection(catalogTest.home_collection || false);
    setNewReportTime(catalogTest.report_time || '24 hours');
    setAddModal(true);
  };

  const handleAdd = async () => {
    if (!newPrice || Number(newPrice) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid price.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('center_tests')
      .insert({
        diagnostics_center_id: profile.id,
        lab_test_id: selectedCatalogTest.id,
        price: Number(newPrice),
        discount_percentage: Number(newDiscount) || 0,
        is_available: true,
        home_collection: newHomeCollection,
        report_time: newReportTime,
      });

    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setAddModal(false);
    load();
  };

  const openEditModal = (item: any) => {
    const catalog = Array.isArray(item.catalog) ? item.catalog[0] : item.catalog;
    setEditItem({ ...item, catalogName: catalog?.name });
    setEditPrice(item.price?.toString() || '');
    setEditDiscount(item.discount_percentage?.toString() || '0');
    setEditHomeCollection(item.home_collection || false);
    setEditReportTime(item.report_time || '');
    setEditAvailable(item.is_available);
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editPrice || Number(editPrice) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid price.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('center_tests')
      .update({
        price: Number(editPrice),
        discount_percentage: Number(editDiscount) || 0,
        home_collection: editHomeCollection,
        report_time: editReportTime,
        is_available: editAvailable,
      })
      .eq('id', editItem.id);

    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setEditModal(false);
    load();
  };

  const handleRemove = (item: any) => {
    const catalog = Array.isArray(item.catalog) ? item.catalog[0] : item.catalog;
    Alert.alert('Remove Test', `Remove "${catalog?.name}" from your center?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('center_tests').delete().eq('id', item.id);
          load();
        },
      },
    ]);
  };

  const toggleAvailability = async (item: any) => {
    await supabase
      .from('center_tests')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);
    load();
  };

  if (loading) {
    return <View style={styles.loadingWrap}><ActivityIndicator size="large" color="#7C3AED" /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Manage Tests</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => {
          if (availableCatalog.length === 0) {
            Alert.alert('All Added', 'You have already added all available tests.');
            return;
          }
          setAddModal(true);
          setSelectedCatalogTest(null);
        }}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add Test</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {centerTests.length} test{centerTests.length !== 1 ? 's' : ''} configured
        {' '}&bull;{' '}
        {centerTests.filter(t => t.is_available).length} available to patients
      </Text>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}
      >
        {centerTests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flask-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No tests configured</Text>
            <Text style={styles.emptySubtitle}>Tap "Add Test" to select from the catalog</Text>
          </View>
        ) : (
          centerTests.map((item) => {
            const catalog = Array.isArray(item.catalog) ? item.catalog[0] : item.catalog;
            const discounted = Math.round(item.price * (1 - (item.discount_percentage || 0) / 100));
            return (
              <View key={item.id} style={[styles.card, !item.is_available && styles.cardDisabled]}>
                <View style={styles.cardTop}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={(CAT_ICONS[catalog?.category] || 'flask-outline') as any} size={18} color="#7C3AED" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testName}>{catalog?.name || 'Test'}</Text>
                    <Text style={styles.testCategory}>{catalog?.category || 'General'}</Text>
                  </View>
                  <Switch
                    value={item.is_available}
                    onValueChange={() => toggleAvailability(item)}
                    trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                    thumbColor={item.is_available ? '#7C3AED' : '#9CA3AF'}
                  />
                </View>

                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Price</Text>
                    <Text style={styles.metaValue}>Rs. {discounted}</Text>
                    {item.discount_percentage > 0 && (
                      <Text style={styles.metaStrike}>Rs. {item.price}</Text>
                    )}
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Discount</Text>
                    <Text style={styles.metaValue}>{item.discount_percentage || 0}%</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Report</Text>
                    <Text style={styles.metaValue}>{item.report_time}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Home</Text>
                    <Ionicons
                      name={item.home_collection ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={item.home_collection ? '#059669' : '#DC2626'}
                    />
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={14} color="#7C3AED" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
                    <Ionicons name="trash-outline" size={14} color="#DC2626" />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Test Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCatalogTest ? 'Configure Test' : 'Select a Test'}</Text>
              <TouchableOpacity onPress={() => { setAddModal(false); setSelectedCatalogTest(null); }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {!selectedCatalogTest ? (
              <ScrollView style={{ maxHeight: 400 }}>
                {availableCatalog.map((ct) => (
                  <TouchableOpacity key={ct.id} style={styles.catalogItem} onPress={() => openAddModal(ct)}>
                    <View style={styles.catalogIcon}>
                      <Ionicons name={(CAT_ICONS[ct.category] || 'flask-outline') as any} size={16} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catalogName}>{ct.name}</Text>
                      <Text style={styles.catalogCategory}>{ct.category}</Text>
                    </View>
                    <Text style={styles.catalogPrice}>Rs. {ct.price}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
                {availableCatalog.length === 0 && (
                  <Text style={styles.noCatalog}>All tests have been added to your center.</Text>
                )}
              </ScrollView>
            ) : (
              <ScrollView>
                <Text style={styles.configTestName}>{selectedCatalogTest.name}</Text>
                <Text style={styles.configTestCat}>{selectedCatalogTest.category}</Text>

                <Text style={styles.fieldLabel}>Price (Rs.)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                  placeholder="Enter price"
                />

                <Text style={styles.fieldLabel}>Discount (%)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newDiscount}
                  onChangeText={setNewDiscount}
                  keyboardType="numeric"
                  placeholder="0"
                />

                <Text style={styles.fieldLabel}>Report Time</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newReportTime}
                  onChangeText={setNewReportTime}
                  placeholder="e.g., 24 hours"
                />

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Home Collection Available</Text>
                  <Switch
                    value={newHomeCollection}
                    onValueChange={setNewHomeCollection}
                    trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                    thumbColor={newHomeCollection ? '#7C3AED' : '#9CA3AF'}
                  />
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Add Test</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Test Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Test</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.configTestName}>{editItem?.catalogName}</Text>

            <Text style={styles.fieldLabel}>Price (Rs.)</Text>
            <TextInput
              style={styles.fieldInput}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Discount (%)</Text>
            <TextInput
              style={styles.fieldInput}
              value={editDiscount}
              onChangeText={setEditDiscount}
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Report Time</Text>
            <TextInput
              style={styles.fieldInput}
              value={editReportTime}
              onChangeText={setEditReportTime}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Home Collection</Text>
              <Switch
                value={editHomeCollection}
                onValueChange={setEditHomeCollection}
                trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                thumbColor={editHomeCollection ? '#7C3AED' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Available to Patients</Text>
              <Switch
                value={editAvailable}
                onValueChange={setEditAvailable}
                trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
                thumbColor={editAvailable ? '#7C3AED' : '#9CA3AF'}
              />
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdate} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 12, color: '#64748B', paddingHorizontal: 20, marginBottom: 12 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#7C3AED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardDisabled: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center',
  },
  testName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  testCategory: { fontSize: 11, color: '#7C3AED', fontWeight: '600', marginTop: 1 },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, marginBottom: 10,
  },
  metaItem: { alignItems: 'center', gap: 2 },
  metaLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  metaStrike: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },
  cardActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#F5F3FF', borderRadius: 8, paddingVertical: 8,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },
  removeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#FEF2F2', borderRadius: 8, paddingVertical: 8,
  },
  removeBtnText: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  catalogItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  catalogIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center',
  },
  catalogName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  catalogCategory: { fontSize: 11, color: '#64748B', marginTop: 1 },
  catalogPrice: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },
  noCatalog: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, paddingVertical: 20 },
  configTestName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  configTestCat: { fontSize: 12, color: '#7C3AED', fontWeight: '600', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  fieldInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#1E293B', backgroundColor: '#F9FAFB',
  },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingVertical: 4,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  confirmBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
