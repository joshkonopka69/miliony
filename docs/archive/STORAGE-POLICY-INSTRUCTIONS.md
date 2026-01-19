# 🗄️ Storage Policies Setup (Supabase UI)

## Step 1: Run Database SQL First
1. Open Supabase Dashboard → SQL Editor
2. Run `FIX-DATABASE-ONLY.sql`
3. Verify you see ✅ success message

---

## Step 2: Fix Storage Policies in UI

### Navigate to Storage
1. Go to Supabase Dashboard
2. Click **Storage** in left sidebar
3. Click on the **avatars** bucket
4. Click the **Policies** tab at the top

### Delete All Existing Policies
- Click the **trash icon** next to each policy to delete them all
- This ensures a clean slate

### Create New Policies

#### Policy 1: Public Read (SELECT)
```
Name: Public read access for avatars
Allowed operation: SELECT
Policy definition: (bucket_id = 'avatars'::text)
Target roles: public
```

#### Policy 2: Authenticated Insert (INSERT)
```
Name: Users can upload their own avatars
Allowed operation: INSERT
Policy definition: ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))
Target roles: authenticated
```

#### Policy 3: Authenticated Update (UPDATE)
```
Name: Users can update their own avatars
Allowed operation: UPDATE
Policy definition: ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))
Target roles: authenticated
```

#### Policy 4: Authenticated Delete (DELETE)
```
Name: Users can delete their own avatars
Allowed operation: DELETE
Policy definition: ((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))
Target roles: authenticated
```

---

## Alternative: Use New Policy Button

If your Supabase UI has a "New Policy" button:

1. **Click "New Policy"**
2. **Select "Create policy from template"** or "Custom"
3. **For each operation (SELECT, INSERT, UPDATE, DELETE):**
   - Choose the operation type
   - Set target roles (public for SELECT, authenticated for others)
   - Enter the policy definition as shown above

---

## Policy Definitions Explained

- `bucket_id = 'avatars'::text` → Only applies to avatars bucket
- `(storage.foldername(name))[1]` → Gets the first folder in path (the user ID)
- `auth.uid()::text` → Current authenticated user's ID
- Combined: Users can only access files in their own folder (`avatars/USER_ID/...`)

---

## ✅ After Setup

Your storage structure will be:
```
avatars/
  └── c46dec97-bfd3-4d30-9cc8-178b1a2b66a7/  (your user ID)
      ├── 1762244241968.jpg
      └── 1762245226000.jpg
```

Only you can upload/update/delete files in YOUR folder.
Everyone can VIEW files (needed for displaying avatars in the app).

---

## 🧪 Test It

1. Restart your app
2. Upload a profile photo
3. Navigate away and back → Photo should persist ✅
4. Add a friend → Should work ✅

---

## ❓ Can't Find Storage UI?

### Method 1: Direct URL
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets/avatars
```
Replace `YOUR_PROJECT_ID` with your actual project ID from the URL.

### Method 2: Create Bucket (if missing)
1. Storage → Click "New bucket"
2. Name: `avatars`
3. Public: Yes (for viewing)
4. Then follow the steps above

---

## 🚨 If Policies UI Doesn't Match

Some Supabase versions show SQL instead of form fields. If so:

Go to Storage → avatars → Policies → Click "Add policy via SQL":

```sql
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users insert own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

But this might still give the "must be owner" error. The UI method is safer.










