import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTranslation } from '../contexts/TranslationContext';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

interface ActivityFilter {
  types: string[];
  keywords: string[];
  radius: number;
}

interface ActivityFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ActivityFilter) => void;
  currentFilters: ActivityFilter;
}

const BASE_ACTIVITY_TYPES = [
  { id: 'gym', icon: '💪' },
  { id: 'stadium', icon: '🏟️' },
  { id: 'swimming_pool', icon: '🏊' },
  { id: 'park', icon: '🌳' },
  { id: 'sports_complex', icon: '🏟️' },
  { id: 'bowling_alley', icon: '🎳' },
  { id: 'golf_course', icon: '⛳' },
  { id: 'ice_rink', icon: '⛸️' },
  { id: 'tennis_court', icon: '🎾' },
  { id: 'basketball_court', icon: '🏀' },
];

export default function ActivityFilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: ActivityFilterModalProps) {
  const { t } = useTranslation();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentFilters.types);
  const [keywords, setKeywords] = useState(currentFilters.keywords.join(', '));
  const [radius, setRadius] = useState(currentFilters.radius);

  const activityTypes = useMemo(
    () =>
      BASE_ACTIVITY_TYPES.map(type => ({
        ...type,
        label: t.activityFilter.types[type.id] ?? type.id,
      })),
    [t.activityFilter.types]
  );

  const radiusOptions = useMemo(
    () =>
      [1000, 3000, 5000, 10000, 20000].map(value => ({
        value,
        label: `${value / 1000} ${t.activityFilter.unitKm}`,
      })),
    [t.activityFilter.unitKm]
  );

  // Update local state when currentFilters prop changes
  useEffect(() => {
    setSelectedTypes(currentFilters.types);
    setKeywords(currentFilters.keywords.join(', '));
    setRadius(currentFilters.radius);
  }, [currentFilters]);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleApply = () => {
    const filters: ActivityFilter = {
      types: selectedTypes,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
      radius: radius,
    };
    
    console.log('ActivityFilterModal: Applying filters:', filters);
    console.log('ActivityFilterModal: Selected types:', selectedTypes);
    console.log('ActivityFilterModal: Keywords:', keywords);
    console.log('ActivityFilterModal: Radius:', radius);
    
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setKeywords('');
    setRadius(3000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>{t.activityFilter.cancel}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.activityFilter.title}</Text>
          <SMLogo size={30} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Activity Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.activityFilter.venueTypes}</Text>
            <View style={styles.typesGrid}>
              {activityTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    selectedTypes.includes(type.id) && styles.typeChipSelected
                  ]}
                  onPress={() => handleTypeToggle(type.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedTypes.includes(type.id) && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Keywords */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.activityFilter.specificActivities}</Text>
            <Text style={styles.sectionSubtitle}>
              {t.activityFilter.specificActivitiesHint}
            </Text>
            <TextInput
              style={styles.keywordInput}
              value={keywords}
              onChangeText={setKeywords}
              placeholder={t.activityFilter.keywordsPlaceholder}
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>

          {/* Radius */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.activityFilter.searchRadius}</Text>
            <View style={styles.radiusContainer}>
              {radiusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusChip,
                    radius === option.value && styles.radiusChipSelected
                  ]}
                  onPress={() => setRadius(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.radiusLabel,
                    radius === option.value && styles.radiusLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>{t.activityFilter.apply}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 8,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minWidth: 120,
  },
  typeChipSelected: {
    backgroundColor: '#f9bc06',
    borderColor: '#f9bc06',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeLabelSelected: {
    color: '#ffffff',
  },
  keywordInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  radiusChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  radiusChipSelected: {
    backgroundColor: '#f9bc06',
    borderColor: '#f9bc06',
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  radiusLabelSelected: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  applyButton: {
    height: 56,
    backgroundColor: '#f9bc06',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f9bc06',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});