import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { BottomNavBar } from '../components';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
  avatar: string;
}

// Mock messages matching the design
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey everyone! I\'m here. See you on the court!',
    sender: 'You',
    senderId: 'currentUser',
    timestamp: '3:45 PM',
    isOwn: true,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJbXPTvs7vZfVZxjUI49GIO8KVbeVEFFTD1ImnQy_B-g--Hmx1u2ggYIblPQgalPSUjbBYCtD8uB0lrNu77ng3HRgiTIdXvS6_p8zdrWmq0jpjgA2nrYtSrwW8fWdjolm5VNsxsNG42OwjX7gbeJkjADDwKKE6IOHXq-CD8rlrLklZHNhDVFNu_WvDcQgXjoaNZ4Akl_Xo9ItHQ4e039evg0iU2ZKGOTOoO8hfc0pNh2Lx60ScUabJ0gTeFRf8PAz9SEc2yj_JAE',
  },
  {
    id: '2',
    text: 'Awesome! On my way, should be there in 10.',
    sender: 'Alex',
    senderId: 'user1',
    timestamp: '3:46 PM',
    isOwn: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW5bUkOABWoczBONYYkhyHUImAs3Oz6PqgAa0Cw36uSdBjmpMrA2B-DadfdTqV9UYB5Oc9YAcQx0CMe2qZ0IWAt6XNEoB3GwK9toNSMccTD6PfiyAVykfUNHXANYTW01NrlOJfkv3AI4ufTobIDgNL9MPsJv7r4wLbm9Q0qoxwtaHfPTTuga9934JS4_ziXFwIDXKML4bSK8yMIlrafeZ8kPU3ZT7AvRxvwoqTwpCiojhmt8romHpitG85hkU9lK1arzNAhSoLhw0',
  },
  {
    id: '3',
    text: 'Running a bit late, sorry! Be there in 15.',
    sender: 'Maria',
    senderId: 'user2',
    timestamp: '3:48 PM',
    isOwn: false,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUD3ZP15Jn8FzMIh_kA7ydT4G6lMWRKhq891ujhYdFh1rXbWx0TN9bJutdjp9da6WR7k8nwF769QJq6XU1IWPaIY80gTWUkvvpeMuwMY051wcC17aIQNSHIdvqZLuzUEV1sH1znZaS6Nc4PdtmllaizK0sbAW7a-Nlf7Afx20AW8e2ZaNWbzELEXaxAFLf3vDi4zlDQp5yt1pWIianOIoMQb7hkcPL4AfAfLHbMQxqmZe1QwcBiHeJLLs86sGmbjAIrm30MY4jHGU',
  },
];

export default function ChatScreen() {
  const navigation = useAppNavigation();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'You',
        senderId: 'currentUser',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJbXPTvs7vZfVZxjUI49GIO8KVbeVEFFTD1ImnQy_B-g--Hmx1u2ggYIblPQgalPSUjbBYCtD8uB0lrNu77ng3HRgiTIdXvS6_p8zdrWmq0jpjgA2nrYtSrwW8fWdjolm5VNsxsNG42OwjX7gbeJkjADDwKKE6IOHXq-CD8rlrLklZHNhDVFNu_WvDcQgXjoaNZ4Akl_Xo9ItHQ4e039evg0iU2ZKGOTOoO8hfc0pNh2Lx60ScUabJ0gTeFRf8PAz9SEc2yj_JAE',
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={[
          styles.messageBubble,
          item.isOwn ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.isOwn ? styles.ownText : styles.otherText
          ]}>
            {item.text}
          </Text>
        </View>
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
        <View style={styles.gameInfoContainer}>
          <Text style={styles.gameTitle}>Basketball Game</Text>
          <Text style={styles.gameSubtitle}>Golden Gate Park</Text>
        </View>
        <TouchableOpacity style={styles.usersButton}>
          <Text style={styles.usersIcon}>👥</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="MyGames" />
    </SafeAreaView>
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#0f172a', // stone-900
    fontWeight: 'bold',
  },
  gameInfoContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a', // stone-900
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.24, // tracking-[-0.015em]
  },
  gameSubtitle: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#78716c', // stone-500
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 2,
  },
  usersButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersIcon: {
    fontSize: 24,
    color: '#0f172a', // stone-900
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 24,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a', // stone-900
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#78716c', // stone-500
    lineHeight: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#fbbf24', // amber-400
    borderTopLeftRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#f5f5f4', // stone-100
    borderTopRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  ownText: {
    color: '#0f172a', // stone-900
  },
  otherText: {
    color: '#0f172a', // stone-900
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4', // stone-200
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f4', // stone-100
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 20,
    color: '#0f172a', // stone-900
    maxHeight: 100,
    minHeight: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButtonActive: {
    backgroundColor: '#fbbf24', // amber-400
  },
  sendButtonInactive: {
    backgroundColor: '#e7e5e4', // stone-200
  },
  sendIcon: {
    fontSize: 18,
    color: '#0f172a', // stone-900
  },
});