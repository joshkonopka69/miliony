# Supabase Email Templates for SportsMap

Copy the HTML from each section and paste into Supabase Dashboard > Authentication > Email Templates.

---

## 1. Confirm Signup

**Subject:** `Confirm your SportsMap account | Potwierdź swoje konto SportsMap`

**Message Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Account - SportsMap</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F5F0;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #FEFEFE; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 2px solid #FDB924;">
                    <!-- Gold top bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Header with logos -->
                    <tr>
                        <td align="center" style="background-color: #FEFDFB; padding: 45px 20px 35px 20px; border-bottom: 2px solid #FDB924;">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo.png" alt="SM" width="100" height="100" style="display: block; border: 0; border-radius: 20px; box-shadow: 0 6px 16px rgba(0,0,0,0.12);">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo_text.png" alt="SportsMap" width="200" style="display: block; border: 0; margin-top: 0;">
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px 40px 40px; text-align: center; background-color: #ffffff;">
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px;">Welcome to the Community!</h1>
                            <p style="font-size: 16px; color: #4B5563; margin: 0 0 24px 0; line-height: 1.6;">
                                Thanks for joining <strong style="color: #111827;">SportsMap</strong>. 
                                Discover nearby sports events, join games, and meet other athletes in your area.
                            </p>
                            <p style="font-size: 16px; color: #4B5563; margin: 0 0 28px 0;">Please click the button below to verify your email:</p>
                            
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 42px; background-color: #FDB924; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(253, 185, 36, 0.4); border: 2px solid #E5A520;">Confirm Account</a>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Polish section -->
                    <tr>
                        <td style="padding: 28px 40px; background-color: #FFFBF0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 2px solid #FDB924;">
                                <tr>
                                    <td style="padding: 22px 26px;">
                                        <h2 style="font-size: 18px; color: #111827; margin: 0 0 10px 0; font-weight: 700;">Witamy w społeczności!</h2>
                                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 12px 0; line-height: 1.5;">
                                            Dziękujemy za dołączenie do <strong>SportsMap</strong>. 
                                            Odkrywaj wydarzenia sportowe w Twojej okolicy.
                                        </p>
                                        <a href="{{ .ConfirmationURL }}" style="color: #D4960F; font-weight: 700; text-decoration: none; font-size: 14px;">Potwierdź konto →</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Note -->
                    <tr>
                        <td style="padding: 0 40px 28px 40px; background-color: #FFFBF0;">
                            <p style="font-size: 13px; color: #9CA3AF; margin: 0; text-align: center;">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center; font-size: 13px; color: #6B7280; background-color: #FEFDFB;">
                            <span style="color: #FDB924; font-size: 16px;">●</span> © 2026 SportsMap. All rights reserved.<br>
                            The best way to find your next game.
                        </td>
                    </tr>
                    <!-- Gold bottom bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 2. Reset Password

**Subject:** `Reset your SportsMap password | Zresetuj hasło SportsMap`

**Message Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - SportsMap</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F5F0;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #FEFEFE; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 2px solid #FDB924;">
                    <!-- Gold top bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Header with logos -->
                    <tr>
                        <td align="center" style="background-color: #FEFDFB; padding: 45px 20px 35px 20px; border-bottom: 2px solid #FDB924;">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo.png" alt="SM" width="100" height="100" style="display: block; border: 0; border-radius: 20px; box-shadow: 0 6px 16px rgba(0,0,0,0.12);">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo_text.png" alt="SportsMap" width="200" style="display: block; border: 0; margin-top: 0;">
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px 40px 40px; text-align: center; background-color: #ffffff;">
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px;">Reset Your Password</h1>
                            <p style="font-size: 16px; color: #4B5563; margin: 0 0 24px 0; line-height: 1.6;">
                                We received a request to reset the password for your <strong style="color: #111827;">SportsMap</strong> account. 
                                If you didn't request this, you can safely ignore this email.
                            </p>
                            
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 42px; background-color: #FDB924; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(253, 185, 36, 0.4); border: 2px solid #E5A520;">Reset Password</a>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Polish section -->
                    <tr>
                        <td style="padding: 28px 40px; background-color: #FFFBF0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 2px solid #FDB924;">
                                <tr>
                                    <td style="padding: 22px 26px;">
                                        <h2 style="font-size: 18px; color: #111827; margin: 0 0 10px 0; font-weight: 700;">Zresetuj swoje hasło</h2>
                                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 12px 0; line-height: 1.5;">
                                            Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta <strong>SportsMap</strong>.
                                        </p>
                                        <a href="{{ .ConfirmationURL }}" style="color: #D4960F; font-weight: 700; text-decoration: none; font-size: 14px;">Zresetuj hasło →</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Note -->
                    <tr>
                        <td style="padding: 0 40px 28px 40px; background-color: #FFFBF0;">
                            <p style="font-size: 13px; color: #9CA3AF; margin: 0; text-align: center;">
                                The link will expire shortly for security reasons.
                            </p>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center; font-size: 13px; color: #6B7280; background-color: #FEFDFB;">
                            <span style="color: #FDB924; font-size: 16px;">●</span> © 2026 SportsMap. All rights reserved.<br>
                            The best way to find your next game.
                        </td>
                    </tr>
                    <!-- Gold bottom bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 3. Magic Link

**Subject:** `Your SportsMap login link | Twój link do logowania SportsMap`

**Message Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - SportsMap</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F5F0;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #FEFEFE; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 2px solid #FDB924;">
                    <!-- Gold top bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Header with logos -->
                    <tr>
                        <td align="center" style="background-color: #FEFDFB; padding: 45px 20px 35px 20px; border-bottom: 2px solid #FDB924;">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo.png" alt="SM" width="100" height="100" style="display: block; border: 0; border-radius: 20px; box-shadow: 0 6px 16px rgba(0,0,0,0.12);">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo_text.png" alt="SportsMap" width="200" style="display: block; border: 0; margin-top: 0;">
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px 40px 40px; text-align: center; background-color: #ffffff;">
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px;">Sign In to SportsMap</h1>
                            <p style="font-size: 16px; color: #4B5563; margin: 0 0 24px 0; line-height: 1.6;">
                                Click the button below to securely sign in to your <strong style="color: #111827;">SportsMap</strong> account. No password needed!
                            </p>
                            
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 42px; background-color: #FDB924; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(253, 185, 36, 0.4); border: 2px solid #E5A520;">Sign In</a>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Polish section -->
                    <tr>
                        <td style="padding: 28px 40px; background-color: #FFFBF0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 2px solid #FDB924;">
                                <tr>
                                    <td style="padding: 22px 26px;">
                                        <h2 style="font-size: 18px; color: #111827; margin: 0 0 10px 0; font-weight: 700;">Zaloguj się do SportsMap</h2>
                                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 12px 0; line-height: 1.5;">
                                            Kliknij poniższy przycisk, aby bezpiecznie zalogować się do swojego konta.
                                        </p>
                                        <a href="{{ .ConfirmationURL }}" style="color: #D4960F; font-weight: 700; text-decoration: none; font-size: 14px;">Zaloguj się →</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Note -->
                    <tr>
                        <td style="padding: 0 40px 28px 40px; background-color: #FFFBF0;">
                            <p style="font-size: 13px; color: #9CA3AF; margin: 0; text-align: center;">
                                This link will expire in 24 hours.
                            </p>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center; font-size: 13px; color: #6B7280; background-color: #FEFDFB;">
                            <span style="color: #FDB924; font-size: 16px;">●</span> © 2026 SportsMap. All rights reserved.<br>
                            The best way to find your next game.
                        </td>
                    </tr>
                    <!-- Gold bottom bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new email address | Potwierdź nowy adres e-mail`

**Message Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change - SportsMap</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F5F0;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #FEFEFE; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 2px solid #FDB924;">
                    <!-- Gold top bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Header with logos -->
                    <tr>
                        <td align="center" style="background-color: #FEFDFB; padding: 45px 20px 35px 20px; border-bottom: 2px solid #FDB924;">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo.png" alt="SM" width="100" height="100" style="display: block; border: 0; border-radius: 20px; box-shadow: 0 6px 16px rgba(0,0,0,0.12);">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo_text.png" alt="SportsMap" width="200" style="display: block; border: 0; margin-top: 0;">
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px 40px 40px; text-align: center; background-color: #ffffff;">
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px;">Confirm New Email</h1>
                            <p style="font-size: 16px; color: #4B5563; margin: 0 0 24px 0; line-height: 1.6;">
                                You requested to change the email address for your <strong style="color: #111827;">SportsMap</strong> account.
                            </p>
                            
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 42px; background-color: #FDB924; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(253, 185, 36, 0.4); border: 2px solid #E5A520;">Confirm New Email</a>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Polish section -->
                    <tr>
                        <td style="padding: 28px 40px; background-color: #FFFBF0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 2px solid #FDB924;">
                                <tr>
                                    <td style="padding: 22px 26px;">
                                        <h2 style="font-size: 18px; color: #111827; margin: 0 0 10px 0; font-weight: 700;">Potwierdź nowy adres e-mail</h2>
                                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 12px 0; line-height: 1.5;">
                                            Poprosiłeś o zmianę adresu e-mail dla Twojego konta <strong>SportsMap</strong>.
                                        </p>
                                        <a href="{{ .ConfirmationURL }}" style="color: #D4960F; font-weight: 700; text-decoration: none; font-size: 14px;">Potwierdź zmianę →</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Note -->
                    <tr>
                        <td style="padding: 0 40px 28px 40px; background-color: #FFFBF0;">
                            <p style="font-size: 13px; color: #9CA3AF; margin: 0; text-align: center;">
                                If you didn't request this change, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center; font-size: 13px; color: #6B7280; background-color: #FEFDFB;">
                            <span style="color: #FDB924; font-size: 16px;">●</span> © 2026 SportsMap. All rights reserved.<br>
                            The best way to find your next game.
                        </td>
                    </tr>
                    <!-- Gold bottom bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 5. Invite User

**Subject:** `You're invited to join SportsMap! | Zaproszenie do SportsMap!`

**Message Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited - SportsMap</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #F5F5F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F5F0;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #FEFEFE; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 2px solid #FDB924;">
                    <!-- Gold top bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Header with logos -->
                    <tr>
                        <td align="center" style="background-color: #FEFDFB; padding: 45px 20px 35px 20px; border-bottom: 2px solid #FDB924;">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo.png" alt="SM" width="100" height="100" style="display: block; border: 0; border-radius: 20px; box-shadow: 0 6px 16px rgba(0,0,0,0.12);">
                            <img src="https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/logo_text.png" alt="SportsMap" width="200" style="display: block; border: 0; margin-top: 0;">
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px 40px 40px; text-align: center; background-color: #ffffff;">
                            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.5px;">You're Invited!</h1>
                            <p style="font-size: 16px; color: #4B5563; margin: 0 0 24px 0; line-height: 1.6;">
                                Someone invited you to join <strong style="color: #111827;">SportsMap</strong> – the best way to find sports events and teammates near you.
                            </p>
                            
                            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 42px; background-color: #FDB924; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 14px rgba(253, 185, 36, 0.4); border: 2px solid #E5A520;">Accept Invitation</a>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Polish section -->
                    <tr>
                        <td style="padding: 28px 40px; background-color: #FFFBF0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 2px solid #FDB924;">
                                <tr>
                                    <td style="padding: 22px 26px;">
                                        <h2 style="font-size: 18px; color: #111827; margin: 0 0 10px 0; font-weight: 700;">Masz zaproszenie!</h2>
                                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 12px 0; line-height: 1.5;">
                                            Ktoś zaprosił Cię do <strong>SportsMap</strong> – najlepszego sposobu na znalezienie wydarzeń sportowych.
                                        </p>
                                        <a href="{{ .ConfirmationURL }}" style="color: #D4960F; font-weight: 700; text-decoration: none; font-size: 14px;">Dołącz teraz →</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Note -->
                    <tr>
                        <td style="padding: 0 40px 28px 40px; background-color: #FFFBF0;">
                            <p style="font-size: 13px; color: #9CA3AF; margin: 0; text-align: center;">
                                If you weren't expecting this invitation, you can ignore this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Gold separator -->
                    <tr>
                        <td style="background-color: #FDB924; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center; font-size: 13px; color: #6B7280; background-color: #FEFDFB;">
                            <span style="color: #FDB924; font-size: 16px;">●</span> © 2026 SportsMap. All rights reserved.<br>
                            The best way to find your next game.
                        </td>
                    </tr>
                    <!-- Gold bottom bar -->
                    <tr>
                        <td style="background-color: #FDB924; height: 8px; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```
