# 🔧 COMPLETE FIX - Step by Step

## ⚠️ IMPORTANT: Follow these steps IN ORDER

---

## 📋 **STEP 1: Run Diagnostic (Check Current State)**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `CHECK-POLICIES.sql` to see current policies
3. Run `CHECK-TABLE-STRUCTURE.sql` to verify table structure
4. **Send me the results** so I can see what's wrong

---

## 🔨 **STEP 2: Fix Database Policies**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `ULTIMATE-RLS-FIX.sql`
3. **Copy the ENTIRE file** and paste into SQL Editor
4. Click **"Run"**
5. You should see: ✅ `DATABASE POLICIES COMPLETE!`

---

## 🖼️ **STEP 3: Fix Storage Policies (Manual via UI)**

### A. Delete Old Storage Policies First

1. Go to **Storage** → **Policies** (left sidebar)
2. Click on **"avatars"** bucket
3. **Delete ALL existing policies** (click the trash icon on each one)

### B. Create 4 New Storage Policies

For each of the 4 policies below, do this:

1. Click **"New Policy"**
2. Click **"Create a policy from scratch"**
3. Fill in the details from each policy below
4. Click **"Review"** → **"Save Policy"**

---

#### **POLICY 1: SELECT (View avatars)**

- **Policy Name:** `allow_select_own_avatar`
- **Allowed operation:** `SELECT`
- **Target roles:** `authenticated`
- **USING expression:**
  ```
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

#### **POLICY 2: INSERT (Upload avatars)**

- **Policy Name:** `allow_insert_own_avatar`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **WITH CHECK expression:**
  ```
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

#### **POLICY 3: UPDATE (Update avatars)**

- **Policy Name:** `allow_update_own_avatar`
- **Allowed operation:** `UPDATE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- **WITH CHECK expression:**
  ```
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

#### **POLICY 4: DELETE (Delete avatars)**

- **Policy Name:** `allow_delete_own_avatar`
- **Allowed operation:** `DELETE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

---

## 🧪 **STEP 4: Test in Your App**

1. **Restart your app:**
   ```powershell
   cd miliony
   .\START-APP.ps1
   ```

2. **Test Profile Photo:**
   - Go to Profile Screen
   - Upload a photo
   - Navigate away and come back
   - ✅ Photo should persist

3. **Test Add Friend:**
   - Go to Add Friend Screen
   - Search for a user
   - Click "Add Friend"
   - ✅ Should see "Pending" status

4. **Send me the logs** if it still doesn't work

---

## 🆘 **If Still Not Working:**

Run `CHECK-POLICIES.sql` again and send me:
1. The complete output
2. Any error messages from the app console
3. Screenshots of your Storage Policies page

---

## 📝 **Quick Reference - The Expression to Copy:**

For all storage policies (both USING and WITH CHECK):
```
bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```

Just copy this one line and use it everywhere! ✅

