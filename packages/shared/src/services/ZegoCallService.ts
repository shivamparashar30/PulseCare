import { findNodeHandle } from 'react-native';

const ZEGO_APP_ID = 1277694267;
const ZEGO_APP_SIGN = 'ee2a3fb63b5acf104429496a48fe35c8ef4ad3ab9e77a634434cd16844b54a9c';

let ZegoEngine: any = null;
try {
  ZegoEngine = require('zego-express-engine-reactnative').default;
} catch (e) {
  // SDK not available — all methods become no-ops
}

type StreamCallback = (streamID: string | null) => void;

class _ZegoCallService {
  private ready = false;
  private roomID: string | null = null;
  onRemoteStream: StreamCallback | null = null;

  async init(): Promise<boolean> {
    if (this.ready) return true;
    if (!ZegoEngine) return false;
    try {
      await ZegoEngine.createEngineWithProfile({
        appID: ZEGO_APP_ID,
        appSign: ZEGO_APP_SIGN,
        scenario: 0, // General
      });

      ZegoEngine.instance().on(
        'roomStreamUpdate',
        (_roomID: string, updateType: number, streams: any[]) => {
          if (updateType === 0 && streams.length > 0) {
            this.onRemoteStream?.(streams[0].streamID);
          } else if (updateType === 1) {
            this.onRemoteStream?.(null);
          }
        },
      );

      this.ready = true;
      return true;
    } catch (e) {
      console.warn('Zegocloud init failed:', e);
      return false;
    }
  }

  async joinRoom(
    sessionId: string,
    userId: string,
    userName: string,
    isVideo: boolean,
  ) {
    if (!this.ready || !ZegoEngine) return;
    const roomID = 'r_' + sessionId.replace(/-/g, '_');
    const userID = userId.replace(/-/g, '_');
    this.roomID = roomID;
    try {
      await ZegoEngine.instance().loginRoom(roomID, { userID, userName });
      await ZegoEngine.instance().startPublishingStream(`${roomID}_${userID}`);
      if (!isVideo) await ZegoEngine.instance().enableCamera(false);
    } catch (e) {
      console.warn('Zego joinRoom failed:', e);
    }
  }

  startPreview(viewRef: any) {
    if (!this.ready || !ZegoEngine) return;
    const tag = findNodeHandle(viewRef);
    if (tag) {
      ZegoEngine.instance().startPreview({
        reactTag: tag,
        viewMode: 0,
        backgroundColor: 0,
      });
    }
  }

  playStream(streamID: string, viewRef: any) {
    if (!this.ready || !ZegoEngine) return;
    const tag = findNodeHandle(viewRef);
    if (tag) {
      ZegoEngine.instance().startPlayingStream(streamID, {
        reactTag: tag,
        viewMode: 0,
        backgroundColor: 0,
      });
    }
  }

  muteMic(muted: boolean) {
    if (!this.ready || !ZegoEngine) return;
    ZegoEngine.instance().muteMicrophone(muted);
  }

  setCamera(on: boolean) {
    if (!this.ready || !ZegoEngine) return;
    ZegoEngine.instance().enableCamera(on);
  }

  setSpeaker(on: boolean) {
    if (!this.ready || !ZegoEngine) return;
    ZegoEngine.instance().setAudioRouteToSpeaker(on);
  }

  async leave() {
    if (!this.ready || !ZegoEngine || !this.roomID) return;
    try {
      await ZegoEngine.instance().stopPublishingStream();
      await ZegoEngine.instance().stopPreview();
      await ZegoEngine.instance().logoutRoom(this.roomID);
    } catch (e) {
      console.warn('Zego leave error:', e);
    }
    this.roomID = null;
  }

  async destroy() {
    await this.leave();
    if (this.ready && ZegoEngine) {
      try {
        await ZegoEngine.destroyEngine();
      } catch (e) {
        console.warn('Zego destroy error:', e);
      }
    }
    this.ready = false;
    this.onRemoteStream = null;
  }
}

export const ZegoCallService = new _ZegoCallService();
