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
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { AppealRequest } from '../../services/moderationService';

interface AppealScreenProps {
  navigation: any;
}

export default function AppealScreen({ navigation }: AppealScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    createAppealRequest,
    getAppealRequests,
    reviewAppeal,
    appealRequests,
    isLoading,
    error,
    clearError,
  } = useModeration();

  const [isCreatingAppeal, setIsCreatingAppeal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealEvidence, setAppealEvidence] = useState<string[]>([]);
  const [actionId, setActionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAppealRequests();
  }, []);

  const loadAppealRequests = async () => {
    try {
      if (user) {
        await getAppealRequests({ user_id: user.id });
      }
    } catch (error) {
      console.error('Error loading appeal requests:', error);
    }
  };

  const handleCreateAppeal = async () => {
    if (!appealReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for your appeal');
      return;
    }

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
                setShowCreateForm(false);
                setAppealReason('');
                setAppealEvidence([]);
                setActionId('');
                loadAppealRequests();
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

  const handleReviewAppeal = async (appealId: string, decision: 'approved' | 'denied') => {
    try {
      const success = await reviewAppeal(appealId, decision, 'Reviewed by moderator');
      
      if (success) {
        Alert.alert(
          'Appeal Reviewed',
          `Appeal has been ${decision} successfully.`,
          [
            {
              text: 'OK',
              onPress: () => loadAppealRequests(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      Alert.alert('Error', 'Failed to review appeal. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF8800';
      case 'under_review': return '#007AFF';
      case 'approved': return '#00BB00';
      case 'denied': return '#FF4444';
      default: return '#666666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'under_review': return '🔍';
      case 'approved': return '✅';
      case 'denied': return '❌';
      default: return '❓';
    }
  };

  const getFilteredAppeals = () => {
    if (filter === 'all') return appealRequests;
    return appealRequests.filter(appeal => appeal.status === filter);
  };

  const renderAppealItem = ({ item }: { item: AppealRequest }) => (
    <View style={styles.appealItem}>
      <View style={styles.appealHeader}>
        <Text style={styles.appealId}>Appeal ID: {item.id}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}>
          <Text style={styles.statusText}>
            {getStatusIcon(item.status)} {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.appealDetails}>
        <Text style={styles.detailText}>Action ID: {item.action_id}</Text>
        <Text style={styles.detailText}>Reason: {item.reason}</Text>
        {item.evidence && item.evidence.length > 0 && (
          <Text style={styles.detailText}>Evidence: {item.evidence.length} items</Text>
        )}
        {item.moderator_notes && (
          <Text style={styles.detailText}>Moderator Notes: {item.moderator_notes}</Text>
        )}
        <Text style={styles.detailText}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.updated_at !== item.created_at && (
          <Text style={styles.detailText}>
            Updated: {new Date(item.updated_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={styles.appealActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => Alert.alert('Cancel Appeal', 'Are you sure you want to cancel this appeal?')}
          >
            <Text style={styles.cancelButtonText}>Cancel Appeal</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCreateForm = () => (
    <View style={styles.createForm}>
      <Text style={styles.formTitle}>Create New Appeal</Text>
      
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Action ID (Optional)</Text>
        <TextInput
          style={styles.fieldInput}
          value={actionId}
          onChangeText={setActionId}
          placeholder="Enter the action ID you're appealing"
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
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelFormButton}
          onPress={() => setShowCreateForm(false)}
        >
          <Text style={styles.cancelFormButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitFormButton,
            isSubmitting && styles.submitFormButtonDisabled,
          ]}
          onPress={handleCreateAppeal}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitFormButtonText}>Submit Appeal</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading appeals...</Text>
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
        <Text style={styles.title}>Appeals</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && renderCreateForm()}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'under_review', 'approved', 'denied'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                filter === filterOption && styles.activeFilterButton,
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterOption && styles.activeFilterButtonText,
              ]}>
                {filterOption.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.clearErrorButton}
            onPress={clearError}
          >
            <Text style={styles.clearErrorText}>Clear Error</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={getFilteredAppeals()}
        renderItem={renderAppealItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appeals found</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Your First Appeal</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  createButton: {
    padding: 8,
  },
  createButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  createForm: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
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
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelFormButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelFormButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  submitFormButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitFormButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitFormButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 20,
    borderRadius: 8,
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
  listContainer: {
    padding: 20,
  },
  appealItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  appealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appealId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  appealDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  appealActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF4444',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  createFirstButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
