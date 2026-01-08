# 🐛 Known Issues & Bugs - SportMap App
**Last Updated:** January 7, 2026

---

## 📊 Summary

| Category | Critical | Important | Minor |
|----------|----------|-----------|-------|
| API/Security | 0 | 2 | 3 |
| Features | 0 | 3 | 5 |
| UI/UX | 0 | 1 | 2 |
| **Total** | **0** | **6** | **10** |

---

## ✅ Recently Fixed

### ~~Participant Count Shows 0~~
**Status:** ✅ FIXED (January 7, 2026)

The `participants_count` field was not updating when users joined/left events. Now fixed in `src/services/supabase.ts`:
- `fetchEventsAtLocation` now queries `event_participants` table to get real count
- `joinEvent` and `leaveEvent` now update the `participants_count` field

---

## ⚠️ Important Issues (Should Fix Soon)

### 1. Hardcoded API Keys in Source Code
**Severity:** ⚠️ Important (Security)
**Files Affected:**
- `src/screens/MapScreen.tsx` (lines 320, 329)
- `src/services/placesApi.ts` (line 674)
- `src/components/GoogleMapsView.tsx` (line 96)
- `src/screens/MyPlaceDetailsScreen.tsx` (line 10)
- `src/config/firebase.ts` (lines 18-23)

**Issue:** API keys are hardcoded as fallback values in the code. While environment variables are checked first, having keys in source code is a security risk.

**Recommendation:** Remove hardcoded fallbacks and ensure all keys come from `.env` only.

---

### 2. MyEventsScreen Uses Mock Data
**Severity:** ⚠️ Important (Feature Not Working)
**File:** `src/screens/MyEventsScreen.tsx` (lines 37-172)

**Issue:** The screen displays hardcoded mock data instead of fetching real events from Supabase.

**Current Code:**
```typescript
// TODO: Replace with actual API call
// const fetchedEvents = await eventService.getMyEvents();

// Mock data for demonstration
const mockEvents: MyEvent[] = [...]
```

**Fix Needed:** Replace mock data with `supabaseService.getUserEvents(userId)`

---

### 3. Leave Event API Not Connected
**Severity:** ⚠️ Important (Feature Not Working)
**File:** `src/screens/MyEventsScreen.tsx` (line 209)

**Issue:** The "Leave Event" button only removes the event from local state, doesn't call the API.

**Current Code:**
```typescript
// TODO: Call API to leave event
setEvents(prev => prev.filter(e => e.id !== event.id));
```

**Fix Needed:** Call `supabaseService.leaveEvent(eventId, userId)` before updating local state.

---

### 4. FCM Navigation Not Implemented
**Severity:** ⚠️ Important (Feature Incomplete)
**File:** `src/services/fcmService.ts` (line 318)

**Issue:** When a push notification is tapped, the app doesn't navigate to the relevant screen.

**Current Code:**
```typescript
// TODO: Implement navigation logic
```

---

### 5. Block User Feature Not Implemented
**Severity:** ⚠️ Important (Feature Missing)
**File:** `src/screens/FriendsListScreen.tsx` (line 126)

**Issue:** The "Block User" option in the friends menu doesn't do anything.

**Current Code:**
```typescript
// TODO: Implement block user functionality
```

---

### 6. Cancel Friend Request Not Implemented
**Severity:** ⚠️ Important (Feature Missing)
**File:** `src/screens/FriendRequestsScreen.tsx` (line 114)

**Issue:** Users cannot cancel a pending friend request.

**Current Code:**
```typescript
// TODO: Implement cancel friend request functionality
```

---

## 📝 Minor Issues (Low Priority)

### 7. Distance Calculation Missing in MyGamesScreen
**Severity:** 📝 Minor
**File:** `src/screens/MyGamesScreen.tsx` (line 111)

**Issue:** Event distance always shows as 0 instead of actual distance from user.

**Current Code:**
```typescript
distance: 0, // TODO: Calculate distance if user location available
```

---

### 8. Mutual Friends Count Not Calculated
**Severity:** 📝 Minor
**File:** `src/screens/AddFriendScreen.tsx` (line 85)

**Issue:** Mutual friends always shows as 0 when searching for users.

**Current Code:**
```typescript
mutualFriends: 0, // TODO: Calculate mutual friends
```

---

### 9. User Profile Navigation Missing
**Severity:** 📝 Minor
**Files:**
- `src/screens/UserSearchScreen.tsx` (line 106)
- `src/screens/FriendsListScreen.tsx` (line 135)
- `src/screens/FriendRequestsScreen.tsx` (line 123)

**Issue:** Tapping on a user doesn't navigate to their profile.

**Current Code:**
```typescript
// TODO: Navigate to user's profile
```

---

### 10. Chat with Friend Not Implemented
**Severity:** 📝 Minor
**File:** `src/screens/FriendsListScreen.tsx` (line 140)

**Issue:** "Message" option in friends menu doesn't navigate to chat.

**Current Code:**
```typescript
// TODO: Navigate to chat with friend
```

---

### 11. Fetch Other User's Profile Not Implemented
**Severity:** 📝 Minor
**File:** `src/hooks/useUserProfile.ts` (line 304)

**Issue:** Cannot view other users' profiles, only your own.

**Current Code:**
```typescript
// TODO: Implement fetching other user's profile
```

---

### 12. EnhancedMapScreen Event Details Navigation
**Severity:** 📝 Minor
**File:** `src/screens/EnhancedMapScreen.tsx` (line 504)

**Issue:** Event marker tap doesn't navigate to event details.

**Current Code:**
```typescript
// TODO: Navigate to event details screen
```

---

## 🔒 Security Recommendations

### 1. Remove Hardcoded API Keys
Files containing hardcoded keys that should be cleaned:

| File | Key Type |
|------|----------|
| `MapScreen.tsx` | Google Places API |
| `placesApi.ts` | Google Places API |
| `GoogleMapsView.tsx` | Google Maps API |
| `MyPlaceDetailsScreen.tsx` | Google Maps API |
| `firebase.ts` | Firebase Config |

### 2. Validate All Environment Variables at Startup
Consider adding a startup check that validates all required environment variables are present and shows a clear error if any are missing.

---

## 📋 Action Priority

### Do First (1-2 hours)
1. ✅ ~~Fix participant count~~ (DONE)
2. Connect MyEventsScreen to real API
3. Implement Leave Event API call

### Do Second (2-4 hours)
4. Remove all hardcoded API keys
5. Implement FCM notification navigation
6. Add block user functionality

### Do Third (Nice to have)
7. Calculate mutual friends
8. Add distance calculation
9. Implement user profile viewing
10. Add direct messaging between friends

---

## 🧪 Testing Checklist

After fixing issues, verify:

- [ ] Events load from Supabase, not mock data
- [ ] Participant count updates when joining/leaving
- [ ] Leave event removes from database
- [ ] No API keys visible in source code
- [ ] Push notification taps navigate correctly
- [ ] Block user works and persists
- [ ] Friend request can be cancelled

---

**Need help fixing any of these issues? Just ask!** 🚀
