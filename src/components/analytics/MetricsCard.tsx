import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'stable';
  trend?: 'up' | 'down' | 'stable';
  onPress?: () => void;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  loading?: boolean;
}

export function MetricsCard({
  title,
  value,
  change = 0,
  changeType = 'stable',
  trend = 'stable',
  onPress,
  color = '#2196F3',
  icon,
  subtitle,
  loading = false,
}: MetricsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return '#4CAF50';
      case 'decrease':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getChangeText = () => {
    if (change === 0) return 'No change';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon} />
          <View style={styles.loadingText} />
          <View style={styles.loadingSubtext} />
        </View>
      </View>
    );
  }

  const CardContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>
          {formatValue(value)}
        </Text>
        
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        
        {change !== 0 && (
          <View style={styles.changeContainer}>
            <Ionicons
              name={getTrendIcon()}
              size={14}
              color={getChangeColor()}
            />
            <Text style={[styles.changeText, { color: getChangeColor() }]}>
              {getChangeText()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 120,
  },
  touchable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  loadingText: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingSubtext: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '60%',
  },
});
