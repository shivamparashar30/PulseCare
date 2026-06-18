import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props { profile: any; }

const GREEN = '#059669';
const CATEGORIES = ['All', 'Tablets', 'Capsules', 'Syrups', 'Injections', 'Drops', 'Ointments', 'Vitamins', 'Ayurvedic'];

export default function StoreMedicinesTab({ profile }: Props) {
  const [tab, setTab] = useState<'inventory' | 'catalog'>('inventory');

  // Inventory state
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editMed, setEditMed] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  // Catalog state
  const [catalog, setCatalog] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCat, setCatalogCat] = useState('All');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Add from catalog modal
  const [addModal, setAddModal] = useState(false);
  const [addItem, setAddItem] = useState<any>(null);
  const [addPrice, setAddPrice] = useState('');
  const [addStock, setAddStock] = useState('100');
  const [addDiscount, setAddDiscount] = useState('0');

  // Load store inventory
  const loadInventory = useCallback(async () => {
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .eq('store_id', profile.id)
      .order('name');
    if (data) {
      setMedicines(data);
      setAddedIds(new Set(data.map((m: any) => m.name.toLowerCase())));
    }
    setLoading(false);
  }, [profile.id]);

  // Load catalog
  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    const { data } = await supabase
      .from('medicine_catalog')
      .select('*')
      .order('name');
    if (data) setCatalog(data);
    setCatalogLoading(false);
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  useEffect(() => {
    if (tab === 'catalog' && catalog.length === 0) loadCatalog();
  }, [tab, catalog.length, loadCatalog]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === 'inventory') await loadInventory();
    else await loadCatalog();
    setRefreshing(false);
  };

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    let list = medicines;
    if (selectedCat !== 'All') list = list.filter((m) => m.category === selectedCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.manufacturer || '').toLowerCase().includes(q));
    }
    return list;
  }, [medicines, selectedCat, query]);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    let list = catalog;
    if (catalogCat !== 'All') list = list.filter((m) => m.category === catalogCat);
    if (catalogQuery.trim()) {
      const q = catalogQuery.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q));
    }
    return list;
  }, [catalog, catalogCat, catalogQuery]);

  // Add catalog item to store
  const handleAddFromCatalog = async () => {
    if (!addItem || !addPrice) {
      Alert.alert('Error', 'Please set a price');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('medicines').insert({
      name: addItem.name,
      manufacturer: addItem.manufacturer,
      category: addItem.category,
      description: addItem.description,
      dosage_form: addItem.dosage_form,
      strength: addItem.strength,
      pack_size: addItem.pack_size,
      price: Number(addPrice),
      discount_percentage: Number(addDiscount) || 0,
      stock_quantity: Number(addStock) || 100,
      requires_prescription: addItem.requires_prescription,
      uses: addItem.uses,
      side_effects: addItem.side_effects,
      image: addItem.image,
      store_id: profile.id,
      approval_status: 'approved',
      in_stock: true,
    });
    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Added!', `${addItem.name} added to your inventory`);
      setAddModal(false);
      setAddItem(null);
      loadInventory();
    }
  };

  // Update existing medicine price/stock
  const handleUpdate = async () => {
    if (!editMed) return;
    setSaving(true);
    await supabase.from('medicines').update({
      price: Number(editPrice),
      stock_quantity: Number(editStock),
      discount_percentage: Number(editDiscount) || 0,
    }).eq('id', editMed.id);
    setSaving(false);
    setEditModal(false);
    loadInventory();
  };

  const toggleInStock = async (med: any) => {
    await supabase.from('medicines').update({ in_stock: !med.in_stock }).eq('id', med.id);
    loadInventory();
  };

  const removeMedicine = (med: any) => {
    Alert.alert('Remove Medicine', `Remove ${med.name} from your inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await supabase.from('medicines').delete().eq('id', med.id);
          loadInventory();
        },
      },
    ]);
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={GREEN} /></View>;
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Inventory</Text>
        <Text style={s.countBadge}>{medicines.length} items</Text>
      </View>

      {/* Tab Switch */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'inventory' && s.tabBtnActive]}
          onPress={() => setTab('inventory')}
        >
          <Ionicons name="cube-outline" size={16} color={tab === 'inventory' ? '#fff' : '#64748B'} />
          <Text style={[s.tabBtnText, tab === 'inventory' && s.tabBtnTextActive]}>My Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'catalog' && s.tabBtnActive]}
          onPress={() => setTab('catalog')}
        >
          <Ionicons name="search-outline" size={16} color={tab === 'catalog' ? '#fff' : '#64748B'} />
          <Text style={[s.tabBtnText, tab === 'catalog' && s.tabBtnTextActive]}>Browse Catalog</Text>
        </TouchableOpacity>
      </View>

      {/* ====== INVENTORY VIEW ====== */}
      {tab === 'inventory' && (
        <>
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput style={s.searchInput} placeholder="Search your medicines..." placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} />
            {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} style={[s.catChip, selectedCat === cat && s.catChipActive]} onPress={() => setSelectedCat(cat)}>
                <Text style={[s.catText, selectedCat === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredInventory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}
            ListEmptyComponent={
              <View style={s.emptyBox}>
                <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                <Text style={s.emptyTitle}>No medicines in inventory</Text>
                <Text style={s.emptySubtitle}>Tap "Browse Catalog" to add medicines</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={() => setTab('catalog')}>
                  <Text style={s.emptyBtnText}>Browse Catalog</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={s.invCard}>
                <View style={s.invTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.invName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.invMfr}>{item.manufacturer} · {item.category}</Text>
                  </View>
                  <Switch
                    value={item.in_stock}
                    onValueChange={() => toggleInStock(item)}
                    trackColor={{ true: '#A7F3D0', false: '#E5E7EB' }}
                    thumbColor={item.in_stock ? GREEN : '#9CA3AF'}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
                <View style={s.invBottom}>
                  <View>
                    <Text style={s.invPrice}>Rs. {item.price}</Text>
                    {item.discount_percentage > 0 && <Text style={s.invDisc}>{item.discount_percentage}% off</Text>}
                  </View>
                  <Text style={s.invStock}>Stock: {item.stock_quantity || 0}</Text>
                  <View style={s.invActions}>
                    <TouchableOpacity
                      style={s.editBtn}
                      onPress={() => {
                        setEditMed(item);
                        setEditPrice(String(item.price));
                        setEditStock(String(item.stock_quantity || 0));
                        setEditDiscount(String(item.discount_percentage || 0));
                        setEditModal(true);
                      }}
                    >
                      <Ionicons name="create-outline" size={16} color={GREEN} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.removeBtn} onPress={() => removeMedicine(item)}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* ====== CATALOG VIEW ====== */}
      {tab === 'catalog' && (
        <>
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput style={s.searchInput} placeholder="Search medicines catalog..." placeholderTextColor="#9CA3AF" value={catalogQuery} onChangeText={setCatalogQuery} />
            {catalogQuery.length > 0 && <TouchableOpacity onPress={() => setCatalogQuery('')}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} style={[s.catChip, catalogCat === cat && s.catChipActive]} onPress={() => setCatalogCat(cat)}>
                <Text style={[s.catText, catalogCat === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.catalogHint}>{filteredCatalog.length} medicines available · Tap + to add to your store</Text>

          {catalogLoading ? (
            <View style={s.center}><ActivityIndicator size="large" color={GREEN} /></View>
          ) : (
            <FlatList
              data={filteredCatalog}
              keyExtractor={(item) => item.id}
              contentContainerStyle={s.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}
              ListEmptyComponent={
                <View style={s.emptyBox}>
                  <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
                  <Text style={s.emptyTitle}>No medicines found</Text>
                </View>
              }
              renderItem={({ item }) => {
                const alreadyAdded = addedIds.has(item.name.toLowerCase());
                return (
                  <View style={[s.catCard, alreadyAdded && { opacity: 0.6 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.catCardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.catCardMfr}>{item.manufacturer} · {item.category}</Text>
                      <View style={s.catCardMeta}>
                        <Text style={s.catCardStrength}>{item.strength} · {item.pack_size}</Text>
                        <Text style={s.catCardMrp}>MRP Rs. {item.mrp}</Text>
                      </View>
                      {item.requires_prescription && (
                        <View style={s.rxBadge}>
                          <Ionicons name="document-text" size={10} color="#D97706" />
                          <Text style={s.rxText}>Rx Required</Text>
                        </View>
                      )}
                    </View>
                    {alreadyAdded ? (
                      <View style={s.addedBadge}>
                        <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                        <Text style={s.addedText}>Added</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={s.addCatalogBtn}
                        onPress={() => {
                          setAddItem(item);
                          setAddPrice(String(item.mrp));
                          setAddStock('100');
                          setAddDiscount('0');
                          setAddModal(true);
                        }}
                      >
                        <Ionicons name="add-circle" size={28} color={GREEN} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* ====== ADD FROM CATALOG MODAL ====== */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Add to Store</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {addItem && (
              <>
                <Text style={s.modalMedName}>{addItem.name}</Text>
                <Text style={s.modalMedInfo}>{addItem.manufacturer} · {addItem.strength} · {addItem.pack_size}</Text>
                <Text style={s.modalMrp}>MRP: Rs. {addItem.mrp}</Text>

                <View style={s.modalDivider} />

                <Text style={s.fieldLabel}>Your Selling Price (Rs.) *</Text>
                <TextInput style={s.fieldInput} value={addPrice} onChangeText={setAddPrice} keyboardType="numeric" placeholder="Enter price" placeholderTextColor="#9CA3AF" />

                <Text style={s.fieldLabel}>Discount %</Text>
                <TextInput style={s.fieldInput} value={addDiscount} onChangeText={setAddDiscount} keyboardType="numeric" placeholder="0" placeholderTextColor="#9CA3AF" />

                <Text style={s.fieldLabel}>Stock Quantity</Text>
                <TextInput style={s.fieldInput} value={addStock} onChangeText={setAddStock} keyboardType="numeric" placeholder="100" placeholderTextColor="#9CA3AF" />

                <TouchableOpacity style={s.modalSubmitBtn} onPress={handleAddFromCatalog} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="add-circle-outline" size={18} color="#fff" />
                      <Text style={s.modalSubmitText}>Add to Inventory</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ====== EDIT PRICE/STOCK MODAL ====== */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>Edit Medicine</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {editMed && (
              <>
                <Text style={s.modalMedName}>{editMed.name}</Text>
                <Text style={s.modalMedInfo}>{editMed.manufacturer}</Text>

                <View style={s.modalDivider} />

                <Text style={s.fieldLabel}>Price (Rs.)</Text>
                <TextInput style={s.fieldInput} value={editPrice} onChangeText={setEditPrice} keyboardType="numeric" />

                <Text style={s.fieldLabel}>Discount %</Text>
                <TextInput style={s.fieldInput} value={editDiscount} onChangeText={setEditDiscount} keyboardType="numeric" />

                <Text style={s.fieldLabel}>Stock Quantity</Text>
                <TextInput style={s.fieldInput} value={editStock} onChangeText={setEditStock} keyboardType="numeric" />

                <TouchableOpacity style={s.modalSubmitBtn} onPress={handleUpdate} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.modalSubmitText}>Update</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  countBadge: { fontSize: 12, fontWeight: '600', color: GREEN, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },

  // Tab switch
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 3 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: GREEN },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: '#fff' },

  // Search
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },

  // Categories
  catRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  catText: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  catalogHint: { fontSize: 11, color: '#9CA3AF', paddingHorizontal: 16, marginBottom: 8 },

  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 30 },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#64748B', marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  emptyBtn: { backgroundColor: GREEN, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Inventory card
  invCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  invTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  invName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  invMfr: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  invBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invPrice: { fontSize: 15, fontWeight: '800', color: GREEN },
  invDisc: { fontSize: 10, color: '#F59E0B', fontWeight: '600' },
  invStock: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  invActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  removeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },

  // Catalog card
  catCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  catCardName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  catCardMfr: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  catCardMeta: { flexDirection: 'row', gap: 8, marginTop: 4 },
  catCardStrength: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  catCardMrp: { fontSize: 11, color: GREEN, fontWeight: '700' },
  rxBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  rxText: { fontSize: 9, color: '#D97706', fontWeight: '600' },
  addedBadge: { alignItems: 'center', gap: 2 },
  addedText: { fontSize: 10, color: GREEN, fontWeight: '600' },
  addCatalogBtn: { padding: 4 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalMedName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  modalMedInfo: { fontSize: 12, color: '#64748B', marginTop: 2 },
  modalMrp: { fontSize: 13, color: GREEN, fontWeight: '700', marginTop: 6 },
  modalDivider: { height: 1, backgroundColor: '#F0F4F8', marginVertical: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 16, fontWeight: '600', backgroundColor: '#F9FAFB', color: '#1F2937' },
  modalSubmitBtn: { backgroundColor: GREEN, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  modalSubmitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
