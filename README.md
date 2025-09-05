# SportMap - Aplikacja Sportowa

## Opis aplikacji

SportMap to aplikacja mobilna, która pomaga sportowcom znajdować partnerów do treningu, organizować wydarzenia sportowe i komunikować się z innymi użytkownikami.

## Funkcjonalności

### 1. Ekran powitalny
- Witanie użytkowników w aplikacji
- Przejście do logowania/rejestracji

### 2. Autoryzacja
- Logowanie użytkowników
- Rejestracja nowych użytkowników
- Walidacja formularzy

### 3. Wybór sportów
- Lista dostępnych sportów
- Wyszukiwanie sportów
- Wielokrotny wybór sportów

### 4. Tworzenie profilu
- Dane osobowe (imię, wiek)
- Opis siebie
- Doświadczenie sportowe
- Możliwość pominięcia

### 5. Główna aplikacja
- **Mapa**: Wyszukiwarka z mapą lokalizacji sportowych
- **Chat**: Komunikacja z innymi użytkownikami
- **Wydarzenia**: Przeglądanie i tworzenie wydarzeń sportowych
- **Ustawienia**: Konfiguracja aplikacji i profilu

## Struktura projektu

```
src/
├── screens/          # Ekrany aplikacji
│   ├── WelcomeScreen.tsx
│   ├── AuthScreen.tsx
│   ├── SportSelectionScreen.tsx
│   ├── ProfileCreationScreen.tsx
│   ├── MapScreen.tsx
│   ├── ChatScreen.tsx
│   ├── EventsScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/       # Nawigacja
│   └── AppNavigator.tsx
└── components/       # Komponenty (do rozbudowy)
```

## Technologie

- React Native
- Expo
- React Navigation (Stack + Bottom Tabs)
- TypeScript

## Instalacja i uruchomienie

1. Zainstaluj zależności:
```bash
npm install
```

2. Uruchom aplikację:
```bash
npm start
```

3. Użyj Expo Go na telefonie lub emulatora do testowania

## Nawigacja

Aplikacja używa dwóch poziomów nawigacji:

1. **Stack Navigator** - dla flow onboarding (Welcome → Auth → Sport Selection → Profile Creation → Main App)
2. **Bottom Tab Navigator** - dla głównej aplikacji (Map, Chat, Events, Settings)

## Rozbudowa

### Dodanie nowych ekranów:
1. Utwórz nowy plik w `src/screens/`
2. Dodaj eksport w `src/screens/index.ts`
3. Dodaj do nawigacji w `src/navigation/AppNavigator.tsx`

### Dodanie nowych funkcjonalności:
- Integracja z mapami (Google Maps, Mapbox)
- System powiadomień
- Autentykacja (Firebase, Auth0)
- Baza danych (Firebase, Supabase)

## Status projektu

✅ Ekrany aplikacji  
✅ System nawigacji  
✅ Podstawowy UI/UX  
🔄 Integracja z backendem  
🔄 Testy  
🔄 Dokumentacja API  

## Autor

SportMap Team

