# 📸 Profile Photo Upload - Visual Guide

---

## 🎨 **USER INTERFACE:**

### **Before (No Photo):**
```
╔═══════════════════════════════════════╗
║         PROFILE SCREEN                ║
╠═══════════════════════════════════════╣
║                                       ║
║          ┌─────────────┐              ║
║          │             │              ║
║          │      JO     │ ← Initials  ║
║          │             │              ║
║          └─────────────┘              ║
║               📷 ← Camera Button      ║
║                                       ║
║            Josh Smith                 ║
║            @joshsmith                 ║
║            Joined 2025                ║
║                                       ║
╚═══════════════════════════════════════╝
```

### **After (Has Photo):**
```
╔═══════════════════════════════════════╗
║         PROFILE SCREEN                ║
╠═══════════════════════════════════════╣
║                                       ║
║          ┌─────────────┐              ║
║          │ [😊 Photo] │              ║
║          │             │              ║
║          └─────────────┘              ║
║               📷 ← Click to change    ║
║                                       ║
║            Josh Smith                 ║
║            @joshsmith                 ║
║            Joined 2025                ║
║                                       ║
╚═══════════════════════════════════════╝
```

### **During Upload:**
```
╔═══════════════════════════════════════╗
║         PROFILE SCREEN                ║
╠═══════════════════════════════════════╣
║                                       ║
║          ┌─────────────┐              ║
║          │             │              ║
║          │   🔄 ⏳      │              ║
║          │ Uploading.. │              ║
║          └─────────────┘              ║
║          (No camera button)           ║
║                                       ║
║            Josh Smith                 ║
║            @joshsmith                 ║
║            Joined 2025                ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## 📱 **USER INTERACTION FLOW:**

```
┌─────────────────────────────────────────────────────┐
│  User opens ProfileScreen                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  User taps profile photo or camera button 📷        │
└──────────────────┬──────────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
      ▼ iOS                     ▼ Android
┌─────────────┐          ┌─────────────┐
│ Action Sheet│          │    Alert    │
├─────────────┤          ├─────────────┤
│ Cancel      │          │ Cancel      │
│ Take Photo  │          │ Take Photo  │
│ Choose Photo│          │ Choose Photo│
└──────┬──────┘          └──────┬──────┘
       │                        │
       └────────────┬───────────┘
                    │
       ┌────────────┴────────────┐
       │                         │
       ▼ Take Photo              ▼ Choose Photo
┌──────────────┐          ┌──────────────┐
│              │          │              │
│  📸 Camera   │          │  🖼️ Gallery │
│              │          │              │
│  Permission  │          │  Permission  │
│  (1st time)  │          │  (1st time)  │
│              │          │              │
│  Snap photo  │          │ Select photo │
│              │          │              │
└──────┬───────┘          └──────┬───────┘
       │                         │
       └────────────┬────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │                  │
          │  ✂️ Edit/Crop    │
          │                  │
          │  1:1 Square      │
          │  Adjust, Rotate  │
          │                  │
          │  [Use Photo]     │
          │                  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │                  │
          │  🔄 Uploading    │
          │                  │
          │  Loading spinner │
          │  "Uploading..."  │
          │                  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │                  │
          │  ✅ Success!     │
          │                  │
          │  Alert: "Profile │
          │  photo updated!" │
          │                  │
          │  Photo displays  │
          │  immediately     │
          │                  │
          └──────────────────┘
```

---

## 🔄 **TECHNICAL DATA FLOW:**

```
ProfileScreen.tsx
       │
       │ User taps photo
       ▼
handlePhotoPress()
       │
       ├─ iOS → ActionSheetIOS.showActionSheet()
       └─ Android → Alert.alert()
       │
       │ User selects source
       ▼
┌──────────────────┴───────────────────┐
│                                      │
▼                                      ▼
handleTakePhoto()              handlePickImage()
│                                      │
▼                                      ▼
photoUploadService                photoUploadService
   .takePhoto()                      .pickImage()
│                                      │
├─ Request camera permission          ├─ Request gallery permission
├─ ImagePicker.launchCameraAsync()    ├─ ImagePicker.launchImageLibraryAsync()
├─ allowsEditing: true                ├─ allowsEditing: true
├─ aspect: [1, 1]                     ├─ aspect: [1, 1]
└─ quality: 0.8                       └─ quality: 0.8
│                                      │
└──────────────────┬───────────────────┘
                   │
                   │ Returns: ImagePickerAsset
                   │ { uri, width, height }
                   ▼
          uploadAndUpdatePhoto(uri)
                   │
                   ├─ setIsUploadingPhoto(true)
                   │  (Show loading UI)
                   │
                   ▼
          photoUploadService
              .uploadProfilePhoto(userId, uri)
                   │
                   ├─ Read file as base64
                   │  FileSystem.readAsStringAsync()
                   │
                   ├─ Generate filename
                   │  [user_id]/[timestamp].jpg
                   │
                   ├─ Upload to Supabase Storage
                   │  supabase.storage.from('avatars')
                   │    .upload(filename, base64)
                   │
                   └─ Get public URL
                      https://[project].supabase.co/
                        storage/v1/object/public/
                        avatars/[user_id]/[timestamp].jpg
                   │
                   │ Returns: Public URL
                   ▼
          supabaseService
              .updateProfilePhoto(userId, newUrl)
                   │
                   ├─ UPDATE users
                   │  SET avatar_url = [newUrl]
                   │  WHERE id = [userId]
                   │
                   └─ Success!
                   │
                   ▼
          photoUploadService
              .deleteOldProfilePhoto(oldUrl)
                   │
                   ├─ Extract path from URL
                   ├─ supabase.storage.from('avatars')
                   │    .remove([oldPath])
                   └─ (Non-blocking, continues if fails)
                   │
                   ▼
          setProfile({ ...profile, avatar_url: newUrl })
                   │
                   ├─ Local state updates
                   └─ UI re-renders with new photo
                   │
                   ▼
          Alert.alert('Success', 'Profile photo updated!')
                   │
                   ▼
          setIsUploadingPhoto(false)
                   │
                   └─ Hide loading, show camera button
```

---

## 🗄️ **SUPABASE STORAGE STRUCTURE:**

```
Supabase Storage
│
└── avatars/ (bucket - PUBLIC)
    │
    ├── user-abc-123/
    │   ├── 1738087234567.jpg  ← Old photo
    │   ├── 1738087345678.jpg  ← Old photo
    │   └── 1738087456789.jpg  ← Current photo ✅
    │
    ├── user-def-456/
    │   └── 1738087567890.jpg  ← Current photo ✅
    │
    └── user-ghi-789/
        ├── 1738087678901.png  ← Old photo
        └── 1738087789012.jpg  ← Current photo ✅
```

### **File Naming:**
```
Format: [user_id]/[unix_timestamp].[extension]

Examples:
- abc123def456/1738087234567.jpg
- xyz789/1738087345678.png
- user-uuid-here/1738087456789.jpg
```

### **URL Structure:**
```
https://[project-id].supabase.co/storage/v1/object/public/avatars/[user-id]/[timestamp].jpg
         └────┬────┘                           └──────┬──────┘ └───────┬───────┘ └────┬────┘
       Project ID                            Bucket Name    User Folder    Filename
```

---

## 🔐 **SUPABASE RLS POLICIES:**

```
Policy 1: Upload Own Avatar
┌────────────────────────────────────────┐
│ Operation: INSERT                      │
│ Check:                                 │
│   - Bucket is 'avatars'                │
│   - Folder name = user's auth ID       │
│                                        │
│ Effect: Users can ONLY upload to      │
│         their own folder               │
└────────────────────────────────────────┘

Policy 2: Update Own Avatar
┌────────────────────────────────────────┐
│ Operation: UPDATE                      │
│ Check:                                 │
│   - Bucket is 'avatars'                │
│   - Folder name = user's auth ID       │
│                                        │
│ Effect: Users can ONLY update their   │
│         own photos                     │
└────────────────────────────────────────┘

Policy 3: Delete Own Avatar
┌────────────────────────────────────────┐
│ Operation: DELETE                      │
│ Check:                                 │
│   - Bucket is 'avatars'                │
│   - Folder name = user's auth ID       │
│                                        │
│ Effect: Users can ONLY delete their   │
│         own photos                     │
└────────────────────────────────────────┘

Policy 4: Public View ⚠️ CRITICAL
┌────────────────────────────────────────┐
│ Operation: SELECT                      │
│ Check:                                 │
│   - Bucket is 'avatars'                │
│                                        │
│ Effect: EVERYONE can view all photos  │
│         (Required for profile display!)│
└────────────────────────────────────────┘
```

---

## 📊 **DATABASE SCHEMA:**

```
users table:
┌──────────────┬──────────────┬─────────────┐
│ Column       │ Type         │ Example     │
├──────────────┼──────────────┼─────────────┤
│ id           │ UUID         │ abc123...   │
│ email        │ TEXT         │ josh@...    │
│ display_name │ TEXT         │ Josh Smith  │
│ avatar_url   │ TEXT         │ https://... │ ← ADDED
│ created_at   │ TIMESTAMP    │ 2025-01-... │
│ updated_at   │ TIMESTAMP    │ 2025-01-... │
└──────────────┴──────────────┴─────────────┘
```

---

## ✅ **SUCCESS INDICATORS:**

### **1. In App:**
```
✅ Profile photo displays
✅ Camera button works
✅ Photo picker opens
✅ Upload progress shows
✅ Success alert appears
✅ New photo appears immediately
✅ Photo persists after restart
```

### **2. In Supabase Dashboard:**
```
✅ Storage → avatars → [user-id]/[file].jpg exists
✅ Database → users → avatar_url has URL
✅ URL is accessible (paste in browser)
```

### **3. Console Logs:**
```
📤 Uploading profile photo...
   User ID: abc123...
   Image URI: file:///...
   Filename: abc123.../1738087456789.jpg
✅ Upload successful: abc123.../1738087456789.jpg
🔗 Public URL: https://...
💾 Updating profile photo in database...
   User ID: abc123...
   New URL: https://...
✅ Profile updated successfully
🗑️  Deleting old photo: abc123.../1738087234567.jpg
✅ Old photo deleted
```

---

## 🎉 **FINAL RESULT:**

**Users can now:**
- ✅ Change their profile photo anytime
- ✅ Use camera or gallery
- ✅ Edit/crop photos
- ✅ See updates instantly
- ✅ Have photos persist forever
- ✅ Secure (only they can modify their photo)
- ✅ Public (everyone can view photos)

**Platform Support:**
- ✅ iOS (Action Sheet)
- ✅ Android (Alert)
- ✅ Works on real devices
- ✅ Works with Expo Go

---

**Beautiful, secure, and professional profile photo upload system!** 🎉📸



