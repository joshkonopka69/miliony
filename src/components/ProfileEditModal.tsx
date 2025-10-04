import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { supabase } from '../services/supabase';
import type { SportActivity } from '../types/event';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  profile: {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
    favorite_sports: SportActivity[];
    bio?: string;
    phone?: string;
    location?: string;
  };
  onSave: () => void;
}

const AVAILABLE_SPORTS: SportActivity[] = [
  'Football',
  'Basketball',
  'Tennis',
  'Volleyball',
  'Running',
  'Cycling',
  'Swimming',
  'Gym',
];

export default function ProfileEditModal({
  visible,
  onClose,
  profile,
  onSave,
}: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [selectedSports, setSelectedSports] = useState<SportActivity[]>(
    profile.favorite_sports || []
  );

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setDisplayName(profile.display_name);
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setAvatarUrl(profile.avatar_url || '');
      setSelectedSports(profile.favorite_sports || []);
    }
  }, [visible, profile]);

  const toggleSport = (sport: SportActivity) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter((s) => s !== sport));
    } else {
      if (selectedSports.length >= 5) {
        Alert.alert('Maximum Sports', 'You can select up to 5 favorite sports');
        return;
      }
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Create file name
      const fileExt = uri.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setAvatarUrl(urlData.publicUrl);
        Alert.alert('Success', 'Photo uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Display name is required');
      return;
    }

    if (displayName.length < 2) {
      Alert.alert('Validation Error', 'Display name must be at least 2 characters');
      return;
    }

    if (displayName.length > 50) {
      Alert.alert('Validation Error', 'Display name must be less than 50 characters');
      return;
    }

    if (bio.length > 500) {
      Alert.alert('Validation Error', 'Bio must be less than 500 characters');
      return;
    }

    try {
      setLoading(true);

      // Update profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          avatar_url: avatarUrl || null,
          favorite_sports: selectedSports,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (): string => {
    return displayName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Ionicons name="checkmark" size={28} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <View style={styles.photoContainer}>
                  {uploading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  ) : avatarUrl ? (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoPlaceholderText}>
                        {getInitials()}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoPlaceholderText}>
                        {getInitials()}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
              
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={20} color={theme.colors.textOnPrimary} />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.photoHint}>Tap to change photo</Text>
          </View>

          {/* Display Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Display Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={50}
              />
            </View>
            <Text style={styles.charCount}>{displayName.length}/50</Text>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>

          {/* Phone */}
          <View style={styles.section}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 234 567 8900"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          {/* Favorite Sports */}
          <View style={styles.section}>
            <Text style={styles.label}>Favorite Sports</Text>
            <Text style={styles.hint}>Select up to 5 sports you love</Text>
            <View style={styles.sportsGrid}>
              {AVAILABLE_SPORTS.map((sport) => {
                const isSelected = selectedSports.includes(sport);
                return (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.sportChip,
                      isSelected && styles.sportChipSelected,
                    ]}
                    onPress={() => toggleSport(sport)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.sportChipText,
                        isSelected && styles.sportChipTextSelected,
                      ]}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.selectedCount}>
              {selectedSports.length}/5 selected
            </Text>
          </View>

          {/* Email (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.readOnlyText}>{profile.email}</Text>
            </View>
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textOnPrimary} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.textOnPrimary} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  gradientBorder: {
    width: 136,
    height: 136,
    borderRadius: 68,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  photoPlaceholderText: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  photoHint: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.xs,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  hint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  sportChipSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  sportChipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  sportChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  selectedCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  readOnlyInput: {
    backgroundColor: theme.colors.background,
  },
  readOnlyText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
});

