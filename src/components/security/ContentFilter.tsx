import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useModeration } from '../../hooks/useModeration';
import { ContentFilter, FilterResult } from '../../utils/contentFilters';

interface ContentFilterProps {
  content: {
    id: string;
    type: string;
    user_id: string;
    text?: string;
    images?: string[];
    metadata?: any;
  };
  onFilterResult: (result: FilterResult) => void;
  onContentBlocked?: (contentId: string, reason: string) => void;
  onContentFlagged?: (contentId: string, reasons: string[]) => void;
}

export default function ContentFilterComponent({
  content,
  onFilterResult,
  onContentBlocked,
  onContentFlagged,
}: ContentFilterProps) {
  const { moderateContent } = useModeration();
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);
  const [customFilters, setCustomFilters] = useState<ContentFilter[]>([]);
  const [filterEnabled, setFilterEnabled] = useState(true);

  useEffect(() => {
    if (content && filterEnabled) {
      filterContent();
    }
  }, [content, filterEnabled]);

  const filterContent = async () => {
    try {
      setIsFiltering(true);

      // Auto-moderate content
      const moderationResult = await moderateContent(content);
      
      if (moderationResult) {
        const result: FilterResult = {
          passed: moderationResult.status === 'approved',
          blocked: moderationResult.status === 'rejected',
          flagged: moderationResult.status === 'flagged',
          score: moderationResult.auto_moderation_score,
          reasons: moderationResult.flagged_reasons || [],
          suggestions: getSuggestions(moderationResult.flagged_reasons || []),
        };

        setFilterResult(result);
        onFilterResult(result);

        // Handle blocked content
        if (result.blocked) {
          onContentBlocked?.(content.id, result.reasons.join(', '));
        }

        // Handle flagged content
        if (result.flagged) {
          onContentFlagged?.(content.id, result.reasons);
        }
      }
    } catch (error) {
      console.error('Error filtering content:', error);
      Alert.alert('Error', 'Failed to filter content. Please try again.');
    } finally {
      setIsFiltering(false);
    }
  };

  const getSuggestions = (reasons: string[]): string[] => {
    const suggestions: string[] = [];
    
    if (reasons.includes('spam')) {
      suggestions.push('Remove promotional language');
    }
    if (reasons.includes('harassment')) {
      suggestions.push('Use respectful language');
    }
    if (reasons.includes('inappropriate')) {
      suggestions.push('Review content for appropriateness');
    }
    if (reasons.includes('fake')) {
      suggestions.push('Verify information accuracy');
    }
    
    return suggestions;
  };

  const handleManualReview = () => {
    Alert.alert(
      'Manual Review Required',
      'This content has been flagged for manual review. Please review the content and take appropriate action.',
      [
        {
          text: 'Approve',
          onPress: () => {
            const result: FilterResult = {
              passed: true,
              blocked: false,
              flagged: false,
              score: 0,
              reasons: [],
              suggestions: [],
            };
            setFilterResult(result);
            onFilterResult(result);
          },
        },
        {
          text: 'Block',
          onPress: () => {
            const result: FilterResult = {
              passed: false,
              blocked: true,
              flagged: false,
              score: 1,
              reasons: ['Manual review - blocked'],
              suggestions: [],
            };
            setFilterResult(result);
            onFilterResult(result);
            onContentBlocked?.(content.id, 'Manual review - blocked');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderFilterResult = () => {
    if (!filterResult) return null;

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Filter Result</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(filterResult) },
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(filterResult)}
            </Text>
          </View>
        </View>

        <View style={styles.resultDetails}>
          <Text style={styles.scoreText}>
            Score: {(filterResult.score * 100).toFixed(0)}%
          </Text>
          
          {filterResult.reasons.length > 0 && (
            <View style={styles.reasonsContainer}>
              <Text style={styles.reasonsTitle}>Issues Found:</Text>
              {filterResult.reasons.map((reason, index) => (
                <Text key={index} style={styles.reasonText}>
                  • {reason}
                </Text>
              ))}
            </View>
          )}

          {filterResult.suggestions && filterResult.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {filterResult.suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestionText}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}
        </View>

        {filterResult.flagged && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => {
                const result: FilterResult = {
                  passed: true,
                  blocked: false,
                  flagged: false,
                  score: 0,
                  reasons: [],
                  suggestions: [],
                };
                setFilterResult(result);
                onFilterResult(result);
              }}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blockButton}
              onPress={() => {
                const result: FilterResult = {
                  passed: false,
                  blocked: true,
                  flagged: false,
                  score: 1,
                  reasons: ['Manual review - blocked'],
                  suggestions: [],
                };
                setFilterResult(result);
                onFilterResult(result);
                onContentBlocked?.(content.id, 'Manual review - blocked');
              }}
            >
              <Text style={styles.blockButtonText}>Block</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleManualReview}
            >
              <Text style={styles.reviewButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const getStatusColor = (result: FilterResult) => {
    if (result.blocked) return '#FF4444';
    if (result.flagged) return '#FF8800';
    if (result.passed) return '#00BB00';
    return '#666666';
  };

  const getStatusText = (result: FilterResult) => {
    if (result.blocked) return 'BLOCKED';
    if (result.flagged) return 'FLAGGED';
    if (result.passed) return 'APPROVED';
    return 'PENDING';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Filter</Text>
        <View style={styles.headerControls}>
          <Text style={styles.filterLabel}>Filter:</Text>
          <Switch
            value={filterEnabled}
            onValueChange={setFilterEnabled}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            thumbColor={filterEnabled ? '#ffffff' : '#ffffff'}
          />
        </View>
      </View>

      <View style={styles.contentInfo}>
        <Text style={styles.contentType}>Type: {content.type}</Text>
        <Text style={styles.contentId}>ID: {content.id}</Text>
        <Text style={styles.userId}>User: {content.user_id}</Text>
      </View>

      {content.text && (
        <View style={styles.textPreview}>
          <Text style={styles.previewTitle}>Text Content:</Text>
          <Text style={styles.previewText}>{content.text}</Text>
        </View>
      )}

      {content.images && content.images.length > 0 && (
        <View style={styles.imagePreview}>
          <Text style={styles.previewTitle}>Images ({content.images.length}):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {content.images.map((image, index) => (
              <View key={index} style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>📷</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {isFiltering && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Filtering content...</Text>
        </View>
      )}

      {renderFilterResult()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  contentInfo: {
    marginBottom: 12,
  },
  contentType: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  contentId: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666666',
  },
  textPreview: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
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
  resultDetails: {
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  reasonsContainer: {
    marginBottom: 8,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#FF4444',
    marginBottom: 2,
  },
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  blockButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    marginRight: 8,
    alignItems: 'center',
  },
  blockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FF8800',
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
