# Supabase Email Templates for SportMap

This document contains all email templates ready to paste into your Supabase Dashboard.

**Go to:** `Supabase Dashboard > Authentication > Email Templates`

---

## 1. Confirm Signup

**Subject:** `Confirm your SportMap account | Potwierdź swoje konto SportMap`

**Message Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Account - SportMap</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1F2937;
            padding: 50px 20px;
            text-align: center;
        }
        .logo-box {
            width: 80px;
            height: 80px;
            background-color: #FDB924;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 15px;
            line-height: 80px;
            font-size: 38px;
            font-weight: 800;
            color: #000000;
            text-align: center;
        }
        .app-name {
            color: #FDB924;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        h1 {
            color: #111827;
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            padding: 18px 40px;
            background-color: #FDB924;
            color: #000000 !important;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 17px;
            margin: 20px 0 30px;
            box-shadow: 0 4px 12px rgba(253, 185, 36, 0.3);
        }
        .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 30px 0;
        }
        .polish-section {
            background-color: #F3F4F6;
            padding: 24px;
            border-radius: 16px;
            margin-top: 10px;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #9CA3AF;
            background-color: #F9FAFB;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-box">Sm</div>
            <div class="app-name">SportMap</div>
        </div>
        <div class="content">
            <h1>Welcome to the Community!</h1>
            <p>
                Thanks for joining <strong>SportMap</strong>. 
                Discover nearby sports events, join games, and meet other athletes in your area.
            </p>
            <p>Please click the button below to verify your email address and activate your account:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Confirm Account</a>
            
            <div class="divider"></div>
            
            <div class="polish-section">
                <h2 style="font-size: 18px; color: #111827; margin-bottom: 8px;">Witamy w społeczności!</h2>
                <p style="font-size: 14px; margin-bottom: 12px;">
                    Dziękujemy za dołączenie do <strong>SportMap</strong>. 
                    Odkrywaj wydarzenia sportowe w Twojej okolicy i poznawaj innych sportowców.
                </p>
                <a href="{{ .ConfirmationURL }}" style="color: #FDB924; font-weight: 700; text-decoration: none; font-size: 14px;">Potwierdź konto &rarr;</a>
            </div>

            <p style="font-size: 13px; color: #9CA3AF; margin-top: 30px;">
                If you didn't create an account, you can safely ignore this email.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 SportMap. All rights reserved.<br>
            The best way to find your next game.
        </div>
    </div>
</body>
</html>
```

---

## 2. Reset Password

**Subject:** `Reset your SportMap password | Zresetuj hasło SportMap`

**Message Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - SportMap</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1F2937;
            padding: 50px 20px;
            text-align: center;
        }
        .logo-box {
            width: 80px;
            height: 80px;
            background-color: #FDB924;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 15px;
            line-height: 80px;
            font-size: 38px;
            font-weight: 800;
            color: #000000;
            text-align: center;
        }
        .app-name {
            color: #FDB924;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        h1 {
            color: #111827;
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            padding: 18px 40px;
            background-color: #FDB924;
            color: #000000 !important;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 17px;
            margin: 20px 0 30px;
            box-shadow: 0 4px 12px rgba(253, 185, 36, 0.3);
        }
        .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 30px 0;
        }
        .polish-section {
            background-color: #F3F4F6;
            padding: 24px;
            border-radius: 16px;
            margin-top: 10px;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #9CA3AF;
            background-color: #F9FAFB;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-box">Sm</div>
            <div class="app-name">SportMap</div>
        </div>
        <div class="content">
            <h1>Reset Your Password</h1>
            <p>
                We received a request to reset the password for your <strong>SportMap</strong> account. 
                If you didn't request this, you can safely ignore this email.
            </p>
            <p>To set a new password, please click the button below:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
            
            <div class="divider"></div>
            
            <div class="polish-section">
                <h2 style="font-size: 18px; color: #111827; margin-bottom: 8px;">Zresetuj swoje hasło</h2>
                <p style="font-size: 14px; margin-bottom: 12px;">
                    Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta <strong>SportMap</strong>. 
                    Jeśli to nie Ty, możesz bezpiecznie zignorować tę wiadomość.
                </p>
                <a href="{{ .ConfirmationURL }}" style="color: #FDB924; font-weight: 700; text-decoration: none; font-size: 14px;">Zresetuj hasło &rarr;</a>
            </div>

            <p style="font-size: 13px; color: #9CA3AF; margin-top: 30px;">
                The link will expire shortly for security reasons.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 SportMap. All rights reserved.<br>
            The best way to find your next game.
        </div>
    </div>
</body>
</html>
```

---

## 3. Magic Link

**Subject:** `Your SportMap login link | Twój link do logowania SportMap`

**Message Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - SportMap</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1F2937;
            padding: 50px 20px;
            text-align: center;
        }
        .logo-box {
            width: 80px;
            height: 80px;
            background-color: #FDB924;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 15px;
            line-height: 80px;
            font-size: 38px;
            font-weight: 800;
            color: #000000;
            text-align: center;
        }
        .app-name {
            color: #FDB924;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        h1 {
            color: #111827;
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            padding: 18px 40px;
            background-color: #FDB924;
            color: #000000 !important;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 17px;
            margin: 20px 0 30px;
            box-shadow: 0 4px 12px rgba(253, 185, 36, 0.3);
        }
        .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 30px 0;
        }
        .polish-section {
            background-color: #F3F4F6;
            padding: 24px;
            border-radius: 16px;
            margin-top: 10px;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #9CA3AF;
            background-color: #F9FAFB;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-box">Sm</div>
            <div class="app-name">SportMap</div>
        </div>
        <div class="content">
            <h1>Sign In to SportMap</h1>
            <p>
                Click the button below to securely sign in to your <strong>SportMap</strong> account. 
                No password needed!
            </p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Sign In</a>
            
            <div class="divider"></div>
            
            <div class="polish-section">
                <h2 style="font-size: 18px; color: #111827; margin-bottom: 8px;">Zaloguj się do SportMap</h2>
                <p style="font-size: 14px; margin-bottom: 12px;">
                    Kliknij poniższy przycisk, aby bezpiecznie zalogować się do swojego konta <strong>SportMap</strong>.
                </p>
                <a href="{{ .ConfirmationURL }}" style="color: #FDB924; font-weight: 700; text-decoration: none; font-size: 14px;">Zaloguj się &rarr;</a>
            </div>

            <p style="font-size: 13px; color: #9CA3AF; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request this, ignore this email.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 SportMap. All rights reserved.<br>
            The best way to find your next game.
        </div>
    </div>
</body>
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new email address | Potwierdź nowy adres e-mail`

**Message Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change - SportMap</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1F2937;
            padding: 50px 20px;
            text-align: center;
        }
        .logo-box {
            width: 80px;
            height: 80px;
            background-color: #FDB924;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 15px;
            line-height: 80px;
            font-size: 38px;
            font-weight: 800;
            color: #000000;
            text-align: center;
        }
        .app-name {
            color: #FDB924;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        h1 {
            color: #111827;
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            padding: 18px 40px;
            background-color: #FDB924;
            color: #000000 !important;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 17px;
            margin: 20px 0 30px;
            box-shadow: 0 4px 12px rgba(253, 185, 36, 0.3);
        }
        .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 30px 0;
        }
        .polish-section {
            background-color: #F3F4F6;
            padding: 24px;
            border-radius: 16px;
            margin-top: 10px;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #9CA3AF;
            background-color: #F9FAFB;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-box">Sm</div>
            <div class="app-name">SportMap</div>
        </div>
        <div class="content">
            <h1>Confirm New Email</h1>
            <p>
                You requested to change the email address for your <strong>SportMap</strong> account.
            </p>
            <p>Please click the button below to confirm your new email address:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>
            
            <div class="divider"></div>
            
            <div class="polish-section">
                <h2 style="font-size: 18px; color: #111827; margin-bottom: 8px;">Potwierdź nowy adres e-mail</h2>
                <p style="font-size: 14px; margin-bottom: 12px;">
                    Poprosiłeś o zmianę adresu e-mail dla Twojego konta <strong>SportMap</strong>.
                </p>
                <a href="{{ .ConfirmationURL }}" style="color: #FDB924; font-weight: 700; text-decoration: none; font-size: 14px;">Potwierdź zmianę &rarr;</a>
            </div>

            <p style="font-size: 13px; color: #9CA3AF; margin-top: 30px;">
                If you didn't request this change, please ignore this email.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 SportMap. All rights reserved.<br>
            The best way to find your next game.
        </div>
    </div>
</body>
</html>
```

---

## 5. Invite User

**Subject:** `You're invited to join SportMap! | Zaproszenie do SportMap!`

**Message Body:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited - SportMap</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #1F2937;
            padding: 50px 20px;
            text-align: center;
        }
        .logo-box {
            width: 80px;
            height: 80px;
            background-color: #FDB924;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 15px;
            line-height: 80px;
            font-size: 38px;
            font-weight: 800;
            color: #000000;
            text-align: center;
        }
        .app-name {
            color: #FDB924;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        h1 {
            color: #111827;
            font-size: 26px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            color: #4B5563;
            margin-bottom: 24px;
        }
        .button {
            display: inline-block;
            padding: 18px 40px;
            background-color: #FDB924;
            color: #000000 !important;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 17px;
            margin: 20px 0 30px;
            box-shadow: 0 4px 12px rgba(253, 185, 36, 0.3);
        }
        .divider {
            height: 1px;
            background-color: #E5E7EB;
            margin: 30px 0;
        }
        .polish-section {
            background-color: #F3F4F6;
            padding: 24px;
            border-radius: 16px;
            margin-top: 10px;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #9CA3AF;
            background-color: #F9FAFB;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-box">Sm</div>
            <div class="app-name">SportMap</div>
        </div>
        <div class="content">
            <h1>You're Invited!</h1>
            <p>
                Someone invited you to join <strong>SportMap</strong> – the best way to find sports events and teammates near you.
            </p>
            <p>Click below to accept the invitation and create your account:</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
            
            <div class="divider"></div>
            
            <div class="polish-section">
                <h2 style="font-size: 18px; color: #111827; margin-bottom: 8px;">Masz zaproszenie!</h2>
                <p style="font-size: 14px; margin-bottom: 12px;">
                    Ktoś zaprosił Cię do <strong>SportMap</strong> – najlepszego sposobu na znalezienie wydarzeń sportowych i współzawodników w Twojej okolicy.
                </p>
                <a href="{{ .ConfirmationURL }}" style="color: #FDB924; font-weight: 700; text-decoration: none; font-size: 14px;">Dołącz teraz &rarr;</a>
            </div>

            <p style="font-size: 13px; color: #9CA3AF; margin-top: 30px;">
                If you weren't expecting this invitation, you can ignore this email.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 SportMap. All rights reserved.<br>
            The best way to find your next game.
        </div>
    </div>
</body>
</html>
```

---

## How to Apply These Templates

1. **Go to your Supabase Dashboard**
2. Navigate to **Authentication** → **Email Templates**
3. For each template type:
   - Copy the **Subject** line
   - Copy the **Message Body** HTML (everything inside the code block)
   - Paste into the corresponding template in Supabase
4. **Save Changes**

> **Important:** The `{{ .ConfirmationURL }}` variable is automatically replaced by Supabase with the correct link for each email type.
