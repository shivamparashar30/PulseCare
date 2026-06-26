import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useAuth } from '../../../../../../packages/providers/src/AuthProvider';
import { Header } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';
import { uploadAvatar, updateProfile } from '../../../../../../packages/supabase/src/auth';

export default function ProfileImageScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const avatarUrl = user?.avatar;
  const hasCustomAvatar = avatarUrl && !avatarUrl.includes('randomuser.me');
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const pickImage = async (fromCamera: boolean) => {
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is needed.');
        return;
      }
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true });

    if (result.canceled || !result.assets[0]?.base64) return;

    setUploading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const publicUrl = await uploadAvatar(authUser.id, result.assets[0].base64);
      updateUser({ avatar: publicUrl });
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setUploading(true);
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error('Not authenticated');
            await updateProfile(authUser.id, { avatar_url: '' });
            updateUser({ avatar: '' });
            Alert.alert('Done', 'Profile photo removed.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to remove photo.');
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  const showOptions = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Library', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Profile Photo" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* Large Avatar */}
        <View style={styles.avatarSection}>
          {uploading ? (
            <View style={[styles.avatarLarge, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : hasCustomAvatar ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarLarge} />
          ) : (
            <View style={[styles.avatarLarge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>

        {/* Actions */}
        <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: colors.border }]}
            onPress={showOptions}
            disabled={uploading}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Change Photo</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomColor: colors.border }]}
            onPress={() => pickImage(true)}
            disabled={uploading}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#7c3aed15' }]}>
              <Ionicons name="aperture-outline" size={20} color="#7c3aed" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Take a Selfie</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {hasCustomAvatar && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={removePhoto}
              disabled={uploading}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#dc262615' }]}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </View>
              <Text style={[styles.actionLabel, { color: '#dc2626' }]}>Remove Photo</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          Your profile photo is visible to doctors and healthcare providers when you book appointments.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  avatarSection: { marginBottom: SPACING.lg },
  avatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  initialsText: { color: '#fff', fontSize: 48, fontWeight: '900' },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: FONT_SIZES.sm, marginBottom: SPACING.xl },
  actionsCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600' },
  hint: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
});
