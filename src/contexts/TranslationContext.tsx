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
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
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
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
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
      termsOfService: 'Términos de Servicio',
      privacyPolicy: 'Política de Privacidad',
      selectLanguage: 'Seleccionar Idioma',
    },
    auth: {
      title: 'Bienvenido de nuevo',
      subtitle: 'Inicia sesión en tu cuenta SportMap',
      emailPlaceholder: 'Dirección de email',
      passwordPlaceholder: 'Contraseña',
      signIn: 'Iniciar Sesión',
      forgotPassword: '¿Olvidaste la contraseña?',
      createAccount: 'Crear nueva cuenta',
    },
    register: {
      title: 'Únete a SportMap',
      subtitle: 'Crea tu cuenta para empezar a conectar\ncon atletas locales',
      emailLabel: 'Dirección de email',
      displayNameLabel: 'Nombre de usuario',
      passwordLabel: 'Contraseña',
      confirmPasswordLabel: 'Confirmar contraseña',
      emailPlaceholder: 'Ingresa tu email',
      displayNamePlaceholder: 'Elige un nombre de usuario',
      passwordPlaceholder: 'Crea una contraseña',
      confirmPasswordPlaceholder: 'Confirma tu contraseña',
      favoriteSports: 'Tus deportes favoritos',
      selectSports: 'Selecciona todos los que apliquen',
      createAccount: 'Crear Cuenta',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      signIn: 'Iniciar sesión',
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
    },
    policy: {
      privacyPolicy: 'Política de Privacidad',
      termsOfService: 'Términos de Servicio',
      lastUpdated: 'Última actualización',
      back: 'Atrás',
    },
    map: {
      permissionDenied: 'Permiso Denegado',
      locationAccessNeeded: 'Se necesita acceso a la ubicación para mostrar tu posición en el mapa.',
    },
    sports: {
      boxing: 'Boxeo',
      calisthenics: 'Calistenia',
      gym: 'Gimnasio',
      basketball: 'Baloncesto',
      rollerSkating: 'Patinaje',
      football: 'Fútbol',
      volleyball: 'Voleibol',
      bjj: 'BJJ',
      chess: 'Ajedrez',
      pingPong: 'Ping Pong',
      tennis: 'Tenis',
      badminton: 'Bádminton',
      squash: 'Squash',
      mma: 'MMA',
      judo: 'Judo',
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
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
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
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
    },
    languages: {
      english: 'English',
      polish: 'Polski',
      spanish: 'Español',
      french: 'Français',
      german: 'Deutsch',
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

