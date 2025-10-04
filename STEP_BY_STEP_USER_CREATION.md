# 🎯 Create Test User - Step by Step (5 Minutes)

## ✅ EASIEST METHOD - Follow These Exact Steps:

---

### **Step 1: Create Auth User in Supabase Dashboard** (2 minutes)

1. Open your browser and go to:
   ```
   https://supabase.com/dashboard
   ```

2. Select your SportMap project

3. Click **"Authentication"** in left sidebar

4. Click **"Users"** tab

5. Click **"Add User"** button (top right, green button)

6. Fill in the form:
   ```
   Email: test@sportmap.com
   Password: Test123456
   ```

7. **IMPORTANT:** ✅ **Check the box** "Auto Confirm User"

8. Click **"Create User"**

9. **COPY THE USER ID!**
   - After creation, you'll see the new user in the list
   - The ID looks like: `002318cb-0909-4949-8ba5-d33c8650380c`
   - **Click on it to copy** or write it down

---

### **Step 2: Create User Profile in Database** (2 minutes)

1. In Supabase, click **"SQL Editor"** in left sidebar

2. Click **"New Query"**

3. **Paste this SQL** (replace the UUID with yours from Step 1):

```sql
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
  '002318cb-0909-4949-8ba5-d33c8650380c',  -- ← REPLACE WITH YOUR UUID FROM STEP 1
  'test@sportmap.com',
  'Test User',
  NULL,
  ARRAY[]::uuid[],
  ARRAY['Football', 'Basketball', 'Tennis'],
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  favorite_sports = EXCLUDED.favorite_sports,
  updated_at = NOW();
```

4. Click **"Run"** button (or press F5)

5. You should see: `Success. No rows returned`

---

### **Step 3: Verify It Worked** (30 seconds)

Run this query in SQL Editor:

```sql
SELECT id, email, display_name, favorite_sports 
FROM public.users 
WHERE email = 'test@sportmap.com';
```

You should see your test user with the data!

---

### **Step 4: Disable Email Confirmation** (1 minute)

1. In Supabase, click **"Authentication"** in left sidebar

2. Click **"Providers"** tab

3. Find **"Email"** in the list and click it    

4. **Uncheck** the box that says **"Confirm email"**

5. Click **"Save"** at the bottom

---

### **Step 5: Test Login in Your App** (1 minute)

1. Start your app:
   ```bash
   cd /home/hubi/SportMap/miliony
   npx expo start
   ```

2. Open in Expo Go on your phone

3. Try to log in:
   ```
   Email: test@sportmap.com
   Password: Test123456
   ```

4. **If it works → YOU'RE DONE! 🎉**

---

## 🆘 TROUBLESHOOTING

### Error: "User already exists"

You already created the auth user! Just skip to Step 2 and use the existing user ID.

To find the existing user ID:
1. Go to Authentication > Users
2. Find `test@sportmap.com` in the list
3. Click to copy the ID

---

### Error: "Column does not exist"

Make sure you're using the updated SQL from this file, not the old one.
The correct columns are:
- `display_name` (not `full_name`)
- `favorite_sports` (not `sports_interests`)

---

### Error: "Invalid login credentials"

**Option A:** Disable email confirmation (Step 4)

**Option B:** Check if you created the profile in `public.users` table (Step 2)

**Option C:** Reset the user's password:
1. Go to Authentication > Users
2. Find your test user
3. Click the menu (•••)
4. Click "Reset Password"
5. Set new password: `Test123456`

---

### Can't find the user in the database?

Run this to check:
```sql
-- Check auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test@sportmap.com';

-- Check public.users
SELECT id, email, display_name 
FROM public.users 
WHERE email = 'test@sportmap.com';
```

If user exists in `auth.users` but not in `public.users`, run Step 2 again.

---

## 🎯 ALTERNATIVE: Use Existing User

I can see you already have users in your database (from the screenshot).

### **Option 1: Use hubi@pl**

You already have this user! Just add the profile:

```sql
-- Check if user exists in auth
SELECT id FROM auth.users WHERE email = 'hubi@pl';

-- Then create/update profile (use the ID from above)
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
  '06a4ae9e-2f99-4d16-8f2f-56bbba4b96b2',  -- Use actual ID
  'hubi@pl',
  'Hubi',
  NULL,
  ARRAY[]::uuid[],
  ARRAY['Football', 'Basketball'],
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  favorite_sports = EXCLUDED.favorite_sports,
  updated_at = NOW();
```

Then log in with your existing password!

---

## ✅ SUCCESS CHECKLIST

- [ ] User exists in `auth.users` table
- [ ] User exists in `public.users` table
- [ ] Both tables have the **same UUID**
- [ ] Email confirmation is disabled
- [ ] Can log in to the app

**When all checked → Your backend is working! 🚀**

---

## 📋 Your Login Credentials

```
Email: test@sportmap.com
Password: Test123456
```

**Write these down!** You'll need them to test your app.

---

## ⏭️ NEXT STEPS

Once login works:

1. **Test event creation:**
   - Go to Map screen
   - Try to create an event
   - Check if it appears in database

2. **Test real-time features:**
   - Open app on two devices
   - Create event on device 1
   - See if it appears on device 2

3. **Start UI polish:**
   - Follow `QUICK_START_CHECKLIST.md`
   - Make screens consistent

---

**Need help? Check the main guide: `UI_COMPLETION_AND_DEPLOYMENT_GUIDE.md`**

