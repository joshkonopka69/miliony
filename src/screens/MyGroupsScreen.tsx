 import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../navigation';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  isAdmin: boolean;
  avatar?: string;
}

export default function MyGroupsScreen() {
  const navigation = useAppNavigation();
  
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Basketball Crew',
      memberCount: 12,
      isAdmin: true,
    },
    {
      id: '2',
      name: 'Soccer Squad',
      memberCount: 8,
      isAdmin: true,
    },
    {
      id: '3',
      name: 'Volleyball Team',
      memberCount: 15,
      isAdmin: true,
    },
  ]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditGroup = (group: Group) => {
    Alert.alert('Edit Group', `Edit "${group.name}"`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit', onPress: () => console.log('Edit group:', group.id) }
    ]);
  };

  const handleDeleteGroup = (group: Group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setGroups(prev => prev.filter(g => g.id !== group.id));
            Alert.alert('Success', `"${group.name}" has been deleted`);
          }
        }
      ]
    );
  };

  const renderGroupItem = (group: Group) => (
    <View key={group.id} style={styles.groupItem}>
      <View style={styles.groupAvatar}>
        <Text style={styles.groupAvatarText}>
          {group.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.memberCount}>{group.memberCount} members</Text>
      </View>
      <View style={styles.groupActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditGroup(group)}
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteGroup(group)}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Groups</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {groups.map(renderGroupItem)}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🎮</Text>
          <Text style={styles.navLabel}>My Games</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>👥</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F0', // bg-[var(--secondary-color)]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#181611', // text-[var(--text-primary)]
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181611', // text-[var(--text-primary)]
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16, // rounded-2xl
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 16,
  },
  groupAvatar: {
    width: 64,
    height: 64,
    borderRadius: 12, // rounded-xl
    backgroundColor: '#f9bc06', // bg-[var(--primary-color)]
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181611',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600', // font-semibold
    color: '#181611', // text-[var(--text-primary)]
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#8c805f', // text-[var(--text-secondary)]
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 18,
    color: '#8c805f', // text-[var(--text-secondary)]
  },
  bottomNav: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  navIcon: {
    fontSize: 20,
    color: '#8c805f', // text-[var(--text-secondary)]
  },
  navIconActive: {
    color: '#f9bc06', // text-[var(--primary-color)]
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500', // font-medium
    color: '#8c805f', // text-[var(--text-secondary)]
  },
  navLabelActive: {
    fontWeight: 'bold',
    color: '#f9bc06', // text-[var(--primary-color)]
  },
});