import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { ProfileStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

const MENU_SECTIONS = [
  {
    title: 'My Health',
    items: [
      { icon: 'document-text-outline', label: 'Health Records', route: 'HealthRecords', color: '#0066CC' },
      { icon: 'calendar-outline', label: 'My Appointments', route: null, color: '#7c3aed' },
      { icon: 'flask-outline', label: 'Lab Reports', route: null, color: '#0891b2' },
      { icon: 'medical-outline', label: 'My Prescriptions', route: null, color: '#059669' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', route: 'EditProfile', color: '#0066CC' },
      { icon: 'location-outline', label: 'Saved Addresses', route: null, color: '#dc2626' },
      { icon: 'people-outline', label: 'Family Members', route: null, color: '#7c3aed' },
      { icon: 'notifications-outline', label: 'Notification Settings', route: null, color: '#d97706' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: 'HelpCenter', color: '#0066CC' },
      { icon: 'shield-outline', label: 'Privacy Policy', route: 'PrivacyPolicy', color: '#475569' },
      { icon: 'document-outline', label: 'Terms of Service', route: null, color: '#475569' },
      { icon: 'star-outline', label: 'Rate the App', route: null, color: '#d97706' },
    ],
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile hero */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.hero}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={styles.heroName}>{user?.name}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          <Text style={styles.heroPhone}>{user?.phone}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Appointments', value: '3', icon: 'calendar-outline' },
            { label: 'Lab Tests', value: '2', icon: 'flask-outline' },
            { label: 'Orders', value: '5', icon: 'bag-outline' },
          ].map(({ label, value, icon }) => (
            <View key={label} style={styles.statItem}>
              <Ionicons name={icon as any} size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Family members */}
        {user?.familyMembers && user.familyMembers.length > 0 && (
          <View style={styles.familyCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Family Members</Text>
              <TouchableOpacity>
                <Text style={styles.addText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                {user.familyMembers.map((member, i) => (
                  <TouchableOpacity key={i} style={styles.familyMember}>
                    <View style={styles.familyAvatar}>
                      <Text style={styles.familyAvatarText}>{member.name[0]}</Text>
                    </View>
                    <Text style={styles.familyName} numberOfLines={1}>{member.name.split(' ')[0]}</Text>
                    <Text style={styles.familyRelation}>{member.relation}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Dark mode toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#1e293b' }]}>
              <Ionicons name="moon-outline" size={18} color="#fff" />
            </View>
            <Text style={styles.menuLabel}>Dark Mode</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, isDarkMode && styles.toggleOn]}
            onPress={toggleTheme}
          >
            <View style={[styles.toggleThumb, isDarkMode && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => {
                    if (item.route) navigation.navigate(item.route as any);
                  }}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>HealthCare+ v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.xs,
    paddingBottom: SPACING.xl + 8,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#fff' },
  heroEmail: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)' },
  heroPhone: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginTop: SPACING.sm,
  },
  editBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: -SPACING.md,
    ...SHADOWS.md,
    padding: SPACING.md,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  familyCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  addText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '700' },
  familyMember: { alignItems: 'center', width: 70, gap: 4 },
  familyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyAvatarText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.md },
  familyName: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  familyRelation: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    ...SHADOWS.sm,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: COLORS.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  menuSection: { marginTop: SPACING.sm },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    margin: SPACING.md,
    backgroundColor: '#fee2e2',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  logoutText: { fontSize: FONT_SIZES.md, color: COLORS.error, fontWeight: '700' },
  version: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
});
