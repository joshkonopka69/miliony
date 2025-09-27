import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TableColumn {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AnalyticsTableProps {
  data: any[];
  columns: TableColumn[];
  title?: string;
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowPress?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  style?: any;
}

export function AnalyticsTable({
  data,
  columns,
  title,
  searchable = false,
  sortable = true,
  pagination = true,
  pageSize = 10,
  onRowPress,
  loading = false,
  emptyMessage = 'No data available',
  style,
}: AnalyticsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFullTable, setShowFullTable] = useState(false);

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    return columns.some(column => {
      const value = row[column.key];
      return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? sortedData.slice(startIndex, endIndex) : sortedData;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.headerActions}>
          {searchable && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#666666" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor="#999999"
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.fullTableButton}
            onPress={() => setShowFullTable(true)}
          >
            <Ionicons name="expand" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTableHeader = () => {
    return (
      <View style={styles.tableHeader}>
        {columns.map((column, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tableHeaderCell,
              { width: column.width ? `${column.width}%` : `${100 / columns.length}%` },
            ]}
            onPress={() => handleSort(column.key)}
            disabled={!sortable || !column.sortable}
          >
            <Text style={styles.tableHeaderText}>{column.title}</Text>
            {sortable && column.sortable && sortColumn === column.key && (
              <Ionicons
                name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#2196F3"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTableRow = (row: any, rowIndex: number) => {
    return (
      <TouchableOpacity
        key={rowIndex}
        style={[
          styles.tableRow,
          rowIndex % 2 === 0 && styles.tableRowEven,
          onRowPress && styles.tableRowPressable,
        ]}
        onPress={() => onRowPress?.(row)}
        disabled={!onRowPress}
      >
        {columns.map((column, columnIndex) => (
          <View
            key={columnIndex}
            style={[
              styles.tableCell,
              { width: column.width ? `${column.width}%` : `${100 / columns.length}%` },
              column.align === 'center' && styles.tableCellCenter,
              column.align === 'right' && styles.tableCellRight,
            ]}
          >
            {column.render ? (
              column.render(row[column.key], row)
            ) : (
              <Text style={styles.tableCellText}>
                {row[column.key]?.toString() || '-'}
              </Text>
            )}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? '#cccccc' : '#666666'} />
        </TouchableOpacity>

        {pageNumbers.map(page => (
          <TouchableOpacity
            key={page}
            style={[
              styles.paginationButton,
              currentPage === page && styles.paginationButtonActive,
            ]}
            onPress={() => handlePageChange(page)}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === page && styles.paginationButtonTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? '#cccccc' : '#666666'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFullTableModal = () => {
    return (
      <Modal
        visible={showFullTable}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFullTable(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title || 'Full Table'}</Text>
            <TouchableOpacity onPress={() => setShowFullTable(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.fullTable}>
              {renderTableHeader()}
              {sortedData.map((row, index) => renderTableRow(row, index))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderLoadingState = () => {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={48} color="#cccccc" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        {renderHeader()}
        {renderLoadingState()}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      
      <View style={styles.tableContainer}>
        {renderTableHeader()}
        {paginatedData.map((row, index) => renderTableRow(row, index))}
      </View>
      
      {renderPagination()}
      {renderFullTableModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  searchInput: {
    fontSize: 14,
    color: '#333333',
    minWidth: 120,
  },
  fullTableButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  tableContainer: {
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    gap: 6,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  tableRowPressable: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    justifyContent: 'center',
  },
  tableCellCenter: {
    alignItems: 'center',
  },
  tableCellRight: {
    alignItems: 'flex-end',
  },
  tableCellText: {
    fontSize: 14,
    color: '#333333',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    minWidth: 32,
    alignItems: 'center',
  },
  paginationButtonActive: {
    backgroundColor: '#2196F3',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  paginationButtonTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
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
  },
  fullTable: {
    minWidth: 600,
  },
});
