import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { COLORS, Profile, ChatMessage } from '@linkradar/shared';
import { Send, ArrowLeft, Landmark, SendHorizonal } from 'lucide-react';

interface ChatScreenProps {
  chatProfiles: Profile[];
  messages: Record<string, ChatMessage[]>;
  activeChatId: string | null;
  onSelectChat: (id: string | null) => void;
  onSendMessage: (profileId: string, text: string) => void;
  onBack: () => void;
}

export default function ChatScreen({
  chatProfiles,
  messages,
  activeChatId,
  onSelectChat,
  onSendMessage,
  onBack
}: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const activeProfile = chatProfiles.find(p => p.id === activeChatId);
  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  // Scroll to bottom when message log updates
  useEffect(() => {
    if (activeMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeChatId) return;
    onSendMessage(activeChatId, inputText.trim());
    setInputText('');
  };

  const renderChatItem = ({ item }: { item: Profile }) => {
    const thread = messages[item.id] || [];
    const lastMsg = thread[thread.length - 1];
    
    return (
      <TouchableOpacity
        style={styles.chatRow}
        onPress={() => onSelectChat(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        
        <View style={styles.chatRowInfo}>
          <View style={styles.chatRowHeader}>
            <Text style={styles.chatRowName}>{item.name}</Text>
            <Text style={styles.chatRowTime}>{lastMsg ? lastMsg.timestamp : ''}</Text>
          </View>
          
          <Text style={styles.chatRowHeadline}>{item.headline} @ {item.company}</Text>
          
          <Text style={styles.chatRowMessage} numberOfLines={1}>
            {lastMsg ? lastMsg.text : 'No messages yet. Start with a warm icebreaker!'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === 'currentUser';
    
    return (
      <View style={[styles.msgContainer, isMe ? styles.msgMeContainer : styles.msgOtherContainer]}>
        {!isMe && activeProfile && (
          <Image source={{ uri: activeProfile.avatar }} style={styles.msgAvatar} />
        )}
        <View style={[styles.msgBubble, isMe ? styles.msgMeBubble : styles.msgOtherBubble]}>
          <Text style={[styles.msgText, isMe ? styles.msgMeText : styles.msgOtherText]}>{item.text}</Text>
          <Text style={[styles.msgTime, isMe ? styles.msgMeTime : styles.msgOtherTime]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  // 1. Thread Detail Screen
  if (activeChatId && activeProfile) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Thread Header */}
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <Image source={{ uri: activeProfile.avatar }} style={styles.threadAvatar} />
          
          <View style={styles.threadHeaderInfo}>
            <Text style={styles.threadName}>{activeProfile.name}</Text>
            <View style={styles.threadMeta}>
              <Landmark size={10} color={COLORS.accentNeon} style={{ marginRight: 3 }} />
              <Text style={styles.threadHeadline} numberOfLines={1}>
                {activeProfile.headline} at {activeProfile.company}
              </Text>
            </View>
          </View>
        </View>

        {/* Message Log */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <FlatList
            ref={flatListRef}
            data={activeMessages}
            keyExtractor={(item: ChatMessage) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />

          {/* Message Input Row */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Send an icebreaker to ${activeProfile.name}...`}
              placeholderTextColor={COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <SendHorizonal size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // 2. Converations List Screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversations</Text>
        <Text style={styles.subtitle}>Chatting with matched professional cohorts</Text>
      </View>

      {chatProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Your Inbox is Quiet</Text>
          <Text style={styles.emptyDesc}>
            Conversations will open here as soon as you match with colleagues from your corporate or locality radar list.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatProfiles}
          keyExtractor={(item: Profile) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 10,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chatRowInfo: {
    flex: 1,
    marginLeft: 16,
  },
  chatRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRowName: {
    fontFamily: 'Outfit',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chatRowTime: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  chatRowHeadline: {
    fontFamily: 'Outfit',
    fontSize: 11.5,
    color: COLORS.accentNeon,
    marginTop: 2,
    fontWeight: '500',
  },
  chatRowMessage: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  threadHeader: {
    height: 64,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
    marginRight: 6,
    cursor: 'pointer',
  },
  threadAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  threadHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  threadName: {
    fontFamily: 'Outfit',
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  threadHeadline: {
    fontFamily: 'Outfit',
    fontSize: 11,
    color: COLORS.textSecondary,
    maxWidth: 240,
  },
  messageList: {
    padding: 20,
    gap: 16,
  },
  msgContainer: {
    flexDirection: 'row',
    maxWidth: '85%',
  },
  msgMeContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgOtherContainer: {
    alignSelf: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  msgBubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  msgMeBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  msgOtherBubble: {
    backgroundColor: COLORS.bgCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    fontFamily: 'Outfit',
    fontSize: 13.5,
    lineHeight: 19,
  },
  msgMeText: {
    color: '#ffffff',
  },
  msgOtherText: {
    color: COLORS.textPrimary,
  },
  msgTime: {
    fontFamily: 'Outfit',
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgMeTime: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  msgOtherTime: {
    color: COLORS.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#0c101c',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: COLORS.textPrimary,
    fontFamily: 'Outfit',
    fontSize: 13.5,
    outline: 'none',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px rgba(0, 119, 181, 0.25)',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
    cursor: 'default',
    boxShadow: 'none',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: 'Outfit',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  }
});
