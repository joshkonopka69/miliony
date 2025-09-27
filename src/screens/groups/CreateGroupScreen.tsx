import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { useAppNavigation } from '../../navigation';
import { useGroupManager } from '../../hooks/useGroups';
import { CreateGroupData } from '../../services/groupService';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

const SPORTS = [
  'Basketball', 'Football', 'Soccer', 'Tennis', 'Volleyball', 'Baseball',
  'Hockey', 'Swimming', 'Running', 'Cycling', 'Golf', 'Boxing',
  'Martial Arts', 'Yoga', 'Pilates', 'Weightlifting', 'CrossFit',
  'Rock Climbing', 'Surfing', 'Skiing', 'Snowboarding', 'Other'
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Anyone can find and join' },
  { value: 'private', label: 'Private', description: 'Only invited members can join' },
  { value: 'invite_only', label: 'Invite Only', description: 'Members must be approved' },
];

const SKILL_LEVELS = [
  { value: 'any', label: 'Any Level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function CreateGroupScreen() {
  const navigation = useAppNavigation();
  const { createGroupWithValidation, isLoading, error, clearError } = useGroupManager();

  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    sport: '',
    privacy: 'public',
    member_limit: undefined,
    tags: [],
    rules: [],
    requirements: {
      age_min: undefined,
      age_max: undefined,
      skill_level: 'any',
      gender_preference: 'any',
    },
  });

  const [location, setLocation] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radius: 5,
  });

  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showRulesInput, setShowRulesInput] = useState(false);
  const [newRule, setNewRule] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequirementsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()],
      }));
      setNewRule('');
      setShowRulesInput(false);
    }
  };

  const handleRemoveRule = (ruleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule !== ruleToRemove),
    }));
  };

  const handleLocationSelect = (selectedLocation: any) => {
    setLocation(selectedLocation);
    setShowLocationPicker(false);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Group name is required');
        return;
      }

      if (!formData.sport) {
        Alert.alert('Error', 'Please select a sport');
        return;
      }

      // Prepare group data
      const groupData: CreateGroupData = {
        ...formData,
        location: location.name ? location : undefined,
      };

      const group = await createGroupWithValidation(groupData);
      if (group) {
        Alert.alert(
          'Success',
          'Group created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('GroupDetails', { groupId: group.id }),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    }
  };

  const getSportLabel = (sport: string) => {
    return sport || 'Select Sport';
  };

  const getPrivacyLabel = (privacy: string) => {
    const option = PRIVACY_OPTIONS.find(opt => opt.value === privacy);
    return option ? option.label : 'Select Privacy';
  };

  const getSkillLabel = (skill: string) => {
    const option = SKILL_LEVELS.find(opt => opt.value === skill);
    return option ? option.label : 'Any Level';
  };

  const getGenderLabel = (gender: string) => {
    const option = GENDER_OPTIONS.find(opt => opt.value === gender);
    return option ? option.label : 'Any Gender';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <SMLogo size={30} />
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter group name"
                placeholderTextColor="#8e8e93"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe your group"
                placeholderTextColor="#8e8e93"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {formData.description.length}/500
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sport *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSportPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {getSportLabel(formData.sport)}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Privacy</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPrivacyPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {getPrivacyLabel(formData.privacy)}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Member Limit (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.member_limit?.toString() || ''}
                onChangeText={(value) => handleInputChange('member_limit', value ? parseInt(value) : undefined)}
                placeholder="No limit"
                placeholderTextColor="#8e8e93"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location (Optional)</Text>
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowLocationPicker(true)}
            >
              <Text style={styles.locationButtonText}>
                {location.name || 'Select Location'}
              </Text>
              <Text style={styles.locationButtonIcon}>📍</Text>
            </TouchableOpacity>

            {location.name && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationInfoText}>
                  Radius: {location.radius} km
                </Text>
              </View>
            )}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity
                    style={styles.tagRemove}
                    onPress={() => handleRemoveTag(tag)}
                  >
                    <Text style={styles.tagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {!showTagInput ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowTagInput(true)}
              >
                <Text style={styles.addButtonText}>+ Add Tag</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Enter tag"
                  placeholderTextColor="#8e8e93"
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                  style={styles.tagAddButton}
                  onPress={handleAddTag}
                >
                  <Text style={styles.tagAddButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Rules */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Rules</Text>
            
            <View style={styles.rulesContainer}>
              {formData.rules.map((rule, index) => (
                <View key={index} style={styles.rule}>
                  <Text style={styles.ruleText}>{rule}</Text>
                  <TouchableOpacity
                    style={styles.ruleRemove}
                    onPress={() => handleRemoveRule(rule)}
                  >
                    <Text style={styles.ruleRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {!showRulesInput ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowRulesInput(true)}
              >
                <Text style={styles.addButtonText}>+ Add Rule</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.ruleInputContainer}>
                <TextInput
                  style={styles.ruleInput}
                  value={newRule}
                  onChangeText={setNewRule}
                  placeholder="Enter rule"
                  placeholderTextColor="#8e8e93"
                  onSubmitEditing={handleAddRule}
                />
                <TouchableOpacity
                  style={styles.ruleAddButton}
                  onPress={handleAddRule}
                >
                  <Text style={styles.ruleAddButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Requirements</Text>
            
            <View style={styles.requirementsContainer}>
              <View style={styles.requirementRow}>
                <Text style={styles.requirementLabel}>Age Range</Text>
                <View style={styles.ageInputs}>
                  <TextInput
                    style={styles.ageInput}
                    value={formData.requirements.age_min?.toString() || ''}
                    onChangeText={(value) => handleRequirementsChange('age_min', value ? parseInt(value) : undefined)}
                    placeholder="Min"
                    placeholderTextColor="#8e8e93"
                    keyboardType="numeric"
                  />
                  <Text style={styles.ageSeparator}>-</Text>
                  <TextInput
                    style={styles.ageInput}
                    value={formData.requirements.age_max?.toString() || ''}
                    onChangeText={(value) => handleRequirementsChange('age_max', value ? parseInt(value) : undefined)}
                    placeholder="Max"
                    placeholderTextColor="#8e8e93"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.requirementRow}>
                <Text style={styles.requirementLabel}>Skill Level</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowSkillPicker(true)}
                >
                  <Text style={styles.pickerButtonText}>
                    {getSkillLabel(formData.requirements.skill_level)}
                  </Text>
                  <Text style={styles.pickerIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.requirementRow}>
                <Text style={styles.requirementLabel}>Gender Preference</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <Text style={styles.pickerButtonText}>
                    {getGenderLabel(formData.requirements.gender_preference)}
                  </Text>
                  <Text style={styles.pickerIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Sport Picker Modal */}
      <Modal visible={showSportPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Sport</Text>
            <FlatList
              data={SPORTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    handleInputChange('sport', item);
                    setShowSportPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowSportPicker(false)}
            >
              <Text style={styles.pickerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Picker Modal */}
      <Modal visible={showPrivacyPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Privacy</Text>
            {PRIVACY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerItem}
                onPress={() => {
                  handleInputChange('privacy', option.value);
                  setShowPrivacyPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{option.label}</Text>
                <Text style={styles.pickerItemDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowPrivacyPicker(false)}
            >
              <Text style={styles.pickerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Skill Picker Modal */}
      <Modal visible={showSkillPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Skill Level</Text>
            {SKILL_LEVELS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerItem}
                onPress={() => {
                  handleRequirementsChange('skill_level', option.value);
                  setShowSkillPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowSkillPicker(false)}
            >
              <Text style={styles.pickerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal visible={showGenderPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Gender Preference</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerItem}
                onPress={() => {
                  handleRequirementsChange('gender_preference', option.value);
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={styles.pickerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },
  errorDismiss: {
    fontSize: 18,
    color: '#c62828',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
  pickerButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  pickerIcon: {
    fontSize: 12,
    color: '#666666',
  },
  locationButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  locationButtonIcon: {
    fontSize: 16,
  },
  locationInfo: {
    marginTop: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#666666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  tagRemove: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  tagAddButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  tagAddButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  rulesContainer: {
    marginBottom: 12,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  ruleRemove: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleRemoveText: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: 'bold',
  },
  ruleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleInput: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  ruleAddButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  ruleAddButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  requirementsContainer: {
    gap: 16,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requirementLabel: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  ageInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageInput: {
    width: 60,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },
  ageSeparator: {
    fontSize: 16,
    color: '#666666',
  },
  submitButton: {
    paddingVertical: 16,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    maxHeight: '60%',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333333',
  },
  pickerItemDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  pickerCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pickerCancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
});
