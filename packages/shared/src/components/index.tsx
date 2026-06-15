import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../providers/src/ThemeProvider';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../core/src/constants';

// ============================================
// HEADER COMPONENT
// ============================================

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightComponent, subtitle }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent && <View style={styles.headerRight}>{rightComponent}</View>}
    </View>
  );
};

// ============================================
// PRIMARY BUTTON
// ============================================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading,
  disabled,
  icon,
  fullWidth = true,
  style,
  textStyle,
  size = 'md',
}) => {
  const { isDarkMode } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = { borderRadius: BORDER_RADIUS.md };
    switch (variant) {
      case 'primary': return { ...base, backgroundColor: disabled ? COLORS.textTertiary : COLORS.primary };
      case 'secondary': return { ...base, backgroundColor: disabled ? '#E0E0E0' : COLORS.accent };
      case 'outline': return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary };
      case 'ghost': return { ...base, backgroundColor: COLORS.primaryUltraLight };
      case 'danger': return { ...base, backgroundColor: COLORS.error };
      default: return base;
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'ghost') return COLORS.primary;
    return COLORS.white;
  };

  const getPadding = () => {
    if (size === 'sm') return { paddingVertical: 8, paddingHorizontal: 16 };
    if (size === 'lg') return { paddingVertical: 18, paddingHorizontal: 32 };
    return { paddingVertical: 14, paddingHorizontal: 24 };
  };

  const getFontSize = () => {
    if (size === 'sm') return FONT_SIZES.sm;
    if (size === 'lg') return FONT_SIZES.lg;
    return FONT_SIZES.base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        getButtonStyle(),
        getPadding(),
        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        fullWidth && { width: '100%' },
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <Ionicons name={icon as any} size={20} color={getTextColor()} style={{ marginRight: 8 }} />
          )}
          <Text style={[{ color: getTextColor(), fontSize: getFontSize(), fontWeight: '600' }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// INPUT COMPONENT
// ============================================

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline,
  numberOfLines,
  editable = true,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[{ marginBottom: SPACING.md }, style]}>
      {label && (
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderColor: error ? COLORS.error : colors.border,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon as any} size={20} color={colors.textTertiary} style={{ marginRight: SPACING.sm }} />
        )}
        <TextInput
          style={[
            styles.input,
            { color: colors.textPrimary, flex: 1 },
            multiline && { height: numberOfLines ? numberOfLines * 22 : 80, textAlignVertical: 'top' },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          autoCapitalize="none"
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon as any} size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevated = true }) => {
  const { colors } = useTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border },
    elevated && SHADOWS.md,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// ============================================
// BADGE COMPONENT
// ============================================

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = COLORS.primary,
  bgColor = COLORS.primaryUltraLight,
  size = 'md',
}) => (
  <View
    style={[
      styles.badge,
      { backgroundColor: bgColor },
      size === 'sm' && { paddingVertical: 2, paddingHorizontal: 6 },
    ]}
  >
    <Text style={[styles.badgeText, { color }, size === 'sm' && { fontSize: 10 }]}>{label}</Text>
  </View>
);

// ============================================
// STAR RATING COMPONENT
// ============================================

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export const StarRating: React.FC<RatingProps> = ({ rating, reviewCount, size = 14 }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="star" size={size} color={COLORS.warning} />
      <Text style={{ color: COLORS.textPrimary, fontWeight: '600', marginLeft: 3, fontSize: size }}>
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined && (
        <Text style={{ color: COLORS.textSecondary, marginLeft: 4, fontSize: size - 1 }}>
          ({reviewCount > 999 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
        </Text>
      )}
    </View>
  );
};

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDarkMode ? '#2D3748' : '#E8ECF0',
        },
        style,
      ]}
    />
  );
};

export const DoctorCardSkeleton: React.FC = () => (
  <Card style={{ padding: SPACING.base, marginBottom: SPACING.md }}>
    <View style={{ flexDirection: 'row' }}>
      <Skeleton width={72} height={72} borderRadius={36} />
      <View style={{ flex: 1, marginLeft: SPACING.md }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={13} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={13} />
      </View>
    </View>
  </Card>
);

export const MedicineCardSkeleton: React.FC = () => (
  <Card style={{ padding: SPACING.base, marginBottom: SPACING.md }}>
    <Skeleton width="100%" height={120} borderRadius={8} style={{ marginBottom: 12 }} />
    <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
    <Skeleton width="40%" height={16} />
  </Card>
);

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name={icon as any} size={48} color={COLORS.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="md" style={{ marginTop: SPACING.lg, width: 180 }} />
      )}
    </View>
  );
};

// ============================================
// DISCOUNT BADGE
// ============================================

export const DiscountBadge: React.FC<{ percent: number }> = ({ percent }) => {
  if (percent === 0) return null;
  return (
    <View style={styles.discountBadge}>
      <Text style={styles.discountBadgeText}>{percent}% OFF</Text>
    </View>
  );
};

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onSeeAll }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================
// PRICE DISPLAY
// ============================================

interface PriceProps {
  price: number;
  discountedPrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceDisplay: React.FC<PriceProps> = ({ price, discountedPrice, size = 'md' }) => {
  const { colors } = useTheme();
  const mainSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 17;
  const origSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 13;

  const showDiscount = discountedPrice !== undefined && discountedPrice < price;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={{ fontSize: mainSize, fontWeight: '700', color: COLORS.primary }}>
        ₹{showDiscount ? discountedPrice?.toFixed(0) : price.toFixed(0)}
      </Text>
      {showDiscount && (
        <Text style={{ fontSize: origSize, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
          ₹{price.toFixed(0)}
        </Text>
      )}
    </View>
  );
};

// ============================================
// AVAILABILITY INDICATOR
// ============================================

export const AvailabilityDot: React.FC<{ isAvailable: boolean }> = ({ isAvailable }) => (
  <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? COLORS.success : COLORS.warning }]} />
);

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: 1,
  },
  headerRight: {
    marginLeft: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  input: {
    fontSize: FONT_SIZES.base,
    padding: 0,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['4xl'],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  discountBadge: {
    backgroundColor: COLORS.accentUltraLight,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
