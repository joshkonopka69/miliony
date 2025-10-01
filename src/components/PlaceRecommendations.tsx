import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Place, placesApiService } from '../services/placesApi';

interface PlaceRecommendationsProps {
  currentLocation: { lat: number; lng: number };
  onPlaceSelect: (place: Place) => void;
}

interface RecommendationCategory {
  title: string;
  icon: string;
  places: Place[];
  loading: boolean;
}

export default function PlaceRecommendations({
  currentLocation,
  onPlaceSelect,
}: PlaceRecommendationsProps) {
  const [categories, setCategories] = useState<RecommendationCategory[]>([
    {
      title: 'Nearby Gyms',
      icon: '💪',
      places: [],
      loading: true,
    },
    {
      title: 'Parks & Outdoor',
      icon: '🌳',
      places: [],
      loading: true,
    },
    {
      title: 'Sports Complexes',
      icon: '🏟️',
      places: [],
      loading: true,
    },
    {
      title: 'Swimming Pools',
      icon: '🏊',
      places: [],
      loading: true,
    },
  ]);

  useEffect(() => {
    loadRecommendations();
  }, [currentLocation]);

  const loadRecommendations = async () => {
    const updatedCategories = await Promise.all(
      categories.map(async (category) => {
        try {
          let types: string[] = [];
          switch (category.title) {
            case 'Nearby Gyms':
              types = ['gym'];
              break;
            case 'Parks & Outdoor':
              types = ['park', 'tourist_attraction'];
              break;
            case 'Sports Complexes':
              types = ['sports_complex', 'stadium'];
              break;
            case 'Swimming Pools':
              types = ['swimming_pool'];
              break;
          }

          const places = await placesApiService.searchNearby(currentLocation, {
            types,
            keywords: [],
            radius: 5000,
          });

          return {
            ...category,
            places: places.slice(0, 3),
            loading: false,
          };
        } catch (error) {
          console.error(`Error loading ${category.title}:`, error);
          return {
            ...category,
            places: [],
            loading: false,
          };
        }
      })
    );

    setCategories(updatedCategories);
  };

  const renderPlaceCard = (place: Place) => (
    <TouchableOpacity
      key={place.placeId}
      style={styles.placeCard}
      onPress={() => onPlaceSelect(place)}
    >
      {place.photos && place.photos.length > 0 && (
        <Image
          source={{ uri: place.photos[0] }}
          style={styles.placeImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.placeAddress} numberOfLines={1}>
          {place.address}
        </Text>
        <View style={styles.placeRating}>
          {place.rating && (
            <Text style={styles.ratingText}>⭐ {place.rating}</Text>
          )}
          {place.priceLevel && (
            <Text style={styles.priceText}>
              {'💰'.repeat(place.priceLevel)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category: RecommendationCategory) => (
    <View key={category.title} style={styles.category}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      
      {category.loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : category.places.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.placesScroll}
        >
          {category.places.map(renderPlaceCard)}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No places found</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Places</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map(renderCategory)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  placesScroll: {
    flexDirection: 'row',
  },
  placeCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  placeImage: {
    width: '100%',
    height: 120,
  },
  placeInfo: {
    padding: 12,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  placeRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#f59e0b',
  },
  priceText: {
    fontSize: 12,
    color: '#10b981',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});


