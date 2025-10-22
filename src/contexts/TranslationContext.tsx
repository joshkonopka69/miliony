import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  };
  
  // Event Details Screen
  eventDetails: {
    share: string;
    gameInformation: string;
    date: string;
    time: string;
    players: string;
    location: string;
    skillLevel: string;
    description: string;
    equipmentNeeded: string;
    rules: string;
    organizer: string;
    chat: string;
    joinGame: string;
    leaveGame: string;
  };
  
  // All Badges Screen
  allBadges: {
    title: string;
    earnedBadge: string;
    locked: string;
  };
  
  // Notifications
  notifications: {
    title: string;
    noNotifications: string;
    noNotificationsSubtext: string;
    markAsRead: string;
  };
  
  // Bottom Navigation
  bottomNav: {
    map: string;
    events: string;
    myGames: string;
    myProfile: string;
    myGroups: string;
  };
}

// Translation data
const translations: Record<Language, Translations> = {
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
    },
    eventDetails: {
      share: 'Share',
      gameInformation: 'Game Information',
      date: 'Date',
      time: 'Time',
      players: 'Players',
      location: 'Location',
      skillLevel: 'Skill Level',
      description: 'Description',
      equipmentNeeded: 'Equipment Needed',
      rules: 'Rules',
      organizer: 'Organizer',
      chat: 'Chat',
      joinGame: 'Join Game',
      leaveGame: 'Leave Game',
    },
    allBadges: {
      title: 'All Badges',
      earnedBadge: 'Earned',
      locked: 'Locked',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      noNotificationsSubtext: 'You\'re all caught up!',
      markAsRead: 'Mark as Read',
    },
    bottomNav: {
      map: 'Map',
      events: 'Events',
      myGames: 'My Games',
      myProfile: 'My Profile',
      myGroups: 'My Groups',
    },
  },
  pl: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Połącz się z lokalnymi sportowcami\ni odkryj miejsca sportowe',
      continueWithGoogle: 'Kontynuuj z Google',
      continueWithApple: 'Kontynuuj z Apple',
      signUpWithEmail: 'Zarejestruj siÄ™ przez Email',
      termsText: 'KontynuujÄ…c, zgadzasz siÄ™ z naszymi',
      termsOfService: 'Warunkami UsĹ‚ugi',
      privacyPolicy: 'PolitykÄ… PrywatnoĹ›ci',
      selectLanguage: 'Wybierz JÄ™zyk',
    },
    auth: {
      title: 'Witaj z powrotem',
      subtitle: 'Zaloguj siÄ™ do swojego konta SportMap',
      emailPlaceholder: 'Adres email',
      passwordPlaceholder: 'HasĹ‚o',
      signIn: 'Zaloguj siÄ™',
      forgotPassword: 'ZapomniaĹ‚eĹ› hasĹ‚a?',
      createAccount: 'UtwĂłrz nowe konto',
    },
    register: {
      title: 'DoĹ‚Ä…cz do SportMap',
      subtitle: 'UtwĂłrz konto, aby zaczÄ…Ä‡ Ĺ‚Ä…czyÄ‡ siÄ™\nz lokalnymi sportowcami',
      emailLabel: 'Adres email',
      displayNameLabel: 'Nazwa wyĹ›wietlana',
      passwordLabel: 'HasĹ‚o',
      confirmPasswordLabel: 'PotwierdĹş hasĹ‚o',
      emailPlaceholder: 'WprowadĹş swĂłj email',
      displayNamePlaceholder: 'Wybierz nazwÄ™ wyĹ›wietlanÄ…',
      passwordPlaceholder: 'UtwĂłrz hasĹ‚o',
      confirmPasswordPlaceholder: 'PotwierdĹş swoje hasĹ‚o',
      favoriteSports: 'Twoje ulubione sporty',
      selectSports: 'Wybierz wszystkie, ktĂłre pasujÄ…',
      createAccount: 'UtwĂłrz Konto',
      alreadyHaveAccount: 'Masz juĹĽ konto?',
      signIn: 'Zaloguj siÄ™',
    },
    common: {
      back: 'Wstecz',
      next: 'Dalej',
      cancel: 'Anuluj',
      save: 'Zapisz',
      delete: 'UsuĹ„',
      edit: 'Edytuj',
      loading: 'Ĺadowanie...',
      error: 'BĹ‚Ä…d',
      success: 'Sukces',
      confirm: 'PotwierdĹş',
    },
    policy: {
      privacyPolicy: 'Polityka PrywatnoĹ›ci',
      termsOfService: 'Warunki UsĹ‚ugi',
      lastUpdated: 'Ostatnia aktualizacja',
      back: 'Wstecz',
    },
    map: {
      permissionDenied: 'Odmowa DostÄ™pu',
      locationAccessNeeded: 'DostÄ™p do lokalizacji jest potrzebny, aby pokazaÄ‡ TwojÄ… pozycjÄ™ na mapie.',
    },
    sports: {
      boxing: 'Boks',
      calisthenics: 'Kalistenika',
      gym: 'SiĹ‚ownia',
      basketball: 'KoszykĂłwka',
      rollerSkating: 'Rolki',
      football: 'PiĹ‚ka noĹĽna',
      volleyball: 'SiatkĂłwka',
      bjj: 'BJJ',
      chess: 'Szachy',
      pingPong: 'Ping Pong',
      tennis: 'Tenis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'EspaĂ±ol',
      french: 'FranĂ§ais',
      german: 'Deutsch',
    },
    settings: {
      title: 'Ustawienia',
      account: 'Konto',
      favoriteSports: 'Ulubione Sporty',
      preferences: 'Preferencje',
      language: 'JÄ™zyk',
      legal: 'Prawne',
      termsOfService: 'Warunki UsĹ‚ugi',
      privacyPolicy: 'Polityka PrywatnoĹ›ci',
      development: 'RozwĂłj',
      backendTest: 'Test Backendu',
      dangerZone: 'Strefa ZagroĹĽenia',
      deleteAccount: 'UsuĹ„ Konto',
      logout: 'Wyloguj siÄ™',
      logoutConfirm: 'Wyloguj siÄ™',
      logoutMessage: 'Czy na pewno chcesz siÄ™ wylogowaÄ‡?',
      deleteConfirm: 'UsuĹ„ Konto',
      deleteMessage: 'Ta akcja nie moĹĽe byÄ‡ cofniÄ™ta. Czy na pewno chcesz usunÄ…Ä‡ swoje konto?',
      deleteSuccess: 'Twoje konto zostaĹ‚o usuniÄ™te.',
    },
    profile: {
      title: 'Profil',
      loadingProfile: 'Ĺadowanie profilu...',
      joined: 'DoĹ‚Ä…czyĹ‚ do SportMap w',
      earned: 'Zdobyte',
      toUnlock: 'Do Odblokowania',
      progress: 'PostÄ™p',
      achievements: 'OsiÄ…gniÄ™cia',
      viewAll: 'Zobacz Wszystkie',
      noBadges: 'Brak zdobytych odznak',
      noBadgesSubtext: 'Zagraj wiÄ™cej gier, aby zdobyÄ‡ odznaki!',
      friends: 'Znajomi',
      addFriends: 'Dodaj Znajomych',
      noFriends: 'Brak znajomych',
      noFriendsSubtext: 'Dodaj znajomych, aby siÄ™ poĹ‚Ä…czyÄ‡ i graÄ‡ razem',
      groups: 'Grupy',
      viewGroups: 'Zobacz Grupy',
      noGroups: 'Brak grup',
      noGroupsSubtext: 'DoĹ‚Ä…cz do grup, aby znaleĹşÄ‡ zespĂłĹ‚ i organizowaÄ‡ wydarzenia',
      errorLoading: 'Nie udaĹ‚o siÄ™ zaĹ‚adowaÄ‡ danych profilu',
    },
    myEvents: {
      title: 'Moje Gry',
      allGames: 'Wszystkie Gry',
      created: 'Utworzone',
      joined: 'DoĹ‚Ä…czone',
      upcoming: 'NadchodzÄ…ce',
      past: 'PrzeszĹ‚e',
      noEvents: 'Brak wydarzeĹ„',
      noEventsSubtext: 'UtwĂłrz lub doĹ‚Ä…cz do wydarzenia, aby zaczÄ…Ä‡',
      createEvent: 'UtwĂłrz Wydarzenie',
      viewDetails: 'Zobacz SzczegĂłĹ‚y',
      participants: 'uczestnikĂłw',
      skillLevel: 'Poziom UmiejÄ™tnoĹ›ci',
      beginner: 'PoczÄ…tkujÄ…cy',
      intermediate: 'Ĺšredniozaawansowany',
      advanced: 'Zaawansowany',
      expert: 'Ekspert',
    },
    myGroups: {
      title: 'Moje Grupy',
      allGroups: 'Wszystkie Grupy',
      yourGroups: 'Twoje Grupy',
      createGroup: 'UtwĂłrz GrupÄ™',
      noGroups: 'Brak grup',
      noGroupsSubtext: 'UtwĂłrz lub doĹ‚Ä…cz do grupy, aby zaczÄ…Ä‡',
      members: 'czĹ‚onkĂłw',
      viewDetails: 'Zobacz SzczegĂłĹ‚y',
    },
    createGroup: {
      title: 'UtwĂłrz GrupÄ™',
      groupName: 'Nazwa Grupy',
      groupNamePlaceholder: 'WprowadĹş nazwÄ™ grupy',
      description: 'Opis',
      descriptionPlaceholder: 'WprowadĹş opis grupy',
      selectSport: 'Wybierz Sport',
      selectFriends: 'Wybierz Znajomych',
      selectFriendsOptional: 'Wybierz Znajomych (Opcjonalne)',
      searchFriends: 'Szukaj znajomych...',
      create: 'UtwĂłrz GrupÄ™',
      cancel: 'Anuluj',
      success: 'Sukces',
      groupCreated: 'Grupa zostaĹ‚a utworzona pomyĹ›lnie!',
      viewGroup: 'Zobacz GrupÄ™',
      error: 'BĹ‚Ä…d',
      fillFields: 'ProszÄ™ wypeĹ‚niÄ‡ wszystkie wymagane pola',
    },
    eventDetails: {
      share: 'UdostÄ™pnij',
      gameInformation: 'Informacje o Grze',
      date: 'Data',
      time: 'Czas',
      players: 'Gracze',
      location: 'Lokalizacja',
      skillLevel: 'Poziom UmiejÄ™tnoĹ›ci',
      description: 'Opis',
      equipmentNeeded: 'Potrzebny SprzÄ™t',
      rules: 'Zasady',
      organizer: 'Organizator',
      chat: 'Czat',
      joinGame: 'DoĹ‚Ä…cz do Gry',
      leaveGame: 'OpuĹ›Ä‡ GrÄ™',
    },
    allBadges: {
      title: 'Wszystkie Odznaki',
      earnedBadge: 'Zdobyte',
      locked: 'Zablokowane',
    },
    notifications: {
      title: 'Powiadomienia',
      noNotifications: 'Brak powiadomieĹ„',
      noNotificationsSubtext: 'Wszystko przeczytane!',
      markAsRead: 'Oznacz jako Przeczytane',
    },
    bottomNav: {
      map: 'Mapa',
      events: 'Wydarzenia',
      myGames: 'Moje Gry',
      myProfile: 'MĂłj Profil',
      myGroups: 'Moje Grupy',
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
      back: 'AtrĂˇs',
      next: 'Siguiente',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Ă‰xito',
      confirm: 'Confirmar',
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
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'EspaĂ±ol',
      french: 'FranĂ§ais',
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
      deleteMessage: 'Esta acciĂłn no se puede deshacer. ÂżEstĂˇs seguro de que quieres eliminar tu cuenta?',
      deleteSuccess: 'Tu cuenta ha sido eliminada.',
    },
    profile: {
      title: 'Perfil',
      loadingProfile: 'Cargando perfil...',
      joined: 'Se uniĂł a SportMap en',
      earned: 'Ganadas',
      toUnlock: 'Por Desbloquear',
      progress: 'Progreso',
      achievements: 'Logros',
      viewAll: 'Ver Todo',
      noBadges: 'Sin insignias aĂşn',
      noBadgesSubtext: 'ÂˇJuega mĂˇs juegos para ganar insignias!',
      friends: 'Amigos',
      addFriends: 'Agregar Amigos',
      noFriends: 'Sin amigos aĂşn',
      noFriendsSubtext: 'Agrega amigos para conectar y jugar juntos',
      groups: 'Grupos',
      viewGroups: 'Ver Grupos',
      noGroups: 'Sin grupos aĂşn',
      noGroupsSubtext: 'Ăšnete a grupos para encontrar compaĂ±eros y organizar eventos',
      errorLoading: 'Error al cargar datos del perfil',
    },
    myEvents: {
      title: 'Mis Juegos',
      allGames: 'Todos los Juegos',
      created: 'Creados',
      joined: 'Unidos',
      upcoming: 'PrĂłximos',
      past: 'Pasados',
      noEvents: 'Sin eventos aĂşn',
      noEventsSubtext: 'Crea o Ăşnete a un evento para comenzar',
      createEvent: 'Crear Evento',
      viewDetails: 'Ver Detalles',
      participants: 'participantes',
      skillLevel: 'Nivel de Habilidad',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto',
    },
    myGroups: {
      title: 'Mis Grupos',
      allGroups: 'Todos los Grupos',
      yourGroups: 'Tus Grupos',
      createGroup: 'Crear Grupo',
      noGroups: 'Sin grupos aĂşn',
      noGroupsSubtext: 'Crea o Ăşnete a un grupo para comenzar',
      members: 'miembros',
      viewDetails: 'Ver Detalles',
    },
    createGroup: {
      title: 'Crear Grupo',
      groupName: 'Nombre del Grupo',
      groupNamePlaceholder: 'Ingresa el nombre del grupo',
      description: 'DescripciĂłn',
      descriptionPlaceholder: 'Ingresa la descripciĂłn del grupo',
      selectSport: 'Seleccionar Deporte',
      selectFriends: 'Seleccionar Amigos',
      selectFriendsOptional: 'Seleccionar Amigos (Opcional)',
      searchFriends: 'Buscar amigos...',
      create: 'Crear Grupo',
      cancel: 'Cancelar',
      success: 'Ă‰xito',
      groupCreated: 'ÂˇGrupo creado exitosamente!',
      viewGroup: 'Ver Grupo',
      error: 'Error',
      fillFields: 'Por favor completa todos los campos requeridos',
    },
    eventDetails: {
      share: 'Compartir',
      gameInformation: 'InformaciĂłn del Juego',
      date: 'Fecha',
      time: 'Hora',
      players: 'Jugadores',
      location: 'UbicaciĂłn',
      skillLevel: 'Nivel de Habilidad',
      description: 'DescripciĂłn',
      equipmentNeeded: 'Equipo Necesario',
      rules: 'Reglas',
      organizer: 'Organizador',
      chat: 'Chat',
      joinGame: 'Unirse al Juego',
      leaveGame: 'Dejar el Juego',
    },
    allBadges: {
      title: 'Todas las Insignias',
      earnedBadge: 'Ganadas',
      locked: 'Bloqueadas',
    },
    notifications: {
      title: 'Notificaciones',
      noNotifications: 'Sin notificaciones',
      noNotificationsSubtext: 'ÂˇEstĂˇs al dĂ­a!',
      markAsRead: 'Marcar como LeĂ­do',
    },
    bottomNav: {
      map: 'Mapa',
      events: 'Eventos',
      myGames: 'Mis Juegos',
      myProfile: 'Mi Perfil',
      myGroups: 'Mis Grupos',
    },
  },
  fr: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Connectez-vous avec des athlĂ¨tes locaux\net dĂ©couvrez des lieux sportifs',
      continueWithGoogle: 'Continuer avec Google',
      continueWithApple: 'Continuer avec Apple',
      signUpWithEmail: 'S\'inscrire avec Email',
      termsText: 'En continuant, vous acceptez nos',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de ConfidentialitĂ©',
      selectLanguage: 'SĂ©lectionner la Langue',
    },
    auth: {
      title: 'Bon retour',
      subtitle: 'Connectez-vous Ă  votre compte SportMap',
      emailPlaceholder: 'Adresse email',
      passwordPlaceholder: 'Mot de passe',
      signIn: 'Se connecter',
      forgotPassword: 'Mot de passe oubliĂ© ?',
      createAccount: 'CrĂ©er un nouveau compte',
    },
    register: {
      title: 'Rejoindre SportMap',
      subtitle: 'CrĂ©ez votre compte pour commencer Ă  vous connecter\navec des athlĂ¨tes locaux',
      emailLabel: 'Adresse email',
      displayNameLabel: 'Nom d\'affichage',
      passwordLabel: 'Mot de passe',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      emailPlaceholder: 'Entrez votre email',
      displayNamePlaceholder: 'Choisissez un nom d\'affichage',
      passwordPlaceholder: 'CrĂ©ez un mot de passe',
      confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
      favoriteSports: 'Vos sports favoris',
      selectSports: 'SĂ©lectionnez tous ceux qui s\'appliquent',
      createAccount: 'CrĂ©er un Compte',
      alreadyHaveAccount: 'Vous avez dĂ©jĂ  un compte ?',
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
      success: 'SuccĂ¨s',
      confirm: 'Confirmer',
    },
    policy: {
      privacyPolicy: 'Politique de ConfidentialitĂ©',
      termsOfService: 'Conditions d\'Utilisation',
      lastUpdated: 'DerniĂ¨re mise Ă  jour',
      back: 'Retour',
    },
    map: {
      permissionDenied: 'Permission RefusĂ©e',
      locationAccessNeeded: 'L\'accĂ¨s Ă  la localisation est nĂ©cessaire pour afficher votre position sur la carte.',
    },
    sports: {
      boxing: 'Boxe',
      calisthenics: 'CallisthĂ©nie',
      gym: 'Salle de sport',
      basketball: 'Basketball',
      rollerSkating: 'Roller',
      football: 'Football',
      volleyball: 'Volley-ball',
      bjj: 'BJJ',
      chess: 'Ă‰checs',
      pingPong: 'Ping Pong',
      tennis: 'Tennis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'EspaĂ±ol',
      french: 'FranĂ§ais',
      german: 'Deutsch',
    },
    settings: {
      title: 'ParamĂ¨tres',
      account: 'Compte',
      favoriteSports: 'Sports Favoris',
      preferences: 'PrĂ©fĂ©rences',
      language: 'Langue',
      legal: 'Juridique',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de ConfidentialitĂ©',
      development: 'DĂ©veloppement',
      backendTest: 'Test Backend',
      dangerZone: 'Zone Dangereuse',
      deleteAccount: 'Supprimer le Compte',
      logout: 'Se DĂ©connecter',
      logoutConfirm: 'Se DĂ©connecter',
      logoutMessage: 'ĂŠtes-vous sĂ»r de vouloir vous dĂ©connecter ?',
      deleteConfirm: 'Supprimer le Compte',
      deleteMessage: 'Cette action ne peut pas ĂŞtre annulĂ©e. ĂŠtes-vous sĂ»r de vouloir supprimer votre compte ?',
      deleteSuccess: 'Votre compte a Ă©tĂ© supprimĂ©.',
    },
    profile: {
      title: 'Profil',
      loadingProfile: 'Chargement du profil...',
      joined: 'Rejoint SportMap en',
      earned: 'GagnĂ©s',
      toUnlock: 'Ă€ DĂ©bloquer',
      progress: 'ProgrĂ¨s',
      achievements: 'RĂ©alisations',
      viewAll: 'Tout Voir',
      noBadges: 'Aucun badge gagnĂ©',
      noBadgesSubtext: 'Jouez plus de jeux pour gagner des badges !',
      friends: 'Amis',
      addFriends: 'Ajouter des Amis',
      noFriends: 'Pas encore d\'amis',
      noFriendsSubtext: 'Ajoutez des amis pour vous connecter et jouer ensemble',
      groups: 'Groupes',
      viewGroups: 'Voir les Groupes',
      noGroups: 'Pas encore de groupes',
      noGroupsSubtext: 'Rejoignez des groupes pour trouver des coĂ©quipiers et organiser des Ă©vĂ©nements',
      errorLoading: 'Ă‰chec du chargement des donnĂ©es du profil',
    },
    myEvents: {
      title: 'Mes Jeux',
      allGames: 'Tous les Jeux',
      created: 'CrĂ©Ă©s',
      joined: 'Rejoints',
      upcoming: 'Ă€ Venir',
      past: 'PassĂ©s',
      noEvents: 'Pas encore d\'Ă©vĂ©nements',
      noEventsSubtext: 'CrĂ©ez ou rejoignez un Ă©vĂ©nement pour commencer',
      createEvent: 'CrĂ©er un Ă‰vĂ©nement',
      viewDetails: 'Voir les DĂ©tails',
      participants: 'participants',
      skillLevel: 'Niveau de CompĂ©tence',
      beginner: 'DĂ©butant',
      intermediate: 'IntermĂ©diaire',
      advanced: 'AvancĂ©',
      expert: 'Expert',
    },
    myGroups: {
      title: 'Mes Groupes',
      allGroups: 'Tous les Groupes',
      yourGroups: 'Vos Groupes',
      createGroup: 'CrĂ©er un Groupe',
      noGroups: 'Pas encore de groupes',
      noGroupsSubtext: 'CrĂ©ez ou rejoignez un groupe pour commencer',
      members: 'membres',
      viewDetails: 'Voir les DĂ©tails',
    },
    createGroup: {
      title: 'CrĂ©er un Groupe',
      groupName: 'Nom du Groupe',
      groupNamePlaceholder: 'Entrez le nom du groupe',
      description: 'Description',
      descriptionPlaceholder: 'Entrez la description du groupe',
      selectSport: 'SĂ©lectionner un Sport',
      selectFriends: 'SĂ©lectionner des Amis',
      selectFriendsOptional: 'SĂ©lectionner des Amis (Optionnel)',
      searchFriends: 'Rechercher des amis...',
      create: 'CrĂ©er un Groupe',
      cancel: 'Annuler',
      success: 'SuccĂ¨s',
      groupCreated: 'Groupe crĂ©Ă© avec succĂ¨s !',
      viewGroup: 'Voir le Groupe',
      error: 'Erreur',
      fillFields: 'Veuillez remplir tous les champs requis',
    },
    eventDetails: {
      share: 'Partager',
      gameInformation: 'Informations sur le Jeu',
      date: 'Date',
      time: 'Heure',
      players: 'Joueurs',
      location: 'Emplacement',
      skillLevel: 'Niveau de CompĂ©tence',
      description: 'Description',
      equipmentNeeded: 'Ă‰quipement NĂ©cessaire',
      rules: 'RĂ¨gles',
      organizer: 'Organisateur',
      chat: 'Chat',
      joinGame: 'Rejoindre le Jeu',
      leaveGame: 'Quitter le Jeu',
    },
    allBadges: {
      title: 'Tous les Badges',
      earnedBadge: 'GagnĂ©s',
      locked: 'VerrouillĂ©s',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'Aucune notification',
      noNotificationsSubtext: 'Vous ĂŞtes Ă  jour !',
      markAsRead: 'Marquer comme Lu',
    },
    bottomNav: {
      map: 'Carte',
      events: 'Ă‰vĂ©nements',
      myGames: 'Mes Jeux',
      myProfile: 'Mon Profil',
      myGroups: 'Mes Groupes',
    },
  },
  de: {
    welcome: {
      title: 'SportMap',
      subtitle: 'Verbinde dich mit lokalen Sportlern\nund entdecke SportstĂ¤tten',
      continueWithGoogle: 'Mit Google fortfahren',
      continueWithApple: 'Mit Apple fortfahren',
      signUpWithEmail: 'Mit E-Mail registrieren',
      termsText: 'Durch Fortfahren stimmst du unseren',
      termsOfService: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzrichtlinie',
      selectLanguage: 'Sprache auswĂ¤hlen',
    },
    auth: {
      title: 'Willkommen zurĂĽck',
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
      confirmPasswordLabel: 'Passwort bestĂ¤tigen',
      emailPlaceholder: 'Gib deine E-Mail ein',
      displayNamePlaceholder: 'WĂ¤hle einen Anzeigenamen',
      passwordPlaceholder: 'Erstelle ein Passwort',
      confirmPasswordPlaceholder: 'BestĂ¤tige dein Passwort',
      favoriteSports: 'Deine Lieblingssportarten',
      selectSports: 'WĂ¤hle alle aus, die zutreffen',
      createAccount: 'Konto Erstellen',
      alreadyHaveAccount: 'Hast du bereits ein Konto?',
      signIn: 'Anmelden',
    },
    common: {
      back: 'ZurĂĽck',
      next: 'Weiter',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'LĂ¶schen',
      edit: 'Bearbeiten',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      confirm: 'BestĂ¤tigen',
    },
    policy: {
      privacyPolicy: 'Datenschutzrichtlinie',
      termsOfService: 'Nutzungsbedingungen',
      lastUpdated: 'Zuletzt aktualisiert',
      back: 'ZurĂĽck',
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
      football: 'FuĂźball',
      volleyball: 'Volleyball',
      bjj: 'BJJ',
      chess: 'Schach',
      pingPong: 'Ping Pong',
      tennis: 'Tennis',
      badminton: 'Badminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'EspaĂ±ol',
      french: 'FranĂ§ais',
      german: 'Deutsch',
    },
    settings: {
      title: 'Einstellungen',
      account: 'Konto',
      favoriteSports: 'Lieblingssportarten',
      preferences: 'PrĂ¤ferenzen',
      language: 'Sprache',
      legal: 'Rechtliches',
      termsOfService: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzrichtlinie',
      development: 'Entwicklung',
      backendTest: 'Backend-Test',
      dangerZone: 'Gefahrenzone',
      deleteAccount: 'Konto LĂ¶schen',
      logout: 'Abmelden',
      logoutConfirm: 'Abmelden',
      logoutMessage: 'MĂ¶chten Sie sich wirklich abmelden?',
      deleteConfirm: 'Konto LĂ¶schen',
      deleteMessage: 'Diese Aktion kann nicht rĂĽckgĂ¤ngig gemacht werden. MĂ¶chten Sie Ihr Konto wirklich lĂ¶schen?',
      deleteSuccess: 'Ihr Konto wurde gelĂ¶scht.',
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
      addFriends: 'Freunde HinzufĂĽgen',
      noFriends: 'Noch keine Freunde',
      noFriendsSubtext: 'FĂĽgen Sie Freunde hinzu, um sich zu verbinden und zusammen zu spielen',
      groups: 'Gruppen',
      viewGroups: 'Gruppen Ansehen',
      noGroups: 'Noch keine Gruppen',
      noGroupsSubtext: 'Treten Sie Gruppen bei, um Teammitglieder zu finden und Veranstaltungen zu organisieren',
      errorLoading: 'Fehler beim Laden der Profildaten',
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
    },
    eventDetails: {
      share: 'Teilen',
      gameInformation: 'Spielinformationen',
      date: 'Datum',
      time: 'Uhrzeit',
      players: 'Spieler',
      location: 'Ort',
      skillLevel: 'FĂ¤higkeitslevel',
      description: 'Beschreibung',
      equipmentNeeded: 'BenĂ¶tigte AusrĂĽstung',
      rules: 'Regeln',
      organizer: 'Organisator',
      chat: 'Chat',
      joinGame: 'Spiel Beitreten',
      leaveGame: 'Spiel Verlassen',
    },
    allBadges: {
      title: 'Alle Abzeichen',
      earnedBadge: 'Verdient',
      locked: 'Gesperrt',
    },
    notifications: {
      title: 'Benachrichtigungen',
      noNotifications: 'Keine Benachrichtigungen',
      noNotificationsSubtext: 'Sie sind auf dem neuesten Stand!',
      markAsRead: 'Als Gelesen Markieren',
    },
    bottomNav: {
      map: 'Karte',
      events: 'Veranstaltungen',
      myGames: 'Meine Spiele',
      myProfile: 'Mein Profil',
      myGroups: 'Meine Gruppen',
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

  const availableLanguages = [
    { code: 'en' as Language, name: translations.en.languages.english },
    { code: 'pl' as Language, name: translations.pl.languages.polish },
    { code: 'es' as Language, name: translations.es.languages.spanish },
    { code: 'fr' as Language, name: translations.fr.languages.french },
    { code: 'de' as Language, name: translations.de.languages.german },
  ];

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

  const value: TranslationContextType = {
    language,
    setLanguage,
    t: translations[language],
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

