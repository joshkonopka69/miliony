# 🗺️ Google Maps API Setup Guide

## Quick Setup Steps

### 1. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS** (if targeting iOS)
   - **Places API** (for search functionality)

4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Configure for Development

#### For Expo Development (Current Setup)
Add to your `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
      }
    }
  }
}
```

#### For Production Builds
You'll need to configure native Android/iOS files as described in `MAPS_SETUP.md`

### 3. Test Your Setup

1. Add your API key to `app.json`
2. Run `npx expo start`
3. Open the Map screen in your app
4. You should see a real Google Map with sports location markers

### 4. Security Best Practices

- **Restrict your API key** to your app's package name
- **Set usage quotas** to prevent unexpected charges
- **Use different keys** for development and production
- **Monitor usage** in Google Cloud Console

### 5. Cost Management

- **Free tier**: $200 credit per month
- **Maps SDK**: $7 per 1,000 requests
- **Places API**: $32 per 1,000 requests

For development and small apps, the free tier is usually sufficient.

## Current Status

✅ **InteractiveMap component** - Ready with real map functionality
✅ **Sports location markers** - 6 different sports facilities
✅ **Location permissions** - Android and iOS support
✅ **Search integration** - Filters markers by sport/name
⏳ **Google Maps API key** - Needs to be configured

## Next Steps

1. Get your Google Maps API key
2. Add it to `app.json`
3. Test the map functionality
4. Customize markers and add more locations

Your map is ready to go! 🚀



