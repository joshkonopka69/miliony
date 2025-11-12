# ✅ TASK 2: Profile Photo Upload Implementation

**Date:** October 28, 2025  
**Status:** ✅ CODE COMPLETE - Requires Supabase Setup

---

## 🎯 **OBJECTIVE:**

Allow users to change their profile photo by:
1. Tapping profile photo/camera button
2. Choosing from camera or gallery
3. Uploading to Supabase Storage
4. Updating profile in database
5. Seeing updated photo immediately

---

## 📋 **FILES CREATED/MODIFIED:**

### **1. Created: `src/services/photoUploadService.ts`** ✅
**Purpose:** Handles image picking, camera access, and upload to Supabase

**Functions:**
- `requestCameraPermission()` - Request camera access
- `requestMediaLibraryPermission()` - Request gallery access
- `takePhoto()` - Launch camera and take photo
- `pickImage()` - Open gallery and select photo
- `uploadProfilePhoto()` - Upload to Supabase Storage
- `deleteOldProfilePhoto()` - Clean up old photos (optional)

**Features:**
- ✅ Camera permission handling
- ✅ Gallery permission handling
- ✅ Image editing/cropping (1:1 aspect ratio)
- ✅ Image compression (0.8 quality)
- ✅ Base64 encoding for Supabase
- ✅ Unique filename generation
- ✅ Public URL generation
- ✅ Old photo cleanup

---

### **2. Modified: `src/services/supabase.ts`** ✅
**Added Functions:**

#### **`updateProfilePhoto(userId, avatarUrl)`**
- Updates `users.avatar_url` in database
- Takes user ID and new photo URL
- Includes error handling and logging

#### **`getCurrentUserProfile()`**
- Fetches current user's profile from database
- Returns full user object
- Handles authentication check

---

### **3. Modified: `src/screens/ProfileScreen.tsx`** ✅
**Changes:**

#### **New Imports:**
```typescript
import { Platform, ActionSheetIOS } from 'react-native';
import {
  takePhoto,
  pickImage,
  uploadProfilePhoto,
  deleteOldProfilePhoto,
} from '../services/photoUploadService';
import { supabaseService } from '../services/supabase';
```

#### **New State:**
```typescript
const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
```

#### **New Functions:**
- `handlePhotoPress()` - Shows action sheet/alert
- `handleTakePhoto()` - Launches camera
- `handlePickImage()` - Opens gallery
- `uploadAndUpdatePhoto()` - Handles complete upload flow

#### **UI Changes:**
- Profile photo is now **clickable**
- Camera button is **functional**
- Shows **loading indicator** during upload
- Displays **"Uploading..."** text
- Success/error alerts
- Works on both **iOS** (Action Sheet) and **Android** (Alert)

---

## 🔧 **REQUIRED PACKAGES:**

**Install these packages:**
```bash
npx expo install expo-image-picker expo-file-system base64-arraybuffer
```

**Dependencies:**
- `expo-image-picker` - Camera and gallery access
- `expo-file-system` - Read files as base64
- `base64-arraybuffer` - Convert base64 to array buffer for Supabase

---

## 🗄️ **SUPABASE SETUP (CRITICAL!):**

### **Step 1: Create Storage Bucket**

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Bucket name: `avatars`
4. Set as **Public** ✅
5. Click **"Create bucket"**

---

### **Step 2: Add RLS Policies**

Go to **Storage** → **avatars** → **Policies** and add these:

#### **Policy 1: Allow users to upload their own avatar**
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Policy 2: Allow users to update their own avatar**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Policy 3: Allow users to delete their own avatar**
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Policy 4: Allow everyone to view avatars** ⚠️ **CRITICAL**
```sql
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

### **Step 3: Verify Database Schema**

Ensure your `users` table has an `avatar_url` column:

```sql
-- Check if avatar_url exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';

-- If not, add it:
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

## 🎨 **HOW IT WORKS:**

### **User Flow:**

```
1. User opens ProfileScreen
   ↓
2. User taps profile photo OR camera button
   ↓
3. iOS: Action Sheet appears
   Android: Alert appears
   ↓
4. User selects "Take Photo" or "Choose from Library"
   ↓
5a. Take Photo:
    - Camera permission requested (if first time)
    - Camera opens
    - User takes photo
    - Edit/crop screen (1:1 square)
    - User confirms
    
5b. Choose from Library:
    - Gallery permission requested (if first time)
    - Photo library opens
    - User selects photo
    - Edit/crop screen (1:1 square)
    - User confirms
   ↓
6. Photo uploads to Supabase Storage:
    - Shows loading indicator
    - Displays "Uploading..." text
    - Camera button hidden during upload
   ↓
7. Database updates with new URL
   ↓
8. Old photo deleted (async, non-blocking)
   ↓
9. Local state updates → UI refreshes
   ↓
10. Success alert: "Profile photo updated!"
```

---

### **Data Flow:**

```
ProfileScreen
  ↓ User taps photo
  handlePhotoPress()
  ↓ User selects source
  handleTakePhoto() / handlePickImage()
  ↓ Image selected
  uploadAndUpdatePhoto(imageUri)
  ↓
  ┌─────────────────────────────────────┐
  │ 1. Read image as base64             │
  │    photoUploadService.uploadProfile │
  │                                      │
  │ 2. Upload to Supabase Storage       │
  │    → avatars/[user_id]/[timestamp]  │
  │                                      │
  │ 3. Get public URL                   │
  │    → https://[project].supabase.co/│
  │      storage/v1/object/public/     │
  │      avatars/[user_id]/[timestamp] │
  └─────────────────────────────────────┘
  ↓
  ┌─────────────────────────────────────┐
  │ 4. Update database                  │
  │    supabaseService.updateProfile    │
  │    UPDATE users                     │
  │    SET avatar_url = [new_url]       │
  │    WHERE id = [user_id]             │
  └─────────────────────────────────────┘
  ↓
  ┌─────────────────────────────────────┐
  │ 5. Delete old photo (optional)      │
  │    photoUploadService.deleteOld     │
  │    → Non-blocking, won't fail upload│
  └─────────────────────────────────────┘
  ↓
  6. Update local state
     setProfile({ ...profile, avatar_url: newUrl })
  ↓
  7. UI automatically refreshes
```

---

## 🧪 **TESTING CHECKLIST:**

### **Before Testing:**
- [ ] Install required packages (`expo-image-picker`, `expo-file-system`, `base64-arraybuffer`)
- [ ] Create `avatars` bucket in Supabase Storage
- [ ] Set bucket to **Public**
- [ ] Add all 4 RLS policies
- [ ] Verify `users.avatar_url` column exists
- [ ] Restart Expo dev server

### **iOS Testing:**
- [ ] Tap profile photo
- [ ] Verify **Action Sheet** appears with 3 options
- [ ] Select "Take Photo"
  - [ ] Camera permission alert (first time)
  - [ ] Camera opens
  - [ ] Take photo
  - [ ] Edit/crop screen appears
  - [ ] Confirm photo
  - [ ] Loading indicator shows
  - [ ] Profile photo updates
  - [ ] Success alert shows
- [ ] Select "Choose from Library"
  - [ ] Gallery permission alert (first time)
  - [ ] Photo library opens
  - [ ] Select photo
  - [ ] Edit/crop screen appears
  - [ ] Confirm photo
  - [ ] Loading indicator shows
  - [ ] Profile photo updates
  - [ ] Success alert shows

### **Android Testing:**
- [ ] Tap profile photo
- [ ] Verify **Alert dialog** appears
- [ ] Repeat same tests as iOS above

### **Additional Tests:**
- [ ] Close and reopen app
  - [ ] New photo persists
- [ ] Go to Supabase Dashboard → Storage → avatars
  - [ ] Verify file exists in correct folder
  - [ ] Folder structure: `avatars/[user_id]/[timestamp].jpg`
- [ ] Check Supabase Database → users table
  - [ ] Verify `avatar_url` updated for user
  - [ ] URL should be accessible (paste in browser)
- [ ] Test error cases:
  - [ ] Deny camera permission → Error alert shown
  - [ ] Deny gallery permission → Error alert shown
  - [ ] No internet → Error alert shown
- [ ] Upload multiple photos
  - [ ] Each new photo replaces previous

---

## 🚨 **TROUBLESHOOTING:**

### **Camera/Gallery Won't Open:**
```
Issue: Permission not granted or packages not installed
Fix:
1. Check packages installed:
   npx expo install expo-image-picker expo-file-system
2. Check phone settings → App permissions
3. Try uninstall/reinstall app
4. Check console for permission errors
```

### **Upload Fails:**
```
Issue: Supabase bucket or RLS policy missing
Fix:
1. Verify bucket exists and is PUBLIC
2. Check all 4 RLS policies are active
3. Check API keys in .env file
4. Look for error in console logs
```

### **Photo Doesn't Display:**
```
Issue: URL incorrect or not accessible
Fix:
1. Check avatar_url in database
2. Paste URL in browser - should load image
3. Verify bucket is PUBLIC
4. Check "Avatars are publicly accessible" policy exists
```

### **Old Photos Not Deleted:**
```
Issue: Delete policy missing or URL format wrong
Fix:
1. This is non-critical - won't block upload
2. Check delete RLS policy exists
3. Check console for deletion warnings
4. Verify URL format matches extraction logic
```

### **"base64-arraybuffer" Import Error:**
```
Issue: Package not installed
Fix:
npm install base64-arraybuffer
or
yarn add base64-arraybuffer
```

---

## 📊 **FILE STRUCTURE:**

```
avatars/
└── [user_id]/
    ├── 1738087234567.jpg  (old)
    ├── 1738087345678.jpg  (old)
    └── 1738087456789.jpg  (current)
```

**Format:** `avatars/[user_id]/[unix_timestamp].[extension]`

---

## 🎉 **SUCCESS CRITERIA:**

- [x] **Code Complete**: All files created/modified
- [ ] **Packages Installed**: expo-image-picker, expo-file-system, base64-arraybuffer
- [ ] **Supabase Bucket**: avatars bucket created and public
- [ ] **RLS Policies**: All 4 policies added
- [ ] **Database Schema**: avatar_url column exists
- [ ] **iOS**: Action Sheet works, camera works, gallery works
- [ ] **Android**: Alert works, camera works, gallery works
- [ ] **Upload**: Photo uploads successfully
- [ ] **Display**: New photo shows immediately
- [ ] **Persistence**: Photo persists after app restart
- [ ] **Database**: avatar_url updated correctly
- [ ] **Storage**: File visible in Supabase Storage

---

## 📝 **NEXT STEPS:**

1. **Install packages:**
   ```bash
   npx expo install expo-image-picker expo-file-system base64-arraybuffer
   ```

2. **Set up Supabase:**
   - Create `avatars` bucket (public)
   - Add 4 RLS policies
   - Verify `users.avatar_url` column

3. **Restart Expo:**
   ```bash
   cd miliony
   npx expo start
   ```

4. **Test on device:**
   - Open ProfileScreen
   - Tap profile photo
   - Test camera and gallery
   - Verify upload works

---

**Once Supabase is set up and packages are installed, profile photo upload will be fully functional!** 🎉📸



