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
  Animated 
} from 'react-native';
import { useAppNavigation } from '../navigation';

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    city: '',
  });
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    if (!formData.email || !formData.password || !formData.name || !formData.city) {
      alert('Please fill in all fields');
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

  const FloatingLabelInput = ({ 
    field, 
    label, 
    placeholder, 
    secureTextEntry = false,
    keyboardType = 'default'
  }: {
    field: string;
    label: string;
    placeholder: string;
    secureTextEntry?: boolean;
    keyboardType?: any;
  }) => {
    const isFocused = focusedField === field;
    const hasValue = formData[field as keyof typeof formData].length > 0;
    const shouldFloat = isFocused || hasValue;

    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused
          ]}
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => handleInputChange(field, value)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          placeholder={placeholder}
          placeholderTextColor="transparent"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        <Text style={[
          styles.label,
          shouldFloat && styles.labelFloated,
          isFocused && styles.labelFocused
        ]}>
          {label}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sportsmap</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Create an account</Text>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <FloatingLabelInput
              field="email"
              label="Email"
              placeholder="Email"
              keyboardType="email-address"
            />
            
            <FloatingLabelInput
              field="password"
              label="Password"
              placeholder="Password"
              secureTextEntry={true}
            />
            
            <FloatingLabelInput
              field="name"
              label="Name"
              placeholder="Name"
            />
            
            <FloatingLabelInput
              field="city"
              label="City"
              placeholder="City"
            />

            {/* Sports Selection */}
            <View style={styles.sportsSection}>
              <Text style={styles.sportsLabel}>Favorite sports</Text>
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

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
        
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Log in</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#292524',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#292524',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c0a09',
    marginBottom: 32,
  },
  formSection: {
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0c0a09',
    backgroundColor: '#ffffff',
  },
  inputFocused: {
    borderColor: '#f9bc06',
  },
  label: {
    position: 'absolute',
    left: 12,
    top: 16,
    fontSize: 16,
    color: '#78716c',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
  },
  labelFloated: {
    top: -8,
    fontSize: 14,
    color: '#78716c',
  },
  labelFocused: {
    color: '#f9bc06',
  },
  sportsSection: {
    marginTop: 8,
  },
  sportsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#44403c',
    marginBottom: 12,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    backgroundColor: '#ffffff',
  },
  sportChipSelected: {
    backgroundColor: '#f9bc06',
    borderColor: '#f9bc06',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#292524',
  },
  sportChipTextSelected: {
    color: '#0c0a09',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  registerButton: {
    height: 56,
    backgroundColor: '#f9bc06',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c0a09',
  },
  loginText: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: '600',
    color: '#f9bc06',
    textDecorationLine: 'underline',
  },
});
