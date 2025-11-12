# ⚡ QUICKSTART - Fix RLS in 2 Steps

## The Problem
- ❌ Profile photo doesn't persist
- ❌ Friend requests fail with RLS error

## The Fix (2 Steps)

### Step 1: Fix Database (SQL)
1. Open Supabase → **SQL Editor**
2. Copy & paste contents of `FIX-DATABASE-ONLY.sql`
3. Click **Run**
4. ✅ Should see "DATABASE RLS FIXED!"

### Step 2: Fix Storage (UI)
1. Open Supabase → **Storage** → **avatars** bucket → **Policies** tab
2. **Delete all existing policies** (trash icon)
3. Click **"New Policy"** 4 times to create:

#### Policy 1: SELECT (Read)
- Operation: **SELECT**
- Target: **public**
- Policy: `bucket_id = 'avatars'`

#### Policy 2: INSERT (Upload)
- Operation: **INSERT**
- Target: **authenticated**
- Policy: `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`

#### Policy 3: UPDATE (Update)
- Operation: **UPDATE**
- Target: **authenticated**
- Policy: `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`

#### Policy 4: DELETE (Delete)
- Operation: **DELETE**
- Target: **authenticated**
- Policy: `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`

---

## ✅ Done! Now Test:
1. Restart app
2. Upload profile photo → Navigate away → Come back → Should persist ✅
3. Add friend → Should work ✅

---

## 📸 Screenshots (if needed)

### Where to find Storage Policies:
```
Supabase Dashboard
  └── Storage (left sidebar)
      └── avatars (click bucket)
          └── Policies (top tab)
              └── New Policy (button)
```

### What the policy form looks like:
```
┌─────────────────────────────────┐
│ Create new policy               │
├─────────────────────────────────┤
│ Policy name: [your choice]      │
│ Allowed operation: [SELECT]     │
│ Target roles: [public]          │
│ Policy definition: [see above]  │
│                                 │
│ [Cancel]  [Create policy]       │
└─────────────────────────────────┘
```

---

## ❓ Troubleshooting

### Can't find "New Policy" button?
- Try refreshing the page
- Make sure you're on the **Policies** tab, not Files
- Your Supabase version might differ - see `STORAGE-POLICY-INSTRUCTIONS.md` for alternatives

### "must be owner of table objects" error?
- ✅ You're doing it right! This is why we use the UI for storage
- Don't try to run storage SQL commands
- Use the Supabase Dashboard UI method above

### Friend requests still failing?
- Make sure you ran Step 1 (database SQL) first
- Check that you see your auth.uid() in the SQL output
- Restart your app completely

### Profile photo still not persisting?
- Make sure you completed Step 2 (storage policies)
- All 4 policies must be created (SELECT, INSERT, UPDATE, DELETE)
- Check that policy definitions match exactly (especially the `auth.uid()::text` part)






