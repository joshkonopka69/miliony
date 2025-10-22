-- SIMPLE FIX FOR EXISTING POLICIES
-- This drops existing policies to avoid conflicts

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Groups are readable by everyone" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;

-- Drop other existing policies
DROP POLICY IF EXISTS "Events are readable by everyone" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

DROP POLICY IF EXISTS "Event participants are readable by everyone" ON event_participants;
DROP POLICY IF EXISTS "Users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON event_participants;

DROP POLICY IF EXISTS "Event messages are readable by participants" ON event_messages;
DROP POLICY IF EXISTS "Users can send messages to events they joined" ON event_messages;

DROP POLICY IF EXISTS "Group members are readable by everyone" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can insert their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can update their own privacy settings" ON privacy_settings;
DROP POLICY IF EXISTS "Users can delete their own privacy settings" ON privacy_settings;

DROP POLICY IF EXISTS "Users can view their own consent settings" ON consent_settings;
DROP POLICY IF EXISTS "Users can insert their own consent settings" ON consent_settings;
DROP POLICY IF EXISTS "Users can update their own consent settings" ON consent_settings;
DROP POLICY IF EXISTS "Users can delete their own consent settings" ON consent_settings;

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

DROP POLICY IF EXISTS "Users are readable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
