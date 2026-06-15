import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../../../packages/providers/src/AuthProvider';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { Card, SectionHeader, StarRating, PriceDisplay, DiscountBadge, Badge } from '../../../../../../packages/shared/src/components';
import { getTopDoctors } from '../../doctor/services/doctorData';
import { getPopularMedicines } from '../../medicalStore/services/medicineData';
import { MEDICAL_STORES, HEALTH_PACKAGES, BANNERS, LAB_TESTS } from '../../../../../../packages/core/src/api/mockData';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - SPACING.base * 2;

const CATEGORIES = [
  { id: 'c1', name: 'Doctors', icon: 'medkit', color: COLORS.primary, route: 'Doctors' },
  { id: 'c2', name: 'Lab Tests', icon: 'flask', color: COLORS.accent, route: 'LabTests' },
  { id: 'c3', name: 'Pharmacy', icon: 'medical', color: '#7B1FA2', route: 'Pharmacy' },
  { id: 'c4', name: 'CT Scan', icon: 'body', color: '#E65100', route: 'LabTests' },
  { id: 'c5', name: 'MRI', icon: 'scan', color: '#1565C0', route: 'LabTests' },
  { id: 'c6', name: 'Blood Test', icon: 'water', color: '#B71C1C', route: 'LabTests' },
  { id: 'c7', name: 'X-Ray', icon: 'radio', color: '#37474F', route: 'LabTests' },
  { id: 'c8', name: 'ECG', icon: 'pulse', color: '#1B5E20', route: 'LabTests' },
  { id: 'c9', name: 'Vaccination', icon: 'shield-checkmark', color: '#4A148C', route: 'Doctors' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  const topDoctors = getTopDoctors();
  const popularMedicines = getPopularMedicines();
  const popularLabTests = LAB_TESTS.filter((t) => t.isPopular).slice(0, 6);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const navigateToTab = (tabName: string, params?: any) => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(tabName, params);
    } else {
      navigation.navigate(tabName, params);
    }
  };

  const handleCategoryPress = (cat: typeof CATEGORIES[number]) => {
    if (cat.route === 'Doctors') {
      navigateToTab('Doctors');
    } else if (cat.route === 'Pharmacy') {
      navigateToTab('Pharmacy');
    } else {
      navigation.navigate('LabTests');
    }
  };

  const handleBannerPress = (banner: typeof BANNERS[number]) => {
    if (banner.image === 'doctor') navigateToTab('Doctors');
    else if (banner.image === 'medicine') navigateToTab('Pharmacy');
    else if (banner.image === 'lab') navigation.navigate('LabTests');
    else if (banner.image === 'checkup') navigation.navigate('HealthPackages');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ backgroundColor: COLORS.primary }} edges={['top']} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        {/* Top Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.topHeader}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => navigation.navigate('Search')}
              >
                <Ionicons name="search-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                <View style={styles.notifBadge} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.9}
          >
            <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search doctors, medicines, tests...</Text>
            <View style={styles.searchFilter}>
              <Ionicons name="options-outline" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {/* Health Banners */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH))}
            scrollEventThrottle={16}
            style={styles.bannerScroll}
          >
            {BANNERS.map((banner) => (
              <LinearGradient
                key={banner.id}
                colors={[banner.color, banner.color + 'CC']}
                style={styles.bannerCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  <TouchableOpacity
                    style={styles.bannerBtn}
                    activeOpacity={0.8}
                    onPress={() => handleBannerPress(banner)}
                  >
                    <Text style={styles.bannerBtnText}>{banner.actionText} →</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.bannerIconContainer}>
                  <Ionicons
                    name={banner.image === 'doctor' ? 'medical' : banner.image === 'medicine' ? 'medkit' : banner.image === 'lab' ? 'flask' : 'clipboard'}
                    size={60}
                    color="rgba(255,255,255,0.25)"
                  />
                </View>
              </LinearGradient>
            ))}
          </ScrollView>

          {/* Banner Dots */}
          <View style={styles.dotsContainer}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i === activeBanner ? COLORS.primary : COLORS.textTertiary }]}
              />
            ))}
          </View>

          {/* Categories */}
          <SectionHeader title="Services" />
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(cat)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={[styles.categoryName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top Doctors */}
          <View style={{ marginTop: SPACING.base }}>
            <SectionHeader
              title="Top Doctors"
              onSeeAll={() => navigateToTab('Doctors')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topDoctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={styles.doctorCard}
                  onPress={() => navigateToTab('Doctors', {
                    screen: 'DoctorDetail',
                    params: { doctorId: doctor.id },
                  })}
                >
                  <View style={[styles.doctorCardInner, { backgroundColor: colors.card }]}>
                    <Image source={{ uri: doctor.avatar }} style={styles.doctorAvatar} />
                    <View style={[styles.availBadge, { backgroundColor: doctor.isAvailable ? COLORS.successLight : COLORS.warningLight }]}>
                      <Text style={{ fontSize: 10, color: doctor.isAvailable ? COLORS.success : COLORS.warning, fontWeight: '600' }}>
                        {doctor.isAvailable ? 'Available' : doctor.nextAvailable}
                      </Text>
                    </View>
                    <Text style={[styles.doctorName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {doctor.name}
                    </Text>
                    <Text style={styles.doctorSpec} numberOfLines={1}>{doctor.specialization}</Text>
                    <StarRating rating={doctor.rating} size={12} />
                    <Text style={styles.doctorFees}>₹{doctor.fees} consult</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Popular Lab Tests */}
          <View style={{ marginTop: SPACING.base }}>
            <SectionHeader
              title="Popular Lab Tests"
              onSeeAll={() => navigation.navigate('LabTests')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularLabTests.map((test, index) => {
                const accentColors = [
                  { bg: '#EEF2FF', border: '#C7D2FE', icon: '#6366F1', text: '#4338CA' },
                  { bg: '#FFF1F2', border: '#FECDD3', icon: '#F43F5E', text: '#BE123C' },
                  { bg: '#ECFDF5', border: '#A7F3D0', icon: '#10B981', text: '#047857' },
                  { bg: '#FFF7ED', border: '#FED7AA', icon: '#F97316', text: '#C2410C' },
                  { bg: '#F0F9FF', border: '#BAE6FD', icon: '#0EA5E9', text: '#0369A1' },
                  { bg: '#FAF5FF', border: '#E9D5FF', icon: '#A855F7', text: '#7E22CE' },
                ];
                const accent = accentColors[index % accentColors.length];
                return (
                  <TouchableOpacity
                    key={test.id}
                    style={[styles.labCard, { backgroundColor: colors.card }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('LabTestDetail', { testId: test.id })}
                  >
                    <View style={[styles.labIconRow]}>
                      <View style={[styles.labIconCircle, { backgroundColor: accent.bg, borderColor: accent.border }]}>
                        <Ionicons name="flask" size={18} color={accent.icon} />
                      </View>
                      {test.discountPercent > 0 && (
                        <View style={[styles.labDiscountChip, { backgroundColor: accent.bg }]}>
                          <Text style={[styles.labDiscountText, { color: accent.text }]}>{test.discountPercent}% off</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.labTestName, { color: colors.textPrimary }]} numberOfLines={2}>{test.name}</Text>
                    <Text style={[styles.labCategory, { color: colors.textTertiary }]}>{test.category}</Text>
                    <View style={styles.labBottomRow}>
                      <View>
                        <Text style={[styles.labPrice, { color: accent.text }]}>₹{test.discountedPrice || test.price}</Text>
                        {test.discountPercent > 0 && (
                          <Text style={[styles.labOrigPrice, { color: colors.textTertiary }]}>₹{test.price}</Text>
                        )}
                      </View>
                      <View style={[styles.labReportBadge, { backgroundColor: accent.bg }]}>
                        <Ionicons name="time-outline" size={10} color={accent.icon} />
                        <Text style={[styles.labReportText, { color: accent.text }]}>{test.reportTime}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.labBookBtn, { backgroundColor: accent.text }]}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('LabTestDetail', { testId: test.id })}
                    >
                      <Text style={styles.labBookBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Popular Medicines */}
          <View style={{ marginTop: SPACING.base }}>
            <SectionHeader
              title="Popular Medicines"
              onSeeAll={() => navigateToTab('Pharmacy')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularMedicines.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  style={styles.medicineCard}
                  onPress={() => navigateToTab('Pharmacy', {
                    screen: 'MedicineDetail',
                    params: { medicineId: med.id },
                  })}
                >
                  <View style={[styles.medicineImage, { backgroundColor: colors.background }]}>
                    <Ionicons name="medical" size={36} color={COLORS.primary} />
                    {med.discountPercent > 0 && (
                      <View style={styles.medDiscount}>
                        <Text style={styles.medDiscountText}>{med.discountPercent}%</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.medicineName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {med.name}
                  </Text>
                  <Text style={styles.medicineCompany} numberOfLines={1}>{med.company}</Text>
                  <PriceDisplay price={med.price} discountedPrice={med.discountedPrice} size="sm" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Nearby Medical Stores */}
          <View style={{ marginTop: SPACING.base }}>
            <SectionHeader
              title="Nearby Medical Stores"
              onSeeAll={() => navigation.navigate('MedicalStores')}
            />
            {MEDICAL_STORES.slice(0, 3).map((store) => (
              <Card key={store.id} style={styles.storeCard} onPress={() => navigation.navigate('MedicalStores')}>
                <View style={styles.storeRow}>
                  <View style={[styles.storeIconContainer, { backgroundColor: COLORS.primaryUltraLight }]}>
                    <Ionicons name="storefront-outline" size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.storeInfo}>
                    <View style={styles.storeNameRow}>
                      <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>{store.name}</Text>
                      <View style={[styles.openBadge, { backgroundColor: store.isOpen ? COLORS.successLight : COLORS.errorLight }]}>
                        <Text style={{ fontSize: 11, color: store.isOpen ? COLORS.success : COLORS.error, fontWeight: '600' }}>
                          {store.isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.storeAddress} numberOfLines={1}>{store.address}</Text>
                    <View style={styles.storeMeta}>
                      <Ionicons name="location-outline" size={13} color={COLORS.textTertiary} />
                      <Text style={styles.storeMetaText}>{store.distance}</Text>
                      <Ionicons name="star" size={13} color={COLORS.warning} style={{ marginLeft: 8 }} />
                      <Text style={styles.storeMetaText}>{store.rating}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              </Card>
            ))}
          </View>

          {/* Health Packages */}
          <View style={{ marginTop: SPACING.base, marginBottom: SPACING['2xl'] }}>
            <SectionHeader
              title="Health Packages"
              onSeeAll={() => navigation.navigate('HealthPackages')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {HEALTH_PACKAGES.slice(0, 4).map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.packageCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('HealthPackages')}
                >
                  <LinearGradient
                    colors={[COLORS.primaryUltraLight, colors.card]}
                    style={styles.packageGradient}
                  >
                    <View style={styles.packageIcon}>
                      <Ionicons name="clipboard-outline" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.packageName, { color: colors.textPrimary }]} numberOfLines={2}>
                      {pkg.name}
                    </Text>
                    <Text style={[styles.packageTests, { color: colors.textSecondary }]}>{pkg.tests.length} Tests</Text>
                    <View style={styles.packagePriceRow}>
                      <Text style={styles.packagePrice}>₹{pkg.price}</Text>
                      <Text style={[styles.packageOrigPrice, { color: colors.textTertiary }]}>₹{pkg.originalPrice}</Text>
                    </View>
                    <Badge label={`${pkg.discountPercent}% OFF`} size="sm" color={COLORS.accent} bgColor={COLORS.accentUltraLight} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING['2xl'],
    paddingTop: SPACING.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.base,
  },
  greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.md },
  userName: { color: COLORS.white, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    gap: 8,
    ...SHADOWS.md,
  },
  searchPlaceholder: { flex: 1, color: COLORS.textTertiary, fontSize: FONT_SIZES.md },
  searchFilter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: SPACING.base, marginTop: -SPACING.md },
  bannerScroll: { marginBottom: SPACING.sm },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 140,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  bannerTitle: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800', marginBottom: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZES.sm, flex: 1, marginBottom: SPACING.md },
  bannerBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  bannerIconContainer: { justifyContent: 'center' },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: SPACING.lg },
  dot: { width: 6, height: 6, borderRadius: 3 },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: SPACING.md,
    marginHorizontal: '1.5%',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  doctorCard: { marginRight: SPACING.md, width: 150 },
  doctorCardInner: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  doctorAvatar: { width: 72, height: 72, borderRadius: 36, marginBottom: SPACING.sm },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  doctorName: { fontSize: FONT_SIZES.sm, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  doctorSpec: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6, textAlign: 'center' },
  doctorFees: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  labCard: {
    width: 165,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  labIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  labIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  labDiscountChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  labDiscountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  labTestName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: 17,
  },
  labCategory: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  labBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  labPrice: {
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
  },
  labOrigPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through' as const,
    marginTop: 1,
  },
  labReportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  labReportText: {
    fontSize: 9,
    fontWeight: '600',
  },
  labBookBtn: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 9,
    alignItems: 'center',
  },
  labBookBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  medicineCard: { width: 130, marginRight: SPACING.md },
  medicineImage: {
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  medDiscount: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  medDiscountText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  medicineName: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: 2 },
  medicineCompany: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  storeCard: { marginBottom: SPACING.md, padding: SPACING.md },
  storeRow: { flexDirection: 'row', alignItems: 'center' },
  storeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  storeInfo: { flex: 1 },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  storeName: { fontSize: FONT_SIZES.md, fontWeight: '700', flex: 1 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  storeAddress: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: 4 },
  storeMeta: { flexDirection: 'row', alignItems: 'center' },
  storeMetaText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginLeft: 3 },
  packageCard: { width: 170, marginRight: SPACING.md, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOWS.md },
  packageGradient: { padding: SPACING.md },
  packageIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  packageName: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginBottom: 4 },
  packageTests: { fontSize: 11, marginBottom: 6 },
  packagePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  packagePrice: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.primary },
  packageOrigPrice: { fontSize: FONT_SIZES.sm, textDecorationLine: 'line-through' as const },
});
