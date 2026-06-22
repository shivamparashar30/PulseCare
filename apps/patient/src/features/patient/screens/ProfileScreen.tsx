import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { ProfileStackParamList } from '../../../../../../packages/core/src/types';
import { useAuth } from '../../../../../../packages/providers/src/AuthProvider';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

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
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [stats, setStats] = useState({ appointments: 0, labTests: 0, orders: 0 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const uid = session.user.id;

    const [appts, labs, ords, profileRes] = await Promise.all([
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('patient_id', uid),
      supabase.from('lab_bookings').select('id', { count: 'exact', head: true }).eq('patient_id', uid),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('patient_id', uid),
      supabase.from('profiles').select('avatar_url').eq('id', uid).single(),
    ]);
    setStats({
      appointments: appts.count ?? 0,
      labTests: labs.count ?? 0,
      orders: ords.count ?? 0,
    });
    if (profileRes.data?.avatar_url) setAvatarUrl(profileRes.data.avatar_url);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Reload when coming back from EditProfile (avatar may have changed)
  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'GU';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.avatarRing}>
              {avatarUrl && !avatarUrl.includes('randomuser.me') ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName} numberOfLines={1}>{user?.name || 'Guest User'}</Text>
              {user?.email && (
                <View style={styles.heroDetailRow}>
                  <Ionicons name="mail-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroDetail}>{user.email}</Text>
                </View>
              )}
              {user?.phone && (
                <View style={styles.heroDetailRow}>
                  <Ionicons name="call-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroDetail}>{user.phone}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={14} color="#fff" />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          {[
            { label: 'Appointments', value: String(stats.appointments), icon: 'calendar', color: '#7c3aed' },
            { label: 'Lab Tests', value: String(stats.labTests), icon: 'flask', color: '#0891b2' },
            { label: 'Orders', value: String(stats.orders), icon: 'bag-handle', color: '#059669' },
          ].map(({ label, value, icon, color }, index) => (
            <React.Fragment key={label}>
              {index > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.statItem}>
                <View style={[styles.statIconCircle, { backgroundColor: color + '15' }]}>
                  <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.darkModeCard, { backgroundColor: colors.card }]}>
          <View style={styles.darkModeLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: isDarkMode ? '#312e81' : '#1e293b15' }]}>
              <Ionicons name={isDarkMode ? 'moon' : 'moon-outline'} size={18} color={isDarkMode ? '#a5b4fc' : '#1e293b'} />
            </View>
            <View>
              <Text style={[styles.darkModeTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.darkModeSub, { color: colors.textTertiary }]}>
                {isDarkMode ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{section.title}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    i < section.items.length - 1 && [styles.menuItemBorder, { borderBottomColor: colors.border }],
                  ]}
                  onPress={() => {
                    if (item.label === 'My Appointments') {
                      navigation.getParent()?.navigate('Appointments');
                    } else if (item.route) {
                      navigation.navigate(item.route as any);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + '12' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.card }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textTertiary }]}>HealthCare+ v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    marginBottom: SPACING.base,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    padding: 3,
  },
  avatarImg: {
    flex: 1,
    borderRadius: 32,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  heroInfo: { flex: 1 },
  heroName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  heroDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  heroDetail: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.75)',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  editProfileBtnText: {
    fontSize: FONT_SIZES.xs,
    color: '#fff',
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: -SPACING.base,
    padding: SPACING.base,
    ...SHADOWS.md,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '500' },
  darkModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  darkModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  darkModeTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  darkModeSub: {
    fontSize: 10,
    marginTop: 1,
  },
  menuSection: { marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: 14,
    gap: SPACING.md,
  },
  menuItemBorder: { borderBottomWidth: 1 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.base,
    marginTop: SPACING['2xl'],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: { fontSize: FONT_SIZES.md, color: COLORS.error, fontWeight: '600' },
  version: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.base,
    marginBottom: SPACING.lg,
  },
});
