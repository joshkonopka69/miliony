import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../contexts/AuthContext';
import { AppealRequest } from '../../services/moderationService';

interface AppealFormProps {
  onAppealSubmitted?: (appeal: AppealRequest) => void;
  onCancel?: () => void;
  actionId?: string;
  initialReason?: string;
  showCancelButton?: boolean;
}

export default function AppealFormComponent({
  onAppealSubmitted,
  onCancel,
  actionId,
  initialReason,
  showCancelButton = true,
}: AppealFormProps) {
  const { user } = useAuth();
  const {
    createAppealRequest,
    isModerating,
    error,
    clearError,
  } = useModeration();

  const [appealReason, setAppealReason] = useState(initialReason || '');
  const [appealEvidence, setAppealEvidence] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialReason) {
      setAppealReason(initialReason);
    }
  }, [initialReason]);

  const handleSubmitAppeal = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an appeal');
      return;
    }

    try {
      setIsSubmitting(true);

      const appeal = {
        user_id: user.id,
        action_id: actionId || 'unknown',
        reason: appealReason,
        evidence: appealEvidence,
        status: 'pending' as const,
      };

      const result = await createAppealRequest(appeal);

      if (result) {
        Alert.alert(
          'Appeal Submitted',
          'Your appeal has been submitted successfully. We will review it and notify you of the decision.',
          [
            {
              text: 'OK',
              onPress: () => {
                onAppealSubmitted?.(result);
                resetForm();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating appeal:', error);
      Alert.alert('Error', 'Failed to create appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!appealReason.trim()) {
      errors.push('Please provide a reason for your appeal');
    }

    if (appealReason.trim().length < 10) {
      errors.push('Please provide a more detailed reason (at least 10 characters)');
    }

    if (appealReason.trim().length > 1000) {
      errors.push('Reason is too long (maximum 1000 characters)');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const resetForm = () => {
    setAppealReason('');
    setAppealEvidence([]);
    setValidationErrors([]);
    clearError();
  };

  const handleCancel = () => {
    if (appealReason.trim() && !isSubmitting) {
      Alert.alert(
        'Cancel Appeal',
        'Are you sure you want to cancel? Your changes will be lost.',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Cancel',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onCancel?.();
            },
          },
        ]
      );
    } else {
      resetForm();
      onCancel?.();
    }
  };

  const addEvidence = () => {
    Alert.alert(
      'Add Evidence',
      'Evidence can include screenshots, documents, or other supporting materials. This feature will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  const removeEvidence = (index: number) => {
    setAppealEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const renderEvidenceItem = (evidence: string, index: number) => (
    <View key={index} style={styles.evidenceItem}>
      <Text style={styles.evidenceText}>{evidence}</Text>
      <TouchableOpacity
        style={styles.removeEvidenceButton}
        onPress={() => removeEvidence(index)}
      >
        <Text style={styles.removeEvidenceText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null;

    return (
      <View style={styles.validationErrorsContainer}>
        {validationErrors.map((error, index) => (
          <Text key={index} style={styles.validationErrorText}>
            • {error}
          </Text>
        ))}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.clearErrorButton}
          onPress={clearError}
        >
          <Text style={styles.clearErrorText}>Clear Error</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Appeal</Text>
        <Text style={styles.subtitle}>
          Explain why you believe this action was incorrect
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Action ID</Text>
          <TextInput
            style={styles.fieldInput}
            value={actionId || 'Unknown'}
            editable={false}
            placeholder="Action ID"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Reason *</Text>
          <TextInput
            style={styles.reasonInput}
            value={appealReason}
            onChangeText={setAppealReason}
            placeholder="Explain why you believe this action was incorrect..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.characterCount}>
            {appealReason.length}/1000 characters
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Evidence (Optional)</Text>
          <Text style={styles.fieldDescription}>
            Add any supporting evidence such as screenshots or documents
          </Text>
          
          {appealEvidence.length > 0 && (
            <View style={styles.evidenceContainer}>
              {appealEvidence.map(renderEvidenceItem)}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.addEvidenceButton}
            onPress={addEvidence}
          >
            <Text style={styles.addEvidenceText}>+ Add Evidence</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Appeal Guidelines</Text>
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelineText}>
              • Be specific about what action you're appealing
            </Text>
            <Text style={styles.guidelineText}>
              • Provide clear reasoning for why the action was incorrect
            </Text>
            <Text style={styles.guidelineText}>
              • Include any relevant evidence or context
            </Text>
            <Text style={styles.guidelineText}>
              • Be respectful and constructive in your appeal
            </Text>
            <Text style={styles.guidelineText}>
              • Appeals are reviewed by moderators and decisions are final
            </Text>
          </View>
        </View>

        {renderValidationErrors()}
        {renderError()}
      </ScrollView>

      <View style={styles.footer}>
        {showCancelButton && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitAppeal}
          disabled={isSubmitting || !appealReason.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Appeal</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formField: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F5F5F5',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
  evidenceContainer: {
    marginBottom: 12,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  evidenceText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  removeEvidenceButton: {
    padding: 4,
  },
  removeEvidenceText: {
    fontSize: 18,
    color: '#FF4444',
    fontWeight: '600',
  },
  addEvidenceButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  addEvidenceText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  guidelinesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  validationErrorsContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  validationErrorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007AFF',
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
