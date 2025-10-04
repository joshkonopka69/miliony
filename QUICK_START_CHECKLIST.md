# 🚀 Quick Start Checklist - Do This First!

## Priority Order: Get Your App Working TODAY

---

## ✅ Step 1: Fix Backend & Login (30 minutes)

### **1.1 Create Test User in Supabase**

Go to: https://supabase.com → Your Project → SQL Editor

Run this SQL:

```sql
-- Get user ID from previous auth.users insert
-- Replace 'YOUR_AUTH_USER_ID' with actual ID

INSERT INTO public.users (
  id,
  email,
  display_name,
  avatar_url,
  friends,
  favorite_sports,
  location_latitude,
  location_longitude,
  created_at,
  updated_at
)
VALUES (
  'YOUR_AUTH_USER_ID',  -- ← REPLACE THIS with ID from auth.users
  'test@sportmap.com',
  'Test User',
  NULL,
  ARRAY[]::uuid[],
  ARRAY['Football', 'Basketball', 'Tennis'],
  NULL,
  NULL,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  favorite_sports = EXCLUDED.favorite_sports,
  updated_at = NOW();
```

### **1.2 Disable Email Confirmation**

1. Go to Supabase Dashboard
2. Click **Authentication** → **Providers**
3. Click **Email**
4. **Uncheck** "Confirm email"
5. Click **Save**

### **1.3 Test Login**

```bash
cd /home/hubi/SportMap/miliony
npx expo start --clear
```

**Credentials:**
- Email: `test@sportmap.com`
- Password: `TestPassword123!`

✅ **You should now be able to log in!**

---

## ✅ Step 2: Design Your Screens (2 hours)

### **2.1 Sign Up for Figma** (5 minutes)

1. Go to https://figma.com
2. Sign up (free)
3. Click "Create new design file"
4. Set frame to **iPhone 14 & 15 Pro** (390×844)

### **2.2 Get UI Kit** (5 minutes)

1. In Figma, click **Community** (top left)
2. Search: **"iOS UI Kit"** or **"Mobile App UI Kit"**
3. Duplicate one to your files
4. Open it

### **2.3 Design 3 Key Screens** (90 minutes)

**Priority screens to design:**

1. **Events List Screen** (30 min)
   - Top: Search bar
   - Middle: Cards with events
   - Each card: Sport icon, title, participants, time
   - Bottom: Join button

2. **Event Details Screen** (30 min)
   - Top: Large sport icon
   - Title, description, time
   - Participants list
   - Map location
   - Join/Leave button at bottom

3. **Profile Screen** (30 min)
   - Top: Profile picture, name
   - Stats: Events joined, friends
   - Buttons: Edit Profile, Settings
   - Recent activity list

**Design Tips:**
- Use your colors: `#4F46E5` (primary), `#059669` (secondary), `#F59E0B` (accent)
- Copy layouts from similar apps
- Keep it simple!

---

## ✅ Step 3: Standardize 3 Screens (3 hours)

### **3.1 Events Screen** (1 hour)

File: `src/screens/EventsScreen.tsx`

**Goal:** Make it match your Figma design

Replace emojis with icons:
```typescript
// ❌ OLD:
<Text>⚽</Text>

// ✅ NEW:
<Ionicons name="football" size={24} color={theme.colors.primary} />
```

Use ProfessionalButton:
```typescript
// ❌ OLD:
<TouchableOpacity style={styles.button}>
  <Text>Join</Text>
</TouchableOpacity>

// ✅ NEW:
<ProfessionalButton 
  title="Join Event"
  variant="primary"
  onPress={handleJoin}
/>
```

### **3.2 Profile Screen** (1 hour)

File: `src/screens/ProfileScreen.tsx`

Same process - replace with professional components

### **3.3 Settings Screen** (1 hour)

File: `src/screens/SettingsScreen.tsx`

Same process

---

## ✅ Step 4: Test on Real Device (30 minutes)

### **4.1 Start Development Server**

```bash
cd /home/hubi/SportMap/miliony
npx expo start
```

### **4.2 Test on Your Phone**

**Android:**
1. Install "Expo Go" from Play Store
2. Scan QR code from terminal
3. App opens!

**iOS:**
1. Install "Expo Go" from App Store
2. Scan QR code from terminal
3. App opens!

### **4.3 Test These Features:**

- [ ] Login works
- [ ] Can see map
- [ ] Can see events
- [ ] Can view profile
- [ ] Can navigate between screens
- [ ] Buttons work
- [ ] No crashes!

---

## ✅ Step 5: Build Preview (1 hour)

### **5.1 Build Android Preview**

```bash
cd /home/hubi/SportMap/miliony
eas build --profile preview --platform android
```

Wait 10-20 minutes for build...

### **5.2 Download & Install**

1. Build completes → get APK link
2. Download APK on Android phone
3. Install it
4. Test app (this is closer to production!)

---

## 📅 Today's Realistic Schedule

| Time | Task | Status |
|------|------|--------|
| **Hour 1** | Fix backend & test login | ⏳ |
| **Hour 2-3** | Design in Figma | ⏳ |
| **Hour 4-6** | Implement 3 screens | ⏳ |
| **Hour 7** | Test on device | ⏳ |
| **Hour 8** | Build preview | ⏳ |

**Total: 8 hours = 1 focused day** 🎯

---

## 🎯 This Week's Goals

### **Day 1 (Today):** Backend + 3 Screens ✅
### **Day 2:** Finish remaining screens
### **Day 3:** Polish & fix bugs
### **Day 4:** Test with friends
### **Day 5:** Prepare store assets
### **Weekend:** Submit to stores!

---

## 🆘 Quick Troubleshooting

### **Can't log in?**
→ Check: Did you create user in `public.users` table?
→ Check: Did you disable email confirmation?

### **App crashes on start?**
```bash
npx expo start --clear
```

### **Figma is confusing?**
→ Just sketch on paper first
→ Or copy existing designs

### **Build failed?**
→ Read error message
→ Usually: missing env variable or incorrect config

---

## 💪 You Got This!

**Remember:**
- Don't try to be perfect
- Copy what works
- Test early, test often
- Ship it and improve later!

**See full guide:** `UI_COMPLETION_AND_DEPLOYMENT_GUIDE.md`

---

**Start with Step 1 right now! ⏰**

