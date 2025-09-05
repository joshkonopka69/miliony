import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatScreenProps {
  navigation: any;
}

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'Jan Kowalski',
    lastMessage: 'Cześć! Gramy w piłkę jutro?',
    time: '14:30',
    unread: 2,
    avatar: '⚽',
  },
  {
    id: '2',
    name: 'Anna Nowak',
    lastMessage: 'Świetny trening dzisiaj!',
    time: '12:15',
    unread: 0,
    avatar: '🏃‍♀️',
  },
  {
    id: '3',
    name: 'Piotr Wiśniewski',
    lastMessage: 'Kiedy następny mecz?',
    time: 'Wczoraj',
    unread: 1,
    avatar: '🏀',
  },
  {
    id: '4',
    name: 'Maria Zielińska',
    lastMessage: 'Dzięki za dzisiejszy trening!',
    time: '2 dni temu',
    unread: 0,
    avatar: '🎾',
  },
];

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}</Text>
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Wyszukaj wiadomości..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* New Message Button */}
      <TouchableOpacity style={styles.newMessageButton}>
        <Text style={styles.newMessageButtonText}>✉️ Nowa wiadomość</Text>
      </TouchableOpacity>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.chatList}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
  },
  newMessageButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  newMessageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

