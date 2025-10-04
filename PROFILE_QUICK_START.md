# 🚀 PROFILE SYSTEM - QUICK START GUIDE

## ⚠️ IMPORTANT: YOU NEED TO LOG IN FIRST!

The error you saw ("No user logged in") is **expected** because you're not logged in!

---

## 📋 STEP-BY-STEP GUIDE

### **Step 1: Wait for App to Restart** ⏱️
- Wait **30-45 seconds** for the app to restart
- You'll see the Expo dev server start
- Your phone should reload automatically

### **Step 2: Log In** 🔐
```
1. Open the app on your phone
2. You'll see the Welcome/Auth screen
3. Enter your credentials:
   - Email: [your email]
   - Password: [your password]
4. Tap "Sign In"
```

**OR create a new account:**
```
1. Tap "Sign Up"
2. Enter:
   - Email
   - Password
   - Display Name
3. Tap "Create Account"
```

### **Step 3: Navigate to Profile** 👤
```
1. After logging in, you'll be on the Map screen
2. Tap the bottom-right icon (person icon)
3. This opens your Profile screen
```

### **Step 4: See Your Profile** ✨
You'll see:
- ✅ Your name and email
- ✅ Gradient border profile picture
- ✅ Statistics cards (0/0/0 initially)
- ✅ Blue info box: "Complete Your Profile"
- ✅ Empty states for events

### **Step 5: Edit Your Profile** ✏️
```
1. Tap the Edit button (pencil icon, top right)
2. Modal slides up
3. You can now:
   - Tap profile picture to upload photo
   - Edit display name
   - Write a bio
   - Add phone number
   - Add location
   - Select favorite sports (up to 5)
4. Tap Save (checkmark, top right)
5. See "Success" message
6. Profile updates!
```

---

## 🎨 WHAT YOU'LL SEE

### **When Logged In:**
```
┌──────────────────────────────────┐
│  ← Profile       [✏️] [SM]       │ ← Edit button!
├──────────────────────────────────┤
│                                  │
│      ╔═══════════╗  📷          │
│      ║ GRADIENT  ║              │ ← Beautiful gradient
│      ║    YN     ║              │
│      ╚═══════════╝              │
│                                  │
│       Your Name                  │
│    your@email.com                │
│   Joined October 2024            │
│                                  │
│  ┌─────┬─────┬─────┐            │
│  │  0  │  0  │  0  │            │ ← Stats (initially 0)
│  │Cre  │Join │Fri  │            │
│  └─────┴─────┴─────┘            │
│                                  │
│ ┌──────────────────────────┐    │
│ │ ℹ️ Complete Your Profile │    │ ← Info banner
│ │    Add favorite sports   │    │
│ └──────────────────────────┘    │
│                                  │
│  [Created] [Joined]              │
├──────────────────────────────────┤
│  📅 No Events Created            │ ← Empty state
│  Create your first event!        │
│  [Create Event]                  │
└──────────────────────────────────┘
```

### **Edit Modal:**
```
┌──────────────────────────────────┐
│  ✕  Edit Profile            ✓   │ ← Close / Save
├──────────────────────────────────┤
│      ╔═══════════╗  📷          │
│      ║ GRADIENT  ║              │ ← Tap to upload photo
│      ║    YN     ║              │
│      ╚═══════════╝              │
│   Tap to change photo            │
│                                  │
│  Display Name *                  │
│  ┌─────────────────────────┐    │
│  │ 👤 Your Name             │    │
│  └─────────────────────────┘    │
│  9/50                           │
│                                  │
│  Bio                            │
│  ┌─────────────────────────┐    │
│  │ Tell others about...     │    │ ← Multi-line
│  │                          │    │
│  └─────────────────────────┘    │
│  0/500                          │
│                                  │
│  Favorite Sports                 │
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │○ ⚽  │ │○ 🏀  │ │○ 🎾  │     │ ← Tap to select
│  │Football│ │Basketball│ │Tennis│    │
│  └──────┘ └──────┘ └──────┘     │
│  0/5 selected                    │
│                                  │
│  ┌────────────────────────┐     │
│  │ ✓ Save Changes         │     │ ← Save button
│  └────────────────────────┘     │
└──────────────────────────────────┘
```

---

## ✅ FEATURES YOU CAN USE

| Feature | How to Use |
|---------|------------|
| **Upload Photo** | Edit → Tap profile pic → Choose from gallery |
| **Change Name** | Edit → Type in "Display Name" field |
| **Add Bio** | Edit → Write in "Bio" field (500 chars max) |
| **Add Phone** | Edit → Type in "Phone Number" field |
| **Add Location** | Edit → Type in "Location" field |
| **Select Sports** | Edit → Tap up to 5 sports in grid |
| **Save Changes** | Edit → Tap checkmark (top right) |
| **Refresh Profile** | Pull down on profile screen |

---

## 🔧 BACKEND SETUP (Optional)

### **If Photo Upload Fails:**

1. **Create Supabase Storage Bucket:**
   ```
   1. Go to Supabase Dashboard
   2. Click "Storage" in sidebar
   3. Click "New bucket"
   4. Name: "avatars"
   5. Public: YES (enable)
   6. Click "Create bucket"
   ```

2. **Set Storage Policies:**
   ```sql
   -- In Supabase SQL Editor:
   
   -- Allow uploads
   CREATE POLICY "Users can upload own avatar"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'avatars');
   
   -- Allow public read
   CREATE POLICY "Public avatar access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

### **If Bio/Phone/Location Don't Save:**

```sql
-- In Supabase SQL Editor, run:
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;
```

---

## 🐛 COMMON ISSUES

### **Issue: "No user logged in" Error**
**Fix:** This is normal! You need to log in first.
1. Tap "Go to Login" button
2. Sign in with your account
3. Come back to Profile

### **Issue: Can't See Profile**
**Fix:** Make sure you're logged in
1. Check if you see the Map screen
2. If you see Welcome screen, log in
3. Then navigate to Profile (bottom right)

### **Issue: Edit Button Doesn't Work**
**Fix:** Wait for profile to load
1. Pull down to refresh
2. Wait for loading to finish
3. Try edit button again

### **Issue: Photo Upload Fails**
**Fix:** Create Supabase bucket (see above)
1. Follow "Backend Setup" section
2. Create "avatars" bucket
3. Try uploading again

---

## 📊 WHAT'S NEXT

### **After Logging In:**
1. ✅ Complete your profile
2. ✅ Upload a photo
3. ✅ Write a bio
4. ✅ Select favorite sports
5. ✅ Create an event
6. ✅ Join events from map
7. ✅ Add friends
8. ✅ Start chatting!

---

## 🎉 SUMMARY

| Step | Action | Result |
|------|--------|--------|
| 1 | Wait for app restart | Dev server starts |
| 2 | Log in / Sign up | Authenticated |
| 3 | Navigate to Profile | See profile screen |
| 4 | Tap Edit button | Modal opens |
| 5 | Make changes | Fields update |
| 6 | Tap Save | Data saves |
| 7 | See success message | Profile refreshes |
| 8 | Enjoy! | 🎉 |

---

## 💡 PRO TIP

**Complete your profile in this order:**
1. Upload a photo (makes it personal)
2. Write a bio (tells your story)
3. Add location (helps find local events)
4. Select sports (gets recommendations)
5. Add phone (optional, for event organizers)

This creates the **most professional profile** possible!

---

**🚀 NOW GO LOG IN AND SEE THE MAGIC! 🚀**

*The app is restarting now... give it 30-45 seconds!*

