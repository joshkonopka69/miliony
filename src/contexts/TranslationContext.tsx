import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation types
export type Language = 'en' | 'pl' | 'es' | 'fr' | 'de';

export interface Translations {
  // Welcome Screen
  welcome: {
    title: string;
    subtitle: string;
    continueWithGoogle: string;
    continueWithApple: string;
    signUpWithEmail: string;
    termsText: string;
    termsOfService: string;
    privacyPolicy: string;
    selectLanguage: string;
  };

  // Auth Screen
  auth: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    signIn: string;
    forgotPassword: string;
    createAccount: string;
  };

  // Register Screen
  register: {
    title: string;
    subtitle: string;
    emailLabel: string;
    displayNameLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    emailPlaceholder: string;
    displayNamePlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    favoriteSports: string;
    selectSports: string;
    createAccount: string;
    alreadyHaveAccount: string;
    signIn: string;
  };

  // Common
  common: {
    back: string;
    next: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    ok: string;
    add: string;
  };

  // Policy Screens
  policy: {
    privacyPolicy: string;
    termsOfService: string;
    lastUpdated: string;
    back: string;
  };

  // Map Screen
  map: {
    permissionDenied: string;
    locationAccessNeeded: string;
  };

  // Sports
  sports: {
    boxing: string;
    calisthenics: string;
    gym: string;
    basketball: string;
    rollerSkating: string;
    football: string;
    volleyball: string;
    bjj: string;
    chess: string;
    pingPong: string;
    tennis: string;
    badminton: string;
    squash: string;
    mma: string;
    judo: string;
    martial_arts_gym: string;
    grappling_hall: string;
    soccer: string;
    baseball: string;
    hockey: string;
    swimming: string;
    running: string;
    cycling: string;
    golf: string;
    yoga: string;
    pilates: string;
    weightlifting: string;
    crossfit: string;
    rock_climbing: string;
    bouldering: string;
    surfing: string;
    skiing: string;
    snowboarding: string;
    ice_skating: string;
    rollerblading: string;
    skating: string;
    muay_thai: string;
    kickboxing: string;
    wrestling: string;
    padel: string;
    table_tennis: string;
    other: string;
    martial_arts: string;
  };


  // Languages
  languages: {
    english: string;
    polish: string;
    spanish: string;
    french: string;
    german: string;
  };

  // Settings
  settings: {
    title: string;
    account: string;
    favoriteSports: string;
    preferences: string;
    language: string;
    legal: string;
    termsOfService: string;
    privacyPolicy: string;
    development: string;
    backendTest: string;
    dangerZone: string;
    deleteAccount: string;
    logout: string;
    logoutConfirm: string;
    logoutMessage: string;
    deleteConfirm: string;
    deleteMessage: string;
    deleteSuccess: string;
  };

  // Profile Screen
  profile: {
    title: string;
    loadingProfile: string;
    joined: string;
    earned: string;
    toUnlock: string;
    progress: string;
    achievements: string;
    viewAll: string;
    noBadges: string;
    noBadgesSubtext: string;
    friends: string;
    addFriends: string;
    noFriends: string;
    noFriendsSubtext: string;
    groups: string;
    viewGroups: string;
    noGroups: string;
    noGroupsSubtext: string;
    errorLoading: string;
    uploading: string;
    noFriendsOther: string;
    noGroupsOther: string;
    userDefault: string;
    viewProfile: string;
  };


  // My Events Screen
  myEvents: {
    title: string;
    allGames: string;
    created: string;
    joined: string;
    upcoming: string;
    past: string;
    noEvents: string;
    noEventsSubtext: string;
    createEvent: string;
    viewDetails: string;
    participants: string;
    skillLevel: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
    errorLoading: string;
    filtersComingSoonTitle: string;
    filtersComingSoonMessage: string;
    moreOptionsTitle: string;
    moreOptionsMessage: string;
    leaveEventTitle: string;
    leaveEventMessage: string;
    leaveEventConfirm: string;
    leaveEventSuccess: string;
    participantsShort: string;
    almostFull: string;
    groupLabels: {
      TODAY: string;
      TOMORROW: string;
      THIS_WEEK: string;
      NEXT_WEEK: string;
      LATER: string;
    };
    statusLabels: {
      live: string;
      startingSoon: string;
      cancelled: string;
      started: string;
    };
  };

  // Create Event Screen
  createEvent: {
    title: string;
    eventTitle: string;
    sportType: string;
    dateTime: string;
    missingTitle: string;
    invalidDate: string;
    invalidParticipants: string;
    missingLocation: string;
  };

  // My Groups Screen
  myGroups: {
    title: string;
    allGroups: string;
    yourGroups: string;
    createGroup: string;
    noGroups: string;
    noGroupsSubtext: string;
    members: string;
    viewDetails: string;
    adminGroupsTitle: string;
    memberGroupsTitle: string;
    noGroupsTitle: string;
    noGroupsMessage: string;
    createFirstGroup: string;
    cannotLeaveAdminTitle: string;
    cannotLeaveAdminMessage: string;
    leaveGroupTitle: string;
    leaveGroupMessage: string;
    leaveConfirm: string;
    all: string;
    admin: string;
    member: string;
    noGroupsFound: string;
    noGroupsFoundMessage: string;
    clearFilter: string;
    loadingGroups: string;
    public: string;
    private: string;
    inviteOnly: string;
  };

  // Create Group Screen
  createGroup: {
    title: string;
    groupName: string;
    groupNamePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    selectSport: string;
    selectFriends: string;
    selectFriendsOptional: string;
    searchFriends: string;
    create: string;
    cancel: string;
    success: string;
    groupCreated: string;
    viewGroup: string;
    error: string;
    fillFields: string;
    privacyLevel: string;
    memberLimit: string;
    memberLimitPlaceholder: string;
    setGroupLocation: string;
    locationVisibleRadius: string;
    ageRange: string;
    anyLevel: string;
    anyGender: string;
    male: string;
    female: string;
    tags: string;
    groupRules: string;
    addTag: string;
    addRule: string;
    basicInformation: string;
    sportCategory: string;
    privacySettings: string;
    selectPrivacy: string;
    locationOptional: string;
    memberRequirements: string;
    minAge: string;
    maxAge: string;
    skillLevel: string;
    genderPreference: string;
    details: string;
    tagNamePlaceholder: string;
    ok: string;
    rulePlaceholder: string;
    add: string;
    selectSkillLevel: string;
    selectGenderPreference: string;
  };

  // Event Details Screen
  eventDetails: {
    title: string;
    share: string;
    gameInformation: string;
    date: string;
    time: string;
    startTime: string;
    endTime: string;
    players: string;
    location: string;
    viewOnMap: string;
    skillLevel: string;
    skillLevelAll: string;
    description: string;
    equipmentNeeded: string;
    rules: string;
    organizer: string;
    organizerRole: string;
    creatorBadge: string;
    chat: string;
    joinGame: string;
    joinPrompt: string;
    joinSuccess: string;
    requestAccess: string;
    requestSent: string;
    requestPending: string;
    leaveGame: string;
    manageEvent: string;
    eventFull: string;
    eventStarted: string;
    shareMessage: string;
    distanceLabel: string;
    participantsSection: string;
    joinedLabel: string;
    spotsLeft: string;
    viewParticipants: string;
    shareError: string;
    shareSuccess: string;
    viewLocationTitle: string;
    viewLocationMessage: string;
    participantsInfoTitle: string;
    participantsInfoMessage: string;
    errorTitle: string;
    errorMessage: string;
    errorButton: string;
    rescheduleEvent: string;
    confirmReschedule: string;
    deleteEvent: string;
    confirmDelete: string;
    cancelEvent: string;
    confirmCancel: string;
    manageOptions: string;
  };

  // All Badges Screen
  allBadges: {
    title: string;
    earnedBadge: string;
    locked: string;
    progressLabel: string;
    requirementLabel: string;
    earnedStatus: string;
    tiers: {
      rookie: string;
      player: string;
      pro: string;
      legend: string;
      enthusiast: string;
      regular: string;
      marathoner: string;
    };
    basketball: string;
    football: string;
    tennis: string;
    running: string;
    volleyball: string;
    cycling: string;
    gym: string;
    swimming: string;
    special: string;
    specialCategory: string;
    specialBadges: {
      allRounderName: string;
      allRounderRequirement: string;
      socialButterflyName: string;
      socialButterflyRequirement: string;
    };
    playGames: string;
    completeGames: string;
  };


  // Notifications
  notifications: {
    title: string;
    noNotifications: string;
    noNotificationsSubtext: string;
    markAsRead: string;
    searchPlaceholder: string;
    filterAll: string;
    filterUnread: string;
    filterLabels: {
      friend_request: string;
      event_invitation: string;
      group_invite: string;
      chat_message: string;
      system_announcement: string;
    };
    emptyTitle: string;
    emptySubtitle: string;
    emptySearchTitle: string;
    emptySearchSubtitle: string;
    select: string;
    selectAll: string;
    deselectAll: string;
    deleteSelected: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
    markAllReadTitle: string;
    markAllReadMessage: string;
    markAllReadConfirm: string;
    loading: string;
    updating: string;
    markAllReadButton: string;
    friendRequestTitle: string;
    friendRequestBody: string;
    groupInviteTitle: string;
    groupInviteBody: string;
    reminder12h: string;
    reminder24h: string;
    reminder1h: string;
    participantJoinedTitle: string;
    participantJoinedBody: string;
    eventCancelledTitle: string;
    eventCancelledBody: string;
    eventInviteTitle: string;
    eventInviteBody: string;
    friendRequestAcceptedTitle: string;
    friendRequestAcceptedBody: string;
    groupInviteAcceptedTitle: string;
    groupInviteAcceptedBody: string;
    eventCreatedTitle: string;
    eventCreatedBody: string;
    achievementUnlockedTitle: string;
    achievementUnlockedBody: string;
    eventUpdate: string;
    eventUpdateBody: string;
  };

  // Bottom Navigation
  bottomNav: {
    map: string;
    events: string;
    myGames: string;
    myProfile: string;
    myGroups: string;
  };

  languageScreen: {
    headerTitle: string;
    title: string;
    subtitle: string;
  };

  activityFilter: {
    title: string;
    cancel: string;
    venueTypes: string;
    specificActivities: string;
    specificActivitiesHint: string;
    keywordsPlaceholder: string;
    searchRadius: string;
    apply: string;
    reset: string;
    unitKm: string;
    types: Record<string, string>;
  };

  friends: {
    searchTitle: string;
    searchSubtitle: string;
    searchPlaceholder: string;
    resultsTitle: string;
    resultsCountLabel: string;
    loadingResults: string;
    quickActionsTitle: string;
    quickActions: {
      contactsTitle: string;
      contactsSubtitle: string;
      inviteLinkTitle: string;
      inviteLinkSubtitle: string;
      nearbyTitle: string;
      nearbySubtitle: string;
    };
    loginRequired: string;
    addConfirmTitle: string;
    addConfirmMessage: string;
    sendRequest: string;
    addSuccess: string;
    removeConfirmTitle: string;
    removeConfirmMessage: string;
    removeConfirmButton: string;
    removeSuccess: string;
    pending: string;
    add: string;
    remove: string;
    emptyResultsTitle: string;
    emptyResultsSubtitle: string;
  };
}

// Map of common mojibake sequences -> correct UTF-8 characters
const ENCODING_FIX_MAP: Record<string, string> = {
  // Spanish
  'Ăą': 'ñ',
  'Ă±': 'ñ',
  'ĂĄ': 'á',
  'Ăˇ': 'á',
  'ĂŠ': 'é',
  'Ă©': 'é',
  'Ă­': 'í',
  'Ăł': 'ó',
  'Ăş': 'ú',
  'Ăš': 'Ú',
  'Â¿': '¿',
  'Â¡': '¡',

  // French
  'Ă§': 'ç',
  'Ă€': 'À',
  'Ă ': 'à',
  'Ă¨': 'è',
  'ĂŞ': 'ê',
  'Ăª': 'ê',
  'Ă«': 'ë',
  'Ă´': 'ô',
  'Ă»': 'û',
  'Ă¹': 'ù',
  'Ă‰': 'É',

  // German
  'Ă¤': 'ä',
  'Ă„': 'Ä',
  'Ăś': 'Ö',
  'Ă¶': 'ö',
  'Ă–': 'Ö',
  'Ăź': 'ü',
  'ĂĽ': 'ü',
  'ĂŸ': 'ß',

  // Polish
  'Ä…': 'ą',
  'Ä‡': 'ć',
  'Ä™': 'ę',
  'Ĺ': 'ł',
  'Ĺ„': 'ń',
  'Ĺ›': 'ś',
  'Ĺź': 'ź',
  'ĹĽ': 'ż',

  // Common stray characters
  'â€“': '–',
  'â€”': '—',
  'â€¦': '…',
  'â€œ': '“',
  'â€': '”',
  'â€ž': '„',
};

const fixMojibakeString = (text: string): string => {
  let result = text;
  for (const [bad, good] of Object.entries(ENCODING_FIX_MAP)) {
    if (result.includes(bad)) {
      result = result.split(bad).join(good);
    }
  }
  return result;
};

// Recursively walk the translations object and fix all string values
const fixTranslationsObject = <T,>(value: T): T => {
  if (typeof value === 'string') {
    return fixMojibakeString(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map(v => fixTranslationsObject(v)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(value as any)) {
      result[key] = fixTranslationsObject(val);
    }
    return result as T;
  }

  return value;
};

// Translation data
export const translations: Record<Language, Translations> = {
  en: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Connect with local athletes\nand discover sports venues',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
      signUpWithEmail: 'Sign up with Email',
      termsText: 'By continuing, you agree to our',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      selectLanguage: 'Select Language',
    },
    auth: {
      title: 'Welcome back',
      subtitle: 'Sign in to your SportMap account',
      emailPlaceholder: 'Email address',
      passwordPlaceholder: 'Password',
      signIn: 'Sign In',
      forgotPassword: 'Forgot password?',
      createAccount: 'Create new account',
    },
    register: {
      title: 'Join SportMap',
      subtitle: 'Create your account to start connecting\nwith local athletes',
      emailLabel: 'Email address',
      displayNameLabel: 'Display name',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm password',
      emailPlaceholder: 'Enter your email',
      displayNamePlaceholder: 'Choose a display name',
      passwordPlaceholder: 'Create a password',
      confirmPasswordPlaceholder: 'Confirm your password',
      favoriteSports: 'Your favorite sports',
      selectSports: 'Select all that apply',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign in',
    },
    common: {
      back: 'Back',
      next: 'Next',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      ok: 'OK',
      add: 'Add',
    },
    policy: {
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      lastUpdated: 'Last updated',
      back: 'Back',
    },
    map: {
      permissionDenied: 'Permission Denied',
      locationAccessNeeded: 'Location access is needed to show your position on the map.',
    },
    sports: {
      boxing: 'Boxing',
      calisthenics: 'Calisthenics',
      gym: 'Gym',
      basketball: 'Basketball',
      rollerSkating: 'Roller Skating',
      football: 'Football',
      volleyball: 'Volleyball',
      bjj: 'BJJ',
      chess: 'Chess',
      pingPong: 'Ping Pong',
      tennis: 'Tennis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
      martial_arts_gym: 'Martial Arts Gym',
      grappling_hall: 'Grappling Hall',
      soccer: 'Soccer',
      baseball: 'Baseball',
      hockey: 'Hockey',
      swimming: 'Swimming',
      running: 'Running',
      cycling: 'Cycling',
      golf: 'Golf',
      yoga: 'Yoga',
      pilates: 'Pilates',
      weightlifting: 'Weightlifting',
      crossfit: 'CrossFit',
      rock_climbing: 'Rock Climbing',
      bouldering: 'Bouldering',
      surfing: 'Surfing',
      skiing: 'Skiing',
      snowboarding: 'Snowboarding',
      ice_skating: 'Ice Skating',
      rollerblading: 'Rollerblading',
      skating: 'Skating',
      muay_thai: 'Muay Thai',
      kickboxing: 'Kickboxing',
      wrestling: 'Wrestling',
      padel: 'Padel',
      table_tennis: 'Table Tennis',
      other: 'Other',
      martial_arts: 'Martial Arts',
    },

    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'EspaĂ±ol',
      french: 'FranĂ§ais',
      german: 'Deutsch',
    },
    settings: {
      title: 'Settings',
      account: 'Account',
      favoriteSports: 'Favorite Sports',
      preferences: 'Preferences',
      language: 'Language',
      legal: 'Legal',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      development: 'Development',
      backendTest: 'Backend Test',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete Account',
      logout: 'Log Out',
      logoutConfirm: 'Log Out',
      logoutMessage: 'Are you sure you want to log out?',
      deleteConfirm: 'Delete Account',
      deleteMessage: 'This action cannot be undone. Are you sure you want to delete your account?',
      deleteSuccess: 'Your account has been deleted.',
    },
    profile: {
      title: 'Profile',
      loadingProfile: 'Loading profile...',
      joined: 'Joined SportMap in',
      earned: 'Earned',
      toUnlock: 'To Unlock',
      progress: 'Progress',
      achievements: 'Achievements',
      viewAll: 'View All',
      noBadges: 'No badges earned yet',
      noBadgesSubtext: 'Play more games to earn badges!',
      friends: 'Friends',
      addFriends: 'Add Friends',
      noFriends: 'No friends yet',
      noFriendsSubtext: 'Add friends to connect and play together',
      groups: 'Groups',
      viewGroups: 'View Groups',
      noGroups: 'No groups yet',
      noGroupsSubtext: 'Join groups to find teammates and organize events',
      errorLoading: 'Failed to load profile data',
      uploading: 'Uploading...',
      noFriendsOther: '{name} has no friends yet.',
      noGroupsOther: "{name} isn't in any groups yet.",
      userDefault: 'User',
      viewProfile: 'View Profile',
    },

    myEvents: {
      title: 'My Games',
      allGames: 'All Games',
      created: 'Created',
      joined: 'Joined',
      upcoming: 'Upcoming',
      past: 'Past',
      noEvents: 'No events yet',
      noEventsSubtext: 'Create or join an event to get started',
      createEvent: 'Create Event',
      viewDetails: 'View Details',
      participants: 'participants',
      skillLevel: 'Skill Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
      errorLoading: 'Failed to load events',
      filtersComingSoonTitle: 'Filters coming soon',
      filtersComingSoonMessage: "We're working on advanced filters for sports, date, and location.",
      moreOptionsTitle: 'More options coming soon',
      moreOptionsMessage: 'Sorting, past games, and settings will arrive shortly.',
      leaveEventTitle: 'Leave Event',
      leaveEventMessage: 'Do you want to leave "{name}"?',
      leaveEventConfirm: 'Leave',
      leaveEventSuccess: 'You left the event.',
      participantsShort: 'joined',
      almostFull: 'Almost full',
      groupLabels: {
        TODAY: 'Today',
        TOMORROW: 'Tomorrow',
        THIS_WEEK: 'This Week',
        NEXT_WEEK: 'Next Week',
        LATER: 'Later',
      },
      statusLabels: {
        live: 'Live',
        startingSoon: 'Starting soon',
        cancelled: 'Cancelled',
        started: 'Already started',
      },
    },
    createEvent: {
      title: 'Create Event',
      eventTitle: 'Event Title',
      sportType: 'Sport Type',
      dateTime: 'Date & Time',
      missingTitle: 'Please enter an event title',
      invalidDate: 'Event must be scheduled for a future time',
      invalidParticipants: 'Minimum participants cannot exceed maximum',
      missingLocation: 'Location information is missing',
    },
    myGroups: {
      title: 'My Groups',
      allGroups: 'All Groups',
      yourGroups: 'Your Groups',
      createGroup: 'Create Group',
      noGroups: 'No groups yet',
      noGroupsSubtext: 'Create or join a group to get started',
      members: 'members',
      viewDetails: 'View Details',
      adminGroupsTitle: 'Groups You Manage',
      memberGroupsTitle: "Groups You're In",
      noGroupsTitle: 'No Groups Yet',
      noGroupsMessage: 'Create or join groups to connect with other sports enthusiasts',
      createFirstGroup: 'Create Your First Group',
      cannotLeaveAdminTitle: 'Cannot Leave Group',
      cannotLeaveAdminMessage: 'You are the admin of this group. Please transfer ownership or delete the group first.',
      leaveGroupTitle: 'Leave Group',
      leaveGroupMessage: 'Are you sure you want to leave this group?',
      leaveConfirm: 'Leave',
      all: 'All',
      admin: 'Admin',
      member: 'Member',
      noGroupsFound: 'No Groups Found',
      noGroupsFoundMessage: 'No {filter} groups in your list',
      clearFilter: 'Clear Filter',
      loadingGroups: 'Loading your groups...',
      public: 'Public',
      private: 'Private',
      inviteOnly: 'Invite Only',
    },
    createGroup: {
      title: 'Create Group',
      groupName: 'Group Name',
      groupNamePlaceholder: 'Enter group name',
      description: 'Description',
      descriptionPlaceholder: 'Enter group description',
      selectSport: 'Select Sport',
      selectFriends: 'Select Friends',
      selectFriendsOptional: 'Select Friends (Optional)',
      searchFriends: 'Search friends...',
      create: 'Create Group',
      cancel: 'Cancel',
      success: 'Success',
      groupCreated: 'Group created successfully!',
      viewGroup: 'View Group',
      error: 'Error',
      fillFields: 'Please fill in all required fields',
      privacyLevel: 'Privacy Level',
      memberLimit: 'Member Limit (Optional)',
      memberLimitPlaceholder: 'No limit',
      setGroupLocation: 'Set Group Location',
      locationVisibleRadius: 'Visible within {radius} km radius',

      ageRange: 'Age Range',
      anyLevel: 'Any Level',
      anyGender: 'Any Gender',
      male: 'Male',
      female: 'Female',
      tags: 'Tags',
      groupRules: 'Group Rules',
      addTag: 'Add Tag',
      addRule: 'Add New Rule',
      basicInformation: 'Basic Information',
      sportCategory: 'Sport Category',
      privacySettings: 'Privacy & Settings',
      selectPrivacy: 'Select Privacy',
      locationOptional: 'Location (Optional)',
      memberRequirements: 'Member Requirements',
      minAge: 'Min',
      maxAge: 'Max',
      skillLevel: 'Skill Level',
      genderPreference: 'Gender Preference',
      details: 'Details',
      tagNamePlaceholder: 'Enter tag name',
      ok: 'OK',
      rulePlaceholder: 'Enter rule',
      add: 'Add',
      selectSkillLevel: 'Select Skill Level',
      selectGenderPreference: 'Select Gender Preference',
    },
    eventDetails: {
      title: 'Event Details',
      share: 'Share',
      gameInformation: 'Game Information',
      date: 'Date',
      time: 'Time',
      startTime: 'Start Time',
      endTime: 'End Time',
      players: 'Players',
      location: 'Location',
      viewOnMap: 'View on Map',
      skillLevel: 'Skill Level',
      skillLevelAll: 'All Levels',
      description: 'Description',
      equipmentNeeded: 'Equipment Needed',
      rules: 'Rules',
      organizer: 'Organizer',
      organizerRole: 'Event Creator',
      creatorBadge: 'You created this event',
      chat: 'Chat',
      joinGame: 'Join Game',
      joinPrompt: 'Are you sure you want to join "{name}"?',
      joinSuccess: 'You have joined the event.',
      requestAccess: 'Request to Join',
      requestSent: 'Join request sent to the organizer.',
      requestPending: 'Request pending approval',
      leaveGame: 'Leave Game',
      manageEvent: 'Manage Event',
      eventFull: 'Event Full',
      eventStarted: 'Event has started',
      shareMessage: 'Join me for {name} at {location} on {date}!',
      distanceLabel: 'Distance',
      participantsSection: 'Participants',
      joinedLabel: 'Joined',
      spotsLeft: 'Spots Left',
      viewParticipants: 'View All Participants',
      shareError: 'Failed to share event',
      shareSuccess: 'Event shared successfully',
      viewLocationTitle: 'View Location',
      viewLocationMessage: 'Opening map view...',
      participantsInfoTitle: 'Participants',
      participantsInfoMessage: '{count} people have joined this event.',
      errorTitle: 'Event Not Found',
      errorMessage: 'This event could not be loaded.',
      errorButton: 'Go Back',
      rescheduleEvent: 'Reschedule Event',
      confirmReschedule: 'Are you sure you want to change the time of this event?',
      deleteEvent: 'Delete Event',
      confirmDelete: 'Are you sure you want to PERMANENTLY delete this event? This cannot be undone.',
      cancelEvent: 'Cancel Event',
      confirmCancel: 'Are you sure you want to cancel this event? Participants will be notified.',
      manageOptions: 'Select an option to manage your event',
    },
    allBadges: {
      title: 'All Badges',
      earnedBadge: 'earned badges',
      locked: 'Locked',
      progressLabel: 'Progress',
      requirementLabel: 'Requirement',
      earnedStatus: 'Earned!',
      basketball: 'Basketball',
      football: 'Football',
      tennis: 'Tennis',
      running: 'Running',
      volleyball: 'Volleyball',
      cycling: 'Cycling',
      gym: 'Gym',
      swimming: 'Swimming',
      special: 'Special',
      tiers: {
        rookie: 'Rookie',
        player: 'Player',
        pro: 'Pro',
        legend: 'Legend',
        enthusiast: 'Enthusiast',
        regular: 'Regular',
        marathoner: 'Marathon Runner',
      },
      specialCategory: 'Special Achievements',
      specialBadges: {
        allRounderName: 'All-Rounder',
        allRounderRequirement: 'Play 3 different sports',
        socialButterflyName: 'Community Star',
        socialButterflyRequirement: 'Join 10 events total',
      },
      playGames: 'Play {count} {sport} game{s}',
      completeGames: 'Complete {count} {sport}{s}',
    },

    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      noNotificationsSubtext: 'You\'re all caught up!',
      markAsRead: 'Mark as Read',
      searchPlaceholder: 'Search notifications',
      filterAll: 'All',
      filterUnread: 'Unread',
      filterLabels: {
        friend_request: 'Friend Requests',
        event_invitation: 'Event Invitations',
        group_invite: 'Group Invites',
        chat_message: 'Chats',
        system_announcement: 'Announcements',
      },
      emptyTitle: 'No notifications yet',
      emptySubtitle: 'You\'re all caught up!',
      emptySearchTitle: 'No notifications found',
      emptySearchSubtitle: 'Try adjusting your search terms',
      select: 'Select',
      selectAll: 'Select All',
      deselectAll: 'Clear Selection',
      deleteSelected: 'Delete',
      deleteConfirmTitle: 'Delete Notifications',
      deleteConfirmMessage: 'Delete {count} notification(s)?',
      markAllReadTitle: 'Mark All as Read',
      markAllReadMessage: 'Mark every notification as read?',
      markAllReadConfirm: 'Mark All Read',
      loading: 'Loading notifications...',
      updating: 'Updating...',
      markAllReadButton: 'Mark All Read',
      friendRequestTitle: 'New Friend Request',
      friendRequestBody: '{name} wants to connect with you.',
      groupInviteTitle: 'Group Invitation',
      groupInviteBody: '{name} invited you to join {group}.',
      reminder12h: 'Reminder: {event} is starting in 12 hours!',
      reminder24h: 'Reminder: {event} is starting in 24 hours!',
      reminder1h: 'Reminder: {event} is starting in 1 hour!',
      participantJoinedTitle: 'New Participant',
      participantJoinedBody: 'Someone joined {event}',
      eventCancelledTitle: 'Event Cancelled',
      eventCancelledBody: '{event} has been cancelled',
      eventInviteTitle: 'Event Invitation',
      eventInviteBody: '{name} invited you to {event}',
      friendRequestAcceptedTitle: 'Friend Request Accepted',
      friendRequestAcceptedBody: '{name} accepted your friend request.',
      groupInviteAcceptedTitle: 'Group Invite Accepted',
      groupInviteAcceptedBody: '{name} joined {group}.',
      eventCreatedTitle: 'New Event from Friend',
      eventCreatedBody: '{name} created a new event: {event}',
      achievementUnlockedTitle: 'Achievement Unlocked!',
      achievementUnlockedBody: 'You earned the {name} badge!',
      eventUpdate: 'Event Updated',
      eventUpdateBody: '{event} has been updated.',
    },
    bottomNav: {
      map: 'Map',
      events: 'Events',
      myGames: 'My Games',
      myProfile: 'My Profile',
      myGroups: 'My Groups',
    },
    languageScreen: {
      headerTitle: 'Language',
      title: 'Language Settings',
      subtitle: 'Choose your preferred language for the entire app',
    },
    activityFilter: {
      title: 'Activities',
      cancel: 'Cancel',
      venueTypes: 'Venue Types',
      specificActivities: 'Specific Activities',
      specificActivitiesHint: 'Search for specific activities (e.g., yoga, bouldering, martial arts)',
      keywordsPlaceholder: 'Enter activities separated by commas',
      searchRadius: 'Search Radius',
      apply: 'Apply Filters',
      reset: 'Reset',
      unitKm: 'km',
      types: {
        gym: 'Gym/Fitness Center',
        stadium: 'Stadium',
        swimming_pool: 'Swimming Pool',
        park: 'Park',
        sports_complex: 'Sports Complex',
        bowling_alley: 'Bowling Alley',
        golf_course: 'Golf Course',
        ice_rink: 'Ice Rink',
        tennis_court: 'Tennis Court',
        basketball_court: 'Basketball Court',
        martial_arts_gym: 'Martial Arts Gym',
        grappling_hall: 'Grappling Hall',
      },
    },
    friends: {
      searchTitle: 'Find Friends',
      searchSubtitle: 'Add friends to connect and play together',
      searchPlaceholder: 'Search friends...',
      resultsTitle: 'Results',
      resultsCountLabel: 'Results',
      loadingResults: 'Searching...',
      quickActionsTitle: 'Quick Actions',
      quickActions: {
        contactsTitle: 'Invite from Contacts',
        contactsSubtitle: 'Find friends from your phone contacts',
        inviteLinkTitle: 'Share Invite Link',
        inviteLinkSubtitle: 'Send a link to invite friends',
        nearbyTitle: 'Find Nearby Users',
        nearbySubtitle: 'Discover people in your area',
      },
      loginRequired: 'You must be logged in to manage friends.',
      addConfirmTitle: 'Add Friend',
      addConfirmMessage: 'Send a friend request to {name}?',
      sendRequest: 'Send Request',
      addSuccess: 'Friend request sent to {name}!',
      removeConfirmTitle: 'Remove Friend',
      removeConfirmMessage: 'Remove {name} from your friends?',
      removeConfirmButton: 'Remove',
      removeSuccess: '{name} has been removed from your friends.',
      pending: 'Pending',
      add: 'Add',
      remove: 'Remove',
      emptyResultsTitle: 'No people found',
      emptyResultsSubtitle: 'Try a different name or username.',
    },
  },
  pl: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Połącz się z lokalnymi sportowcami\ni odkryj miejsca sportowe',
      continueWithGoogle: 'Kontynuuj z Google',
      continueWithApple: 'Kontynuuj z Apple',
      signUpWithEmail: 'Zarejestruj się przez Email',
      termsText: 'Kontynuując, zgadzasz się z naszymi',
      termsOfService: 'Warunkami Usługi',
      privacyPolicy: 'Polityką Prywatności',
      selectLanguage: 'Wybierz Język',
    },
    auth: {
      title: 'Witaj z powrotem',
      subtitle: 'Zaloguj się do swojego konta SportMap',
      emailPlaceholder: 'Adres email',
      passwordPlaceholder: 'Hasło',
      signIn: 'Zaloguj się',
      forgotPassword: 'Zapomniałeś hasła?',
      createAccount: 'Utwórz nowe konto',
    },
    register: {
      title: 'Dołącz do SportMap',
      subtitle: 'Utwórz konto, aby zacząć łączyć się\nz lokalnymi sportowcami',
      emailLabel: 'Adres email',
      displayNameLabel: 'Nazwa wyświetlana',
      passwordLabel: 'Hasło',
      confirmPasswordLabel: 'Potwierdź hasło',
      emailPlaceholder: 'Wprowadź swój email',
      displayNamePlaceholder: 'Wybierz nazwę wyświetlaną',
      passwordPlaceholder: 'Utwórz hasło',
      confirmPasswordPlaceholder: 'Potwierdź swoje hasło',
      favoriteSports: 'Twoje ulubione sporty',
      selectSports: 'Wybierz wszystkie, które pasują',
      createAccount: 'Utwórz Konto',
      alreadyHaveAccount: 'Masz już konto?',
      signIn: 'Zaloguj się',
    },
    common: {
      back: 'Wstecz',
      next: 'Dalej',
      cancel: 'Anuluj',
      save: 'Zapisz',
      delete: 'Usuń',
      edit: 'Edytuj',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      confirm: 'Potwierdź',
      ok: 'OK',
      add: 'Dodaj',
    },
    policy: {
      privacyPolicy: 'Polityka Prywatności',
      termsOfService: 'Warunki Usługi',
      lastUpdated: 'Ostatnia aktualizacja',
      back: 'Wstecz',
    },
    map: {
      permissionDenied: 'Odmowa Dostępu',
      locationAccessNeeded: 'Dostęp do lokalizacji jest potrzebny, aby pokazać Twoją pozycję na mapie.',
    },
    sports: {
      boxing: 'Boks',
      calisthenics: 'Kalistenika',
      gym: 'Siłownia',
      basketball: 'Koszykówka',
      rollerSkating: 'Rolki',
      football: 'Piłka nożna',
      volleyball: 'Siatkówka',
      bjj: 'BJJ',
      chess: 'Szachy',
      pingPong: 'Ping Pong',
      tennis: 'Tenis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
      martial_arts_gym: 'Klub sportów walki',
      grappling_hall: 'Hala do grapplingu',
      soccer: 'Piłka nożna (Soccer)',
      baseball: 'Baseball',
      hockey: 'Hokej',
      swimming: 'Pływanie',
      running: 'Bieganie',
      cycling: 'Kolarstwo',
      golf: 'Golf',
      yoga: 'Joga',
      pilates: 'Pilates',
      weightlifting: 'Podnoszenie ciężarów',
      crossfit: 'CrossFit',
      rock_climbing: 'Wspinaczka (Rock Climbing)',
      bouldering: 'Bouldering/Wspinaczka',
      surfing: 'Surfing',
      skiing: 'Narciarstwo',
      snowboarding: 'Snowboard',
      ice_skating: 'Łyżwiarstwo',
      rollerblading: 'Rolki (Rollerblading)',
      skating: 'Skating',
      muay_thai: 'Muay Thai',
      kickboxing: 'Kickboxing',
      wrestling: 'Zapasy (Wrestling)',
      padel: 'Padel',
      table_tennis: 'Tenis stołowy',
      other: 'Inne',
      martial_arts: 'Sztuki walki',
    },

    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
    },

    settings: {
      title: 'Ustawienia',
      account: 'Konto',
      favoriteSports: 'Ulubione Sporty',
      preferences: 'Preferencje',
      language: 'Język',
      legal: 'Prawne',
      termsOfService: 'Warunki Usługi',
      privacyPolicy: 'Polityka Prywatności',
      development: 'Rozwój',
      backendTest: 'Test Backendu',
      dangerZone: 'Strefa Zagrożenia',
      deleteAccount: 'Usuń Konto',
      logout: 'Wyloguj się',
      logoutConfirm: 'Wyloguj się',
      logoutMessage: 'Czy na pewno chcesz się wylogować?',
      deleteConfirm: 'Usuń Konto',
      deleteMessage: 'Ta akcja nie może być cofnięta. Czy na pewno chcesz usunąć swoje konto?',
      deleteSuccess: 'Twoje konto zostało usunięte.',
    },
    profile: {
      title: 'Profil',
      loadingProfile: 'Ładowanie profilu...',
      joined: 'Dołączył do SportMap w',
      earned: 'Zdobyte',
      toUnlock: 'Do Odblokowania',
      progress: 'Postęp',
      achievements: 'Osiągnięcia',
      viewAll: 'Zobacz Wszystkie',
      noBadges: 'Brak zdobytych odznak',
      noBadgesSubtext: 'Zagraj więcej gier, aby zdobyć odznaki!',
      friends: 'Znajomi',
      addFriends: 'Dodaj Znajomych',
      noFriends: 'Brak znajomych',
      noFriendsSubtext: 'Dodaj znajomych, aby się połączyć i grać razem',
      groups: 'Grupy',
      viewGroups: 'Zobacz Grupy',
      noGroups: 'Brak grup',
      noGroupsSubtext: 'Dołącz do grup, aby znaleźć zespół i organizować wydarzenia',
      errorLoading: 'Nie udało się załadować danych profilu',
      uploading: 'Przesyłanie...',
      noFriendsOther: '{name} nie ma jeszcze żadnych znajomych.',
      noGroupsOther: '{name} nie należy jeszcze do żadnej grupy.',
      userDefault: 'Użytkownik',
      viewProfile: 'Zobacz profil',
    },

    myEvents: {
      title: 'Moje Gry',
      allGames: 'Wszystkie Gry',
      created: 'Utworzone',
      joined: 'Dołączone',
      upcoming: 'Nadchodzące',
      past: 'Przeszłe',
      noEvents: 'Brak wydarzeń',
      noEventsSubtext: 'Utwórz lub dołącz do wydarzenia, aby zacząć',
      createEvent: 'Utwórz Wydarzenie',
      viewDetails: 'Zobacz Szczegóły',
      participants: 'uczestników',
      skillLevel: 'Poziom Umiejętności',
      beginner: 'Początkujący',
      intermediate: 'Średniozaawansowany',
      advanced: 'Zaawansowany',
      expert: 'Ekspert',
      errorLoading: 'Nie udało się załadować wydarzeń',
      filtersComingSoonTitle: 'Filtry wkrótce',
      filtersComingSoonMessage: 'Pracujemy nad zaawansowanymi filtrami dla sportów, dat i lokalizacji.',
      moreOptionsTitle: 'Więcej opcji wkrótce',
      moreOptionsMessage: 'Sortowanie, wcześniejsze gry i ustawienia pojawią się już niedługo.',
      leaveEventTitle: 'Opuść wydarzenie',
      leaveEventMessage: 'Czy chcesz opuścić „{name}”?',
      leaveEventConfirm: 'Opuść',
      leaveEventSuccess: 'Opuściłeś wydarzenie.',
      participantsShort: 'dołączyło',
      almostFull: 'Prawie pełne',
      groupLabels: {
        TODAY: 'Dzisiaj',
        TOMORROW: 'Jutro',
        THIS_WEEK: 'W tym tygodniu',
        NEXT_WEEK: 'W przyszłym tygodniu',
        LATER: 'Później',
      },
      statusLabels: {
        live: 'Na żywo',
        startingSoon: 'Zaczyna się wkrótce',
        cancelled: 'Odwołane',
        started: 'Już się rozpoczęło',
      },
    },
    createEvent: {
      title: 'Stwórz wydarzenie',
      eventTitle: 'Tytuł wydarzenia',
      sportType: 'Typ sportu',
      dateTime: 'Data i godzina',
      missingTitle: 'Proszę podać tytuł wydarzenia',
      invalidDate: 'Wydarzenie musi być zaplanowane na przyszłość',
      invalidParticipants: 'Minimalna liczba uczestników nie może przekraczać maksymalnej',
      missingLocation: 'Brak informacji o lokalizacji',
    },
    myGroups: {
      title: 'Moje Grupy',
      allGroups: 'Wszystkie Grupy',
      yourGroups: 'Twoje Grupy',
      createGroup: 'Utwórz Grupę',
      noGroups: 'Brak grup',
      noGroupsSubtext: 'Utwórz lub dołącz do grupy, aby zacząć',
      members: 'członków',
      viewDetails: 'Zobacz Szczegóły',
      adminGroupsTitle: 'Grupy, którymi zarządzasz',
      memberGroupsTitle: 'Grupy, do których należysz',
      noGroupsTitle: 'Brak grup',
      noGroupsMessage: 'Utwórz lub dołącz do grup, aby połączyć się z innymi entuzjastami sportu',
      createFirstGroup: 'Utwórz swoją pierwszą grupę',
      cannotLeaveAdminTitle: 'Nie można opuścić grupy',
      cannotLeaveAdminMessage: 'Jesteś administratorem tej grupy. Przekaż własność lub usuń grupę przed wyjściem.',
      leaveGroupTitle: 'Opuść grupę',
      leaveGroupMessage: 'Czy na pewno chcesz opuścić tę grupę?',
      leaveConfirm: 'Opuść',
      all: 'Wszystkie',
      admin: 'Admin',
      member: 'Członek',
      noGroupsFound: 'Nie znaleziono grup',
      noGroupsFoundMessage: 'Brak grup typu {filter} na liście',
      clearFilter: 'Wyczyść filtr',
      loadingGroups: 'Ładowanie Twoich grup...',
      public: 'Publiczna',
      private: 'Prywatna',
      inviteOnly: 'Tylko zaproszeni',
    },
    createGroup: {
      title: 'Utwórz Grupę',
      groupName: 'Nazwa Grupy',
      groupNamePlaceholder: 'Wprowadź nazwę grupy',
      description: 'Opis',
      descriptionPlaceholder: 'Wprowadź opis grupy',
      selectSport: 'Wybierz Sport',
      selectFriends: 'Wybierz Znajomych',
      selectFriendsOptional: 'Wybierz Znajomych (Opcjonalne)',
      searchFriends: 'Szukaj znajomych...',
      create: 'Utwórz Grupę',
      cancel: 'Anuluj',
      success: 'Sukces',
      groupCreated: 'Grupa została utworzona pomyślnie!',
      viewGroup: 'Zobacz Grupę',
      error: 'Błąd',
      fillFields: 'Proszę wypełnić wszystkie wymagane pola',
      privacyLevel: 'Poziom prywatności',
      memberLimit: 'Limit członków (opcjonalnie)',
      memberLimitPlaceholder: 'Brak limitu',
      setGroupLocation: 'Ustaw lokalizację grupy',
      locationVisibleRadius: 'Widoczna w promieniu {radius} km',

      ageRange: 'Przedział wiekowy',
      anyLevel: 'Dowolny poziom',
      anyGender: 'Dowolna płeć',
      male: 'Mężczyźni',
      female: 'Kobiety',
      tags: 'Tagi',
      groupRules: 'Zasady grupy',
      addTag: 'Dodaj tag',
      addRule: 'Dodaj nową zasadę',
      basicInformation: 'Podstawowe informacje',
      sportCategory: 'Kategoria sportu',
      privacySettings: 'Prywatność i ustawienia',
      selectPrivacy: 'Wybierz prywatność',
      locationOptional: 'Lokalizacja (opcjonalnie)',
      memberRequirements: 'Wymagania dla członków',
      minAge: 'Min',
      maxAge: 'Max',
      skillLevel: 'Poziom umiejętności',
      genderPreference: 'Preferencja płci',
      details: 'Szczegóły',
      tagNamePlaceholder: 'Wpisz nazwę taga',
      ok: 'OK',
      rulePlaceholder: 'Wpisz zasadę',
      add: 'Dodaj',
      selectSkillLevel: 'Wybierz poziom umiejętności',
      selectGenderPreference: 'Wybierz preferencję płci',
    },
    eventDetails: {
      title: 'Szczegóły wydarzenia',
      share: 'Udostępnij',
      gameInformation: 'Informacje o grze',
      date: 'Data',
      time: 'Czas',
      startTime: 'Godzina rozpoczęcia',
      endTime: 'Godzina zakończenia',
      players: 'Gracze',
      location: 'Lokalizacja',
      viewOnMap: 'Pokaż na mapie',
      skillLevel: 'Poziom umiejętności',
      skillLevelAll: 'Wszystkie poziomy',
      description: 'Opis',
      equipmentNeeded: 'Potrzebny sprzęt',
      rules: 'Zasady',
      organizer: 'Organizator',
      organizerRole: 'Organizator wydarzenia',
      creatorBadge: 'To Ty utworzyłeś to wydarzenie',
      chat: 'Czat',
      joinGame: 'Dołącz do gry',
      joinPrompt: 'Czy chcesz dołączyć do „{name}”?',
      joinSuccess: 'Dołączyłeś do wydarzenia.',
      requestAccess: 'Poproś o dołączenie',
      requestSent: 'Prośba o dołączenie została wysłana do organizatora.',
      requestPending: 'Oczekuje na zatwierdzenie',
      leaveGame: 'Opuść grę',
      manageEvent: 'Zarządzaj wydarzeniem',
      eventFull: 'Brak miejsc',
      eventStarted: 'Wydarzenie już się rozpoczęło',
      shareMessage: 'Dołącz do mnie na {name} w {location} dnia {date}!',
      distanceLabel: 'Odległość',
      participantsSection: 'Uczestnicy',
      joinedLabel: 'Dołączyło',
      spotsLeft: 'Wolne miejsca',
      viewParticipants: 'Zobacz wszystkich uczestników',
      shareError: 'Nie udało się udostępnić wydarzenia',
      shareSuccess: 'Wydarzenie udostępnione',
      viewLocationTitle: 'Zobacz lokalizację',
      viewLocationMessage: 'Otwieranie widoku mapy...',
      participantsInfoTitle: 'Uczestnicy',
      participantsInfoMessage: '{count} osób dołączyło do tego wydarzenia.',
      errorTitle: 'Nie znaleziono wydarzenia',
      errorMessage: 'Nie udało się załadować tego wydarzenia.',
      errorButton: 'Wróć',
      rescheduleEvent: 'Zmień termin',
      confirmReschedule: 'Czy na pewno chcesz zmienić czas tego wydarzenia?',
      deleteEvent: 'Usuń wydarzenie',
      confirmDelete: 'Czy na pewno chcesz TRWALE usunąć to wydarzenie? Tej operacji nie można cofnąć.',
      cancelEvent: 'Anuluj wydarzenie',
      confirmCancel: 'Czy na pewno chcesz anulować to wydarzenie? Uczestnicy zostaną powiadomieni.',
      manageOptions: 'Wybierz opcję zarządzania wydarzeniem',
    },
    allBadges: {
      title: 'Wszystkie odznaki',
      earnedBadge: 'Zdobyte',
      locked: 'Zablokowane',
      progressLabel: 'Postęp',
      requirementLabel: 'Wymaganie',
      earnedStatus: 'Zdobyto!',
      basketball: 'Koszykówka',
      football: 'Piłka nożna',
      tennis: 'Tenis',
      running: 'Bieganie',
      volleyball: 'Siatkówka',
      cycling: 'Jazda na rowerze',
      gym: 'Siłownia',
      swimming: 'Pływanie',
      special: 'Specjalne',
      tiers: {
        rookie: 'Debiutant',
        player: 'Gracz',
        pro: 'Pro',
        legend: 'Legenda',
        enthusiast: 'Entuzjasta',
        regular: 'Bywalec',
        marathoner: 'Maratończyk',
      },
      specialCategory: 'Specjalne osiągnięcia',
      specialBadges: {
        allRounderName: 'Wszechstronny',
        allRounderRequirement: 'Zagraj w 3 różne sporty',
        socialButterflyName: 'Gwiazda Społeczności',
        socialButterflyRequirement: 'Dołącz do łącznie 10 wydarzeń',
      },
      playGames: 'Zagraj w {count} {sport}{s}',
      completeGames: 'Ukończ {count} {sport}{s}',
    },

    notifications: {
      title: 'Powiadomienia',
      noNotifications: 'Brak powiadomień',
      noNotificationsSubtext: 'Wszystko przeczytane!',
      markAsRead: 'Oznacz jako przeczytane',
      searchPlaceholder: 'Szukaj powiadomień',
      filterAll: 'Wszystkie',
      filterUnread: 'Nieprzeczytane',
      filterLabels: {
        friend_request: 'Zaproszenia do znajomych',
        event_invitation: 'Zaproszenia na wydarzenia',
        group_invite: 'Zaproszenia do grup',
        chat_message: 'Wiadomości',
        system_announcement: 'Komunikaty',
      },
      emptyTitle: 'Brak powiadomień',
      emptySubtitle: 'Jesteś na bieżąco!',
      emptySearchTitle: 'Nie znaleziono powiadomień',
      emptySearchSubtitle: 'Spróbuj zmienić kryteria wyszukiwania',
      select: 'Zaznacz',
      selectAll: 'Zaznacz wszystko',
      deselectAll: 'Wyczyść wybór',
      deleteSelected: 'Usuń',
      deleteConfirmTitle: 'Usuń powiadomienia',
      deleteConfirmMessage: 'Usunąć {count} powiadomienie(a)?',
      markAllReadTitle: 'Oznacz wszystkie jako przeczytane',
      markAllReadMessage: 'Oznaczyć wszystkie powiadomienia jako przeczytane?',
      markAllReadConfirm: 'Oznacz wszystko',
      loading: 'Ładowanie powiadomień...',
      updating: 'Aktualizowanie...',
      markAllReadButton: 'Oznacz wszystko',
      friendRequestTitle: 'Nowe zaproszenie do znajomych',
      friendRequestBody: '{name} chce się z Tobą połączyć.',
      groupInviteTitle: 'Zaproszenie do grupy',
      groupInviteBody: '{name} zaprasza Cię do grupy {group}.',
      reminder12h: '{event} rozpocznie się za 12 godzin.',
      reminder24h: '{event} rozpocznie się za 24 godziny.',
      reminder1h: '{event} rozpocznie się za 1 godzinę.',
      participantJoinedTitle: 'Nowy uczestnik',
      participantJoinedBody: 'Ktoś dołączył do {event}',
      eventCancelledTitle: 'Wydarzenie odwołane',
      eventCancelledBody: '{event} zostało odwołane',
      eventInviteTitle: 'Zaproszenie na wydarzenie',
      eventInviteBody: '{name} zaprasza Cię na {event}',
      friendRequestAcceptedTitle: 'Zaproszenie zaakceptowane',
      friendRequestAcceptedBody: '{name} zaakceptował Twoje zaproszenie do znajomych.',
      groupInviteAcceptedTitle: 'Użytkownik dołączył do grupy',
      groupInviteAcceptedBody: '{name} dołączył do grupy {group}.',
      eventCreatedTitle: 'Nowe wydarzenie od znajomego',
      eventCreatedBody: '{name} utworzył nowe wydarzenie: {event}',
      achievementUnlockedTitle: 'Osiągnięcie odblokowane!',
      achievementUnlockedBody: 'Zdobyłeś odznakę: {name}!',
      eventUpdate: 'Wydarzenie zaktualizowane',
      eventUpdateBody: 'Wydarzenie {event} zostało zaktualizowane.',
    },
    bottomNav: {
      map: 'Mapa',
      events: 'Wydarzenia',
      myGames: 'Moje Gry',
      myProfile: 'Mój Profil',
      myGroups: 'Moje Grupy',
    },
    languageScreen: {
      headerTitle: 'Język',
      title: 'Ustawienia języka',
      subtitle: 'Wybierz preferowany język dla całej aplikacji',
    },
    activityFilter: {
      title: 'Aktywności',
      cancel: 'Anuluj',
      venueTypes: 'Typy obiektów',
      specificActivities: 'Konkretne aktywności',
      specificActivitiesHint: 'Wyszukaj konkretne aktywności (np. joga, bouldering, sztuki walki)',
      keywordsPlaceholder: 'Wpisz aktywności oddzielone przecinkami',
      searchRadius: 'Promień wyszukiwania',
      apply: 'Zastosuj filtry',
      reset: 'Resetuj',
      unitKm: 'km',
      types: {
        gym: 'Siłownia/Fitness',
        stadium: 'Stadion',
        swimming_pool: 'Basen',
        park: 'Park',
        sports_complex: 'Kompleks sportowy',
        bowling_alley: 'Kręgielnia',
        golf_course: 'Pole golfowe',
        ice_rink: 'Lodowisko',
        tennis_court: 'Kort tenisowy',
        basketball_court: 'Boisko do koszykówki',
        martial_arts_gym: 'Klub sportów walki',
        grappling_hall: 'Hala do grapplingu',
      },
    },
    friends: {
      searchTitle: 'Wyszukaj znajomych',
      searchSubtitle: 'Dodaj znajomych, aby łączyć się i grać razem',
      searchPlaceholder: 'Szukaj znajomych...',
      resultsTitle: 'Wyniki',
      resultsCountLabel: 'Wyniki',
      loadingResults: 'Wyszukiwanie...',
      quickActionsTitle: 'Szybkie akcje',
      quickActions: {
        contactsTitle: 'Zaproś z kontaktów',
        contactsSubtitle: 'Znajdź znajomych w kontaktach telefonu',
        inviteLinkTitle: 'Udostępnij link zaproszenia',
        inviteLinkSubtitle: 'Wyślij link, aby zaprosić znajomych',
        nearbyTitle: 'Znajdź pobliskich użytkowników',
        nearbySubtitle: 'Odkryj ludzi w swojej okolicy',
      },
      loginRequired: 'Musisz być zalogowany, aby zarządzać znajomymi.',
      addConfirmTitle: 'Dodaj znajomego',
      addConfirmMessage: 'Wysłać zaproszenie do {name}?',
      sendRequest: 'Wyślij zaproszenie',
      addSuccess: 'Wysłano zaproszenie do {name}.',
      removeConfirmTitle: 'Usuń znajomego',
      removeConfirmMessage: 'Usunąć {name} ze znajomych?',
      removeConfirmButton: 'Usuń',
      removeSuccess: '{name} został usunięty ze znajomych.',
      pending: 'Oczekuje',
      add: 'Dodaj',
      remove: 'Usuń',
      emptyResultsTitle: 'Nie znaleziono osób',
      emptyResultsSubtitle: 'Spróbuj innego imienia lub nazwy użytkownika.',
    },
  },
  es: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Conecta con atletas locales\ny descubre lugares deportivos',
      continueWithGoogle: 'Continuar con Google',
      continueWithApple: 'Continuar con Apple',
      signUpWithEmail: 'Registrarse con Email',
      termsText: 'Al continuar, aceptas nuestros',
      termsOfService: 'TĂ©rminos de Servicio',
      privacyPolicy: 'PolĂ­tica de Privacidad',
      selectLanguage: 'Seleccionar Idioma',
    },
    auth: {
      title: 'Bienvenido de nuevo',
      subtitle: 'Inicia sesiĂłn en tu cuenta SportMap',
      emailPlaceholder: 'DirecciĂłn de email',
      passwordPlaceholder: 'ContraseĂ±a',
      signIn: 'Iniciar SesiĂłn',
      forgotPassword: 'ÂżOlvidaste la contraseĂ±a?',
      createAccount: 'Crear nueva cuenta',
    },
    register: {
      title: 'Ăšnete a SportMap',
      subtitle: 'Crea tu cuenta para empezar a conectar\ncon atletas locales',
      emailLabel: 'DirecciĂłn de email',
      displayNameLabel: 'Nombre de usuario',
      passwordLabel: 'ContraseĂ±a',
      confirmPasswordLabel: 'Confirmar contraseĂ±a',
      emailPlaceholder: 'Ingresa tu email',
      displayNamePlaceholder: 'Elige un nombre de usuario',
      passwordPlaceholder: 'Crea una contraseĂ±a',
      confirmPasswordPlaceholder: 'Confirma tu contraseĂ±a',
      favoriteSports: 'Tus deportes favoritos',
      selectSports: 'Selecciona todos los que apliquen',
      createAccount: 'Crear Cuenta',
      alreadyHaveAccount: 'ÂżYa tienes una cuenta?',
      signIn: 'Iniciar sesiĂłn',
    },
    common: {
      back: 'Atrás',
      next: 'Siguiente',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      ok: 'OK',
      add: 'Agregar',
    },

    policy: {
      privacyPolicy: 'PolĂ­tica de Privacidad',
      termsOfService: 'TĂ©rminos de Servicio',
      lastUpdated: 'Ăšltima actualizaciĂłn',
      back: 'AtrĂˇs',
    },
    map: {
      permissionDenied: 'Permiso Denegado',
      locationAccessNeeded: 'Se necesita acceso a la ubicaciĂłn para mostrar tu posiciĂłn en el mapa.',
    },
    sports: {
      boxing: 'Boxeo',
      calisthenics: 'Calistenia',
      gym: 'Gimnasio',
      basketball: 'Baloncesto',
      rollerSkating: 'Patinaje',
      football: 'FĂştbol',
      volleyball: 'Voleibol',
      bjj: 'BJJ',
      chess: 'Ajedrez',
      pingPong: 'Ping Pong',
      tennis: 'Tenis',
      badminton: 'BĂˇdminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
      martial_arts_gym: 'Gimnasio de artes marciales',
      grappling_hall: 'Sala de grappling',
      soccer: 'Fútbol (Soccer)',
      baseball: 'Béisbol',
      hockey: 'Hockey',
      swimming: 'Natación',
      running: 'Running',
      cycling: 'Ciclismo',
      golf: 'Golf',
      yoga: 'Yoga',
      pilates: 'Pilates',
      weightlifting: 'Levantamiento de pesas',
      crossfit: 'CrossFit',
      rock_climbing: 'Escalada',
      bouldering: 'Bouldering (Escalada bloque)',
      surfing: 'Surf',
      skiing: 'Esquí',
      snowboarding: 'Snowboard',
      ice_skating: 'Patinaje sobre hielo',
      rollerblading: 'Patinaje en línea',
      skating: 'Skating',
      muay_thai: 'Muay Thai',
      kickboxing: 'Kickboxing',
      wrestling: 'Lucha (Wrestling)',
      padel: 'Pádel',
      table_tennis: 'Tenis de mesa',
      other: 'Otro',
      martial_arts: 'Artes marciales',
    },

    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
    },
    settings: {
      title: 'ConfiguraciĂłn',
      account: 'Cuenta',
      favoriteSports: 'Deportes Favoritos',
      preferences: 'Preferencias',
      language: 'Idioma',
      legal: 'Legal',
      termsOfService: 'TĂ©rminos de Servicio',
      privacyPolicy: 'PolĂ­tica de Privacidad',
      development: 'Desarrollo',
      backendTest: 'Prueba de Backend',
      dangerZone: 'Zona de Peligro',
      deleteAccount: 'Eliminar Cuenta',
      logout: 'Cerrar SesiĂłn',
      logoutConfirm: 'Cerrar SesiĂłn',
      logoutMessage: 'ÂżEstĂˇs seguro de que quieres cerrar sesiĂłn?',
      deleteConfirm: 'Eliminar Cuenta',
      deleteMessage: 'Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar tu cuenta?',
      deleteSuccess: 'Tu cuenta ha sido eliminada.',

    },
    profile: {
      title: 'Perfil',
      loadingProfile: 'Cargando perfil...',
      joined: 'Se unió a SportMap en',
      earned: 'Ganadas',
      toUnlock: 'Por Desbloquear',
      progress: 'Progreso',
      achievements: 'Logros',
      viewAll: 'Ver Todo',
      noBadges: 'Sin insignias aún',
      noBadgesSubtext: '¡Juega más juegos para ganar insignias!',
      friends: 'Amigos',
      addFriends: 'Añadir Amigos',
      noFriends: 'Sin amigos aún',
      noFriendsSubtext: 'Añade amigos para conectarte y jugar juntos',
      groups: 'Grupos',
      viewGroups: 'Ver Grupos',
      noGroups: 'Sin grupos aún',
      noGroupsSubtext: 'Únete a grupos para encontrar compañeros y organizar eventos',
      errorLoading: 'Fallo al cargar los datos del perfil',
      uploading: 'Subiendo...',
      noFriendsOther: '{name} no tiene amigos aún.',
      noGroupsOther: '{name} no está en ningún grupo aún.',
      userDefault: 'Usuario',
      viewProfile: 'Ver perfil',
    },
    myEvents: {
      title: 'Mis Juegos',
      allGames: 'Todos los Juegos',
      created: 'Creados',
      joined: 'Unidos',
      upcoming: 'Próximos',
      past: 'Pasados',
      noEvents: 'Sin eventos aún',
      noEventsSubtext: 'Crea o únete a un evento para comenzar',
      createEvent: 'Crear Evento',
      viewDetails: 'Ver Detalles',
      participants: 'participantes',
      skillLevel: 'Nivel de Habilidad',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto',
      errorLoading: 'No se pudieron cargar los eventos',
      filtersComingSoonTitle: 'Filtros disponibles pronto',
      filtersComingSoonMessage: 'Estamos trabajando en filtros avanzados por deporte, fecha y ubicación.',
      moreOptionsTitle: 'Más opciones pronto',
      moreOptionsMessage: 'La ordenación, eventos pasados y ajustes llegarán en breve.',
      leaveEventTitle: 'Salir del evento',
      leaveEventMessage: '¿Quieres salir de "{name}"?',
      leaveEventConfirm: 'Salir',
      leaveEventSuccess: 'Has salido del evento.',
      participantsShort: 'unidos',
      almostFull: 'Casi lleno',
      groupLabels: {
        TODAY: 'Hoy',
        TOMORROW: 'Mañana',
        THIS_WEEK: 'Esta semana',
        NEXT_WEEK: 'La próxima semana',
        LATER: 'Más tarde',
      },
      statusLabels: {
        live: 'En vivo',
        startingSoon: 'Comienza pronto',
        cancelled: 'Cancelado',
        started: 'Ya comenzó',
      },
    },
    createEvent: {
      title: 'Crear evento',
      eventTitle: 'Título del evento',
      sportType: 'Tipo de deporte',
      dateTime: 'Fecha y hora',
      missingTitle: 'Por favor, introduce un título para el evento',
      invalidDate: 'El evento debe programarse para una hora futura',
      invalidParticipants: 'El número mínimo de participantes no puede superar al máximo',
      missingLocation: 'Falta la información de la ubicación',
    },
    myGroups: {
      title: 'Mis Grupos',
      allGroups: 'Todos los Grupos',
      yourGroups: 'Tus Grupos',
      createGroup: 'Crear Grupo',
      noGroups: 'Sin grupos aún',
      noGroupsSubtext: 'Crea o únete a un grupo para comenzar',
      members: 'miembros',
      viewDetails: 'Ver Detalles',
      adminGroupsTitle: 'Grupos que diriges',
      memberGroupsTitle: 'Grupos a los que perteneces',
      noGroupsTitle: 'Sin grupos aún',
      noGroupsMessage: 'Crea o únete a grupos para conectar con otros entusiastas del deporte',
      createFirstGroup: 'Crea tu primer grupo',
      cannotLeaveAdminTitle: 'No puedes salir del grupo',
      cannotLeaveAdminMessage: 'Eres el administrador de este grupo. Por favor, transfiere la propiedad o elimina el grupo primero.',
      leaveGroupTitle: 'Salir del grupo',
      leaveGroupMessage: '¿Estás seguro de que quieres salir de este grupo?',
      leaveConfirm: 'Salir',
      all: 'Todos',
      admin: 'Admin',
      member: 'Miembro',
      noGroupsFound: 'No se encontraron grupos',
      noGroupsFoundMessage: 'No hay grupos de tipo {filter} en tu lista',
      clearFilter: 'Limpiar filtro',
      loadingGroups: 'Cargando tus grupos...',
      public: 'Público',
      private: 'Privado',
      inviteOnly: 'Solo invitación',
    },
    createGroup: {
      title: 'Crear Grupo',
      groupName: 'Nombre del Grupo',
      groupNamePlaceholder: 'Ingresa el nombre del grupo',
      description: 'Descripción',
      descriptionPlaceholder: 'Ingresa la descripción del grupo',
      selectSport: 'Seleccionar Deporte',
      selectFriends: 'Seleccionar Amigos',
      selectFriendsOptional: 'Seleccionar Amigos (Opcional)',
      searchFriends: 'Buscar amigos...',
      create: 'Crear Grupo',
      cancel: 'Cancelar',
      success: 'Éxito',
      groupCreated: '¡Grupo creado exitosamente!',
      viewGroup: 'Ver Grupo',
      error: 'Error',
      fillFields: 'Por favor completa todos los campos requeridos',
      privacyLevel: 'Nivel de privacidad',
      memberLimit: 'Límite de miembros (opcional)',
      memberLimitPlaceholder: 'Sin límite',
      setGroupLocation: 'Establecer ubicación del grupo',
      locationVisibleRadius: 'Visible dentro del radio',
      ageRange: 'Rango de edad',
      anyLevel: 'Cualquier nivel',
      anyGender: 'Cualquier género',
      male: 'Masculino',
      female: 'Femenino',
      tags: 'Etiquetas',
      groupRules: 'Reglas del grupo',
      addTag: 'Agregar etiqueta',
      addRule: 'Agregar nueva regla',
      basicInformation: 'Información básica',
      sportCategory: 'Categoría de deporte',
      privacySettings: 'Privacidad y configuración',
      selectPrivacy: 'Seleccionar privacidad',
      locationOptional: 'Ubicación (opcional)',
      memberRequirements: 'Requisitos de miembros',
      minAge: 'Mín',
      maxAge: 'Máx',
      skillLevel: 'Nivel de habilidad',
      genderPreference: 'Preferencia de género',
      details: 'Detalles',
      tagNamePlaceholder: 'Ingresa el nombre de la etiqueta',
      ok: 'Aceptar',
      rulePlaceholder: 'Ingresa la regla',
      add: 'Agregar',
      selectSkillLevel: 'Seleccionar nivel de habilidad',
      selectGenderPreference: 'Seleccionar preferencia de género',
    },
    eventDetails: {
      title: 'Detalles del evento',
      share: 'Compartir',
      gameInformation: 'Información del juego',
      date: 'Fecha',
      time: 'Hora',
      startTime: 'Hora de inicio',
      endTime: 'Hora de finalización',
      players: 'Jugadores',
      location: 'Ubicación',
      viewOnMap: 'Ver en el mapa',
      skillLevel: 'Nivel de habilidad',
      skillLevelAll: 'Todos los niveles',
      description: 'Descripción',
      equipmentNeeded: 'Equipo necesario',
      rules: 'Reglas',
      organizer: 'Organizador',
      organizerRole: 'Creador del evento',
      creatorBadge: 'Tú creaste este evento',
      chat: 'Chat',
      joinGame: 'Unirse al juego',
      joinPrompt: '¿Quieres unirte a "{name}"?',
      joinSuccess: 'Te has unido al evento.',
      requestAccess: 'Solicitar unirse',
      requestSent: 'Solicitud enviada al organizador.',
      requestPending: 'Solicitud pendiente de aprobación',
      leaveGame: 'Salir del juego',
      manageEvent: 'Administrar evento',
      eventFull: 'Evento completo',
      eventStarted: 'El evento ya comenzó',
      shareMessage: 'Únete a mí en {name} en {location} el {date}!',
      distanceLabel: 'Distancia',
      participantsSection: 'Participantes',
      joinedLabel: 'Unidos',
      spotsLeft: 'Lugares disponibles',
      viewParticipants: 'Ver todos los participantes',
      shareError: 'No se pudo compartir el evento',
      shareSuccess: 'Evento compartido con éxito',
      viewLocationTitle: 'Ver ubicación',
      viewLocationMessage: 'Abriendo vista del mapa...',
      participantsInfoTitle: 'Participantes',
      participantsInfoMessage: '{count} personas se han unido a este evento.',
      errorTitle: 'Evento no encontrado',
      errorMessage: 'No se pudo cargar este evento.',
      errorButton: 'Volver',
      rescheduleEvent: 'Reprogramar evento',
      confirmReschedule: '¿Estás seguro de que quieres cambiar la hora de este evento?',
      deleteEvent: 'Eliminar evento',
      confirmDelete: '¿Estás seguro de que quieres eliminar PERMANENTEMENTE este evento? Esto no se puede deshacer.',
      cancelEvent: 'Cancelar evento',
      confirmCancel: '¿Estás seguro de que quieres cancelar este evento? Los participantes serán notificados.',
      manageOptions: 'Seleccione una opción para administrar su evento',
    },
    allBadges: {
      title: 'Todas las insignias',
      earnedBadge: 'Ganadas',
      locked: 'Bloqueadas',
      progressLabel: 'Progreso',
      requirementLabel: 'Requisito',
      earnedStatus: '¡Conseguida!',
      basketball: 'Baloncesto',
      football: 'Fútbol',
      tennis: 'Tenis',
      running: 'Running',
      volleyball: 'Voleibol',
      cycling: 'Ciclismo',
      gym: 'Gimnasio',
      swimming: 'Natación',
      special: 'Especial',
      tiers: {
        rookie: 'Novato',
        player: 'Jugador',
        pro: 'Profesional',
        legend: 'Leyenda',
        enthusiast: 'Entusiasta',
        regular: 'Frecuente',
        marathoner: 'Maratonista',
      },
      specialCategory: 'Logros especiales',
      specialBadges: {
        allRounderName: 'Todoterreno',
        allRounderRequirement: 'Juega 3 deportes diferentes',
        socialButterflyName: 'Estrella de la Comunidad',
        socialButterflyRequirement: 'Únete a 10 eventos en total',
      },
      playGames: 'Jugar {count} {sport}',
      completeGames: 'Completar {count} {sport}',
    },
    notifications: {
      title: 'Notificaciones',
      noNotifications: 'Sin notificaciones',
      noNotificationsSubtext: '¡Estás al día!',
      markAsRead: 'Marcar como leído',
      searchPlaceholder: 'Buscar notificaciones',
      filterAll: 'Todas',
      filterUnread: 'No leídas',
      filterLabels: {
        friend_request: 'Solicitudes de amistad',
        event_invitation: 'Invitaciones a eventos',
        group_invite: 'Invitaciones a grupos',
        chat_message: 'Chats',
        system_announcement: 'Anuncios',
      },
      emptyTitle: 'Sin notificaciones',
      emptySubtitle: '¡Estás al día!',
      emptySearchTitle: 'No se encontraron notificaciones',
      emptySearchSubtitle: 'Prueba a cambiar los términos de búsqueda',
      select: 'Seleccionar',
      selectAll: 'Seleccionar todo',
      deselectAll: 'Limpiar selección',
      deleteSelected: 'Eliminar',
      deleteConfirmTitle: 'Eliminar notificaciones',
      deleteConfirmMessage: '¿Eliminar {count} notificación(es)?',
      markAllReadTitle: 'Marcar todas como leídas',
      markAllReadMessage: '¿Marcar todas las notificaciones como leídas?',
      markAllReadConfirm: 'Marcar todas',
      loading: 'Cargando notificaciones...',
      updating: 'Actualizando...',
      markAllReadButton: 'Marcar todas',
      friendRequestTitle: 'Nueva solicitud de amistad',
      friendRequestBody: '{name} quiere conectar contigo.',
      groupInviteTitle: 'Invitación al grupo',
      groupInviteBody: '{name} te invitó al grupo {group}.',
      reminder12h: '{event} comienza en 12 horas.',
      reminder24h: '{event} comienza en 24 horas.',
      reminder1h: '{event} comienza en 1 hora.',
      participantJoinedTitle: 'Nuevo participante',
      participantJoinedBody: 'Alguien se unió a {event}',
      eventCancelledTitle: 'Evento cancelado',
      eventCancelledBody: '{event} ha sido cancelado',
      eventInviteTitle: 'Invitación al evento',
      eventInviteBody: '{name} te invitó a {event}',
      friendRequestAcceptedTitle: 'Solicitud de amistad aceptada',
      friendRequestAcceptedBody: '{name} aceptó tu solicitud de amistad.',
      groupInviteAcceptedTitle: 'Invitación al grupo aceptada',
      groupInviteAcceptedBody: '{name} se unió a {group}.',
      eventCreatedTitle: 'Nuevo evento de amigo',
      eventCreatedBody: '{name} creó un nuevo evento: {event}',
      achievementUnlockedTitle: '¡Logro desbloqueado!',
      achievementUnlockedBody: '¡Ganaste la insignia {name}!',
      eventUpdate: 'Evento actualizado',
      eventUpdateBody: 'El evento {event} ha sido actualizado.',
    },
    bottomNav: {
      map: 'Mapa',
      events: 'Eventos',
      myGames: 'Mis Juegos',
      myProfile: 'Mi Perfil',
      myGroups: 'Mis Grupos',
    },
    languageScreen: {
      headerTitle: 'Idioma',
      title: 'Configuración de idioma',
      subtitle: 'Elige tu idioma preferido para toda la aplicación',
    },
    activityFilter: {
      title: 'Actividades',
      cancel: 'Cancelar',
      venueTypes: 'Tipos de lugar',
      specificActivities: 'Actividades específicas',
      specificActivitiesHint: 'Busca actividades concretas (ej. yoga, boulder, artes marciales)',
      keywordsPlaceholder: 'Introduce actividades separadas por comas',
      searchRadius: 'Radio de búsqueda',
      apply: 'Aplicar filtros',
      reset: 'Restablecer',
      unitKm: 'km',
      types: {
        gym: 'Gimnasio/Centro fitness',
        stadium: 'Estadio',
        swimming_pool: 'Piscina',
        park: 'Parque',
        sports_complex: 'Complejo deportivo',
        bowling_alley: 'Bolera',
        golf_course: 'Campo de golf',
        ice_rink: 'Pista de hielo',
        tennis_court: 'Cancha de tenis',
        basketball_court: 'Cancha de baloncesto',
        martial_arts_gym: 'Gimnasio de artes marciales',
        grappling_hall: 'Sala de grappling',
      },
    },
    friends: {
      searchTitle: 'Buscar amigos',
      searchSubtitle: 'Agrega amigos para conectar y jugar juntos',
      searchPlaceholder: 'Buscar amigos...',
      resultsTitle: 'Resultados',
      resultsCountLabel: 'Resultados',
      loadingResults: 'Buscando...',
      quickActionsTitle: 'Accesos rápidos',
      quickActions: {
        contactsTitle: 'Invitar desde contactos',
        contactsSubtitle: 'Encuentra amigos en tus contactos del teléfono',
        inviteLinkTitle: 'Compartir enlace de invitación',
        inviteLinkSubtitle: 'Envía un enlace para invitar amigos',
        nearbyTitle: 'Encontrar usuarios cercanos',
        nearbySubtitle: 'Descubre personas en tu zona',
      },
      loginRequired: 'Debes iniciar sesión para gestionar amigos.',
      addConfirmTitle: 'Agregar amigo',
      addConfirmMessage: '¿Enviar solicitud a {name}?',
      sendRequest: 'Enviar solicitud',
      addSuccess: 'Solicitud enviada a {name}.',
      removeConfirmTitle: 'Eliminar amigo',
      removeConfirmMessage: '¿Eliminar a {name} de tus amigos?',
      removeConfirmButton: 'Eliminar',
      removeSuccess: '{name} ha sido eliminado de tus amigos.',
      pending: 'Pendiente',
      add: 'Agregar',
      remove: 'Eliminar',
      emptyResultsTitle: 'No se encontraron personas',
      emptyResultsSubtitle: 'Prueba con otro nombre o usuario.',
    },
  },
  fr: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Connectez-vous avec des athlètes locaux\net découvrez des lieux sportifs',
      continueWithGoogle: 'Continuer avec Google',
      continueWithApple: 'Continuer avec Apple',
      signUpWithEmail: 'S\'inscrire avec Email',
      termsText: 'En continuant, vous acceptez nos',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de Confidentialité',
      selectLanguage: 'Sélectionner la Langue',
    },
    auth: {
      title: 'Bon retour',
      subtitle: 'Connectez-vous à votre compte SportMap',
      emailPlaceholder: 'Adresse email',
      passwordPlaceholder: 'Mot de passe',
      signIn: 'Se connecter',
      forgotPassword: 'Mot de passe oublié ?',
      createAccount: 'Créer un nouveau compte',
    },
    register: {
      title: 'Rejoindre SportMap',
      subtitle: 'Créez votre compte pour commencer à vous connecter\navec des athlètes locaux',
      emailLabel: 'Adresse email',
      displayNameLabel: 'Nom d\'affichage',
      passwordLabel: 'Mot de passe',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      emailPlaceholder: 'Entrez votre email',
      displayNamePlaceholder: 'Choisissez un nom d\'affichage',
      passwordPlaceholder: 'Créez un mot de passe',
      confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
      favoriteSports: 'Vos sports favoris',
      selectSports: 'Sélectionnez tous ceux qui s\'appliquent',
      createAccount: 'Créer un Compte',
      alreadyHaveAccount: 'Vous avez déjà un compte ?',
      signIn: 'Se connecter',
    },
    common: {
      back: 'Retour',
      next: 'Suivant',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      confirm: 'Confirmer',
      ok: 'OK',
      add: 'Ajouter',
    },

    policy: {
      privacyPolicy: 'Politique de Confidentialité',
      termsOfService: 'Conditions d\'Utilisation',
      lastUpdated: 'Dernière mise à jour',
      back: 'Retour',
    },
    map: {
      permissionDenied: 'Permission Refusée',
      locationAccessNeeded: 'L\'accès à la localisation est nécessaire pour afficher votre position sur la carte.',
    },
    sports: {
      boxing: 'Boxe',
      calisthenics: 'Callisthénie',
      gym: 'Salle de sport',
      basketball: 'Basketball',
      rollerSkating: 'Roller',
      football: 'Football',
      volleyball: 'Volley-ball',
      bjj: 'BJJ',
      chess: 'Échecs',
      pingPong: 'Ping Pong',
      tennis: 'Tennis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
      martial_arts_gym: 'Salle de sport de combat',
      grappling_hall: 'Salle de grappling',
      soccer: 'Football (Soccer)',
      baseball: 'Baseball',
      hockey: 'Hockey',
      swimming: 'Natation',
      running: 'Course à pied',
      cycling: 'Cyclisme',
      golf: 'Golf',
      yoga: 'Yoga',
      pilates: 'Pilates',
      weightlifting: 'Musculation',
      crossfit: 'CrossFit',
      rock_climbing: 'Escalade',
      bouldering: 'Bloc / Bouldering',
      surfing: 'Surf',
      skiing: 'Ski',
      snowboarding: 'Snowboard',
      ice_skating: 'Patinage sur glace',
      rollerblading: 'Roller',
      skating: 'Skating',
      muay_thai: 'Muay Thai',
      kickboxing: 'Kickboxing',
      wrestling: 'Lutte',
      padel: 'Padel',
      table_tennis: 'Tennis de table',
      other: 'Autre',
      martial_arts: 'Arts martiaux',
    },

    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
    },
    settings: {
      title: 'Paramètres',
      account: 'Compte',
      favoriteSports: 'Sports Favoris',
      preferences: 'Préférences',
      language: 'Langue',
      legal: 'Juridique',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de Confidentialité',
      development: 'Développement',
      backendTest: 'Test Backend',
      dangerZone: 'Zone Dangereuse',
      deleteAccount: 'Supprimer le Compte',
      logout: 'Se Déconnecter',
      logoutConfirm: 'Se Déconnecter',
      logoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      deleteConfirm: 'Supprimer le Compte',
      deleteMessage: 'Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer votre compte ?',
      deleteSuccess: 'Votre compte a été supprimé.',
    },
    profile: {
      title: 'Profil',
      loadingProfile: 'Chargement du profil...',
      joined: 'Rejoint SportMap en',
      earned: 'Gagnés',
      toUnlock: 'À Débloquer',
      progress: 'Progrès',
      achievements: 'Réalisations',
      viewAll: 'Tout Voir',
      noBadges: 'Aucun badge gagné',
      noBadgesSubtext: 'Jouez plus de jeux pour gagner des badges !',
      friends: 'Amis',
      addFriends: 'Ajouter des Amis',
      noFriends: 'Pas encore d\'amis',
      noFriendsSubtext: 'Ajoutez des amis pour vous connecter et jouer ensemble',
      groups: 'Groupes',
      viewGroups: 'Voir les Groupes',
      noGroups: 'Pas encore de groupes',
      noGroupsSubtext: 'Rejoignez des groupes pour trouver des coéquipiers et organiser des événements',
      errorLoading: 'Échec du chargement des données du profil',
      uploading: 'Chargement...',
      noFriendsOther: '{name} n\'a pas encore d\'amis.',
      noGroupsOther: '{name} n\'est encore dans aucun groupe.',
      userDefault: 'Utilisateur',
      viewProfile: 'Voir le profil',
    },

    myEvents: {
      title: 'Mes Jeux',
      allGames: 'Tous les Jeux',
      created: 'Créés',
      joined: 'Rejoints',
      upcoming: 'À Venir',
      past: 'Passés',
      noEvents: 'Pas encore d\'événements',
      noEventsSubtext: 'Créez ou rejoignez un événement pour commencer',
      createEvent: 'Créer un Événement',
      viewDetails: 'Voir les Détails',
      participants: 'participants',
      skillLevel: 'Niveau de Compétence',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      expert: 'Expert',
      errorLoading: 'Impossible de charger les événements',
      filtersComingSoonTitle: 'Filtres bientôt disponibles',
      filtersComingSoonMessage: 'Nous préparons des filtres avancés par sport, date et lieu.',
      moreOptionsTitle: 'Plus d’options bientôt',
      moreOptionsMessage: 'Tri, événements passés et réglages arrivent très vite.',
      leaveEventTitle: 'Quitter l’événement',
      leaveEventMessage: 'Voulez-vous quitter « {name} » ?',
      leaveEventConfirm: 'Quitter',
      leaveEventSuccess: 'Vous avez quitté l’événement.',
      participantsShort: 'inscrits',
      almostFull: 'Presque complet',
      groupLabels: {
        TODAY: 'Aujourd’hui',
        TOMORROW: 'Demain',
        THIS_WEEK: 'Cette semaine',
        NEXT_WEEK: 'La semaine prochaine',
        LATER: 'Plus tard',
      },
      statusLabels: {
        live: 'En direct',
        startingSoon: 'Commence bientôt',
        cancelled: 'Annulé',
        started: 'Déjà commencé',
      },
    },
    createEvent: {
      title: 'Créer un événement',
      eventTitle: "Titre de l'événement",
      sportType: "Type d'activité",
      dateTime: 'Date et heure',
      missingTitle: "Veuillez saisir un titre d'événement",
      invalidDate: "L'événement doit être planifié pour une heure future",
      invalidParticipants: 'Le nombre minimum de participants ne peut pas dépasser le maximum',
      missingLocation: 'Les informations de localisation sont manquantes',
    },
    myGroups: {
      title: 'Mes Groupes',
      allGroups: 'Tous les Groupes',
      yourGroups: 'Vos Groupes',
      createGroup: 'Créer un Groupe',
      noGroups: 'Pas encore de groupes',
      noGroupsSubtext: 'Créez ou rejoignez un groupe pour commencer',
      members: 'membres',
      viewDetails: 'Voir les Détails',
      adminGroupsTitle: 'Groupes que vous gérez',
      memberGroupsTitle: 'Groupes auxquels vous appartenez',
      noGroupsTitle: 'Pas encore de groupes',
      noGroupsMessage: 'Créez ou rejoignez des groupes pour vous connecter avec d\'autres passionnés de sport',
      createFirstGroup: 'Créez votre premier groupe',
      cannotLeaveAdminTitle: 'Impossible de quitter le groupe',
      cannotLeaveAdminMessage: 'Vous êtes l\'administrateur de ce groupe. Veuillez transférer la propriété ou supprimer le groupe d\'abord.',
      leaveGroupTitle: 'Quitter le groupe',
      leaveGroupMessage: 'Êtes-vous sûr de vouloir quitter ce groupe ?',
      leaveConfirm: 'Quitter',
      all: 'Tout',
      admin: 'Admin',
      member: 'Membre',
      noGroupsFound: 'Aucun groupe trouvé',
      noGroupsFoundMessage: 'Aucun groupe de type {filter} dans votre liste',
      clearFilter: 'Effacer le filtre',
      loadingGroups: 'Chargement de vos groupes...',
      public: 'Public',
      private: 'Privé',
      inviteOnly: 'Sur invitation',
    },
    createGroup: {
      title: 'Créer un Groupe',
      groupName: 'Nom du Groupe',
      groupNamePlaceholder: 'Entrez le nom du groupe',
      description: 'Description',
      descriptionPlaceholder: 'Entrez la description du groupe',
      selectSport: 'Sélectionner un Sport',
      selectFriends: 'Sélectionner des Amis',
      selectFriendsOptional: 'Sélectionner des Amis (Optionnel)',
      searchFriends: 'Rechercher des amis...',
      create: 'Créer un Groupe',
      cancel: 'Annuler',
      success: 'Succès',
      groupCreated: 'Groupe créé avec succès !',
      viewGroup: 'Voir le Groupe',
      error: 'Erreur',
      fillFields: 'Veuillez remplir tous les champs obligatoires',
      privacyLevel: 'Niveau de confidentialité',
      memberLimit: 'Limite de membres (optionnel)',
      memberLimitPlaceholder: 'Aucune limite',
      setGroupLocation: 'Définir le lieu du groupe',
      locationVisibleRadius: 'Visible dans un rayon',
      ageRange: 'Tranche d\'âge',
      anyLevel: 'Tout niveau',
      anyGender: 'Tout genre',
      male: 'Masculin',
      female: 'Féminin',
      tags: 'Tags',
      groupRules: 'Règles du groupe',
      addTag: 'Ajouter un tag',
      addRule: 'Ajouter une nouvelle règle',
      basicInformation: 'Informations de base',
      sportCategory: 'Catégorie d’activité',
      privacySettings: 'Confidentialité et paramètres',
      selectPrivacy: 'Sélectionner la confidentialité',
      locationOptional: 'Localisation (optionnel)',
      memberRequirements: 'Conditions d’adhésion',
      minAge: 'Min',
      maxAge: 'Max',
      skillLevel: 'Niveau de compétence',
      genderPreference: 'Préférence de genre',
      details: 'Détails',
      tagNamePlaceholder: 'Entrez le nom du tag',
      ok: 'OK',
      rulePlaceholder: 'Entrez la règle',
      add: 'Ajouter',
      selectSkillLevel: 'Sélectionnez le niveau de compétence',
      selectGenderPreference: 'Sélectionnez la préférence de genre',
    },
    eventDetails: {
      title: 'Détails de l’événement',
      share: 'Partager',
      gameInformation: 'Informations sur le jeu',
      date: 'Date',
      time: 'Heure',
      startTime: 'Heure de début',
      endTime: 'Heure de fin',
      players: 'Joueurs',
      location: 'Lieu',
      viewOnMap: 'Voir sur la carte',
      skillLevel: 'Niveau de compétence',
      skillLevelAll: 'Tous niveaux',
      description: 'Description',
      equipmentNeeded: 'Équipement nécessaire',
      rules: 'Règles',
      organizer: 'Organisateur',
      organizerRole: 'Créateur de l’événement',
      creatorBadge: 'Vous avez créé cet événement',
      chat: 'Chat',
      joinGame: 'Rejoindre',
      joinPrompt: 'Voulez-vous rejoindre « {name} » ?',
      joinSuccess: 'Vous avez rejoint l’événement.',
      requestAccess: 'Demander à rejoindre',
      requestSent: 'Demande envoyée à l’organisateur.',
      requestPending: 'En attente d’approbation',
      leaveGame: 'Quitter',
      manageEvent: 'Gérer l’événement',
      eventFull: 'Événement complet',
      eventStarted: 'L’événement a déjà commencé',
      shareMessage: 'Rejoignez-moi pour {name} à {location} le {date} !',
      distanceLabel: 'Distance',
      participantsSection: 'Participants',
      joinedLabel: 'Inscrits',
      spotsLeft: 'Places restantes',
      viewParticipants: 'Voir tous les participants',
      shareError: 'Impossible de partager l’événement',
      shareSuccess: 'Événement partagé',
      viewLocationTitle: 'Voir la localisation',
      viewLocationMessage: 'Ouverture de la carte...',
      participantsInfoTitle: 'Participants',
      participantsInfoMessage: '{count} personnes ont rejoint cet événement.',
      errorTitle: 'Événement introuvable',
      errorMessage: 'Impossible de charger cet événement.',
      errorButton: 'Retour',
      rescheduleEvent: 'Reporter l’événement',
      confirmReschedule: 'Êtes-vous sûr de vouloir modifier l’heure de cet événement ?',
      deleteEvent: 'Supprimer l’événement',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT cet événement ? Cette action est irréversible.',
      cancelEvent: 'Annuler l’événement',
      confirmCancel: 'Êtes-vous sûr de vouloir annuler cet événement ? Les participants seront informés.',
      manageOptions: 'Sélectionnez une option pour gérer votre événement',
    },
    allBadges: {
      title: 'Tous les badges',
      earnedBadge: 'Gagnés',
      locked: 'Verrouillés',
      progressLabel: 'Progression',
      requirementLabel: 'Condition',
      earnedStatus: 'Obtenue !',
      tiers: {
        rookie: 'Débutant',
        player: 'Joueur',
        pro: 'Pro',
        legend: 'Légende',
        enthusiast: 'Passionné',
        regular: 'Habitué',
        marathoner: 'Marathonien',
      },
      basketball: 'Basketball',
      football: 'Football',
      tennis: 'Tennis',
      running: 'Running',
      volleyball: 'Volley-ball',
      cycling: 'Cyclisme',
      gym: 'Salle de sport',
      swimming: 'Natation',
      special: 'Spécial',
      specialCategory: 'Réalisations spéciales',
      specialBadges: {
        allRounderName: 'Polyvalent',
        allRounderRequirement: 'Jouer 3 sports différents',
        socialButterflyName: 'Star de la Communauté',
        socialButterflyRequirement: 'Participer à 10 événements',
      },
      playGames: 'Jouer {count} {sport}',
      completeGames: 'Compléter {count} {sport}',
    },

    notifications: {
      title: 'Notifications',
      noNotifications: 'Aucune notification',
      noNotificationsSubtext: 'Vous êtes à jour !',
      markAsRead: 'Marquer comme lu',
      searchPlaceholder: 'Rechercher des notifications',
      filterAll: 'Tout',
      filterUnread: 'Non lues',
      filterLabels: {
        friend_request: 'Demandes d’ami',
        event_invitation: 'Invitations',
        group_invite: 'Invitations aux groupes',
        chat_message: 'Messages',
        system_announcement: 'Annonces',
      },
      emptyTitle: 'Aucune notification',
      emptySubtitle: 'Vous êtes à jour !',
      emptySearchTitle: 'Aucune notification trouvée',
      emptySearchSubtitle: 'Essayez d’ajuster votre recherche',
      select: 'Sélectionner',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Effacer la sélection',
      deleteSelected: 'Supprimer',
      deleteConfirmTitle: 'Supprimer les notifications',
      deleteConfirmMessage: 'Supprimer {count} notification(s) ?',
      markAllReadTitle: 'Tout marquer comme lu',
      markAllReadMessage: 'Voulez-vous marquer toutes les notifications comme lues ?',
      markAllReadConfirm: 'Tout marquer',
      loading: 'Chargement des notifications...',
      updating: 'Mise à jour...',
      markAllReadButton: 'Tout marquer',
      friendRequestTitle: 'Nouvelle demande d’ami',
      friendRequestBody: '{name} souhaite se connecter avec vous.',
      groupInviteTitle: 'Invitation au groupe',
      groupInviteBody: '{name} vous invite à rejoindre {group}.',
      reminder12h: '{event} commence dans 12 heures.',
      reminder24h: '{event} commence dans 24 heures.',
      reminder1h: '{event} commence dans 1 heure.',
      participantJoinedTitle: 'Nouveau participant',
      participantJoinedBody: 'Quelqu\'un a rejoint {event}',
      eventCancelledTitle: 'Événement annulé',
      eventCancelledBody: '{event} a été annulé',
      eventInviteTitle: 'Invitation à l’événement',
      eventInviteBody: '{name} vous a invité à {event}',
      friendRequestAcceptedTitle: 'Demande d’ami acceptée',
      friendRequestAcceptedBody: '{name} a accepté votre demande d’ami.',
      groupInviteAcceptedTitle: 'Invitation au groupe acceptée',
      groupInviteAcceptedBody: '{name} a rejoint {group}.',
      eventCreatedTitle: 'Nouvel événement d’un ami',
      eventCreatedBody: '{name} a créé un nouvel événement: {event}',
      achievementUnlockedTitle: 'Succès déverrouillé !',
      achievementUnlockedBody: 'Vous avez remporté le badge {name} !',
      eventUpdate: 'Événement mis à jour',
      eventUpdateBody: 'L’événement {event} a été mis à jour.',
    },
    bottomNav: {
      map: 'Carte',
      events: 'Événements',
      myGames: 'Mes Jeux',
      myProfile: 'Mon Profil',
      myGroups: 'Mes Groupes',
    },
    languageScreen: {
      headerTitle: 'Langue',
      title: 'Paramètres de langue',
      subtitle: 'Choisissez la langue de l’application',
    },
    activityFilter: {
      title: 'Activités',
      cancel: 'Annuler',
      venueTypes: 'Types de lieu',
      specificActivities: 'Activités spécifiques',
      specificActivitiesHint: 'Recherchez des activités (ex. yoga, escalade, arts martiaux)',
      keywordsPlaceholder: 'Entrez des activités séparées par des virgules',
      searchRadius: 'Rayon de recherche',
      apply: 'Appliquer les filtres',
      reset: 'Réinitialiser',
      unitKm: 'km',
      types: {
        gym: 'Salle de sport / Fitness',
        stadium: 'Stade',
        swimming_pool: 'Piscine',
        park: 'Parc',
        sports_complex: 'Complexe sportif',
        bowling_alley: 'Bowling',
        golf_course: 'Parcours de golf',
        ice_rink: 'Patinoire',
        tennis_court: 'Court de tennis',
        basketball_court: 'Terrain de basket',
      },
    },
    friends: {
      searchTitle: 'Rechercher des amis',
      searchSubtitle: 'Ajoutez des amis pour jouer ensemble',
      searchPlaceholder: 'Rechercher des amis...',
      resultsTitle: 'Résultats',
      resultsCountLabel: 'Résultats',
      loadingResults: 'Recherche...',
      quickActionsTitle: 'Actions rapides',
      quickActions: {
        contactsTitle: 'Inviter depuis les contacts',
        contactsSubtitle: 'Trouvez des amis dans votre téléphone',
        inviteLinkTitle: 'Partager un lien d’invitation',
        inviteLinkSubtitle: 'Envoyez un lien pour inviter des amis',
        nearbyTitle: 'Trouver des utilisateurs proches',
        nearbySubtitle: 'Découvrez des personnes autour de vous',
      },
      loginRequired: 'Vous devez être connecté pour gérer vos amis.',
      addConfirmTitle: 'Ajouter un ami',
      addConfirmMessage: 'Envoyer une demande à {name} ?',
      sendRequest: 'Envoyer',
      addSuccess: 'Demande envoyée à {name}.',
      removeConfirmTitle: 'Supprimer l’ami',
      removeConfirmMessage: 'Retirer {name} de vos amis ?',
      removeConfirmButton: 'Supprimer',
      removeSuccess: '{name} a été retiré de vos amis.',
      pending: 'En attente',
      add: 'Ajouter',
      remove: 'Supprimer',
      emptyResultsTitle: 'Aucune personne trouvée',
      emptyResultsSubtitle: 'Essayez un autre nom ou pseudo.',
    },
  },
  de: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Verbinde dich mit lokalen Sportlern\nund entdecke Sportstätten',
      continueWithGoogle: 'Mit Google fortfahren',
      continueWithApple: 'Mit Apple fortfahren',
      signUpWithEmail: 'Mit E-Mail registrieren',
      termsText: 'Durch Fortfahren stimmst du unseren',
      termsOfService: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzrichtlinie',
      selectLanguage: 'Sprache auswählen',
    },
    auth: {
      title: 'Willkommen zurück',
      subtitle: 'Melde dich in deinem SportMap-Konto an',
      emailPlaceholder: 'E-Mail-Adresse',
      passwordPlaceholder: 'Passwort',
      signIn: 'Anmelden',
      forgotPassword: 'Passwort vergessen?',
      createAccount: 'Neues Konto erstellen',
    },
    register: {
      title: 'SportMap beitreten',
      subtitle: 'Erstelle dein Konto, um dich mit\nlokalen Sportlern zu verbinden',
      emailLabel: 'E-Mail-Adresse',
      displayNameLabel: 'Anzeigename',
      passwordLabel: 'Passwort',
      confirmPasswordLabel: 'Passwort bestätigen',
      emailPlaceholder: 'Gib deine E-Mail ein',
      displayNamePlaceholder: 'Wähle einen Anzeigenamen',
      passwordPlaceholder: 'Erstelle ein Passwort',
      confirmPasswordPlaceholder: 'Bestätige dein Passwort',
      favoriteSports: 'Deine Lieblingssportarten',
      selectSports: 'Wähle alle aus, die zutreffen',
      createAccount: 'Konto Erstellen',
      alreadyHaveAccount: 'Hast du bereits ein Konto?',
      signIn: 'Anmelden',
    },
    common: {
      back: 'Zurück',
      next: 'Weiter',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      confirm: 'Bestätigen',
      ok: 'OK',
      add: 'Hinzufügen',
    },

    policy: {
      privacyPolicy: 'Datenschutzrichtlinie',
      termsOfService: 'Nutzungsbedingungen',
      lastUpdated: 'Zuletzt aktualisiert',
      back: 'Zurück',
    },
    map: {
      permissionDenied: 'Berechtigung Verweigert',
      locationAccessNeeded: 'Standortzugriff ist erforderlich, um deine Position auf der Karte anzuzeigen.',
    },
    sports: {
      boxing: 'Boxen',
      calisthenics: 'Calisthenics',
      gym: 'Fitnessstudio',
      basketball: 'Basketball',
      rollerSkating: 'Rollschuhlaufen',
      football: 'Fußball',
      volleyball: 'Volleyball',
      bjj: 'BJJ',
      chess: 'Schach',
      pingPong: 'Ping Pong',
      tennis: 'Tennis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
      martial_arts_gym: 'Kampfsportschule',
      grappling_hall: 'Grappling-Halle',
      soccer: 'Fußball (Soccer)',
      baseball: 'Baseball',
      hockey: 'Hockey',
      swimming: 'Schwimmen',
      running: 'Laufen',
      cycling: 'Radsport',
      golf: 'Golf',
      yoga: 'Yoga',
      pilates: 'Pilates',
      weightlifting: 'Gewichtheben',
      crossfit: 'CrossFit',
      rock_climbing: 'Klettern',
      bouldering: 'Bouldern',
      surfing: 'Surfen',
      skiing: 'Skifahren',
      snowboarding: 'Snowboarden',
      ice_skating: 'Eislaufen',
      rollerblading: 'Inlineskaten',
      skating: 'Skating',
      muay_thai: 'Muay Thai',
      kickboxing: 'Kickboxen',
      wrestling: 'Ringen',
      padel: 'Padel',
      table_tennis: 'Tischtennis',
      other: 'Andere',
      martial_arts: 'Kampfsport',
    },

    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
    },
    settings: {
      title: 'Einstellungen',
      account: 'Konto',
      favoriteSports: 'Lieblingssportarten',
      preferences: 'Präferenzen',
      language: 'Sprache',
      legal: 'Rechtliches',
      termsOfService: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzrichtlinie',
      development: 'Entwicklung',
      backendTest: 'Backend-Test',
      dangerZone: 'Gefahrenzone',
      deleteAccount: 'Konto Löschen',
      logout: 'Abmelden',
      logoutConfirm: 'Abmelden',
      logoutMessage: 'Möchten Sie sich wirklich abmelden?',
      deleteConfirm: 'Konto Löschen',
      deleteMessage: 'Diese Aktion kann nicht rückgängig gemacht werden. Möchten Sie Ihr Konto wirklich löschen?',
      deleteSuccess: 'Ihr Konto wurde gelöscht.',
    },
    profile: {
      title: 'Profil',
      loadingProfile: 'Profil wird geladen...',
      joined: 'SportMap beigetreten in',
      earned: 'Verdient',
      toUnlock: 'Zum Freischalten',
      progress: 'Fortschritt',
      achievements: 'Erfolge',
      viewAll: 'Alle Ansehen',
      noBadges: 'Noch keine Abzeichen verdient',
      noBadgesSubtext: 'Spielen Sie mehr Spiele, um Abzeichen zu verdienen!',
      friends: 'Freunde',
      addFriends: 'Freunde Hinzufügen',
      noFriends: 'Noch keine Freunde',
      noFriendsSubtext: 'Fügen Sie Freunde hinzu, um sich zu verbinden und zusammen zu spielen',
      groups: 'Gruppen',
      viewGroups: 'Gruppen Ansehen',
      noGroups: 'Noch keine Gruppen',
      noGroupsSubtext: 'Treten Sie Gruppen bei, um Teammitglieder zu finden und Veranstaltungen zu organisieren',
      errorLoading: 'Fehler beim Laden der Profildaten',
      uploading: 'Hochladen...',
      noFriendsOther: '{name} hat noch keine Freunde.',
      noGroupsOther: '{name} ist noch in keinen Gruppen.',
      userDefault: 'Benutzer',
      viewProfile: 'Profil anzeigen',
    },

    myEvents: {
      title: 'Meine Spiele',
      allGames: 'Alle Spiele',
      created: 'Erstellt',
      joined: 'Beigetreten',
      upcoming: 'Bevorstehend',
      past: 'Vergangen',
      noEvents: 'Noch keine Veranstaltungen',
      noEventsSubtext: 'Erstellen oder treten Sie einer Veranstaltung bei, um zu beginnen',
      createEvent: 'Veranstaltung Erstellen',
      viewDetails: 'Details Ansehen',
      participants: 'Teilnehmer',
      skillLevel: 'FĂ¤higkeitslevel',
      beginner: 'AnfĂ¤nger',
      intermediate: 'Mittelstufe',
      advanced: 'Fortgeschritten',
      expert: 'Experte',
      errorLoading: 'Veranstaltungen konnten nicht geladen werden',
      filtersComingSoonTitle: 'Filter kommen bald',
      filtersComingSoonMessage: 'Wir arbeiten an erweiterten Filtern für Sportart, Datum und Ort.',
      moreOptionsTitle: 'Weitere Optionen folgen',
      moreOptionsMessage: 'Sortierung, vergangene Spiele und Einstellungen erscheinen in Kürze.',
      leaveEventTitle: 'Event verlassen',
      leaveEventMessage: 'Möchtest du „{name}“ verlassen?',
      leaveEventConfirm: 'Verlassen',
      leaveEventSuccess: 'Du hast das Event verlassen.',
      participantsShort: 'teilgenommen',
      almostFull: 'Fast voll',
      groupLabels: {
        TODAY: 'Heute',
        TOMORROW: 'Morgen',
        THIS_WEEK: 'Diese Woche',
        NEXT_WEEK: 'Nächste Woche',
        LATER: 'Später',
      },
      statusLabels: {
        live: 'Live',
        startingSoon: 'Beginnt bald',
        cancelled: 'Abgesagt',
        started: 'Bereits gestartet',
      },
    },
    createEvent: {
      title: 'Event erstellen',
      eventTitle: 'Event-Titel',
      sportType: 'Sportart',
      dateTime: 'Datum & Uhrzeit',
      missingTitle: 'Bitte geben Sie einen Event-Titel ein',
      invalidDate: 'Das Event muss für einen zukünftigen Zeitpunkt geplant werden',
      invalidParticipants: 'Die Mindestteilnehmerzahl darf das Maximum nicht überschreiten',
      missingLocation: 'Standortinformationen fehlen',
    },
    myGroups: {
      title: 'Meine Gruppen',
      allGroups: 'Alle Gruppen',
      yourGroups: 'Ihre Gruppen',
      createGroup: 'Gruppe Erstellen',
      noGroups: 'Noch keine Gruppen',
      noGroupsSubtext: 'Erstellen oder treten Sie einer Gruppe bei, um zu beginnen',
      members: 'Mitglieder',
      viewDetails: 'Details Ansehen',
      adminGroupsTitle: 'Gruppen, die Sie verwalten',
      memberGroupsTitle: 'Gruppen, denen Sie angehĂ¶ren',
      noGroupsTitle: 'Noch keine Gruppen',
      noGroupsMessage: 'Erstellen oder treten Sie Gruppen bei, um sich mit anderen Sportbegeisterten zu vernetzen',
      createFirstGroup: 'Erstellen Sie Ihre erste Gruppe',
      cannotLeaveAdminTitle: 'Gruppe kann nicht verlassen werden',
      cannotLeaveAdminMessage: 'Sie sind der Administrator dieser Gruppe. Bitte ĂĽbertragen Sie die EigentĂĽmerschaft oder lĂ¶schen Sie die Gruppe zuerst.',
      leaveGroupTitle: 'Gruppe verlassen',
      leaveGroupMessage: 'Sind Sie sicher, dass Sie diese Gruppe verlassen mĂ¶chten?',
      leaveConfirm: 'Verlassen',
      all: 'Alle',
      admin: 'Admin',
      member: 'Mitglied',
      noGroupsFound: 'Keine Gruppen gefunden',
      noGroupsFoundMessage: 'Keine {filter} Gruppen in Ihrer Liste',
      clearFilter: 'Filter lĂ¶schen',
      loadingGroups: 'Ihre Gruppen werden geladen...',
      public: 'Ă–ffentlich',
      private: 'Privat',
      inviteOnly: 'Nur Einladung',
    },
    createGroup: {
      title: 'Gruppe Erstellen',
      groupName: 'Gruppenname',
      groupNamePlaceholder: 'Geben Sie den Gruppennamen ein',
      description: 'Beschreibung',
      descriptionPlaceholder: 'Geben Sie die Gruppenbeschreibung ein',
      selectSport: 'Sportart AuswĂ¤hlen',
      selectFriends: 'Freunde AuswĂ¤hlen',
      selectFriendsOptional: 'Freunde AuswĂ¤hlen (Optional)',
      searchFriends: 'Freunde suchen...',
      create: 'Gruppe Erstellen',
      cancel: 'Abbrechen',
      success: 'Erfolg',
      groupCreated: 'Gruppe erfolgreich erstellt!',
      viewGroup: 'Gruppe Ansehen',
      error: 'Fehler',
      fillFields: 'Bitte fĂĽllen Sie alle erforderlichen Felder aus',
      privacyLevel: 'PrivatsphĂ¤re-Level',
      memberLimit: 'Mitgliederlimit (optional)',
      memberLimitPlaceholder: 'Kein Limit',
      setGroupLocation: 'Gruppenstandort festlegen',
      locationVisibleRadius: 'Sichtbar im Umkreis',
      ageRange: 'Altersbereich',
      anyLevel: 'Jedes Level',
      anyGender: 'Jedes Geschlecht',
      male: 'MĂ¤nnlich',
      female: 'Weiblich',
      tags: 'Tags',
      groupRules: 'Gruppenregeln',
      addTag: 'Tag hinzufügen',
      addRule: 'Neue Regel hinzufügen',
      basicInformation: 'Basisinformationen',
      sportCategory: 'Sportkategorie',
      privacySettings: 'Privatsphäre & Einstellungen',
      selectPrivacy: 'Privatsphäre auswählen',
      locationOptional: 'Standort (optional)',
      memberRequirements: 'Mitgliedsanforderungen',
      minAge: 'Min',
      maxAge: 'Max',
      skillLevel: 'Leistungsniveau',
      genderPreference: 'Geschlechtspräferenz',
      details: 'Details',
      tagNamePlaceholder: 'Tag-Namen eingeben',
      ok: 'OK',
      rulePlaceholder: 'Regel eingeben',
      add: 'Hinzufügen',
      selectSkillLevel: 'Leistungsniveau auswählen',
      selectGenderPreference: 'Geschlechtspräferenz auswählen',
    },
    eventDetails: {
      title: 'Event-Details',
      share: 'Teilen',
      gameInformation: 'Spielinformationen',
      date: 'Datum',
      time: 'Uhrzeit',
      startTime: 'Startzeit',
      endTime: 'Endzeit',
      players: 'Spieler',
      location: 'Ort',
      viewOnMap: 'Auf Karte anzeigen',
      skillLevel: 'Fähigkeitslevel',
      skillLevelAll: 'Alle Level',
      description: 'Beschreibung',
      equipmentNeeded: 'Benötigte Ausrüstung',
      rules: 'Regeln',
      organizer: 'Organisator',
      organizerRole: 'Event-Ersteller',
      creatorBadge: 'Du hast dieses Event erstellt',
      chat: 'Chat',
      joinGame: 'Beitreten',
      joinPrompt: 'Möchtest du „{name}“ beitreten?',
      joinSuccess: 'Du hast dem Event beigetreten.',
      requestAccess: 'Beitritt anfragen',
      requestSent: 'Anfrage wurde an den Organisator gesendet.',
      requestPending: 'Wartet auf Bestätigung',
      leaveGame: 'Verlassen',
      manageEvent: 'Event verwalten',
      eventFull: 'Event ausgebucht',
      eventStarted: 'Event hat bereits begonnen',
      shareMessage: 'Begleite mich zu {name} in {location} am {date}!',
      distanceLabel: 'Entfernung',
      participantsSection: 'Teilnehmende',
      joinedLabel: 'Teilnehmend',
      spotsLeft: 'Plätze frei',
      viewParticipants: 'Alle Teilnehmenden anzeigen',
      shareError: 'Event konnte nicht geteilt werden',
      shareSuccess: 'Event geteilt',
      viewLocationTitle: 'Ort anzeigen',
      viewLocationMessage: 'Kartenansicht wird geöffnet...',
      participantsInfoTitle: 'Teilnehmende',
      participantsInfoMessage: '{count} Personen haben an diesem Event teilgenommen.',
      errorTitle: 'Event nicht gefunden',
      errorMessage: 'Dieses Event konnte nicht geladen werden.',
      errorButton: 'Zurück',
      rescheduleEvent: 'Termin verschieben',
      confirmReschedule: 'Sind Sie sicher, dass Sie die Zeit dieses Events ändern möchten?',
      deleteEvent: 'Event löschen',
      confirmDelete: 'Sind Sie sicher, dass Sie dieses Event DAUERHAFT löschen möchten? Dies kann nicht rückgängig gemacht werden.',
      cancelEvent: 'Event absagen',
      confirmCancel: 'Sind Sie sicher, dass Sie dieses Event absagen möchten? Die Teilnehmer werden benachrichtigt.',
      manageOptions: 'Wählen Sie eine Option zur Verwaltung Ihres Events',
    },
    allBadges: {
      title: 'Alle Abzeichen',
      earnedBadge: 'Verdient',
      locked: 'Gesperrt',
      progressLabel: 'Fortschritt',
      requirementLabel: 'Anforderung',
      earnedStatus: 'Erhalten!',
      tiers: {
        rookie: 'Einsteiger',
        player: 'Spieler',
        pro: 'Profi',
        legend: 'Legende',
        enthusiast: 'Fan',
        regular: 'Stammspieler',
        marathoner: 'Marathonläufer',
      },
      basketball: 'Basketball',
      football: 'Fußball',
      tennis: 'Tennis',
      running: 'Running',
      volleyball: 'Volleyball',
      cycling: 'Radfahren',
      gym: 'Fitnessstudio',
      swimming: 'Schwimmen',
      special: 'Spezial',
      specialCategory: 'Besondere Erfolge',
      specialBadges: {
        allRounderName: 'Allrounder',
        allRounderRequirement: 'Spiele 3 verschiedene Sportarten',
        socialButterflyName: 'Community-Star',
        socialButterflyRequirement: 'Nimm an insgesamt 10 Veranstaltungen teil',
      },
      playGames: 'Spiele {count} {sport}-Spiel{s}',
      completeGames: 'Absolviere {count} {sport}{s}',
    },

    notifications: {
      title: 'Benachrichtigungen',
      noNotifications: 'Keine Benachrichtigungen',
      noNotificationsSubtext: 'Du bist auf dem neuesten Stand!',
      markAsRead: 'Als gelesen markieren',
      searchPlaceholder: 'Benachrichtigungen durchsuchen',
      filterAll: 'Alle',
      filterUnread: 'Ungelesen',
      filterLabels: {
        friend_request: 'Freundschaftsanfragen',
        event_invitation: 'Event-Einladungen',
        group_invite: 'Gruppeneinladungen',
        chat_message: 'Chats',
        system_announcement: 'Ankündigungen',
      },
      emptyTitle: 'Keine Benachrichtigungen',
      emptySubtitle: 'Du bist auf dem neuesten Stand!',
      emptySearchTitle: 'Keine Treffer',
      emptySearchSubtitle: 'Passe deine Suche an',
      select: 'Auswählen',
      selectAll: 'Alle auswählen',
      deselectAll: 'Auswahl löschen',
      deleteSelected: 'Löschen',
      deleteConfirmTitle: 'Benachrichtigungen löschen',
      deleteConfirmMessage: '{count} Benachrichtigung(en) löschen?',
      markAllReadTitle: 'Alle als gelesen markieren',
      markAllReadMessage: 'Alle Benachrichtigungen als gelesen markieren?',
      markAllReadConfirm: 'Alle markieren',
      loading: 'Benachrichtigungen werden geladen...',
      updating: 'Aktualisiere...',
      markAllReadButton: 'Alle markieren',
      friendRequestTitle: 'Neue Freundschaftsanfrage',
      friendRequestBody: '{name} möchte sich mit dir verbinden.',
      groupInviteTitle: 'Gruppeneinladung',
      groupInviteBody: '{name} hat dich in die Gruppe {group} eingeladen.',
      reminder12h: '{event} beginnt in 12 Stunden.',
      reminder24h: '{event} beginnt in 24 Stunden.',
      reminder1h: '{event} beginnt in 1 Stunde.',
      participantJoinedTitle: 'Neuer Teilnehmer',
      participantJoinedBody: 'Jemand ist {event} beigetreten',
      eventCancelledTitle: 'Event abgesagt',
      eventCancelledBody: '{event} wurde abgesagt',
      eventInviteTitle: 'Event-Einladung',
      eventInviteBody: '{name} hat dich zu {event} eingeladen',
      friendRequestAcceptedTitle: 'Freundschaftsanfrage angenommen',
      friendRequestAcceptedBody: '{name} hat deine Freundschaftsanfrage angenommen.',
      groupInviteAcceptedTitle: 'Gruppeneinladung angenommen',
      groupInviteAcceptedBody: '{name} ist {group} beigetreten.',
      eventCreatedTitle: 'Neues Event von Freund',
      eventCreatedBody: '{name} hat ein neues Event erstellt: {event}',
      achievementUnlockedTitle: 'Erfolg freigeschaltet!',
      achievementUnlockedBody: 'Du hast das Abzeichen {name} erhalten!',
      eventUpdate: 'Event aktualisiert',
      eventUpdateBody: 'Das Event {event} wurde aktualisiert.',
    },
    bottomNav: {
      map: 'Karte',
      events: 'Veranstaltungen',
      myGames: 'Meine Spiele',
      myProfile: 'Mein Profil',
      myGroups: 'Meine Gruppen',
    },
    languageScreen: {
      headerTitle: 'Sprache',
      title: 'Spracheinstellungen',
      subtitle: 'Wähle die Sprache für die gesamte App',
    },
    activityFilter: {
      title: 'Aktivitäten',
      cancel: 'Abbrechen',
      venueTypes: 'Ortsarten',
      specificActivities: 'Spezielle Aktivitäten',
      specificActivitiesHint: 'Suche nach Aktivitäten (z. B. Yoga, Bouldern, Kampfsport)',
      keywordsPlaceholder: 'Aktivitäten durch Kommas getrennt eingeben',
      searchRadius: 'Suchradius',
      apply: 'Filter anwenden',
      reset: 'Zurücksetzen',
      unitKm: 'km',
      types: {
        gym: 'Fitnessstudio',
        stadium: 'Stadion',
        swimming_pool: 'Schwimmbad',
        park: 'Park',
        sports_complex: 'Sportanlage',
        bowling_alley: 'Bowlingbahn',
        golf_course: 'Golfplatz',
        ice_rink: 'Eislaufbahn',
        tennis_court: 'Tennisplatz',
        basketball_court: 'Basketballfeld',
      },
    },
    friends: {
      searchTitle: 'Freunde finden',
      searchSubtitle: 'Füge Freunde hinzu, um gemeinsam zu spielen',
      searchPlaceholder: 'Freunde suchen...',
      resultsTitle: 'Ergebnisse',
      resultsCountLabel: 'Ergebnisse',
      loadingResults: 'Suche...',
      quickActionsTitle: 'Schnellaktionen',
      quickActions: {
        contactsTitle: 'Aus Kontakten einladen',
        contactsSubtitle: 'Finde Freunde in deinen Telefonkontakten',
        inviteLinkTitle: 'Einladungslink teilen',
        inviteLinkSubtitle: 'Sende einen Link, um Freunde einzuladen',
        nearbyTitle: 'Nutzer in der Nähe finden',
        nearbySubtitle: 'Entdecke Leute in deiner Umgebung',
      },
      loginRequired: 'Du musst angemeldet sein, um Freunde zu verwalten.',
      addConfirmTitle: 'Freund hinzufügen',
      addConfirmMessage: 'Freundschaftsanfrage an {name} senden?',
      sendRequest: 'Senden',
      addSuccess: 'Anfrage an {name} gesendet.',
      removeConfirmTitle: 'Freund entfernen',
      removeConfirmMessage: '{name} aus deiner Freundesliste entfernen?',
      removeConfirmButton: 'Entfernen',
      removeSuccess: '{name} wurde entfernt.',
      pending: 'Ausstehend',
      add: 'Hinzufügen',
      remove: 'Entfernen',
      emptyResultsTitle: 'Keine Personen gefunden',
      emptyResultsSubtitle: 'Versuche einen anderen Namen oder Nutzernamen.',
    },
  },
};

// Context interface
interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
  availableLanguages: { code: Language; name: string }[];
}

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Provider component
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const availableLanguages = useMemo(
    () =>
      [
        { code: 'en' as Language, name: translations.en.languages.english },
        { code: 'pl' as Language, name: translations.pl.languages.polish },
        { code: 'es' as Language, name: translations.es.languages.spanish },
        { code: 'fr' as Language, name: translations.fr.languages.french },
        { code: 'de' as Language, name: translations.de.languages.german },
      ].map(option => ({ ...option, name: fixMojibakeString(option.name) })),
    []
  );

  // Load saved language on app start
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.log('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  // Save language when changed
  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  // Fix any encoding issues in the selected language at runtime
  const fixedTranslations = fixTranslationsObject<Translations>(translations[language]);

  const value: TranslationContextType = {
    language,
    setLanguage,
    t: fixedTranslations,
    availableLanguages,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook to use translations
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};


