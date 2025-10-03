import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { BackendTestComponent } from '../components';

const BackendTestScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <BackendTestComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default BackendTestScreen;



