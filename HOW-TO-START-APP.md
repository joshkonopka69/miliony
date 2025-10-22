# How to Start the Expo App

## Quick Start (Option 1 - Easiest)

Simply run:
```powershell
.\START-APP.ps1
```

This will automatically:
- Find your WiFi IP address (`192.168.0.188`)
- Configure environment variables
- Start Expo with the correct network settings
- Display a QR code to scan

## Quick Start (Option 2 - Manual)

If the script doesn't work, use this command directly:
```powershell
$env:EXPO_NO_DOCTOR="1"; $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.0.188"; npx expo start --lan
```

## Requirements

1. **Same WiFi Network**: Your phone and PC must be connected to the **same WiFi network**
2. **Expo Go App**: Install "Expo Go" app on your phone from:
   - iOS: App Store
   - Android: Google Play Store

## Troubleshooting

### If the app won't connect:

1. **Check WiFi Connection**
   - Ensure phone and PC are on the SAME WiFi
   - Not mobile data, not different networks

2. **Windows Firewall**
   - The script should configure this automatically
   - If it fails, run PowerShell as Administrator

3. **Norton 360 Antivirus**
   - If Norton is blocking connections, temporarily disable it:
   - Right-click Norton icon → "Disable Auto-Protect" → 15 minutes

### Manual Connection

If the QR code doesn't work, manually enter in Expo Go app:
```
exp://192.168.0.188:8081
```
(Replace with your actual PC IP if different)

## What Was Fixed

### The Problem
- Expo was binding to `192.168.56.1` (VirtualBox virtual adapter) instead of the real WiFi IP
- This caused timeout errors when the phone tried to connect
- Norton 360 was blocking tunnel services (ngrok, localtunnel)

### The Solution
- Identify the real WiFi IP: `192.168.0.188`
- Set environment variable: `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.188`
- Use `--lan` mode for direct WiFi connection (no tunnels needed)
- Configure Windows Firewall to allow Node.js and port 8081

## Alternative: Tunnel Mode (Not Recommended)

Tunnel mode is **not recommended** because:
- Norton 360 blocks ngrok and localtunnel domains
- Slower and less reliable than direct WiFi
- Requires additional configuration

Only use if you absolutely need to connect from a different network.

---

## 🗺️ MapScreen Setup (Important!)

**Before using the MapScreen, you need Google API keys:**

### Quick Setup:
1. **Get API keys** from https://console.cloud.google.com/
2. **Add to `.env` file:**
   ```bash
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
   ```
3. **Restart Expo:**
   ```powershell
   npx expo start --clear
   ```

### Detailed Instructions:
- 📘 See: `START_HERE_MAPSCREEN.md` - Complete setup guide
- 📗 See: `API_KEYS_NEEDED.md` - API keys reference
- 📕 See: `MAPSCREEN_SETUP_MANUAL.md` - Full manual

**Without these API keys, the MapScreen won't work!**

