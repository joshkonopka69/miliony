import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import Button from './ui/Button';
import Card from './ui/Card';

export interface EventSearchFilters {
  query: string;
  activities: string[];
  timeFilter: 'all' | 'now' | 'today' | 'tomorrow' | 'this_week';
  distance: number; // in km
  skillLevel: 'all' | 'beginner' | 'intermediate' | 'advanced';
  maxParticipants: number;
  showFullEvents: boolean;
  showLiveOnly: boolean;
}

interface EventSearchFilterProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EventSearchFilters) => void;
  currentFilters: EventSearchFilters;
}

const ACTIVITIES = [
  'Football', 'Basketball', 'Tennis', 'Swimming', 'Gym Workout',
  'Yoga', 'Running', 'Cycling', 'Volleyball', 'Badminton',
  'Soccer', 'Baseball', 'Hockey', 'Golf', 'Boxing', 'Martial Arts'
];

const TIME_FILTERS = [
  { key: 'all', label: 'All Time' },
  { key: 'now', label: 'NOW (Live)' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'this_week', label: 'This Week' },
];

const SKILL_LEVELS = [
  { key: 'all', label: 'All Levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

export default function EventSearchFilter({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: EventSearchFilterProps) {
  const [filters, setFilters] = useState<EventSearchFilters>(currentFilters);

  const handleActivityToggle = (activity: string) => {
    setFilters(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleTimeFilterChange = (timeFilter: EventSearchFilters['timeFilter']) => {
    setFilters(prev => ({ ...prev, timeFilter }));
  };

  const handleSkillLevelChange = (skillLevel: EventSearchFilters['skillLevel']) => {
    setFilters(prev => ({ ...prev, skillLevel }));
  };

  const handleDistanceChange = (distance: number) => {
    setFilters(prev => ({ ...prev, distance }));
  };

  const handleMaxParticipantsChange = (maxParticipants: number) => {
    setFilters(prev => ({ ...prev, maxParticipants }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: EventSearchFilters = {
      query: '',
      activities: [],
      timeFilter: 'all',
      distance: 10,
      skillLevel: 'all',
      maxParticipants: 20,
      showFullEvents: true,
      showLiveOnly: false,
    };
    setFilters(resetFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search & Filters</Text>
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Query */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Search</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={filters.query}
              onChangeText={(text) => setFilters(prev => ({ ...prev, query: text }))}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </Card>

          {/* Time Filter */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>When</Text>
            <View style={styles.timeFilterContainer}>
              {TIME_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.timeFilterButton,
                    filters.timeFilter === filter.key && styles.timeFilterButtonActive
                  ]}
                  onPress={() => handleTimeFilterChange(filter.key as EventSearchFilters['timeFilter'])}
                >
                  <Text style={[
                    styles.timeFilterText,
                    filters.timeFilter === filter.key && styles.timeFilterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Activities */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Activities</Text>
            <View style={styles.activitiesContainer}>
              {ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity}
                  style={[
                    styles.activityChip,
                    filters.activities.includes(activity) && styles.activityChipSelected
                  ]}
                  onPress={() => handleActivityToggle(activity)}
                >
                  <Text style={[
                    styles.activityChipText,
                    filters.activities.includes(activity) && styles.activityChipTextSelected
                  ]}>
                    {activity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Distance */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Distance: {filters.distance} km</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderProgress, 
                    { width: `${(filters.distance / 50) * 100}%` }
                  ]} 
                />
                <TouchableOpacity
                  style={[
                    styles.sliderThumb,
                    { left: `${(filters.distance / 50) * 100}%` }
                  ]}
                  onPress={() => {}} // Add slider logic here
                />
              </View>
              <Text style={styles.sliderLabel}>50 km</Text>
            </View>
          </Card>

          {/* Skill Level */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Skill Level</Text>
            <View style={styles.skillLevelContainer}>
              {SKILL_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.skillLevelButton,
                    filters.skillLevel === level.key && styles.skillLevelButtonActive
                  ]}
                  onPress={() => handleSkillLevelChange(level.key as EventSearchFilters['skillLevel'])}
                >
                  <Text style={[
                    styles.skillLevelText,
                    filters.skillLevel === level.key && styles.skillLevelTextActive
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Max Participants */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Max Participants: {filters.maxParticipants}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>2</Text>
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderProgress, 
                    { width: `${((filters.maxParticipants - 2) / 48) * 100}%` }
                  ]} 
                />
                <TouchableOpacity
                  style={[
                    styles.sliderThumb,
                    { left: `${((filters.maxParticipants - 2) / 48) * 100}%` }
                  ]}
                  onPress={() => {}} // Add slider logic here
                />
              </View>
              <Text style={styles.sliderLabel}>50</Text>
            </View>
          </Card>

          {/* Additional Options */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Show Full Events</Text>
              <Switch
                value={filters.showFullEvents}
                onValueChange={(value) => setFilters(prev => ({ ...prev, showFullEvents: value }))}
                trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
                thumbColor={filters.showFullEvents ? 'white' : '#f4f3f4'}
              />
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Live Events Only</Text>
              <Switch
                value={filters.showLiveOnly}
                onValueChange={(value) => setFilters(prev => ({ ...prev, showLiveOnly: value }))}
                trackColor={{ false: '#d1d5db', true: theme.colors.primary }}
                thumbColor={filters.showLiveOnly ? 'white' : '#f4f3f4'}
              />
            </View>
          </Card>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApplyFilters}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  resetText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'white',
  },
  timeFilterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeFilterText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  timeFilterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'white',
  },
  activityChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  activityChipText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  activityChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    minWidth: 30,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'white',
  },
  skillLevelButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  skillLevelText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  skillLevelTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  applyButton: {
    height: 50,
    borderRadius: 12,
  },
});



