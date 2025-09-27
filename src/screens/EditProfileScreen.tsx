import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTranslation } from '../contexts/TranslationContext';
import * as ImagePicker from 'expo-image-picker';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function EditProfileScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const {
    profile,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    isUpdating,
    error,
    clearError,
    profileCompletionPercentage,
    profileStrength,
  } = useUserProfile();

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || '',
    phone: profile?.phone || '',
    favorite_sports: profile?.favorite_sports || [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSportsSelector, setShowSportsSelector] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sports options
  const sports = [
    t.sports.boxing, t.sports.calisthenics, t.sports.gym, t.sports.basketball, t.sports.rollerSkating,
    t.sports.football, t.sports.volleyball, t.sports.bjj, t.sports.chess, t.sports.pingPong,
    t.sports.tennis, t.sports.badminton, t.sports.squash, t.sports.mma, t.sports.judo
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSportToggle = (sport: string) => {
    const currentSports = formData.favorite_sports;
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    setFormData(prev => ({ ...prev, favorite_sports: newSports }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 13 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.favorite_sports.length === 0) {
      newErrors.favorite_sports = 'Please select at least one sport';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const updates = {
      display_name: formData.display_name.trim(),
      bio: formData.bio.trim(),
      age: formData.age ? Number(formData.age) : undefined,
      gender: formData.gender || undefined,
      phone: formData.phone.trim() || undefined,
      favorite_sports: formData.favorite_sports,
    };

    const success = await updateProfile(updates);
    if (success) {
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        const asset = result.assets[0];
        
        // Create a File object from the asset
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

        const avatarUrl = await uploadProfilePicture(file);
        if (avatarUrl) {
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
        }
        setIsUploadingImage(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProfilePicture();
            if (success) {
              Alert.alert('Success', 'Profile picture deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete profile picture. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (Object.keys(errors).length > 0 || isUpdating) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const getProfileImage = () => {
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url };
    }
    return null;
  };

  const getInitials = () => {
    const name = formData.display_name || profile?.display_name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <SMLogo size={30} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <View style={styles.profileImageContainer}>
                {getProfileImage() ? (
                  <Image source={getProfileImage()!} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>{getInitials()}</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={handleImagePicker}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.cameraIcon}>📷</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.imageActionButton}
                  onPress={handleImagePicker}
                  disabled={isUploadingImage}
                >
                  <Text style={styles.imageActionText}>Change Photo</Text>
                </TouchableOpacity>
                {profile?.avatar_url && (
                  <TouchableOpacity 
                    style={[styles.imageActionButton, styles.deleteButton]}
                    onPress={handleDeleteImage}
                  >
                    <Text style={[styles.imageActionText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Profile Completion */}
            <View style={styles.completionSection}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <View style={styles.completionBar}>
                <View style={[styles.completionFill, { width: `${profileCompletionPercentage}%` }]} />
              </View>
              <Text style={styles.completionText}>
                {profileCompletionPercentage}% Complete - {profileStrength} Profile
              </Text>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Text style={styles.errorDismiss}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Display Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name *</Text>
                <TextInput
                  style={[styles.input, errors.display_name && styles.inputError]}
                  value={formData.display_name}
                  onChangeText={(value) => handleInputChange('display_name', value)}
                  placeholder="Enter your display name"
                  placeholderTextColor="#8e8e93"
                />
                {errors.display_name && <Text style={styles.fieldError}>{errors.display_name}</Text>}
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#8e8e93"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={[styles.input, errors.age && styles.inputError]}
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="Enter your age"
                  placeholderTextColor="#8e8e93"
                  keyboardType="numeric"
                />
                {errors.age && <Text style={styles.fieldError}>{errors.age}</Text>}
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                  {['male', 'female', 'other', 'prefer_not_to_say'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderOption,
                        formData.gender === gender && styles.genderOptionSelected
                      ]}
                      onPress={() => handleInputChange('gender', gender)}
                    >
                      <Text style={[
                        styles.genderOptionText,
                        formData.gender === gender && styles.genderOptionTextSelected
                      ]}>
                        {gender.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#8e8e93"
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
              </View>

              {/* Favorite Sports */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Favorite Sports *</Text>
                <TouchableOpacity 
                  style={styles.sportsSelector}
                  onPress={() => setShowSportsSelector(!showSportsSelector)}
                >
                  <Text style={styles.sportsSelectorText}>
                    {formData.favorite_sports.length > 0 
                      ? `${formData.favorite_sports.length} sports selected`
                      : 'Select your favorite sports'
                    }
                  </Text>
                  <Text style={styles.sportsSelectorIcon}>
                    {showSportsSelector ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                
                {showSportsSelector && (
                  <View style={styles.sportsContainer}>
                    {sports.map((sport) => {
                      const isSelected = formData.favorite_sports.includes(sport);
                      return (
                        <TouchableOpacity
                          key={sport}
                          style={[
                            styles.sportChip,
                            isSelected && styles.sportChipSelected
                          ]}
                          onPress={() => handleSportToggle(sport)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.sportChipText,
                            isSelected && styles.sportChipTextSelected
                          ]}>
                            {sport}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {errors.favorite_sports && <Text style={styles.fieldError}>{errors.favorite_sports}</Text>}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666666',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 16,
    color: '#000000',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  deleteButtonText: {
    color: '#c62828',
  },
  completionSection: {
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  completionBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },
  errorDismiss: {
    fontSize: 18,
    color: '#c62828',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  fieldError: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#ffffff',
  },
  genderOptionSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  genderOptionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  sportsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  sportsSelectorText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  sportsSelectorIcon: {
    fontSize: 12,
    color: '#666666',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#ffffff',
  },
  sportChipSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  sportChipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
