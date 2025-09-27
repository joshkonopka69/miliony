import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { ReportCategory, ReportTemplate } from '../../services/reportingService';

interface ReportContentScreenProps {
  navigation: any;
  route: any;
}

export default function ReportContentScreen({ navigation, route }: ReportContentScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    getReportCategories,
    getReportTemplates,
    submitReport,
    reportCategories,
    reportTemplates,
    isReporting,
    reportError,
    clearReportError,
  } = useModeration();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportData, setReportData] = useState<{ [key: string]: any }>({});
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { contentId, contentType, contentData } = route.params || {};

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates();
    }
  }, [selectedCategory]);

  const loadReportData = async () => {
    try {
      await getReportCategories();
    } catch (error) {
      console.error('Error loading report categories:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      await getReportTemplates(selectedCategory);
    } catch (error) {
      console.error('Error loading report templates:', error);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTemplate(null);
    setReportData({});
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setReportData({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setReportData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory || !selectedTemplate) {
      Alert.alert('Error', 'Please select a category and template');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a report');
      return;
    }

    try {
      setIsSubmitting(true);

      const report = {
        reporter_id: user.id,
        template_id: selectedTemplate.id,
        content_id: contentId || 'unknown',
        content_type: contentType || 'unknown',
        data: {
          ...reportData,
          description,
          evidence,
        },
        status: 'submitted' as const,
      };

      const result = await submitReport(report);

      if (result) {
        Alert.alert(
          'Report Submitted',
          'Your report has been submitted successfully. We will review it and take appropriate action.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryItem = (category: ReportCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        selectedCategory === category.id && styles.selectedCategory,
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <Text style={[
        styles.categoryName,
        selectedCategory === category.id && styles.selectedCategoryText,
      ]}>
        {category.name}
      </Text>
      <Text style={styles.categoryDescription}>
        {category.description}
      </Text>
      <View style={[
        styles.severityBadge,
        { backgroundColor: getSeverityColor(category.severity) },
      ]}>
        <Text style={styles.severityText}>
          {category.severity.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateItem = (template: ReportTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateItem,
        selectedTemplate?.id === template.id && styles.selectedTemplate,
      ]}
      onPress={() => handleTemplateSelect(template)}
    >
      <Text style={[
        styles.templateName,
        selectedTemplate?.id === template.id && styles.selectedTemplateText,
      ]}>
        {template.name}
      </Text>
      <Text style={styles.templateDescription}>
        {template.description}
      </Text>
      <View style={[
        styles.priorityBadge,
        { backgroundColor: getPriorityColor(template.priority) },
      ]}>
        <Text style={styles.priorityText}>
          {template.priority.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderField = (field: string) => {
    const isRequired = selectedTemplate?.required_fields.includes(field);
    
    return (
      <View key={field} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.replace(/_/g, ' ').toUpperCase()}
          {isRequired && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={styles.fieldInput}
          value={reportData[field] || ''}
          onChangeText={(value) => handleFieldChange(field, value)}
          placeholder={`Enter ${field.replace(/_/g, ' ')}`}
          multiline={field.includes('description') || field.includes('reason')}
          numberOfLines={field.includes('description') || field.includes('reason') ? 3 : 1}
        />
      </View>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFBB00';
      case 'low': return '#00BB00';
      default: return '#666666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFBB00';
      case 'low': return '#00BB00';
      default: return '#666666';
    }
  };

  if (isReporting) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading report options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Report Content</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {contentData && (
          <View style={styles.contentPreview}>
            <Text style={styles.previewTitle}>Content to Report:</Text>
            <Text style={styles.previewText}>
              {contentData.text || contentData.description || 'Content preview'}
            </Text>
            {contentData.images && contentData.images.length > 0 && (
              <View style={styles.imagePreview}>
                {contentData.images.slice(0, 3).map((image: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Report Category</Text>
          <Text style={styles.sectionDescription}>
            Choose the most appropriate category for your report
          </Text>
          
          {reportCategories.map(renderCategoryItem)}
        </View>

        {selectedCategory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Report Template</Text>
            <Text style={styles.sectionDescription}>
              Choose a template that best fits your report
            </Text>
            
            {reportTemplates
              .filter(template => template.category_id === selectedCategory)
              .map(renderTemplateItem)}
          </View>
        )}

        {selectedTemplate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Report Details</Text>
            <Text style={styles.sectionDescription}>
              Provide additional details for your report
            </Text>

            <View style={styles.descriptionContainer}>
              <Text style={styles.fieldLabel}>Description *</Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue in detail..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {selectedTemplate.required_fields.map(renderField)}
            {selectedTemplate.optional_fields.map(renderField)}
          </View>
        )}

        {reportError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{reportError}</Text>
            <TouchableOpacity
              style={styles.clearErrorButton}
              onPress={clearReportError}
            >
              <Text style={styles.clearErrorText}>Clear Error</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {selectedTemplate && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentPreview: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  imagePreview: {
    flexDirection: 'row',
    marginTop: 12,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedCategoryText: {
    color: '#007AFF',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  templateItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedTemplateText: {
    color: '#007AFF',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  required: {
    color: '#FF4444',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    minHeight: 100,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 8,
  },
  clearErrorButton: {
    alignSelf: 'flex-start',
  },
  clearErrorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
  },
  submitContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
