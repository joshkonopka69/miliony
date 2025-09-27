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
import { UserModerationStatus } from '../../services/moderationService';

interface BlockedUsersScreenProps {
  navigation: any;
}

export default function BlockedUsersScreen({ navigation }: BlockedUsersScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    getUserModerationStatus,
    blockUser,
    unblockUser,
    userModerationStatus,
    isLoading,
    error,
    clearError,
  } = useModeration();

  const [blockedUsers, setBlockedUsers] = useState<UserModerationStatus[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserModerationStatus | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      // In a real implementation, you would fetch all blocked users
      // For now, we'll simulate with the current user's status
      if (userModerationStatus && userModerationStatus.status !== 'active') {
        setBlockedUsers([userModerationStatus]);
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBlockedUsers();
    setRefreshing(false);
  };

  const handleUserPress = (user: UserModerationStatus) => {
    setSelectedUser(user);
    setActionModalVisible(true);
  };

  const handleActionSelect = (action: string) => {
    setActionType(action);
  };

  const handleTakeAction = async () => {
    if (!selectedUser || !actionType || !actionReason) {
      Alert.alert('Error', 'Please select an action and provide a reason');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to take moderation actions');
      return;
    }

    try {
      setIsProcessing(true);

      let success = false;

      if (actionType === 'unblock') {
        success = await unblockUser(selectedUser.user_id, actionReason);
      } else if (actionType === 'block') {
        const duration = actionDuration ? parseInt(actionDuration) : undefined;
        success = await blockUser(selectedUser.user_id, actionReason, duration);
      }

      if (success) {
        Alert.alert(
          'Action Taken',
          `User ${actionType} action has been applied successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setActionModalVisible(false);
                setSelectedUser(null);
                setActionType('');
                setActionReason('');
                setActionDuration('');
                loadBlockedUsers();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'banned': return '#FF4444';
      case 'suspended': return '#FF8800';
      case 'warned': return '#FFBB00';
      case 'restricted': return '#FFBB00';
      case 'active': return '#00BB00';
      default: return '#666666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'banned': return '🚫';
      case 'suspended': return '⏸️';
      case 'warned': return '⚠️';
      case 'restricted': return '🔒';
      case 'active': return '✅';
      default: return '❓';
    }
  };

  const getFilteredUsers = () => {
    if (filter === 'all') return blockedUsers;
    return blockedUsers.filter(user => user.status === filter);
  };

  const renderUserItem = ({ item }: { item: UserModerationStatus }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userHeader}>
        <Text style={styles.userId}>User ID: {item.user_id}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}>
          <Text style={styles.statusText}>
            {getStatusIcon(item.status)} {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Warnings:</Text>
          <Text style={styles.detailValue}>{item.warnings}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Violations:</Text>
          <Text style={styles.detailValue}>{item.violations}</Text>
        </View>
        {item.last_violation && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Violation:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.last_violation).toLocaleDateString()}
            </Text>
          </View>
        )}
        {item.restrictions.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restrictions:</Text>
            <Text style={styles.detailValue}>{item.restrictions.join(', ')}</Text>
          </View>
        )}
        {item.appeal_status && item.appeal_status !== 'none' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Appeal Status:</Text>
            <Text style={[
              styles.detailValue,
              { color: item.appeal_status === 'approved' ? '#00BB00' : '#FF8800' }
            ]}>
              {item.appeal_status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
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
          <Text style={styles.modalTitle}>User Action</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedUser && (
            <View style={styles.userDetails}>
              <Text style={styles.detailTitle}>User Details</Text>
              <Text style={styles.detailText}>User ID: {selectedUser.user_id}</Text>
              <Text style={styles.detailText}>Status: {selectedUser.status}</Text>
              <Text style={styles.detailText}>Warnings: {selectedUser.warnings}</Text>
              <Text style={styles.detailText}>Violations: {selectedUser.violations}</Text>
            </View>
          )}

          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Select Action</Text>
            <View style={styles.actionButtons}>
              {['unblock', 'block', 'warn', 'suspend', 'ban'].map((action) => (
                <TouchableOpacity
                  key={action}
                  style={[
                    styles.actionButton,
                    actionType === action && styles.selectedActionButton,
                  ]}
                  onPress={() => handleActionSelect(action)}
                >
                  <Text style={[
                    styles.actionButtonText,
                    actionType === action && styles.selectedActionButtonText,
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

          {(actionType === 'block' || actionType === 'suspend') && (
            <View style={styles.durationSection}>
              <Text style={styles.sectionTitle}>Duration (hours)</Text>
              <TextInput
                style={styles.durationInput}
                value={actionDuration}
                onChangeText={setActionDuration}
                placeholder="Enter duration in hours (optional)"
                keyboardType="numeric"
              />
            </View>
          )}
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
          <Text style={styles.loadingText}>Loading blocked users...</Text>
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
        <Text style={styles.title}>Blocked Users</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'banned', 'suspended', 'warned', 'restricted'].map((filterOption) => (
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
        data={getFilteredUsers()}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.user_id}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blocked users found</Text>
          </View>
        }
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
  userItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userId: {
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
  userDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
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
  userDetails: {
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
  durationSection: {
    marginBottom: 20,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
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
