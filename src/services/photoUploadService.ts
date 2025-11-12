import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../config/supabase';
import { decode } from 'base64-arraybuffer';

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick image from camera
 */
export const takePhoto = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile photos
      quality: 0.8, // Compress to reduce file size
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
};

/**
 * Pick image from gallery
 */
export const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

/**
 * Upload image to Supabase Storage
 */
export const uploadProfilePhoto = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  try {
    console.log('📤 Uploading profile photo...');
    console.log('   User ID:', userId);
    console.log('   Image URI:', imageUri);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${timestamp}.${fileExt}`;

    console.log('   Filename:', fileName);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, decode(base64), {
        contentType: `image/${fileExt}`,
        upsert: false, // Create new file each time
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }

    console.log('✅ Upload successful:', data.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    console.log('🔗 Public URL:', urlData.publicUrl);

    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    throw error;
  }
};

/**
 * Delete old profile photo from storage
 */
export const deleteOldProfilePhoto = async (photoUrl: string): Promise<void> => {
  try {
    if (!photoUrl) return;

    // Extract path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/avatars/[user_id]/[filename]
    const urlParts = photoUrl.split('/avatars/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    console.log('🗑️  Deleting old photo:', filePath);

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.warn('⚠️  Failed to delete old photo:', error);
      // Don't throw - old photo deletion is not critical
    } else {
      console.log('✅ Old photo deleted');
    }
  } catch (error) {
    console.warn('⚠️  Error deleting old photo:', error);
    // Don't throw - old photo deletion is not critical
  }
};

