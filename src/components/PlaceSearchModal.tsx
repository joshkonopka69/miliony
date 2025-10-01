import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { Place, placesApiService } from '../services/placesApi';

interface PlaceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onPlaceSelect: (place: Place) => void;
  currentLocation: { lat: number; lng: number };
}

export default function PlaceSearchModal({
  visible,
  onClose,
  onPlaceSelect,
  currentLocation,
}: PlaceSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularPlaces, setPopularPlaces] = useState<Place[]>([]);

  useEffect(() => {
    if (visible) {
      loadPopularPlaces();
      loadRecentSearches();
    }
  }, [visible]);

  const loadPopularPlaces = async () => {
    try {
      // Load popular places near current location
      const places = await placesApiService.searchNearby(currentLocation, {
        types: ['gym', 'park', 'stadium', 'sports_complex'],
        keywords: [],
        radius: 10000,
      });
      setPopularPlaces(places.slice(0, 6));
    } catch (error) {
      console.error('Error loading popular places:', error);
    }
  };

  const loadRecentSearches = () => {
    // Load from local storage
    const recent = ['Gym', 'Park', 'Stadium', 'Swimming Pool'];
    setRecentSearches(recent);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await placesApiService.searchNearby(currentLocation, {
        types: [],
        keywords: [query],
        radius: 10000,
      });
      setSearchResults(results);
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    onPlaceSelect(place);
    onClose();
  };

  const renderPlaceItem = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress}>{item.address}</Text>
        {item.rating && (
          <Text style={styles.placeRating}>⭐ {item.rating}/5</Text>
        )}
      </View>
      {item.photos && item.photos.length > 0 && (
        <Image
          source={{ uri: item.photos[0] }}
          style={styles.placeImage}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );

  const renderRecentSearch = (search: string) => (
    <TouchableOpacity
      key={search}
      style={styles.recentSearchItem}
      onPress={() => {
        setSearchQuery(search);
        handleSearch(search);
      }}
    >
      <Text style={styles.recentSearchText}>🔍 {search}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Places</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => handleSearch(searchQuery)}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {searchQuery.length === 0 ? (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <View style={styles.recentSearches}>
                    {recentSearches.map(renderRecentSearch)}
                  </View>
                </View>
              )}

              {/* Popular Places */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Places</Text>
                <FlatList
                  data={popularPlaces}
                  renderItem={renderPlaceItem}
                  keyExtractor={(item) => item.placeId}
                  scrollEnabled={false}
                />
              </View>
            </>
          ) : (
            /* Search Results */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {loading ? 'Searching...' : `Results (${searchResults.length})`}
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderPlaceItem}
                keyExtractor={(item) => item.placeId}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  recentSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentSearchItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#374151',
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  placeRating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  placeImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 12,
  },
});


