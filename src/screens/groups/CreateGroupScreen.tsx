import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation';
import { useGroupManager } from '../../hooks/useGroups';
import { CreateGroupData } from '../../services/groupService';
import { SMLogo } from '../../components';
import { useTranslation } from '../../contexts/TranslationContext';



const GENDER_OPTIONS = [
  { value: 'any', label: 'Any Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const SPORTS_KEYS = [
  'basketball', 'football', 'soccer', 'tennis', 'volleyball', 'baseball',
  'hockey', 'swimming', 'running', 'cycling', 'golf', 'boxing',
  'martial_arts', 'yoga', 'pilates', 'weightlifting', 'crossfit',
  'rock_climbing', 'surfing', 'skiing', 'snowboarding', 'other'
];


export default function CreateGroupScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
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

  const PRIVACY_OPTIONS = useMemo(() => [
    { value: 'public', label: t.myGroups.public, description: t.myGroups.noGroupsFoundMessage.replace('{filter}', t.myGroups.public) }, // Using description from translation maybe?
    { value: 'private', label: t.myGroups.private, description: '' },
    { value: 'invite_only', label: t.myGroups.inviteOnly, description: '' },
  ], [t]);

  const SKILL_LEVEL_OPTIONS = useMemo(() => [
    { value: 'any', label: t.createGroup.anyLevel },
    { value: 'beginner', label: t.myEvents.beginner },
    { value: 'intermediate', label: t.myEvents.intermediate },
    { value: 'advanced', label: t.myEvents.advanced },
    { value: 'expert', label: t.myEvents.expert },
  ], [t]);




  const [location, setLocation] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radius: 5,
  });

  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
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
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim() && !(formData.rules || []).includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...(prev.rules || []), newRule.trim()],
      }));
      setNewRule('');
      setShowRulesInput(false);
    }
  };

  const handleRemoveRule = (ruleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      rules: (prev.rules || []).filter(rule => rule !== ruleToRemove),
    }));
  };

  const handleSubmit = async () => {

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert(t.createGroup.error, t.createGroup.fillFields);
        return;
      }

      if (!formData.sport) {
        Alert.alert(t.createGroup.error, t.createGroup.selectSport);
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
          t.createGroup.success,
          t.createGroup.groupCreated,
          [
            {
              text: t.common.ok,
              onPress: () => navigation.navigate('GroupDetails', { groupId: group.id }),
            },
          ]
        );
      }


    } catch (error: any) {
      Alert.alert(t.createGroup.error, error.message || t.createGroup.fillFields);
    }


  };

  const getSportLabel = (sport: string) => {
    if (!sport) return t.createGroup.selectSport;
    const sportKey = sport.toLowerCase().replace(/ /g, '_');
    return (t.sports as any)[sportKey] || sport;
  };



  const getPrivacyLabel = (privacy: string) => {
    if (privacy === 'public') return t.myGroups.public;
    if (privacy === 'private') return t.myGroups.private;
    if (privacy === 'invite_only') return t.myGroups.inviteOnly;
    return t.createGroup.selectPrivacy;
  };

  const getSkillLabel = (skill: string) => {
    if (skill === 'beginner') return t.myEvents.beginner;
    if (skill === 'intermediate') return t.myEvents.intermediate;
    if (skill === 'advanced') return t.myEvents.advanced;
    if (skill === 'expert') return t.myEvents.expert;
    return t.createGroup.anyLevel;
  };

  const getGenderLabel = (gender: string) => {
    if (gender === 'male') return t.createGroup.male;
    if (gender === 'female') return t.createGroup.female;
    return t.createGroup.anyGender;
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.createGroup.title}</Text>
          <SMLogo size={40} />
        </View>

      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#991B1B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={20} color="#991B1B" />
              </TouchableOpacity>
            </View>
          )}

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Basic Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#1F2937" />
                <Text style={styles.sectionTitle}>{t.createGroup.basicInformation}</Text>
              </View>


              <View style={styles.sectionContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.createGroup.groupName} *</Text>

                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder={t.createGroup.groupNamePlaceholder}

                    placeholderTextColor="#9CA3AF"
                    maxLength={50}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.createGroup.sportCategory} *</Text>

                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowSportPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerButtonText, !formData.sport && styles.placeholderText]}>
                      {getSportLabel(formData.sport)}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.createGroup.description}</Text>

                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.description || ''}
                    onChangeText={(value) => handleInputChange('description', value)}
                    placeholder={t.createGroup.descriptionPlaceholder}

                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>
                    {(formData.description || '').length}/500
                  </Text>
                </View>
              </View>
            </View>

            {/* Privacy & Settings Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings-outline" size={20} color="#1F2937" />
                <Text style={styles.sectionTitle}>{t.createGroup.privacySettings}</Text>
              </View>


              <View style={styles.sectionContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.createGroup.privacyLevel}</Text>

                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowPrivacyPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pickerButtonText}>
                      {getPrivacyLabel(formData.privacy)}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.createGroup.memberLimit}</Text>

                  <TextInput
                    style={styles.textInput}
                    value={formData.member_limit?.toString() || ''}
                    onChangeText={(value) => handleInputChange('member_limit', value ? parseInt(value) : undefined)}
                    placeholder={t.createGroup.memberLimitPlaceholder}

                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Member Requirements Section */}
            <View style={styles.section}>

              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={20} color="#1F2937" />
                <Text style={styles.sectionTitle}>{t.createGroup.memberRequirements}</Text>
              </View>


              <View style={styles.sectionContent}>
                <View style={styles.requirementRow}>
                  <Text style={styles.requirementLabel}>{t.createGroup.ageRange}</Text>

                  <View style={styles.ageInputs}>
                    <TextInput
                      style={styles.ageInput}
                      value={formData.requirements?.age_min?.toString() || ''}
                      onChangeText={(value) => handleRequirementsChange('age_min', value ? parseInt(value) : undefined)}
                      placeholder={t.createGroup.minAge}

                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                    <Text style={styles.ageSeparator}>-</Text>
                    <TextInput
                      style={styles.ageInput}
                      value={formData.requirements?.age_max?.toString() || ''}
                      onChangeText={(value) => handleRequirementsChange('age_max', value ? parseInt(value) : undefined)}
                      placeholder={t.createGroup.maxAge}

                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.requirementRow}>
                  <Text style={styles.requirementLabel}>{t.createGroup.skillLevel}</Text>

                  <TouchableOpacity
                    style={styles.smallPickerButton}
                    onPress={() => setShowSkillPicker(true)}
                  >
                    <Text style={styles.smallPickerText}>
                      {getSkillLabel(formData.requirements?.skill_level || '')}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            {/* Rules & Tags (Combined) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list-outline" size={20} color="#1F2937" />
                <Text style={styles.sectionTitle}>{t.createGroup.details}</Text>
              </View>


              <View style={styles.sectionContent}>
                {/* Tags */}
                <Text style={styles.subSectionTitle}>{t.createGroup.tags}</Text>

                <View style={styles.tagsContainer}>
                  {(formData.tags || []).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        style={styles.tagRemove}
                        onPress={() => handleRemoveTag(tag)}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addTagButton}
                    onPress={() => setShowTagInput(true)}
                  >
                    <Ionicons name="add" size={16} color="#FFD700" />
                    <Text style={styles.addTagText}>{t.createGroup.addTag}</Text>
                  </TouchableOpacity>

                </View>

                {/* Show Input for Tag */}
                {showTagInput && (
                  <View style={styles.inlineInputContainer}>
                    <TextInput
                      style={styles.inlineInput}
                      value={newTag}
                      onChangeText={setNewTag}
                      placeholder={t.createGroup.tagNamePlaceholder}
                      autoFocus

                      onSubmitEditing={handleAddTag}
                    />
                    <TouchableOpacity onPress={handleAddTag} style={styles.inlineAddBtn}>
                      <Text style={styles.inlineAddBtnText}>{t.common.ok}</Text>
                    </TouchableOpacity>

                  </View>
                )}

                <View style={{ height: 16 }} />

                {/* Rules */}
                <Text style={styles.subSectionTitle}>{t.createGroup.groupRules}</Text>

                {formData.rules?.map((rule, index) => (
                  <View key={index} style={styles.ruleRow}>
                    <Ionicons name="ellipse" size={6} color="#FFD700" style={{ marginTop: 7 }} />
                    <Text style={styles.ruleText}>{rule}</Text>
                    <TouchableOpacity onPress={() => handleRemoveRule(rule)}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {!showRulesInput ? (
                  <TouchableOpacity
                    style={styles.addRuleButton}
                    onPress={() => setShowRulesInput(true)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFD700" />
                    <Text style={styles.addRuleText}>{t.createGroup.addRule}</Text>
                  </TouchableOpacity>

                ) : (
                  <View style={styles.inlineInputContainer}>
                    <TextInput
                      style={styles.inlineInput}
                      value={newRule}
                      onChangeText={setNewRule}
                      placeholder={t.createGroup.rulePlaceholder}
                      autoFocus

                      onSubmitEditing={handleAddRule}
                    />
                    <TouchableOpacity onPress={handleAddRule} style={styles.inlineAddBtn}>
                      <Text style={styles.inlineAddBtnText}>{t.common.add}</Text>
                    </TouchableOpacity>

                  </View>
                )}
              </View>
            </View>

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Bar */}
      <SafeAreaView style={styles.actionSafeArea}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.createButton, (!formData.name || !formData.sport || isLoading) && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={!formData.name || !formData.sport || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#000000" style={{ marginRight: 8 }} />
                <Text style={styles.createButtonText}>{t.createGroup.create}</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </SafeAreaView>

      {/* Sport Picker Modal */}
      <Modal visible={showSportPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>{t.createGroup.selectSport}</Text>
            <FlatList
              data={SPORTS_KEYS}

              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    handleInputChange('sport', item);
                    setShowSportPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{getSportLabel(item)}</Text>
                  {formData.sport === item && <Ionicons name="checkmark" size={20} color="#FFD700" />}
                </TouchableOpacity>

              )}
            />
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowSportPicker(false)}
            >
              <Text style={styles.pickerCancelButtonText}>{t.createGroup.cancel}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* Privacy Picker Modal */}
      <Modal visible={showPrivacyPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>{t.createGroup.selectPrivacy}</Text>
            {PRIVACY_OPTIONS.map((option: any) => (

              <TouchableOpacity
                key={option.value}
                style={styles.pickerItem}
                onPress={() => {
                  handleInputChange('privacy', option.value);
                  setShowPrivacyPicker(false);
                }}
              >
                <View>
                  <Text style={styles.pickerItemText}>{option.label}</Text>
                  <Text style={styles.pickerItemDescription}>{option.description}</Text>
                </View>
                {formData.privacy === option.value && <Ionicons name="checkmark" size={20} color="#FFD700" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowPrivacyPicker(false)}
            >
              <Text style={styles.pickerCancelButtonText}>{t.createGroup.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Skill & Gender Pickers reused logic or similar Modals can be added here */}
      <Modal visible={showSkillPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>{t.createGroup.selectSkillLevel}</Text>
            {SKILL_LEVEL_OPTIONS.map((option: any) => (

              <TouchableOpacity
                key={option.value}
                style={styles.pickerItem}
                onPress={() => {
                  handleRequirementsChange('skill_level', option.value);
                  setShowSkillPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{option.label}</Text>
                {formData.requirements?.skill_level === option.value && <Ionicons name="checkmark" size={20} color="#FFD700" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.pickerCancelButton} onPress={() => setShowSkillPicker(false)}>
              <Text style={styles.pickerCancelButtonText}>{t.createGroup.cancel}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Top Bar Styles
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionContent: {
    gap: 12,
  },

  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 8,
  },
  // Inputs
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },

  placeholderText: {
    color: '#9CA3AF',
  },
  pickerButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },

  locationButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFBEB',
    gap: 12,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationInfo: {
    paddingHorizontal: 4,
  },
  locationInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Requirements
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  requirementLabel: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  ageInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  ageSeparator: {
    color: '#9CA3AF',
    fontSize: 18,
  },
  smallPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  smallPickerText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  // Tags & Rules
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  tagRemove: {
    opacity: 0.8,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
    borderStyle: 'dashed',
  },
  addTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addRuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    paddingVertical: 8,
  },
  addRuleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B45309',
  },
  inlineInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  inlineInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inlineAddBtn: {
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inlineAddBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Footer / Action Bar
  actionSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionContainer: {
    padding: 16,
  },
  createButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 14,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '80%',
    padding: 24,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  pickerItemDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pickerCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  pickerCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
});
