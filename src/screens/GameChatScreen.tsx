import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameChatScreenProps } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService, EventMessage } from '../services/supabase';

export default function GameChatScreen({ navigation, route }: GameChatScreenProps) {
  const { game } = route.params || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    senderName: string;
    senderId: string;
    senderAvatar?: string;
    timestamp: Date;
    isMine: boolean;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load existing messages and subscribe to new ones
  useEffect(() => {
    if (!game?.id || !user?.id) {
      return;
    }

    let subscription: ReturnType<typeof supabaseService.subscribeToEventMessages> | null = null;

    const loadMessagesAndSubscribe = async () => {
      console.log('💬 GameChatScreen: loading messages for event:', game.id);

      // Load last messages from backend
      const existing = await supabaseService.getEventMessages(game.id, 50);
      const mapped = (existing || []).map((m: any) => {
        const senderId = m.sender_id || m.user_id || null;
        const text = m.message_text || m.message || '';

        const isMine = senderId
          ? senderId === user.id
          // Fallback: if no sender stored (old messages), treat as mine for this user
          : true;

        const senderName =
          isMine
            ? (user.email || 'You')
            : (m.sender?.display_name || 'Unknown');

        return {
          id: m.id,
          text,
          senderName,
          senderId: senderId || user.id,
          senderAvatar: m.sender?.avatar_url,
          timestamp: new Date(m.created_at),
          isMine,
        };
      });

      // Show newest at bottom
      setMessages(mapped.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
      console.log('💬 GameChatScreen: messages after initial load:', mapped.length);

      // Subscribe to new messages
      subscription = supabaseService.subscribeToEventMessages(game.id, (msg: EventMessage) => {
        console.log('💬 GameChatScreen: realtime message received:', msg);
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev;

          const senderId = (msg as any).sender_id || (msg as any).user_id || null;
          const text = (msg as any).message_text || (msg as any).message || '';

          const isMine = senderId
            ? senderId === user.id
            : true;

          const senderName =
            isMine
              ? (user.email || 'You')
              : 'Unknown';

          const next = [
            ...prev,
            {
              id: msg.id,
              text,
              senderName: msg.sender?.display_name || 'Unknown',
              senderId: senderId || user.id,
              senderAvatar: msg.sender?.avatar_url,
              timestamp: new Date(msg.created_at),
              isMine,
            },
          ];
          return next.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
      });
    };

    loadMessagesAndSubscribe();

    return () => {
      if (subscription) {
        supabaseService.removeChannel(subscription);
      }
    };
  }, [game?.id, user?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !game?.id || !user?.id || isSending) {
      return;
    }

    try {
      setIsSending(true);
      const sent = await supabaseService.sendEventMessage(game.id, user.id, newMessage.trim());
      if (!sent) {
        Alert.alert('Error', 'Failed to send message');
        return;
      }

      // Optimistically add the message; subscription will also deliver it
      setMessages(prev => {
        if (prev.some(m => m.id === sent.id)) return prev;
        const senderId = (sent as any).sender_id || (sent as any).user_id || user.id;
        const text = (sent as any).message_text || (sent as any).message || newMessage.trim();
        const next = [
          ...prev,
          {
            id: sent.id,
            text,
            senderName: user.email || 'You',
            senderId,
            senderAvatar: (user as any).avatar_url,
            timestamp: new Date(sent.created_at),
            isMine: true,
          },
        ];
        return next.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending event message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - matching ProfileScreen design */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>{game?.name || 'Game Chat'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Messages Container */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.isMine ? styles.myMessageWrapper : styles.otherMessageWrapper,
            ]}
          >
            {!message.isMine && (
              <View style={styles.avatarContainer}>
                {message.senderAvatar ? (
                  <Image source={{ uri: message.senderAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitials}>
                      {message.senderName.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={[
              styles.messageContent,
              message.isMine ? styles.myMessageContent : styles.otherMessageContent
            ]}>
              {!message.isMine && (
                <Text style={styles.senderNickname}>{message.senderName}</Text>
              )}
              {message.isMine && (
                <Text style={[styles.senderNickname, styles.myNickname]}>You</Text>
              )}

              <View
                style={[
                  styles.messageBubble,
                  message.isMine ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isMine && styles.myMessageText
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.isMine && styles.myMessageTime
                  ]}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {message.isMine && (
              <View style={styles.avatarContainer}>
                {message.senderAvatar ? (
                  <Image source={{ uri: message.senderAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitials}>
                      {message.senderName.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input Container */}
      <SafeAreaView style={styles.inputSafeArea}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? '#000000' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header Styles - matching ProfileScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Messages Styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: '#FFD700',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  myMessageTime: {
    color: '#000000',
    opacity: 0.6,
  },
  // New Styles
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    gap: 8,
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '75%',
  },
  myMessageContent: {
    alignItems: 'flex-end',
  },
  otherMessageContent: {
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  senderNickname: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 4,
  },
  myNickname: {
    marginRight: 4,
    marginLeft: 0,
  },
  // Input Styles
  inputSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000000',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
});
