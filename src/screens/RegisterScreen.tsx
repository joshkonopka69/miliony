import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Dimensions
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';

const { width } = Dimensions.get('window');

// Custom SM Logo Component (consistent with other screens)
const SMLogo = ({ size = 50 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    nick: '',
    password: '',
    repeatPassword: '',
  });
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sports = [
    t.sports.boxing, t.sports.calisthenics, t.sports.gym, t.sports.basketball, t.sports.rollerSkating,
    t.sports.football, t.sports.volleyball, t.sports.bjj, t.sports.chess, t.sports.pingPong,
    t.sports.tennis, t.sports.badminton, t.sports.squash, t.sports.mma, t.sports.judo
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const handleRegister = () => {
    // Validation
    if (!formData.email || !formData.nick || !formData.password || !formData.repeatPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.repeatPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (selectedSports.length === 0) {
      alert('Please select at least one sport');
      return;
    }
    
    console.log('Registration data:', { ...formData, sports: selectedSports });
    navigation.navigate('Map');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const focusNextField = (currentField: string) => {
    const fieldOrder = ['email', 'nick', 'password', 'repeatPassword'];
    const currentIndex = fieldOrder.indexOf(currentField);
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1];
      inputRefs.current[nextField]?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo and Title */}
            <View style={styles.titleSection}>
              <SMLogo size={50} />
              <Text style={styles.title}>{t.register.title}</Text>
              <Text style={styles.subtitle}>
                {t.register.subtitle}
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.register.emailLabel}</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.email = ref; }}
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder={t.register.emailPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('email')}
                  placeholderTextColor="#8e8e93"
                />
              </View>
              
              {/* Nickname Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.register.displayNameLabel}</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.nick = ref; }}
                  style={styles.input}
                  value={formData.nick}
                  onChangeText={(value) => handleInputChange('nick', value)}
                  placeholder={t.register.displayNamePlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('nick')}
                  placeholderTextColor="#8e8e93"
                />
              </View>
              
              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.register.passwordLabel}</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.password = ref; }}
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder={t.register.passwordPlaceholder}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('password')}
                  placeholderTextColor="#8e8e93"
                />
              </View>
              
              {/* Repeat Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.register.confirmPasswordLabel}</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.repeatPassword = ref; }}
                  style={styles.input}
                  value={formData.repeatPassword}
                  onChangeText={(value) => handleInputChange('repeatPassword', value)}
                  placeholder={t.register.confirmPasswordPlaceholder}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  placeholderTextColor="#8e8e93"
                />
              </View>

              {/* Sports Selection */}
              <View style={styles.sportsSection}>
                <Text style={styles.sportsLabel}>{t.register.favoriteSports}</Text>
                <Text style={styles.sportsSubtitle}>{t.register.selectSports}</Text>
                <View style={styles.sportsContainer}>
                  {sports.map((sport) => {
                    const isSelected = selectedSports.includes(sport);
                    return (
                      <TouchableOpacity
                        key={sport}
                        style={[
                          styles.sportChip,
                          isSelected && styles.sportChipSelected
                        ]}
                        onPress={() => handleSportToggle(sport)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.sportChipText,
                          isSelected && styles.sportChipTextSelected
                        ]}>
                          {sport}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={0.7}
        >
          <Text style={styles.registerButtonText}>{t.register.createAccount}</Text>
        </TouchableOpacity>
        
        <Text style={styles.loginText}>
          {t.register.alreadyHaveAccount}{' '}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>{t.register.signIn}</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sportsSection: {
    marginTop: 8,
  },
  sportsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sportsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '400',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sportChipSelected: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  sportChipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 20,
    gap: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  registerButton: {
    height: 52,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '400',
  },
  loginLink: {
    fontWeight: '600',
    color: '#fbbf24',
    textDecorationLine: 'underline',
  },
});