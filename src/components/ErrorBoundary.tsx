import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  variant?: 'network' | 'server' | 'permission' | 'general';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  variant = 'general',
}) => {
  const getErrorIcon = () => {
    switch (variant) {
      case 'network': return 'wifi-outline';
      case 'server': return 'server-outline';
      case 'permission': return 'lock-closed-outline';
      default: return 'alert-circle-outline';
    }
  };

  const getErrorColor = () => {
    switch (variant) {
      case 'network': return '#F59E0B';
      case 'server': return '#EF4444';
      case 'permission': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getErrorMessage = () => {
    switch (variant) {
      case 'network': return 'Check your internet connection and try again.';
      case 'server': return 'Our servers are having issues. Please try again later.';
      case 'permission': return 'Permission denied. Please check your settings.';
      default: return error;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getErrorColor() }]}>
        <Ionicons name={getErrorIcon() as any} size={32} color="#FFFFFF" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{getErrorMessage()}</Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Network error component
export const NetworkError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorDisplay
    error=""
    onRetry={onRetry}
    title="No Internet Connection"
    variant="network"
  />
);

// Server error component
export const ServerError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorDisplay
    error=""
    onRetry={onRetry}
    title="Server Error"
    variant="server"
  />
);

// Permission error component
export const PermissionError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorDisplay
    error=""
    onRetry={onRetry}
    title="Permission Required"
    variant="permission"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    margin: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FDB924',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});