import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

const RELATIONSHIPS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: string;
  gender: string;
  blood_group: string;
  phone: string;
}

const EMPTY_MEMBER: Omit<FamilyMember, 'id'> = {
  name: '', relationship: 'Spouse', age: '', gender: 'Male', blood_group: '', phone: '',
};

export default function FamilyMembersScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_MEMBER);
  const [saving, setSaving] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (e: any) {
      console.error('Failed to load family members:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_MEMBER);
    setModalVisible(true);
  };

  const openEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      relationship: member.relationship,
      age: member.age ? String(member.age) : '',
      gender: member.gender || 'Male',
      blood_group: member.blood_group || '',
      phone: member.phone || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    if (!form.relationship) {
      Alert.alert('Error', 'Please select a relationship.');
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const payload = {
        user_id: session.user.id,
        name: form.name.trim(),
        relationship: form.relationship,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        blood_group: form.blood_group || null,
        phone: form.phone.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('family_members')
          .update(payload)
          .eq('id', editingId)
          .eq('user_id', session.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('family_members')
          .insert(payload);
        if (error) throw error;
      }

      setModalVisible(false);
      loadMembers();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (member: FamilyMember) => {
    Alert.alert('Delete Member', `Remove ${member.name} from family members?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            await supabase
              .from('family_members')
              .delete()
              .eq('id', member.id)
              .eq('user_id', session.user.id);
            loadMembers();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete.');
          }
        },
      },
    ]);
  };

  const relationIcon = (r: string) => {
    const map: Record<string, string> = {
      Spouse: 'heart', Child: 'happy', Parent: 'people', Sibling: 'person',
      Grandparent: 'flower', Other: 'person-add',
    };
    return (map[r] || 'person') as any;
  };

  const relationColor = (r: string) => {
    const map: Record<string, string> = {
      Spouse: '#dc2626', Child: '#7c3aed', Parent: '#0066CC', Sibling: '#0891b2',
      Grandparent: '#d97706', Other: '#475569',
    };
    return map[r] || '#0066CC';
  };

  const renderMember = ({ item }: { item: FamilyMember }) => {
    const rc = relationColor(item.relationship);
    return (
      <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.memberIcon, { backgroundColor: rc + '15' }]}>
          <Ionicons name={relationIcon(item.relationship)} size={22} color={rc} />
        </View>
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.memberRelation, { color: rc }]}>{item.relationship}</Text>
          <View style={styles.memberDetails}>
            {item.age ? <Text style={[styles.detailText, { color: colors.textTertiary }]}>{item.age} yrs</Text> : null}
            {item.gender ? <Text style={[styles.detailText, { color: colors.textTertiary }]}>{item.gender}</Text> : null}
            {item.blood_group ? <Text style={[styles.detailText, { color: colors.textTertiary }]}>{item.blood_group}</Text> : null}
          </View>
        </View>
        <View style={styles.memberActions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, { backgroundColor: COLORS.primary + '12' }]}>
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionBtn, { backgroundColor: '#dc262612' }]}>
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const update = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Family Members" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={i => i.id}
          renderItem={renderMember}
          contentContainerStyle={[styles.list, members.length === 0 && { flex: 1, justifyContent: 'center' }]}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMembers(); }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: SPACING.xl }}>
              <View style={[styles.emptyIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="people-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Family Members</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Add your family members to easily book appointments for them.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingId ? 'Edit Family Member' : 'Add Family Member'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              {/* Name */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                value={form.name}
                onChangeText={v => update('name', v)}
                placeholder="Enter name"
                placeholderTextColor={colors.textTertiary}
              />

              {/* Relationship */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Relationship *</Text>
              <View style={styles.chipRow}>
                {RELATIONSHIPS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.background },
                      form.relationship === r && { borderColor: relationColor(r), backgroundColor: relationColor(r) + '15' }]}
                    onPress={() => update('relationship', r)}
                  >
                    <Text style={[styles.chipText, { color: form.relationship === r ? relationColor(r) : colors.textSecondary }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gender */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <View style={styles.chipRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.background },
                      form.gender === g && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' }]}
                    onPress={() => update('gender', g)}
                  >
                    <Text style={[styles.chipText, { color: form.gender === g ? COLORS.primary : colors.textSecondary }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Age + Phone row */}
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Age</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                    value={form.age}
                    onChangeText={v => update('age', v)}
                    placeholder="Age"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                    value={form.phone}
                    onChangeText={v => update('phone', v)}
                    placeholder="Phone"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Blood Group */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Blood Group</Text>
              <View style={styles.chipRow}>
                {BLOOD_GROUPS.map(bg => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.chipSmall, { borderColor: colors.border, backgroundColor: colors.background },
                      form.blood_group === bg && { borderColor: '#dc2626', backgroundColor: '#dc262615' }]}
                    onPress={() => update('blood_group', form.blood_group === bg ? '' : bg)}
                  >
                    <Text style={[styles.chipText, { color: form.blood_group === bg ? '#dc2626' : colors.textSecondary }]}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{editingId ? 'Update Member' : 'Add Member'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: SPACING.md, paddingBottom: 100 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  memberIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 2 },
  memberRelation: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: 4 },
  memberDetails: { flexDirection: 'row', gap: SPACING.sm },
  detailText: { fontSize: FONT_SIZES.xs },
  memberActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.sm },
  emptySub: { fontSize: FONT_SIZES.sm, textAlign: 'center', lineHeight: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.md },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONT_SIZES.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
  },
  chipSmall: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
  },
  chipText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
});
