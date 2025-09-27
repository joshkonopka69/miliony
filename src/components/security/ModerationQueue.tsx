import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useModeration } from '../../hooks/useModeration';
import { ModerationQueue } from '../../services/moderationService';

interface ModerationQueueProps {
  onItemPress?: (item: ModerationQueue) => void;
  onTakeAction?: (item: ModerationQueue, action: string) => void;
  filter?: string;
  showActions?: boolean;
  maxItems?: number;
}

export default function ModerationQueueComponent({
  onItemPress,
  onTakeAction,
  filter = 'all',
  showActions = true,
  maxItems,
}: ModerationQueueProps) {
  const {
    getModerationQueue,
    moderationQueue,
    isLoading,
    error,
    clearError,
  } = useModeration();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationQueue | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      await getModerationQueue();
    } catch (error) {
      console.error('Error loading moderation queue:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const handleItemPress = (item: ModerationQueue) => {
    setSelectedItem(item);
    onItemPress?.(item);
  };

  const handleTakeAction = (item: ModerationQueue, action: string) => {
    Alert.alert(
      'Take Action',
      `Are you sure you want to ${action} this item?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            onTakeAction?.(item, action);
            setSelectedItem(null);
          },
        },
      ]
    );
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
    let filtered = moderationQueue;
    
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }
    
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }
    
    return filtered;
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

      {showActions && selectedItem?.id === item.id && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleTakeAction(item, 'approve')}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flagButton}
            onPress={() => handleTakeAction(item, 'flag')}
          >
            <Text style={styles.flagButtonText}>Flag</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleTakeAction(item, 'remove')}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No items in moderation queue</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Moderation Queue</Text>
      <Text style={styles.headerSubtitle}>
        {getFilteredQueue().length} items
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading moderation queue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
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
        ListEmptyComponent={renderEmptyState}
      />
    </View>
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
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
    padding: 16,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  approveButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#00BB00',
    marginRight: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  flagButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF8800',
    marginRight: 8,
    alignItems: 'center',
  },
  flagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    alignItems: 'center',
  },
  removeButtonText: {
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
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
