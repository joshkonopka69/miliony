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
  Image,
} from 'react-native';
import { useTranslation } from '../contexts/TranslationContext';

import { SMLogo } from './index';

export interface ActivityFilter {
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

// Map IDs to specific assets
// Using standard require for assets. 
const BASE_ACTIVITY_TYPES = [
  { id: 'gym', iconSource: require('../../assets/filter icons/gym.png') },
  { id: 'stadium', iconSource: require('../../assets/filter icons/stadium.png') },
  { id: 'swimming_pool', iconSource: require('../../assets/filter icons/swimming pool.png') },
  { id: 'park', iconSource: require('../../assets/filter icons/park.png') },
  // Keeping fallback for sports_complex as no specific icon was found in the new folder
  { id: 'sports_complex', iconSource: require('../../assets/filters/icon_trophy_gold.png') },
  { id: 'bowling_alley', iconSource: require('../../assets/filter icons/bowling alley.png') },
  { id: 'golf_course', iconSource: require('../../assets/filter icons/golf course.png') },
  { id: 'ice_rink', iconSource: require('../../assets/filter icons/ice rink.png') },
  { id: 'tennis_court', iconSource: require('../../assets/filter icons/tennis court.png') },
  { id: 'basketball_court', iconSource: require('../../assets/filter icons/basketball court.png') },
  // New Categories
  { id: 'martial_arts_gym', iconSource: require('../../assets/filter icons/Martial arts gyms.png') },
  { id: 'grappling_hall', iconSource: require('../../assets/filter icons/Grappling sport halls.png') },
] as const;

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
          <SMLogo size={40} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Activity Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.activityFilter.venueTypes}</Text>
            <View style={styles.typesGrid}>
              {activityTypes.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      isSelected && styles.typeChipSelected
                    ]}
                    onPress={() => handleTypeToggle(type.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.typeIconContainer}>
                      <Image
                        source={type.iconSource}
                        style={{
                          width: 50, // Increased size for detail visibility
                          height: 50,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeLabel,
                        isSelected && styles.typeLabelSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    backgroundColor: '#FFFFFF', // White background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
    marginLeft: 4,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8, // Tighter gap for compact grid
  },
  typeChip: {
    width: '31%', // 3 columns
    aspectRatio: 1, // Square
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light Gray Border
    backgroundColor: '#FFFFFF', // White card background
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  typeChipSelected: {
    backgroundColor: '#FFFFFF', // Keep White Background
    borderColor: '#FFD700', // Gold/Yellow Border
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  typeIconContainer: {
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000', // Black Text
    textAlign: 'center',
    marginTop: 4,
  },
  typeLabelSelected: {
    color: '#000000', // Black Text on Gold
    fontWeight: '700',
  },
  keywordInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FAFAFA',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, // Pill shape for radius options
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  radiusChipSelected: {
    backgroundColor: '#FFFFFF', // Keep White Background
    borderColor: '#FFD700', // Gold/Yellow Border
    borderWidth: 2,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  radiusLabelSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    height: 56,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
