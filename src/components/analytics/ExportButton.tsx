import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'csv' | 'excel' | 'json') => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  availableFormats?: ('pdf' | 'csv' | 'excel' | 'json')[];
  style?: any;
}

export function ExportButton({
  onExport,
  loading = false,
  disabled = false,
  availableFormats = ['pdf', 'csv', 'excel', 'json'],
  style,
}: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'excel' | 'json'>('pdf');

  const formatOptions = [
    { key: 'pdf', label: 'PDF', icon: 'document-text', description: 'Formatted report with charts' },
    { key: 'csv', label: 'CSV', icon: 'table', description: 'Raw data for spreadsheet analysis' },
    { key: 'excel', label: 'Excel', icon: 'grid', description: 'Structured data with formatting' },
    { key: 'json', label: 'JSON', icon: 'code', description: 'Machine-readable data format' },
  ].filter(option => availableFormats.includes(option.key as any));

  const handleExport = async () => {
    if (exporting) return;
    
    setExporting(true);
    try {
      await onExport(selectedFormat);
      setShowModal(false);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFormatSelect = (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    setSelectedFormat(format);
  };

  const renderFormatOption = (option: typeof formatOptions[0]) => {
    const isSelected = selectedFormat === option.key;
    
    return (
      <TouchableOpacity
        key={option.key}
        style={[styles.formatOption, isSelected && styles.selectedFormatOption]}
        onPress={() => handleFormatSelect(option.key as any)}
      >
        <View style={styles.formatOptionContent}>
          <View style={styles.formatOptionHeader}>
            <Ionicons
              name={option.icon as any}
              size={24}
              color={isSelected ? '#2196F3' : '#666666'}
            />
            <Text style={[styles.formatOptionLabel, isSelected && styles.selectedFormatOptionLabel]}>
              {option.label}
            </Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
            )}
          </View>
          <Text style={styles.formatOptionDescription}>
            {option.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderExportModal = () => {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Data</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose the format for exporting your analytics data:
            </Text>
            
            <View style={styles.formatOptions}>
              {formatOptions.map(renderFormatOption)}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.exportButton, (exporting || loading) && styles.exportButtonDisabled]}
                onPress={handleExport}
                disabled={exporting || loading}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="download" size={16} color="#ffffff" />
                    <Text style={styles.exportButtonText}>Export</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style, (disabled || loading) && styles.disabled]}
        onPress={() => setShowModal(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : (
          <>
            <Ionicons name="download" size={16} color="#2196F3" />
            <Text style={styles.buttonText}>Export</Text>
          </>
        )}
      </TouchableOpacity>
      
      {renderExportModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
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
  modalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  formatOptions: {
    gap: 12,
    marginBottom: 24,
  },
  formatOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  selectedFormatOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  formatOptionContent: {
    gap: 8,
  },
  formatOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formatOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  selectedFormatOptionLabel: {
    color: '#2196F3',
  },
  formatOptionDescription: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 36,
  },
  modalActions: {
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
  exportButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  exportButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
