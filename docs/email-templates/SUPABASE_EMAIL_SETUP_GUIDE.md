# Supabase Email Setup Guide for SportsMap

Complete step-by-step guide to configure Supabase email templates with deep linking.

---

## 📋 Prerequisites

- Access to Supabase Dashboard
- SportsMap app code (already configured)
- Your Supabase Project URL: `https://ujfeqshqhlplmolfrlvc.supabase.co`

---

## 🔧 STEP 1: Configure URL Settings in Supabase

### 1.1 Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/ujfeqshqhlplmolfrlvc

### 1.2 Navigate to URL Configuration
**Path:** `Authentication` → `URL Configuration`

### 1.3 Set Site URL
```
SportsMap://
```
> This is your app's custom URL scheme registered in your app configuration.

### 1.4 Add Redirect URLs (PRODUCTION)
Click "Add URL" and add each of these **one by one**:

| # | Redirect URL | Purpose |
|---|--------------|---------|
| 1 | `SportsMap://` | Base app deep link |
| 2 | `SportsMap://reset-password` | Password reset completion |
| 3 | `SportsMap://auth/callback` | OAuth sign-in (Google/Apple) |
| 4 | `SportsMap://welcome` | Post email-confirmation redirect |
| 5 | `SportsMap://map` | Main app after successful auth |

> **⚠️ Important:** These are the ONLY redirect URLs needed for production. Do not add localhost or exp:// URLs.

### 1.5 Save Changes
Click **Save** at the bottom of the page.

---

## 📧 STEP 2: Configure Email Templates

### 2.1 Navigate to Email Templates
**Path:** `Authentication` → `Email Templates`

### 2.2 Update Each Template

For each template below, you need to:
1. Select the template
2. Change the **Subject** line
3. Paste the **Message Body** HTML
4. Click **Save**

---

### Template 1: Confirm Signup

**Subject:**
```
Confirm your SportsMap account | Potwierdź swoje konto SportsMap
```

**Message Body:** Copy from `SUPABASE_EMAIL_TEMPLATES.md` → Section "1. Confirm Signup" → the HTML inside the ```html block.

---

### Template 2: Reset Password

**Subject:**
```
Reset your SportsMap password | Zresetuj hasło SportsMap
```

**Message Body:** Copy from `SUPABASE_EMAIL_TEMPLATES.md` → Section "2. Reset Password" → the HTML inside the ```html block.

---

### Template 3: Magic Link

**Subject:**
```
Your SportsMap login link | Twój link do logowania SportsMap
```

**Message Body:** Copy from `SUPABASE_EMAIL_TEMPLATES.md` → Section "3. Magic Link" → the HTML inside the ```html block.

---

### Template 4: Change Email Address

**Subject:**
```
Confirm your new email | Potwierdź nowy adres e-mail
```

**Message Body:** Copy from `SUPABASE_EMAIL_TEMPLATES.md` → Section "4. Change Email Address" → the HTML inside the ```html block.

---

### Template 5: Invite User

**Subject:**
```
You're invited to join SportsMap! | Zaproszenie do SportsMap!
```

**Message Body:** Copy from `SUPABASE_EMAIL_TEMPLATES.md` → Section "5. Invite User" → the HTML inside the ```html block.

---

## ⚡ STEP 3: Configure Email Rate Limits (Optional)

### 3.1 Navigate to Rate Limits
**Path:** `Authentication` → `Rate Limits`

### 3.2 Recommended Settings for Development
| Setting | Value |
|---------|-------|
| Email rate limit | 10 per hour |
| SMS rate limit | 5 per hour |

> **Note:** You hit rate limits earlier. Wait 1 hour or use different email addresses for testing.

---

## 🔐 STEP 4: Verify SMTP Settings (If using custom SMTP)

### 4.1 Navigate to SMTP Settings
**Path:** `Project Settings` → `Auth` → `SMTP Settings`

### 4.2 Default Behavior
By default, Supabase uses its built-in email service. This works fine for testing.

### 4.3 For Production (Recommended)
Consider setting up custom SMTP with:
- SendGrid
- Mailgun
- AWS SES
- Resend

---

## 📱 STEP 5: Test Each Email Function

### 5.1 Test Confirm Signup
1. Open app → Go to Register screen
2. Create new account with a real email
3. Check email inbox for confirmation email
4. Click "Confirm Account" button
5. ✅ App should open and show welcome/map screen

### 5.2 Test Reset Password
1. Open app → Go to Auth screen
2. Click "Forgot Password?"
3. Enter email address
4. Check email inbox for reset email
5. Click "Reset Password" button
6. ✅ App should open ResetPasswordScreen
7. Enter new password and save

### 5.3 Test Magic Link
1. Use Supabase Dashboard → Authentication → Users
2. Click on a user → Send magic link
3. Check email inbox
4. Click the magic link
5. ✅ App should open and user should be logged in

---

## 🚨 Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Verify email address is correct
3. Check rate limits (might be exceeded)
4. Wait and try again

### Link opens in browser instead of app?
1. Make sure app is installed on device (not just Expo Go)
2. Verify URL scheme is registered in app.json/app.config.js
3. On iOS: Might need to rebuild app after changing scheme
4. On Android: Check AndroidManifest.xml for intent filters

### "Invalid redirect URL" error?
1. Go to Authentication → URL Configuration
2. Add the exact redirect URL shown in the error
3. Save and try again

### Password reset not working?
1. Make sure user clicked link on same device as app
2. Check console logs for "Deep link received" message
3. Verify session is being set (check AuthContext state)

---

## 📝 Code Reference

### App Deep Link Handler
**File:** `App.tsx`
- Listens for incoming URLs
- Extracts auth tokens from URL hash
- Sets Supabase session automatically

### Navigation Deep Links  
**File:** `src/navigation/linking.ts`
- URL scheme: `SportsMap://`
- Routes mapped to screens

### Auth Functions
**File:** `src/services/backendService.ts`
- `sendPasswordReset()` → Uses `redirectTo: 'SportsMap://reset-password'`
- `signInWithGoogle()` → Uses `redirectTo: 'SportsMap://auth/callback'`

---

## ✅ Checklist

- [ ] Site URL set to `SportsMap://`
- [ ] All 7 redirect URLs added
- [ ] Confirm Signup template updated
- [ ] Reset Password template updated
- [ ] Magic Link template updated
- [ ] Change Email template updated
- [ ] Invite User template updated
- [ ] Tested email confirmation
- [ ] Tested password reset
- [ ] Tested magic link login

---

## 🎯 Quick Reference: Production Redirect URLs

Copy-paste these into Supabase → Authentication → URL Configuration → Redirect URLs:

```
SportsMap://
SportsMap://reset-password
SportsMap://auth/callback
SportsMap://welcome
SportsMap://map
```

---

*Last Updated: 2026-01-28*
