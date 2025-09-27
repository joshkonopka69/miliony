import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { ModerationQueue, ModerationAction } from '../../services/moderationService';

interface ModerationQueueScreenProps {
  navigation: any;
}

export default function ModerationQueueScreen({ navigation }: ModerationQueueScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    getModerationQueue,
    takeModerationAction,
    moderationQueue,
    isLoading,
    error,
    clearError,
  } = useModeration();

  const [selectedItem, setSelectedItem] = useState<ModerationQueue | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionReason, setActionReason] = useState('');
  const [actionSeverity, setActionSeverity] = useState<string>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadModerationQueue();
  }, []);

  const loadModerationQueue = async () => {
    try {
      await getModerationQueue();
    } catch (error) {
      console.error('Error loading moderation queue:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadModerationQueue();
    setRefreshing(false);
  };

  const handleItemPress = (item: ModerationQueue) => {
    setSelectedItem(item);
    setActionModalVisible(true);
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
  };

  const handleTakeAction = async () => {
    if (!selectedItem || !selectedAction || !actionReason) {
      Alert.alert('Error', 'Please select an action and provide a reason');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to take moderation actions');
      return;
    }

    try {
      setIsProcessing(true);

      const action: Omit<ModerationAction, 'id' | 'created_at'> = {
        moderator_id: user.id,
        content_id: selectedItem.content_id,
        content_type: selectedItem.content_type,
        action_type: selectedAction as any,
        reason: actionReason,
        severity: actionSeverity as any,
      };

      const result = await takeModerationAction(action);

      if (result) {
        Alert.alert(
          'Action Taken',
          'Moderation action has been applied successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setActionModalVisible(false);
                setSelectedItem(null);
                setSelectedAction('');
                setActionReason('');
                loadModerationQueue();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error taking moderation action:', error);
      Alert.alert('Error', 'Failed to take moderation action. Please try again.');
    } finally {
      setIsProcessing(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF8800';
      case 'in_review': return '#007AFF';
      case 'resolved': return '#00BB00';
      default: return '#666666';
    }
  };

  const getFilteredQueue = () => {
    if (filter === 'all') return moderationQueue;
    return moderationQueue.filter(item => item.status === filter);
  };

  const renderQueueItem = ({ item }: { item: ModerationQueue }) => (
    <TouchableOpacity
      style={styles.queueItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.contentType}>{item.content_type.toUpperCase()}</Text>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColor(item.priority) },
        ]}>
          <Text style={styles.priorityText}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.contentId}>Content ID: {item.content_id}</Text>
      <Text style={styles.userId}>User ID: {item.user_id}</Text>

      <View style={styles.itemFooter}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}>
          <Text style={styles.statusText}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.autoScore}>
          Auto Score: {(item.auto_score * 100).toFixed(0)}%
        </Text>
      </View>

      {item.manual_review_required && (
        <View style={styles.manualReviewBadge}>
          <Text style={styles.manualReviewText}>MANUAL REVIEW REQUIRED</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderActionModal = () => (
    <Modal
      visible={actionModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setActionModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Take Moderation Action</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedItem && (
            <View style={styles.itemDetails}>
              <Text style={styles.detailTitle}>Content Details</Text>
              <Text style={styles.detailText}>Type: {selectedItem.content_type}</Text>
              <Text style={styles.detailText}>ID: {selectedItem.content_id}</Text>
              <Text style={styles.detailText}>User: {selectedItem.user_id}</Text>
              <Text style={styles.detailText}>Priority: {selectedItem.priority}</Text>
              <Text style={styles.detailText}>Auto Score: {(selectedItem.auto_score * 100).toFixed(0)}%</Text>
            </View>
          )}

          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Select Action</Text>
            <View style={styles.actionButtons}>
              {['approve', 'flag', 'remove', 'warn', 'suspend', 'ban'].map((action) => (
                <TouchableOpacity
                  key={action}
                  style={[
                    styles.actionButton,
                    selectedAction === action && styles.selectedActionButton,
                  ]}
                  onPress={() => handleActionSelect(action)}
                >
                  <Text style={[
                    styles.actionButtonText,
                    selectedAction === action && styles.selectedActionButtonText,
                  ]}>
                    {action.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.reasonSection}>
            <Text style={styles.sectionTitle}>Reason *</Text>
            <TextInput
              style={styles.reasonInput}
              value={actionReason}
              onChangeText={setActionReason}
              placeholder="Enter reason for this action..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.severitySection}>
            <Text style={styles.sectionTitle}>Severity</Text>
            <View style={styles.severityButtons}>
              {['low', 'medium', 'high', 'critical'].map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.severityButton,
                    actionSeverity === severity && styles.selectedSeverityButton,
                  ]}
                  onPress={() => setActionSeverity(severity)}
                >
                  <Text style={[
                    styles.severityButtonText,
                    actionSeverity === severity && styles.selectedSeverityButtonText,
                  ]}>
                    {severity.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isProcessing && styles.submitButtonDisabled,
            ]}
            onPress={handleTakeAction}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Take Action</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading moderation queue...</Text>
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
        <Text style={styles.title}>Moderation Queue</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'in_review', 'resolved'].map((filterOption) => (
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
        data={getFilteredQueue()}
        renderItem={renderQueueItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {renderActionModal()}
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
  queueItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  contentId: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  autoScore: {
    fontSize: 12,
    color: '#666666',
  },
  manualReviewBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  manualReviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  itemDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  actionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedActionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  selectedActionButtonText: {
    color: '#ffffff',
  },
  reasonSection: {
    marginBottom: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    minHeight: 80,
  },
  severitySection: {
    marginBottom: 20,
  },
  severityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedSeverityButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  selectedSeverityButtonText: {
    color: '#ffffff',
  },
  modalFooter: {
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
