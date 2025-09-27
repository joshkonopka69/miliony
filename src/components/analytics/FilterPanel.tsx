import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsFilters } from '../../services/analyticsService';

interface FilterPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onClose: () => void;
  availableSports?: string[];
  availableLocations?: string[];
  availableAgeGroups?: string[];
  availableSkillLevels?: string[];
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onClose,
  availableSports = [],
  availableLocations = [],
  availableAgeGroups = [],
  availableSkillLevels = [],
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<AnalyticsFilters>(filters);
  const [expandedSections, setExpandedSections] = useState<{
    users: boolean;
    events: boolean;
    groups: boolean;
    sports: boolean;
    locations: boolean;
    demographics: boolean;
  }>({
    users: false,
    events: false,
    groups: false,
    sports: false,
    locations: false,
    demographics: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onFiltersChange({});
    onClose();
  };

  const handleUserIdsChange = (text: string) => {
    const userIds = text.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setLocalFilters(prev => ({
      ...prev,
      user_ids: userIds.length > 0 ? userIds : undefined,
    }));
  };

  const handleEventIdsChange = (text: string) => {
    const eventIds = text.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setLocalFilters(prev => ({
      ...prev,
      event_ids: eventIds.length > 0 ? eventIds : undefined,
    }));
  };

  const handleGroupIdsChange = (text: string) => {
    const groupIds = text.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setLocalFilters(prev => ({
      ...prev,
      group_ids: groupIds.length > 0 ? groupIds : undefined,
    }));
  };

  const handleSportsChange = (sport: string, selected: boolean) => {
    const currentSports = localFilters.sports || [];
    const newSports = selected
      ? [...currentSports, sport]
      : currentSports.filter(s => s !== sport);
    
    setLocalFilters(prev => ({
      ...prev,
      sports: newSports.length > 0 ? newSports : undefined,
    }));
  };

  const handleLocationsChange = (location: string, selected: boolean) => {
    const currentLocations = localFilters.locations || [];
    const newLocations = selected
      ? [...currentLocations, location]
      : currentLocations.filter(l => l !== location);
    
    setLocalFilters(prev => ({
      ...prev,
      locations: newLocations.length > 0 ? newLocations : undefined,
    }));
  };

  const handleAgeGroupsChange = (ageGroup: string, selected: boolean) => {
    const currentAgeGroups = localFilters.age_groups || [];
    const newAgeGroups = selected
      ? [...currentAgeGroups, ageGroup]
      : currentAgeGroups.filter(a => a !== ageGroup);
    
    setLocalFilters(prev => ({
      ...prev,
      age_groups: newAgeGroups.length > 0 ? newAgeGroups : undefined,
    }));
  };

  const handleSkillLevelsChange = (skillLevel: string, selected: boolean) => {
    const currentSkillLevels = localFilters.skill_levels || [];
    const newSkillLevels = selected
      ? [...currentSkillLevels, skillLevel]
      : currentSkillLevels.filter(s => s !== skillLevel);
    
    setLocalFilters(prev => ({
      ...prev,
      skill_levels: newSkillLevels.length > 0 ? newSkillLevels : undefined,
    }));
  };

  const renderSection = (
    title: string,
    section: keyof typeof expandedSections,
    children: React.ReactNode
  ) => {
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons
            name={expandedSections[section] ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666666"
          />
        </TouchableOpacity>
        
        {expandedSections[section] && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  const renderMultiSelect = (
    items: string[],
    selectedItems: string[],
    onItemChange: (item: string, selected: boolean) => void,
    placeholder: string
  ) => {
    if (items.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No {placeholder.toLowerCase()} available
        </Text>
      );
    }

    return (
      <View style={styles.multiSelectContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.multiSelectItem,
              selectedItems.includes(item) && styles.multiSelectItemSelected,
            ]}
            onPress={() => onItemChange(item, !selectedItems.includes(item))}
          >
            <Text
              style={[
                styles.multiSelectItemText,
                selectedItems.includes(item) && styles.multiSelectItemTextSelected,
              ]}
            >
              {item}
            </Text>
            {selectedItems.includes(item) && (
              <Ionicons name="checkmark" size={16} color="#2196F3" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderUserFilters = () => {
    return renderSection(
      'Users',
      'users',
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>User IDs (comma-separated)</Text>
        <TextInput
          style={styles.textInput}
          value={localFilters.user_ids?.join(', ') || ''}
          onChangeText={handleUserIdsChange}
          placeholder="Enter user IDs separated by commas"
          placeholderTextColor="#999999"
          multiline
        />
      </View>
    );
  };

  const renderEventFilters = () => {
    return renderSection(
      'Events',
      'events',
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Event IDs (comma-separated)</Text>
        <TextInput
          style={styles.textInput}
          value={localFilters.event_ids?.join(', ') || ''}
          onChangeText={handleEventIdsChange}
          placeholder="Enter event IDs separated by commas"
          placeholderTextColor="#999999"
          multiline
        />
      </View>
    );
  };

  const renderGroupFilters = () => {
    return renderSection(
      'Groups',
      'groups',
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Group IDs (comma-separated)</Text>
        <TextInput
          style={styles.textInput}
          value={localFilters.group_ids?.join(', ') || ''}
          onChangeText={handleGroupIdsChange}
          placeholder="Enter group IDs separated by commas"
          placeholderTextColor="#999999"
          multiline
        />
      </View>
    );
  };

  const renderSportsFilters = () => {
    return renderSection(
      'Sports',
      'sports',
      renderMultiSelect(
        availableSports,
        localFilters.sports || [],
        handleSportsChange,
        'sports'
      )
    );
  };

  const renderLocationFilters = () => {
    return renderSection(
      'Locations',
      'locations',
      renderMultiSelect(
        availableLocations,
        localFilters.locations || [],
        handleLocationsChange,
        'locations'
      )
    );
  };

  const renderDemographicsFilters = () => {
    return renderSection(
      'Demographics',
      'demographics',
      <View style={styles.demographicsContainer}>
        <View style={styles.demographicsSection}>
          <Text style={styles.demographicsTitle}>Age Groups</Text>
          {renderMultiSelect(
            availableAgeGroups,
            localFilters.age_groups || [],
            handleAgeGroupsChange,
            'age groups'
          )}
        </View>
        
        <View style={styles.demographicsSection}>
          <Text style={styles.demographicsTitle}>Skill Levels</Text>
          {renderMultiSelect(
            availableSkillLevels,
            localFilters.skill_levels || [],
            handleSkillLevelsChange,
            'skill levels'
          )}
        </View>
      </View>
    );
  };

  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (localFilters.user_ids?.length) {
      activeFilters.push(`${localFilters.user_ids.length} users`);
    }
    if (localFilters.event_ids?.length) {
      activeFilters.push(`${localFilters.event_ids.length} events`);
    }
    if (localFilters.group_ids?.length) {
      activeFilters.push(`${localFilters.group_ids.length} groups`);
    }
    if (localFilters.sports?.length) {
      activeFilters.push(`${localFilters.sports.length} sports`);
    }
    if (localFilters.locations?.length) {
      activeFilters.push(`${localFilters.locations.length} locations`);
    }
    if (localFilters.age_groups?.length) {
      activeFilters.push(`${localFilters.age_groups.length} age groups`);
    }
    if (localFilters.skill_levels?.length) {
      activeFilters.push(`${localFilters.skill_levels.length} skill levels`);
    }

    if (activeFilters.length === 0) {
      return (
        <Text style={styles.noFiltersText}>No filters applied</Text>
      );
    }

    return (
      <View style={styles.activeFiltersContainer}>
        <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
        <Text style={styles.activeFiltersText}>
          {activeFilters.join(', ')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#666666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderActiveFilters()}
        {renderUserFilters()}
        {renderEventFilters()}
        {renderGroupFilters()}
        {renderSportsFilters()}
        {renderLocationFilters()}
        {renderDemographicsFilters()}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  activeFiltersContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
    marginBottom: 4,
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#666666',
  },
  noFiltersText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  sectionContent: {
    paddingTop: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minHeight: 40,
  },
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  multiSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  multiSelectItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  multiSelectItemText: {
    fontSize: 12,
    color: '#666666',
  },
  multiSelectItemTextSelected: {
    color: '#2196F3',
    fontWeight: '500',
  },
  demographicsContainer: {
    gap: 16,
  },
  demographicsSection: {
    gap: 8,
  },
  demographicsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  emptyText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
