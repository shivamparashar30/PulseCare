import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Image,
  Alert,
  ActionSheetIOS,
  Linking,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../../packages/supabase/src/client';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_MAX_WIDTH = SCREEN_WIDTH * 0.6;

type EntityType = 'appointment' | 'order' | 'lab_booking';

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  message_type: string;
  created_at: string;
}

interface Props {
  entityType: EntityType;
  entityId: string;
  otherPersonName: string;
  /** true = the business side (doctor/store/center); false = patient */
  isBusiness: boolean;
  accentColor?: string;
  onBack: () => void;
}

// Backward compat alias
interface LegacyProps {
  appointmentId: string;
  otherPersonName: string;
  isDoctor: boolean;
  accentColor?: string;
  onBack: () => void;
}

// Map entity type to FK column name
const FK_COLUMN: Record<EntityType, string> = {
  appointment: 'appointment_id',
  order: 'order_id',
  lab_booking: 'lab_booking_id',
};

// Map entity type to parent table & permission column
const PARENT_TABLE: Record<EntityType, string> = {
  appointment: 'appointments',
  order: 'orders',
  lab_booking: 'lab_bookings',
};

const PERM_COLUMN: Record<EntityType, string> = {
  appointment: 'patient_can_chat',
  order: 'customer_can_chat',
  lab_booking: 'customer_can_chat',
};

function ChatScreenInner({ entityType, entityId, otherPersonName, isBusiness, accentColor = '#0066CC', onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [customerCanChat, setCustomerCanChat] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fkCol = FK_COLUMN[entityType];
  const parentTable = PARENT_TABLE[entityType];
  const permCol = PERM_COLUMN[entityType];

  // Get current user and permission settings
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);

      const { data } = await supabase
        .from(parentTable)
        .select(permCol)
        .eq('id', entityId)
        .single();
      if (data) setCustomerCanChat((data as any)[permCol] ?? false);
    })();
  }, [entityId, parentTable, permCol]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq(fkCol, entityId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
    setLoading(false);
  }, [entityId, fkCol]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${entityType}-${entityId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `${fkCol}=eq.${entityId}`,
      }, (payload: any) => {
        const newMsg = payload.new as ChatMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [entityId, entityType, fkCol]);

  // Listen for permission changes (for patient/customer side)
  useEffect(() => {
    if (isBusiness) return;
    const channel = supabase
      .channel(`chat-perms-${entityType}-${entityId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: parentTable,
        filter: `id=eq.${entityId}`,
      }, (payload: any) => {
        if (payload.new?.[permCol] !== undefined) {
          setCustomerCanChat(payload.new[permCol]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [entityId, entityType, isBusiness, parentTable, permCol]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || !userId || sending) return;

    setSending(true);
    setText('');

    const { error } = await supabase.from('chat_messages').insert({
      [fkCol]: entityId,
      sender_id: userId,
      message: trimmed,
      message_type: 'text',
    });

    if (error) {
      setText(trimmed);
      console.warn('Send error:', error.message);
    }
    setSending(false);
  };

  // Upload file to Supabase Storage and send as message
  const uploadAndSend = async (uri: string, fileName: string, mimeType: string, messageType: 'image' | 'document' | 'video') => {
    if (!userId) return;
    setUploading(true);

    try {
      const ext = fileName.split('.').pop() || (messageType === 'image' ? 'jpg' : 'pdf');
      const storagePath = `${userId}/${entityId}/${Date.now()}.${ext}`;

      // React Native: use expo-file-system to read file as base64, then convert to Uint8Array
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(storagePath, bytes, { contentType: mimeType, upsert: false });

      if (uploadError) {
        Alert.alert('Upload Failed', uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;
      const messageContent = messageType === 'document' ? `${publicUrl}||${fileName}` : publicUrl;

      const { error: insertError } = await supabase.from('chat_messages').insert({
        [fkCol]: entityId,
        sender_id: userId,
        message: messageContent,
        message_type: messageType,
      });

      if (insertError) {
        console.warn('Send error:', insertError.message);
        Alert.alert('Error', 'File uploaded but failed to send message.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload file.');
    }

    setUploading(false);
  };

  const ensurePermission = async (type: 'camera' | 'library'): Promise<boolean> => {
    const perm = type === 'camera'
      ? await ImagePicker.getCameraPermissionsAsync()
      : await ImagePicker.getMediaLibraryPermissionsAsync();

    if (perm.granted) return true;

    // If previously denied and can't ask again, send user to Settings
    if (!perm.canAskAgain) {
      Alert.alert(
        'Permission Required',
        `${type === 'camera' ? 'Camera' : 'Photo library'} access was denied. Please enable it in Settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }

    // Ask for permission
    const req = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    return req.granted;
  };

  const pickImage = async (fromCamera: boolean) => {
    const granted = await ensurePermission(fromCamera ? 'camera' : 'library');
    if (!granted) return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';

    await uploadAndSend(asset.uri, fileName, mimeType, 'image');
  };

  const pickVideo = async () => {
    const granted = await ensurePermission('library');
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.7,
      videoMaxDuration: 60,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const fileName = asset.fileName || `video_${Date.now()}.mp4`;
    const mimeType = asset.mimeType || 'video/mp4';

    await uploadAndSend(asset.uri, fileName, mimeType, 'video');
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const isImage = asset.mimeType?.startsWith('image/');
      await uploadAndSend(asset.uri, asset.name, asset.mimeType || 'application/octet-stream', isImage ? 'image' : 'document');
    } catch (err: any) {
      console.warn('Document pick error:', err);
    }
  };

  const showAttachmentOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery', 'Send Video', 'Upload Document'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) pickImage(true);
          else if (index === 2) pickImage(false);
          else if (index === 3) pickVideo();
          else if (index === 4) pickDocument();
        },
      );
    } else {
      Alert.alert('Attach', 'Choose an option', [
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(false) },
        { text: 'Send Video', onPress: pickVideo },
        { text: 'Upload Document', onPress: pickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const toggleCustomerChat = async (value: boolean) => {
    setToggling(true);
    setCustomerCanChat(value);
    await supabase
      .from(parentTable)
      .update({ [permCol]: value })
      .eq('id', entityId);
    setToggling(false);
  };

  const canType = isBusiness || customerCanChat;

  const permLabel = entityType === 'appointment' ? 'Allow patient to reply' : 'Allow customer to reply';
  const permSubEnabled = entityType === 'appointment' ? 'Patient can send messages' : 'Customer can send messages';
  const permSubDisabled = 'Only you can send messages';
  const disabledLabel = entityType === 'appointment'
    ? 'Doctor has not enabled replies yet'
    : entityType === 'order'
      ? 'Store has not enabled replies yet'
      : 'Center has not enabled replies yet';

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDocIcon = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'document-text';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['xls', 'xlsx'].includes(ext)) return 'grid-outline';
    if (['ppt', 'pptx'].includes(ext)) return 'easel-outline';
    if (['zip', 'rar'].includes(ext)) return 'archive-outline';
    return 'document-attach';
  };

  const getDocColor = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return '#DC2626';
    if (['doc', 'docx'].includes(ext)) return '#2563EB';
    if (['xls', 'xlsx'].includes(ext)) return '#059669';
    if (['ppt', 'pptx'].includes(ext)) return '#D97706';
    return accentColor;
  };

  const getDocLabel = (name: string): string => {
    const ext = name.split('.').pop()?.toUpperCase() || '';
    return ext ? `${ext} File` : 'Document';
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMine = item.sender_id === userId;
    const showDate = index === 0 ||
      new Date(item.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

    const isImage = item.message_type === 'image';
    const isVideo = item.message_type === 'video';
    const isDocument = item.message_type === 'document';

    let docUrl = '';
    let docName = '';
    if (isDocument) {
      const parts = item.message.split('||');
      docUrl = parts[0];
      docName = parts[1] || 'Document';
    }

    return (
      <View>
        {showDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{formatDateHeader(item.created_at)}</Text>
          </View>
        )}

        {isImage ? (
          <TouchableOpacity
            style={[styles.imageBubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
            onPress={() => setViewerImage(item.message)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.message }} style={styles.chatImage} resizeMode="cover" />
            <Text style={[styles.bubbleTime, { marginTop: 4, paddingHorizontal: 4 }]}>
              {formatTime(item.created_at)}
            </Text>
          </TouchableOpacity>
        ) : isVideo ? (
          <TouchableOpacity
            style={[styles.videoBubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
            onPress={() => Linking.openURL(item.message).catch(() => Alert.alert('Error', 'Cannot play this video.'))}
            activeOpacity={0.8}
          >
            <View style={styles.videoPlaceholder}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={28} color="#fff" />
              </View>
              <Text style={styles.videoLabel}>Video</Text>
            </View>
            <Text style={[styles.bubbleTime, { marginTop: 4, paddingHorizontal: 4, color: '#ccc' }]}>
              {formatTime(item.created_at)}
            </Text>
          </TouchableOpacity>
        ) : isDocument ? (
          <TouchableOpacity
            style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther, isMine && { backgroundColor: accentColor }]}
            onPress={() => Linking.openURL(docUrl).catch(() => Alert.alert('Error', 'Cannot open this file.'))}
            activeOpacity={0.7}
          >
            <View style={styles.docRow}>
              <View style={[styles.docIcon, { backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : getDocColor(docName) + '15' }]}>
                <Ionicons name={getDocIcon(docName) as any} size={22} color={isMine ? '#fff' : getDocColor(docName)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.docName, isMine && { color: '#fff' }]} numberOfLines={2}>{docName}</Text>
                <Text style={[styles.docTap, isMine && { color: 'rgba(255,255,255,0.6)' }]}>{getDocLabel(docName)} · Tap to open</Text>
              </View>
              <Ionicons name="download-outline" size={18} color={isMine ? 'rgba(255,255,255,0.7)' : '#9CA3AF'} />
            </View>
            <Text style={[styles.bubbleTime, isMine && { color: 'rgba(255,255,255,0.7)' }]}>{formatTime(item.created_at)}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther, isMine && { backgroundColor: accentColor }]}>
            <Text style={[styles.bubbleText, isMine && { color: '#fff' }]}>{item.message}</Text>
            <Text style={[styles.bubbleTime, isMine && { color: 'rgba(255,255,255,0.7)' }]}>{formatTime(item.created_at)}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}><Ionicons name="arrow-back" size={22} color="#1E293B" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{otherPersonName}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}><ActivityIndicator size="large" color={accentColor} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{otherPersonName}</Text>
          <Text style={styles.headerSub}>
            {entityType === 'appointment' ? 'Appointment Chat' : entityType === 'order' ? 'Order Chat' : 'Booking Chat'}
          </Text>
        </View>
        <View style={[styles.onlineDot, { backgroundColor: '#10B981' }]} />
      </View>

      {/* Business toggle for customer permissions */}
      {isBusiness && (
        <View style={styles.permissionBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.permLabel}>{permLabel}</Text>
            <Text style={styles.permSub}>{customerCanChat ? permSubEnabled : permSubDisabled}</Text>
          </View>
          <Switch
            value={customerCanChat}
            onValueChange={toggleCustomerChat}
            disabled={toggling}
            trackColor={{ false: '#E5E7EB', true: accentColor + '60' }}
            thumbColor={customerCanChat ? accentColor : '#9CA3AF'}
          />
        </View>
      )}

      {uploading && (
        <View style={styles.uploadBar}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text style={styles.uploadText}>Uploading file...</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={[styles.emptyChatIcon, { backgroundColor: accentColor + '15' }]}>
                <Ionicons name="chatbubbles-outline" size={40} color={accentColor} />
              </View>
              <Text style={styles.emptyChatTitle}>Start the conversation</Text>
              <Text style={styles.emptyChatText}>
                {isBusiness
                  ? 'Send a message. You can also enable the customer to reply.'
                  : 'Please wait for a message. You will be notified when replies are enabled.'}
              </Text>
            </View>
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {canType ? (
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={showAttachmentOptions} disabled={uploading}>
              <Ionicons name="attach" size={22} color={uploading ? '#D1D5DB' : '#64748B'} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: text.trim() ? accentColor : '#E5E7EB' }]}
              onPress={sendMessage}
              disabled={!text.trim() || sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={18} color={text.trim() ? '#fff' : '#9CA3AF'} />
              }
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.disabledBar}>
            <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
            <Text style={styles.disabledText}>{disabledLabel}</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Fullscreen Image Viewer */}
      <Modal visible={!!viewerImage} transparent animationType="fade" onRequestClose={() => setViewerImage(null)}>
        <StatusBar barStyle="light-content" />
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {viewerImage && (
            <Image source={{ uri: viewerImage }} style={styles.viewerImage} resizeMode="contain" />
          )}
          <TouchableOpacity
            style={styles.viewerDownload}
            onPress={() => {
              if (viewerImage) {
                Linking.openURL(viewerImage).catch(() => {});
              }
            }}
          >
            <Ionicons name="download-outline" size={22} color="#fff" />
            <Text style={styles.viewerDownloadText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Default export supports both new generic props and legacy appointmentId/isDoctor props
export default function ChatScreen(props: Props | LegacyProps) {
  if ('entityType' in props) {
    return <ChatScreenInner {...props} />;
  }
  // Legacy support
  const { appointmentId, isDoctor, ...rest } = props as LegacyProps;
  return (
    <ChatScreenInner
      entityType="appointment"
      entityId={appointmentId}
      isBusiness={isDoctor}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  permissionBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  permLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  permSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  uploadBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF', borderBottomWidth: 1, borderBottomColor: '#BFDBFE',
  },
  uploadText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  messageList: { padding: 16, paddingBottom: 8, flexGrow: 1, justifyContent: 'flex-end' },
  dateHeader: { alignItems: 'center', marginVertical: 12 },
  dateHeaderText: {
    fontSize: 11, fontWeight: '600', color: '#9CA3AF',
    backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10,
  },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 12, marginBottom: 6 },
  bubbleMine: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleOther: {
    alignSelf: 'flex-start', backgroundColor: '#fff',
    borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB',
  },
  bubbleText: { fontSize: 14, color: '#1E293B', lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4, alignSelf: 'flex-end' },
  imageBubble: { maxWidth: '70%', borderRadius: 16, padding: 4, marginBottom: 6, overflow: 'hidden' },
  chatImage: { width: IMAGE_MAX_WIDTH, height: IMAGE_MAX_WIDTH * 0.75, borderRadius: 12 },
  videoBubble: { maxWidth: '70%', borderRadius: 16, padding: 4, marginBottom: 6, overflow: 'hidden', backgroundColor: '#1a1a2e' },
  videoPlaceholder: {
    width: IMAGE_MAX_WIDTH, height: IMAGE_MAX_WIDTH * 0.56, borderRadius: 12,
    backgroundColor: '#16213e', justifyContent: 'center', alignItems: 'center',
  },
  playButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center',
  },
  videoLabel: { fontSize: 12, color: '#94A3B8', marginTop: 6, fontWeight: '600' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docIcon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  docTap: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  viewerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute', top: 54, right: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  viewerImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  viewerDownload: {
    position: 'absolute', bottom: 50,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24,
  },
  viewerDownloadText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: '#1E293B', maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  disabledBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  disabledText: { fontSize: 13, color: '#9CA3AF' },
  emptyChat: { alignItems: 'center', paddingHorizontal: 32 },
  emptyChatIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyChatTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  emptyChatText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});
