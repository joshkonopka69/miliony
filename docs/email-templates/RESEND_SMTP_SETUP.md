# Resend SMTP Setup for SportsMap

Complete guide to set up Resend as your custom SMTP provider for Supabase emails.

---

## 🏆 Why Resend?

| Feature | Resend | SendGrid | Mailgun |
|---------|--------|----------|---------|
| Supabase Integration | ⭐ One-click | Manual | Manual |
| Free Tier | 3,000/month | 100/day (60 days) | 100/day |
| Price (50k emails) | $20/month | $20/month | $35/month |
| Deliverability | Excellent | Good | Excellent |
| Setup Difficulty | Easy | Medium | Medium |

---

## 📋 Prerequisites

- A domain you own (e.g., `sportsmap.app` or `yourdomain.com`)
- Access to your domain's DNS settings
- Supabase project dashboard access

---

## 🚀 STEP 1: Create Resend Account

### 1.1 Sign Up
1. Go to: https://resend.com/signup
2. Sign up with your email or GitHub account
3. Verify your email address

### 1.2 Get Your API Key
1. After signing in, go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it: `SportsMap Production`
4. Permission: **Full access**
5. Click **"Add"**
6. **⚠️ COPY THE API KEY NOW** - You won't see it again!

Save it somewhere safe:
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🌐 STEP 2: Add & Verify Your Domain

### 2.1 Add Domain
1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `sportsmap.app` (or your domain)
4. Click **"Add"**

### 2.2 Add DNS Records
Resend will show you DNS records to add. You need to add these to your domain's DNS settings.

**Go to your domain registrar** (e.g., GoDaddy, Cloudflare, Namecheap) and add:

#### Record 1: SPF (TXT Record)
| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | @ | `v=spf1 include:_spf.resend.com ~all` |

#### Record 2: DKIM (TXT Record)
| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | resend._domainkey | (Resend will provide this long value) |

#### Record 3: DMARC (TXT Record) - Optional but recommended
| Type | Host/Name | Value |
|------|-----------|-------|
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com` |

### 2.3 Verify Domain
1. After adding DNS records, wait 5-15 minutes
2. Go back to Resend Domains page
3. Click **"Verify"** next to your domain
4. Status should change to **"Verified"** ✅

> **Note:** DNS propagation can take up to 24-48 hours in some cases

---

## ⚙️ STEP 3: Configure Supabase SMTP

### 3.1 Get Resend SMTP Credentials
Resend SMTP settings are:

| Setting | Value |
|---------|-------|
| **SMTP Host** | `smtp.resend.com` |
| **Port** | `465` (SSL) or `587` (TLS) |
| **Username** | `resend` |
| **Password** | Your API key (`re_xxxxxxx...`) |

### 3.2 Configure in Supabase Dashboard
1. Go to your Supabase project
2. Navigate to: **Project Settings** → **Authentication**
3. Scroll down to **SMTP Settings**
4. Toggle **"Enable Custom SMTP"** ON

### 3.3 Enter SMTP Settings
Fill in these values:

| Field | Value |
|-------|-------|
| **Sender email** | `noreply@sportsmap.app` (or your domain) |
| **Sender name** | `SportsMap` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Minimum interval** | `0` (no delay between emails) |
| **Username** | `resend` |
| **Password** | Your Resend API key |

### 3.4 Save Configuration
Click **"Save"** at the bottom of the page.

---

## ✉️ STEP 4: Test Email Delivery

### 4.1 Send Test Email
1. In Supabase, go to **Authentication** → **Users**
2. Click **"Invite user"** or **"Add user"**
3. Enter a test email address you have access to
4. Click **"Invite"**

### 4.2 Check Delivery
1. Check your test email inbox
2. Verify the email arrived (not in spam)
3. Check the "From" address shows your domain

### 4.3 Check Resend Dashboard
1. Go to: https://resend.com/emails
2. You should see the email in your logs
3. Status should be **"Delivered"** ✅

---

## 📊 STEP 5: Monitor & Verify

### 5.1 Resend Dashboard
Monitor all your email statistics at: https://resend.com/overview
- Delivery rates
- Bounce rates
- Open rates (if enabled)

### 5.2 Email Logs
View individual emails at: https://resend.com/emails
- See delivery status
- Debug any failures

---

## 🔧 Troubleshooting

### Email not sending?
1. Verify SMTP credentials are correct
2. Check Resend API key is valid
3. Ensure domain is verified

### Email going to spam?
1. Verify DNS records (SPF, DKIM, DMARC)
2. Make sure you're using your verified domain
3. Check email content isn't triggering spam filters

### Domain not verifying?
1. DNS records can take 24-48 hours to propagate
2. Double-check record values match exactly
3. Use https://mxtoolbox.com to verify DNS

---

## 💰 Pricing Reference

| Plan | Emails/Month | Price |
|------|-------------|-------|
| Free | 3,000 | $0 |
| Pro | 50,000 | $20/month |
| Scale | 100,000 | $90/month |
| Enterprise | Unlimited | Custom |

For a new app, the **Free tier** (3,000 emails/month) is plenty to start!

---

## ✅ Final Checklist

- [ ] Created Resend account
- [ ] Generated API key (saved securely)
- [ ] Added domain to Resend
- [ ] Added SPF DNS record
- [ ] Added DKIM DNS record
- [ ] Domain verified in Resend
- [ ] SMTP configured in Supabase
- [ ] Test email sent successfully
- [ ] Email arrived in inbox (not spam)

---

## 📝 Quick Reference

**Resend SMTP Settings:**
```
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Your API Key]
```

**Sender Email Format:**
```
noreply@yourdomain.com
```

---

*Last Updated: 2026-01-29*
