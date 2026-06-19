import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ZegoCallService } from '../services/ZegoCallService';

let ZegoTextureView: React.ComponentType<any> | null = null;
try {
  ZegoTextureView = require('zego-express-engine-reactnative').ZegoTextureView;
} catch (e) {
  // Native module not available — will show placeholder UI
}

const { width: SW, height: SH } = Dimensions.get('window');

type CallState = 'idle' | 'outgoing' | 'incoming' | 'ongoing';
type CallType = 'audio' | 'video';

interface Props {
  visible: boolean;
  callState: CallState;
  callType: CallType;
  otherPersonName: string;
  otherPersonAvatar?: string;
  duration: number;
  isMuted: boolean;
  isSpeaker: boolean;
  isCameraOff: boolean;
  accentColor?: string;
  remoteStreamID?: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onToggleCamera: () => void;
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export default function CallOverlay({
  visible,
  callState,
  callType,
  otherPersonName,
  otherPersonAvatar,
  duration,
  isMuted,
  isSpeaker,
  isCameraOff,
  accentColor = '#0066CC',
  remoteStreamID,
  onAccept,
  onDecline,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  onToggleCamera,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const localViewRef = useRef(null);
  const remoteViewRef = useRef(null);

  // Pulse animation for avatar during ringing
  useEffect(() => {
    if (callState === 'outgoing' || callState === 'incoming') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulse.start();

      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]),
      );
      ring.start();

      return () => {
        pulse.stop();
        ring.stop();
      };
    }
  }, [callState, pulseAnim, ringAnim]);

  // Vibrate on incoming call
  useEffect(() => {
    if (callState === 'incoming') {
      const interval = setInterval(() => Vibration.vibrate(500), 2000);
      Vibration.vibrate(500);
      return () => {
        clearInterval(interval);
        Vibration.cancel();
      };
    }
  }, [callState]);

  // Start local camera preview for video calls
  useEffect(() => {
    if (callState !== 'ongoing' || callType !== 'video' || isCameraOff) return;
    const timer = setTimeout(() => {
      if (localViewRef.current) {
        ZegoCallService.startPreview(localViewRef.current);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [callState, callType, isCameraOff]);

  // Play remote video stream
  useEffect(() => {
    if (!remoteStreamID) return;
    const timer = setTimeout(() => {
      if (remoteViewRef.current) {
        ZegoCallService.playStream(remoteStreamID, remoteViewRef.current);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [remoteStreamID]);

  if (!visible || callState === 'idle') return null;

  const avatarUri = otherPersonAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPersonName)}&background=4F46E5&color=fff&size=200`;

  const isRinging = callState === 'outgoing' || callState === 'incoming';
  const isOngoingVideo = callState === 'ongoing' && callType === 'video';

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Background */}
        <View style={[styles.bgGradient, { backgroundColor: callType === 'video' ? '#0F172A' : '#1E1B4B' }]} />

        {/* Full-screen remote video for ongoing video calls */}
        {isOngoingVideo && ZegoTextureView && remoteStreamID && (
          <ZegoTextureView ref={remoteViewRef} style={StyleSheet.absoluteFill} />
        )}

        {/* Top info */}
        <View style={[styles.topSection, isOngoingVideo && styles.overlayTop]}>
          <Text style={styles.callTypeLabel}>
            {callType === 'video' ? 'Video Call' : 'Audio Call'}
          </Text>

          {callState === 'ongoing' && (
            <View style={styles.timerBadge}>
              <View style={styles.timerDot} />
              <Text style={styles.timerText}>{formatDuration(duration)}</Text>
            </View>
          )}
        </View>

        {/* Center - Avatar + Name */}
        <View style={styles.centerSection}>
          {isRinging && (
            <>
              <Animated.View style={[styles.pulseRing, styles.pulseRing3, {
                opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0] }),
                transform: [{ scale: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
              }]} />
              <Animated.View style={[styles.pulseRing, styles.pulseRing2, {
                opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0] }),
                transform: [{ scale: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
              }]} />
              <Animated.View style={[styles.pulseRing, {
                opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0] }),
                transform: [{ scale: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
              }]} />
            </>
          )}

          {/* Hide avatar in ongoing video with remote stream (full-screen video shows instead) */}
          {!(isOngoingVideo && remoteStreamID && ZegoTextureView) && (
            <>
              <Animated.View style={[styles.avatarWrap, isRinging && { transform: [{ scale: pulseAnim }] }]}>
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              </Animated.View>

              <Text style={styles.personName}>{otherPersonName}</Text>

              <Text style={styles.statusText}>
                {callState === 'outgoing' ? 'Calling...' :
                 callState === 'incoming' ? `Incoming ${callType} call...` :
                 callType === 'video' ? 'Video call connected' : 'Call connected'}
              </Text>
            </>
          )}

          {/* Show name over video for ongoing video */}
          {isOngoingVideo && remoteStreamID && ZegoTextureView && (
            <View style={styles.videoNameOverlay}>
              <Text style={styles.personName}>{otherPersonName}</Text>
            </View>
          )}

          {/* Video area for ongoing video calls without Zego or waiting for stream */}
          {isOngoingVideo && (!ZegoTextureView || !remoteStreamID) && (
            <View style={styles.videoArea}>
              <View style={styles.waitingBox}>
                <ActivityIndicator size="small" color="#818CF8" />
                <Text style={styles.waitingText}>
                  {!ZegoTextureView ? 'Video requires a development build' : 'Connecting video...'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Local video PiP */}
        {isOngoingVideo && !isCameraOff && ZegoTextureView && (
          <View style={styles.localPiP}>
            <ZegoTextureView ref={localViewRef} style={styles.localPiPVideo} />
          </View>
        )}

        {/* Bottom Controls */}
        <View style={[styles.bottomSection, isOngoingVideo && styles.overlayBottom]}>
          {callState === 'incoming' ? (
            <View style={styles.incomingActions}>
              <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.8}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.swipeHint}>
                {callType === 'video' ? 'Incoming video call' : 'Incoming audio call'}
              </Text>
              <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
                <Ionicons name={callType === 'video' ? 'videocam' : 'call'} size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : callState === 'outgoing' ? (
            <View style={styles.outgoingActions}>
              <TouchableOpacity style={styles.endCallBtn} onPress={onEnd} activeOpacity={0.8}>
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text style={styles.endLabel}>Cancel</Text>
            </View>
          ) : (
            <View style={styles.ongoingActions}>
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                  onPress={onToggleMute}
                  activeOpacity={0.7}
                >
                  <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? '#EF4444' : '#fff'} />
                  <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
                  onPress={onToggleSpeaker}
                  activeOpacity={0.7}
                >
                  <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium'} size={24} color={isSpeaker ? '#3B82F6' : '#fff'} />
                  <Text style={[styles.controlLabel, isSpeaker && styles.controlLabelActive]}>Speaker</Text>
                </TouchableOpacity>

                {callType === 'video' && (
                  <TouchableOpacity
                    style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]}
                    onPress={onToggleCamera}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isCameraOff ? 'videocam-off' : 'videocam'} size={24} color={isCameraOff ? '#F59E0B' : '#fff'} />
                    <Text style={[styles.controlLabel, isCameraOff && styles.controlLabelActive]}>Camera</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.endCallBtn} onPress={onEnd} activeOpacity={0.8}>
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text style={styles.endLabel}>End Call</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgGradient: { ...StyleSheet.absoluteFillObject },
  topSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    gap: 8,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  callTypeLabel: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  timerText: { fontSize: 16, fontWeight: '700', color: '#10B981', fontVariant: ['tabular-nums'] },
  centerSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pulseRing: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  pulseRing2: { width: 120, height: 120, borderRadius: 60 },
  pulseRing3: { width: 120, height: 120, borderRadius: 60 },
  avatarWrap: { marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  personName: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  statusText: { fontSize: 15, color: 'rgba(255,255,255,0.6)' },
  videoNameOverlay: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  videoArea: { marginTop: 24, width: SW * 0.7 },
  waitingBox: {
    alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    paddingVertical: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  waitingText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
  localPiP: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    right: 16,
    width: 110,
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: '#1E293B',
    zIndex: 20,
    elevation: 10,
  },
  localPiPVideo: {
    flex: 1,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  bottomSection: { paddingBottom: Platform.OS === 'ios' ? 50 : 30, alignItems: 'center' },
  incomingActions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: SW * 0.75, paddingHorizontal: 10,
  },
  declineBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    elevation: 8,
  },
  acceptBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    elevation: 8,
  },
  swipeHint: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 80 },
  outgoingActions: { alignItems: 'center', gap: 8 },
  ongoingActions: { alignItems: 'center', gap: 12 },
  controlsRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  controlBtn: {
    width: 64, height: 72, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  controlBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  controlLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  controlLabelActive: { color: '#fff' },
  endCallBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    elevation: 8,
  },
  endLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 4 },
});
