# 🚨 APP CRASH DEBUGGING PLAN
## Comprehensive Plan to Make Your App Work 100%

---

## 🔍 STEP 1: IDENTIFY THE CRASH CAUSE

### Run Comprehensive Debug Test
```bash
node comprehensive-debug-test.js
```

This will test:
- ✅ Database connection
- ✅ All table access
- ✅ Authentication
- ✅ Real-time subscriptions
- ✅ Event operations
- ✅ Chat operations
- ✅ User operations
- ✅ RLS policies

### Expected Output:
- **If all tests pass**: App crashes are UI-related
- **If tests fail**: App crashes are backend-related

---

## 🛠️ STEP 2: FIX BACKEND ISSUES (If Found)

### Common Backend Issues & Fixes:

#### Issue 1: Schema Cache Problems
**Symptoms**: "Could not find column in schema cache"
**Fix**: Run this SQL in Supabase Dashboard:
```sql
-- Force schema refresh by creating data
INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES
('Schema Test', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active');
```

#### Issue 2: RLS Policy Conflicts
**Symptoms**: "row-level security policy" errors
**Fix**: Run this SQL:
```sql
-- Disable RLS temporarily
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;

-- Create sample data
INSERT INTO events (title, sport_type, max_participants, latitude, longitude, created_by, scheduled_datetime, status) VALUES
('Basketball Game', 'Basketball', 10, 51.1079, 17.0385, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '1 hour', 'active'),
('Football Match', 'Football', 22, 51.1089, 17.0395, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() + INTERVAL '2 hours', 'active');

-- Add participants
INSERT INTO event_participants (event_id, user_id, joined_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', NOW() FROM events e;

-- Add messages
INSERT INTO event_messages (event_id, user_id, message, created_at)
SELECT e.id, 'c46dec97-bfd3-4d30-9cc8-178b1a2b66a7', 'Welcome to the event!', NOW()
FROM events e WHERE e.title = 'Basketball Game';

-- Re-enable RLS with simple policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on event_participants" ON event_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on event_messages" ON event_messages FOR ALL USING (true) WITH CHECK (true);
```

#### Issue 3: Missing Data
**Symptoms**: App loads but shows empty screens
**Fix**: Ensure sample data exists:
```sql
-- Check if data exists
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM event_messages;
SELECT COUNT(*) FROM users;

-- If counts are 0, run the sample data creation above
```

---

## 🔧 STEP 3: FIX UI CRASHES

### Common UI Crash Causes:

#### 1. Import Errors
**Check these files for import issues:**
```bash
# Check for missing imports
grep -r "import.*supabase" src/
grep -r "Cannot read property" src/
grep -r "undefined" src/
```

**Fix**: Ensure all files import from correct paths:
```typescript
// Correct import
import { supabase } from '../config/supabase';

// NOT this
import { supabase } from './supabase';
```

#### 2. Null/Undefined Values
**Add null checks everywhere:**
```typescript
// Before accessing properties
if (user && user.display_name) {
  console.log(user.display_name);
}

// Before array operations
if (events && events.length > 0) {
  events.map(event => ...);
}
```

#### 3. Async/Await Issues
**Wrap all async operations in try-catch:**
```typescript
try {
  const result = await BackendService.Events.getNearbyEvents(location);
  if (result.success) {
    setEvents(result.events);
  }
} catch (error) {
  console.error('Error fetching events:', error);
  setEvents([]);
}
```

#### 4. Real-time Subscription Issues
**Fix subscription cleanup:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('events')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'events' },
      (payload) => {
        console.log('Event update:', payload);
        // Handle update safely
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 📱 STEP 4: SYSTEMATIC APP TESTING

### Test Plan (Run in Order):

#### Test 1: App Startup
```bash
# Clear cache and restart
npx expo start --clear
```
**Expected**: App loads without crashes
**If crashes**: Check console for specific error

#### Test 2: Authentication
1. Open app
2. Try to sign in
3. Check if user data loads
**Expected**: User signs in successfully
**If crashes**: Check AuthContext.tsx

#### Test 3: Map Screen
1. Navigate to Map screen
2. Check if events load
3. Check if map renders
**Expected**: Map shows with events
**If crashes**: Check MapScreen.tsx

#### Test 4: Event Creation
1. Tap "Create Event"
2. Fill in details
3. Submit
**Expected**: Event creates successfully
**If crashes**: Check CreateEventModal.tsx

#### Test 5: Chat
1. Tap on an event
2. Try to send a message
3. Check if messages appear
**Expected**: Chat works in real-time
**If crashes**: Check EventChat.tsx

---

## 🚨 STEP 5: EMERGENCY FIXES

### If App Still Crashes After Backend Fix:

#### Fix 1: Disable Problematic Features
```typescript
// In MapScreen.tsx, temporarily disable real-time
useEffect(() => {
  // Comment out real-time subscription
  // const channel = supabase.channel('events')...
  
  // Just fetch events once
  fetchEventsFromBackend();
}, []);
```

#### Fix 2: Add Error Boundaries
```typescript
// Create ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text>Something went wrong. Please restart the app.</Text>;
    }
    return this.props.children;
  }
}
```

#### Fix 3: Simplify Components
```typescript
// Temporarily simplify MapScreen
const MapScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple fetch without real-time
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const result = await BackendService.Events.getNearbyEvents({
        latitude: 51.1079,
        longitude: 17.0385,
        radius: 10
      });
      
      if (result.success) {
        setEvents(result.events);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View>
      <Text>Events: {events.length}</Text>
      {/* Simple list of events */}
    </View>
  );
};
```

---

## 📋 STEP 6: VERIFICATION CHECKLIST

### Backend Verification:
- [ ] Database connection works
- [ ] All tables accessible
- [ ] Sample data exists
- [ ] RLS policies working
- [ ] Real-time subscriptions working

### Frontend Verification:
- [ ] App starts without crashes
- [ ] Authentication works
- [ ] Map screen loads
- [ ] Events display on map
- [ ] Event creation works
- [ ] Chat functionality works
- [ ] Profile data loads

### Integration Verification:
- [ ] Data syncs between app and database
- [ ] Real-time updates work
- [ ] Multiple users can interact
- [ ] No console errors
- [ ] No crashes during normal use

---

## 🎯 STEP 7: FINAL TESTING

### Test with Friend:
1. Both users install app
2. Both sign in
3. One creates event
4. Other joins event
5. Both send messages
6. Verify real-time sync

### Performance Test:
1. Create 10+ events
2. Send 50+ messages
3. Test on slow network
4. Test app in background
5. Test app restart

---

## 🚀 SUCCESS CRITERIA

### Your app is 100% working when:
- ✅ **No crashes** during normal use
- ✅ **All features work** (events, chat, profiles)
- ✅ **Real-time sync** works perfectly
- ✅ **Multiple users** can interact
- ✅ **Data persists** correctly
- ✅ **Performance** is smooth

### If still having issues:
1. **Run debug test** first
2. **Fix backend issues** found
3. **Simplify UI** temporarily
4. **Add error handling** everywhere
5. **Test systematically** step by step

---

## 📞 EMERGENCY CONTACTS

### If you need immediate help:
1. **Check console logs** for specific errors
2. **Run debug test** to identify issues
3. **Apply fixes** from this plan
4. **Test systematically** step by step

**Remember**: Most crashes are caused by:
- Missing data in database
- RLS policy conflicts
- Import path errors
- Null/undefined values
- Async operation failures

**Fix these systematically and your app will work! 🎉**

