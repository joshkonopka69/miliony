import React, { useState, useRef } from 'react';
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
  Keyboard
} from 'react-native';
import { useAppNavigation } from '../navigation';

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const [formData, setFormData] = useState({
    email: '',
    nick: '',
    password: '',
    repeatPassword: '',
  });
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  const sports = [
    'Boks', 'Kalistenika', 'Siłownia', 'Koszykówka', 'Rolki/wrotkarstwo',
    'Piłka nożna', 'Siatkówka', 'BJJ', 'Szachy', 'Ping pong',
    'Tenis', 'Badminton', 'Squash', 'MMA', 'Judo'
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
    
    // TODO: Implement registration logic
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
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Join Sportsmap</Text>
            <Text style={styles.subtitle}>Create your account to start connecting with athletes</Text>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.email = ref; }}
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('email')}
                />
              </View>
              
              {/* Nickname Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nickname</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.nick = ref; }}
                  style={styles.input}
                  value={formData.nick}
                  onChangeText={(value) => handleInputChange('nick', value)}
                  placeholder="Choose a nickname"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('nick')}
                />
              </View>
              
              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.password = ref; }}
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Create a password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField('password')}
                />
              </View>
              
              {/* Repeat Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  ref={(ref) => { inputRefs.current.repeatPassword = ref; }}
                  style={styles.input}
                  value={formData.repeatPassword}
                  onChangeText={(value) => handleInputChange('repeatPassword', value)}
                  placeholder="Confirm your password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>

              {/* Sports Selection */}
              <View style={styles.sportsSection}>
                <Text style={styles.sportsLabel}>Your favorite sports</Text>
                <Text style={styles.sportsSubtitle}>Select all that apply</Text>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>
        
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0f172a',
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
    color: '#1e293b',
    marginBottom: 4,
  },
  sportsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  sportChipTextSelected: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 20,
    gap: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  registerButton: {
    height: 56,
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
    color: '#ffffff',
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '600',
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});