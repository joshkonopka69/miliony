import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlaceDetailsMap } from '../components';

export default function MyPlaceDetailsScreen() {
  return (
    <View style={styles.container}>
      <PlaceDetailsMap
        placeId="ChIJN1t_tDeuEmsRUsoyG83frY4"
        apiKey={process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || ''}
        onPlaceDetailsLoaded={(place) => console.log(place)}
        onError={(error) => console.error(error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});