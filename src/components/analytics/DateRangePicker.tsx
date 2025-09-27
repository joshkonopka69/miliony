import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateRangePickerProps {
  dateRange: {
    start_date: string;
    end_date: string;
  };
  onDateRangeChange: (dateRange: { start_date: string; end_date: string }) => void;
  presets?: {
    label: string;
    days: number;
  }[];
  showPresets?: boolean;
  showTime?: boolean;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last year', days: 365 },
  ],
  showPresets = true,
  showTime = false,
}: DateRangePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date(dateRange.start_date));
  const [tempEndDate, setTempEndDate] = useState(new Date(dateRange.end_date));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePresetSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    onDateRangeChange({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });
    setShowModal(false);
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setTempStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setTempEndDate(selectedDate);
    }
  };

  const handleApply = () => {
    if (tempStartDate <= tempEndDate) {
      onDateRangeChange({
        start_date: tempStartDate.toISOString(),
        end_date: tempEndDate.toISOString(),
      });
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    setTempStartDate(new Date(dateRange.start_date));
    setTempEndDate(new Date(dateRange.end_date));
    setShowModal(false);
  };

  const renderPresets = () => {
    if (!showPresets) return null;

    return (
      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Quick Select</Text>
        <View style={styles.presetsGrid}>
          {presets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={styles.presetButton}
              onPress={() => handlePresetSelect(preset.days)}
            >
              <Text style={styles.presetText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDatePicker = () => {
    return (
      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerTitle}>Select Date Range</Text>
        
        <View style={styles.dateInputsContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateInputLabel}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateInputText}>
                {showTime ? formatDateTime(tempStartDate) : formatDate(tempStartDate)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateInputLabel}>End Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateInputText}>
                {showTime ? formatDateTime(tempEndDate) : formatDate(tempEndDate)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => setShowModal(true)}>
        <View style={styles.content}>
          <Ionicons name="calendar-outline" size={20} color="#666666" />
          <View style={styles.dateRangeText}>
            <Text style={styles.dateRangeLabel}>Date Range</Text>
            <Text style={styles.dateRangeValue}>
              {showTime ? formatDateTime(new Date(dateRange.start_date)) : formatDate(new Date(dateRange.start_date))} - {showTime ? formatDateTime(new Date(dateRange.end_date)) : formatDate(new Date(dateRange.end_date))}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666666" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderPresets()}
            {renderDatePicker()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {showStartPicker && (
        <DateTimePicker
          value={tempStartDate}
          mode={showTime ? 'datetime' : 'date'}
          display="default"
          onChange={handleStartDateChange}
          maximumDate={tempEndDate}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={tempEndDate}
          mode={showTime ? 'datetime' : 'date'}
          display="default"
          onChange={handleEndDateChange}
          minimumDate={tempStartDate}
          maximumDate={new Date()}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 20,
    marginVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dateRangeText: {
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  dateRangeValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  presetsContainer: {
    marginBottom: 24,
  },
  presetsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  presetText: {
    fontSize: 14,
    color: '#666666',
  },
  datePickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 16,
  },
  dateInputsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  dateInputContainer: {
    gap: 8,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateInputText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
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
