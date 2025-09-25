# 🚀 Expo Testing Guide for SportMap

## 📱 **How to Start and Test Your App**

### **Step 1: Start Expo Development Server**
```bash
cd /home/hubi/SportMap/miliony
npm start
```

This will start the Expo development server and show you a QR code.

### **Step 2: Run on Your Device**

#### **Option A: Expo Go App (Recommended)**
1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code** with your phone camera (iOS) or Expo Go app (Android)

3. **Your app will load** on your phone

#### **Option B: iOS Simulator (Mac only)**
```bash
npm run ios
```

#### **Option C: Android Emulator**
```bash
npm run android
```

#### **Option D: Web Browser**
```bash
npm run web
```

## 🧪 **Testing the Event Features**

### **Step 1: Access the Test Screen**
1. **Open your app** (should show welcome screen)
2. **Tap "🧪 Test Events & Chat"** button
3. **You'll see the Event Test Screen**

### **Step 2: Test Event Creation**
1. **Fill in the form:**
   - Event Name: "Morning Football"
   - Activity: "Football"
   - Description: "Weekly football game"
   - Max Participants: 10

2. **Tap "Create Event"**
3. **Check if event appears** in the events list

### **Step 3: Test Real-time Features**
1. **Check connection status** (should show "✅ Connected")
2. **Create an event** and see it in "Live Events"
3. **Test joining/leaving** events
4. **Test messaging** by tapping "Chat" on an event

## 👥 **Testing with Your Friend**

### **Method 1: Same Expo Session**
1. **You start the app** on your phone
2. **Your friend scans the same QR code** with their phone
3. **Both devices** will run the same app
4. **Test events and messaging** together

### **Method 2: Share Your Project**
1. **Share your project folder** with your friend
2. **Friend runs** `npm start` on their device
3. **Both use the same** `.env` file with API keys
4. **Test real-time features** between devices

### **Method 3: Deploy to Expo (Advanced)**
1. **Publish your app** to Expo:
   ```bash
   npx expo publish
   ```
2. **Share the link** with your friend
3. **Both can test** the published version

## 🔧 **Troubleshooting Expo Issues**

### **Issue: "Metro bundler failed to start"**
**Solution:**
```bash
# Clear Metro cache
npx expo start --clear
```

### **Issue: "Cannot connect to Expo"**
**Solution:**
1. Make sure you're on the same WiFi network
2. Try using tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

### **Issue: "App crashes on startup"**
**Solution:**
1. Check console for errors
2. Verify all dependencies are installed:
   ```bash
   npm install
   ```
3. Check your `.env` file has correct API keys

### **Issue: "Firebase connection failed"**
**Solution:**
1. Verify Firebase credentials in `.env`
2. Check Firebase project is active
3. Ensure Firestore is enabled

## 📊 **Testing Checklist**

### **✅ Basic App Functionality:**
- [ ] App starts without errors
- [ ] Welcome screen loads
- [ ] Test screen accessible
- [ ] No console errors

### **✅ Database Connections:**
- [ ] Supabase connection works
- [ ] Firebase connection works
- [ ] API keys are correct
- [ ] No authentication errors

### **✅ Event Features:**
- [ ] Create events successfully
- [ ] Events appear in list
- [ ] Join/leave events works
- [ ] Participant counts update

### **✅ Real-time Features:**
- [ ] Live events update in real-time
- [ ] Messages send and receive
- [ ] Real-time subscriptions work
- [ ] No connection timeouts

### **✅ Multi-device Testing:**
- [ ] Both devices can create events
- [ ] Events sync between devices
- [ ] Messages appear on both devices
- [ ] Real-time updates work across devices

## 🎯 **Testing Scenarios**

### **Scenario 1: Single Device Testing**
1. **Create an event** on your phone
2. **Join the event** (simulate being another user)
3. **Send messages** to yourself
4. **Test all features** work locally

### **Scenario 2: Two Device Testing**
1. **You create an event** on your phone
2. **Friend joins the event** on their phone
3. **Both send messages** in the chat
4. **Test real-time synchronization**

### **Scenario 3: Network Testing**
1. **Test on different WiFi networks**
2. **Test with mobile data**
3. **Test with poor connection**
4. **Verify offline/online behavior**

## 🚀 **Advanced Testing**

### **Test with Multiple Friends:**
1. **Create a group event** with 5+ participants
2. **Test messaging** with multiple people
3. **Test event capacity** limits
4. **Test real-time updates** with many users

### **Test Different Sports:**
1. **Create events** for different sports
2. **Test filtering** by activity type
3. **Test location-based** event discovery
4. **Test event categories**

## 📱 **Expo-Specific Tips**

### **Development Mode:**
- **Hot reloading** works automatically
- **Console logs** appear in terminal
- **Error messages** show in app
- **Fast refresh** for quick testing

### **Production Testing:**
- **Build for production** when ready
- **Test on real devices** (not just simulators)
- **Test with different screen sizes**
- **Test with different OS versions**

### **Debugging:**
- **Use React Native Debugger** for advanced debugging
- **Check Expo logs** in terminal
- **Use Flipper** for network debugging
- **Check Firebase console** for database issues

## 🎉 **Success Indicators**

Your SportMap is working correctly when:
- ✅ **App starts** without errors
- ✅ **Test screen** loads and shows connection status
- ✅ **Events can be created** and appear in list
- ✅ **Real-time updates** work instantly
- ✅ **Messaging** works between devices
- ✅ **No console errors** or crashes

## 🚀 **Next Steps After Testing**

Once everything works:
1. **Integrate with your main map** component
2. **Add user authentication** (Firebase Auth)
3. **Implement push notifications**
4. **Add more sports and locations**
5. **Deploy to app stores**

Your SportMap is ready for real-time sports events! 🏆

## 📞 **Getting Help**

If you encounter issues:
1. **Check the Expo logs** in your terminal
2. **Verify all API keys** are correct
3. **Test each service** individually
4. **Check the setup guides** for detailed instructions

Happy testing! 🎮

