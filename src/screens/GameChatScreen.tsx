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
  Image,
  ScrollView,
  Alert,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { useAppNavigation, useAppRoute } from '../navigation';
import { ROUTES } from '../navigation/types';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: string;
  isOwn: boolean;
  avatar: string;
}

interface GameInfo {
  id: string;
  title: string;
  players: number;
  location: string;
  time: string;
  image: string;
}

// Mock messages matching the design exactly
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

// Mock game info
const mockGameInfo: GameInfo = {
  id: '1',
  title: 'Basketball Game',
  players: 5,
  location: 'Golden Gate Park',
  time: '5:00 PM',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB26Ew9uaRiRRc601eC_dt4k5hvT4db-Jzgc2YlGieDIr_xGvc_S1_fQDMTjpnTcCIGvASMQg-uYJsQejxfwNCAH_6sPnTZs-ufhWnxvlGWKlVYLpbztah8Kfls7OTUIdwAW-68k-geuC1CnDt9FeW0kV4LAhFRTfhR67gj785ENgmqnPBfB2OnVZ-1UHjdNfuzpp-1uIh3JVRiusru_2SLx-q7l6l93TFzVWMN4zRnVROJiVGIYyoLXQimdlYvmjbpOitGDX534Hk',
};

// Mock members data
const mockMembers = [
  {
    id: '1',
    name: 'You',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJbXPTvs7vZfVZxjUI49GIO8KVbeVEFFTD1ImnQy_B-g--Hmx1u2ggYIblPQgalPSUjbBYCtD8uB0lrNu77ng3HRgiTIdXvS6_p8zdrWmq0jpjgA2nrYtSrwW8fWdjolm5VNsxsNG42OwjX7gbeJkjADDwKKE6IOHXq-CD8rlrLklZHNhDVFNu_WvDcQgXjoaNZ4Akl_Xo9ItHQ4e039evg0iU2ZKGOTOoO8hfc0pNh2Lx60ScUabJ0gTeFRf8PAz9SEc2yj_JAE',
    status: 'online'
  },
  {
    id: '2',
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: '4',
    name: 'Mike Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    status: 'away'
  },
  {
    id: '5',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: '6',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    status: 'offline'
  },
  {
    id: '7',
    name: 'Lisa Brown',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: '8',
    name: 'Tom Anderson',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    status: 'online'
  }
];

export default function GameChatScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'GameChat'>();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [gameInfo] = useState<GameInfo>(mockGameInfo);
  const [showMembers, setShowMembers] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  // Get game info from route params (if passed)
  const gameData = route.params?.game || gameInfo;


  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
      
      // Blur the input to dismiss keyboard
      textInputRef.current?.blur();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleInputFocus = () => {
    // Scroll to bottom when input is focused
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleInputSubmit = () => {
    handleSendMessage();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    textInputRef.current?.blur();
  };

  const handleChatAreaPress = () => {
    dismissKeyboard();
  };

  const toggleMembers = () => {
    setShowMembers(!showMembers);
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
          <Text style={styles.gameTitle}>{gameData.title}</Text>
          <Text style={styles.gameSubtitle}>{gameData.location}</Text>
        </View>
        <TouchableOpacity style={styles.usersButton} onPress={toggleMembers}>
          <Text style={styles.usersIcon}>👥</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={true}
      >
        <TouchableWithoutFeedback onPress={handleChatAreaPress}>
          <View style={styles.messagesContainer}>
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
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableWithoutFeedback>

      </KeyboardAvoidingView>

      {/* Members View */}
      {showMembers && (
        <View style={styles.membersContainer}>
          <View style={styles.membersHeader}>
            <Text style={styles.membersTitle}>Game Members ({mockMembers.length})</Text>
            <TouchableOpacity onPress={toggleMembers} style={styles.closeMembersButton}>
              <Text style={styles.closeMembersIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.membersList}>
            {mockMembers.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberStatusContainer}>
                    <View style={[
                      styles.memberStatusDot,
                      { backgroundColor: member.status === 'online' ? '#10b981' : member.status === 'away' ? '#f59e0b' : '#6b7280' }
                    ]} />
                    <Text style={styles.memberStatus}>{member.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Message Input Above Navigation */}
      <View style={styles.bottomInputContainer}>
        <View style={styles.bottomInputRow}>
          <TextInput
            ref={textInputRef}
            style={styles.bottomMessageInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleInputSubmit}
            onFocus={handleInputFocus}
            enablesReturnKeyAutomatically={true}
            textAlignVertical="top"
            scrollEnabled={true}
          />
          <TouchableOpacity 
            style={[
              styles.bottomSendButton,
              newMessage.trim() ? styles.bottomSendButtonActive : styles.bottomSendButtonInactive
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.bottomSendIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  messagesContainer: {
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
  bottomInputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4', // stone-200
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  bottomInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bottomMessageInput: {
    flex: 1,
    backgroundColor: '#f5f5f4', // stone-100
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 20,
    color: '#0f172a', // stone-900
    maxHeight: 100,
    minHeight: 44,
    textAlignVertical: 'top',
    includeFontPadding: false,
  },
  bottomSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  bottomSendButtonActive: {
    backgroundColor: '#fbbf24', // amber-400
  },
  bottomSendButtonInactive: {
    backgroundColor: '#e7e5e4', // stone-200
  },
  bottomSendIcon: {
    fontSize: 18,
    color: '#0f172a', // stone-900
  },
  membersContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4', // stone-200
    maxHeight: 300,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4', // stone-200
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a', // stone-900
  },
  closeMembersButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f4', // stone-100
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeMembersIcon: {
    fontSize: 16,
    color: '#0f172a', // stone-900
  },
  membersList: {
    maxHeight: 200,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4', // stone-100
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a', // stone-900
    marginBottom: 2,
  },
  memberStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  memberStatus: {
    fontSize: 14,
    color: '#6b7280', // stone-500
    textTransform: 'capitalize',
  },
});