//@ts-expect-error
import { NativeModules, NativeEventEmitter } from 'react-native'
import * as zego from '../ZegoExpressDefines'
const { ZegoExpressNativeModule } = NativeModules
const Prefix = ZegoExpressNativeModule.prefix
const ZegoEvent = new NativeEventEmitter(ZegoExpressNativeModule)
let engine
export class ZegoExpressEngineImpl {
  static _listeners = new Map()
  static _mediaPlayerMap = new Map()
  static _audioEffectPlayerMap = new Map()
  static _realTimeSequentialDataManagerMap = new Map()
  _copyrightedMusic = null
  static getInstance() {
    if (engine) {
      return engine
    } else {
      throw new Error('Get instance failed. Please create engine first')
    }
  }
  static async createEngine(appID, appSign, isTestEnv, scenario) {
    if (engine) {
      return engine
    }
    await ZegoExpressNativeModule.createEngine(appID, appSign, isTestEnv, scenario)
    engine = new ZegoExpressEngineImpl()
    return engine
  }
  static async createEngineWithProfile(profile) {
    if (engine) {
      return engine
    }
    await ZegoExpressNativeModule.createEngineWithProfile(profile)
    engine = new ZegoExpressEngineImpl()
    return engine
  }
  static destroyEngine() {
    engine = undefined
    ZegoExpressEngineImpl._listeners.forEach((value, key) => {
      ZegoEvent.removeAllListeners(Prefix + key)
    })
    ZegoExpressEngineImpl._mediaPlayerMap.forEach((vaule, key) => {
      ZegoExpressNativeModule.destroyMediaPlayer(key)
    })
    ZegoExpressEngineImpl._listeners.clear()
    ZegoExpressEngineImpl._mediaPlayerMap.clear()
    // this.removeAllListeners();
    return ZegoExpressNativeModule.destroyEngine()
  }
  static setEngineConfig(config) {
    return ZegoExpressNativeModule.setEngineConfig(config)
  }
  static setRoomMode(mode) {
    return ZegoExpressNativeModule.setRoomMode(mode)
  }
  static getVersion() {
    return ZegoExpressNativeModule.getVersion()
  }
  getVersion() {
    return ZegoExpressNativeModule.getVersion()
  }
  uploadLog() {
    return ZegoExpressNativeModule.uploadLog()
  }
  callExperimentalAPI(params) {
    return ZegoExpressNativeModule.callExperimentalAPI(params)
  }
  on(event, callback) {
    const native_listener = (res) => {
      const { data } = res
      // @ts-ignore
      callback(...data)
    }
    let map = ZegoExpressEngineImpl._listeners.get(event)
    if (map === undefined) {
      map = new Map()
      ZegoExpressEngineImpl._listeners.set(event, map)
    }
    map.set(callback, native_listener)
    ZegoEvent.addListener(Prefix + event, native_listener)
    ZegoExpressEngineImpl._listeners.set(event, map)
  }
  off(event, callback) {
    if (callback === undefined) {
      ZegoEvent.removeAllListeners(Prefix + event)
      ZegoExpressEngineImpl._listeners.delete(event)
    } else {
      const map = ZegoExpressEngineImpl._listeners.get(event)
      if (map === undefined) return
      ZegoEvent.removeListener(Prefix + event, map.get(callback))
      map.delete(callback)
    }
  }
  loginRoom(roomID, user, config) {
    return ZegoExpressNativeModule.loginRoom(roomID, user, config)
  }
  logoutRoom(roomID) {
    return ZegoExpressNativeModule.logoutRoom(roomID)
  }
  switchRoom(fromRoomID, toRoomID, config) {
    return ZegoExpressNativeModule.switchRoom(fromRoomID, toRoomID, config)
  }
  renewToken(roomID, token) {
    return ZegoExpressNativeModule.renewToken(roomID, token)
  }
  setRoomExtraInfo(roomID, key, value) {
    return ZegoExpressNativeModule.setRoomExtraInfo(roomID, key, value)
  }
  setStreamExtraInfo(extraInfo, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setStreamExtraInfo(extraInfo, channel)
  }
  sendBroadcastMessage(roomID, message) {
    return ZegoExpressNativeModule.sendBroadcastMessage(roomID, message)
  }
  sendBarrageMessage(roomID, message) {
    return ZegoExpressNativeModule.sendBarrageMessage(roomID, message)
  }
  sendCustomCommand(roomID, command, toUserList) {
    return ZegoExpressNativeModule.sendCustomCommand(roomID, command, toUserList)
  }
  startPublishingStream(streamID, channel = zego.ZegoPublishChannel.Main, config) {
    return ZegoExpressNativeModule.startPublishingStream(streamID, channel, config)
  }
  stopPublishingStream(channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.stopPublishingStream(channel)
  }
  startPreview(view, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.startPreview(view, channel)
  }
  stopPreview(channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.stopPreview(channel)
  }
  setVideoConfig(config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setVideoConfig(config, channel)
  }
  getVideoConfig(channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.getVideoConfig(channel)
  }
  setVideoMirrorMode(mode, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setVideoMirrorMode(mode, channel)
  }
  setAppOrientation(mode, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setAppOrientation(mode, channel)
  }
  setAudioConfig(config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setAudioConfig(config, channel)
  }
  getAudioConfig(channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.getAudioConfig(channel)
  }
  mutePublishStreamAudio(mute, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.mutePublishStreamAudio(mute, channel)
  }
  mutePublishStreamVideo(mute, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.mutePublishStreamVideo(mute, channel)
  }
  setCaptureVolume(volume) {
    return ZegoExpressNativeModule.setCaptureVolume(volume)
  }
  addPublishCdnUrl(streamID, targetURL) {
    return ZegoExpressNativeModule.addPublishCdnUrl(streamID, targetURL)
  }
  removePublishCdnUrl(streamID, targetURL) {
    return ZegoExpressNativeModule.removePublishCdnUrl(streamID, targetURL)
  }
  enablePublishDirectToCDN(enable, config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enablePublishDirectToCDN(enable, config, channel)
  }
  sendSEI(data, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.sendSEI(Array.from(data), channel)
  }
  enableHardwareEncoder(enable) {
    return ZegoExpressNativeModule.enableHardwareEncoder(enable)
  }
  enableH265EncodeFallback(enable) {
    return ZegoExpressNativeModule.enableH265EncodeFallback(enable)
  }
  isVideoEncoderSupported(codecID) {
    return ZegoExpressNativeModule.isVideoEncoderSupported(codecID)
  }
  startPlayingStream(streamID, view, config) {
    return ZegoExpressNativeModule.startPlayingStream(streamID, view, config)
  }
  stopPlayingStream(streamID) {
    return ZegoExpressNativeModule.stopPlayingStream(streamID)
  }
  setPlayVolume(streamID, volume) {
    return ZegoExpressNativeModule.setPlayVolume(streamID, volume)
  }
  setAllPlayStreamVolume(volume) {
    return ZegoExpressNativeModule.setAllPlayStreamVolume(volume)
  }
  setPlayStreamVideoType(streamID, streamType) {
    return ZegoExpressNativeModule.setPlayStreamVideoType(streamID, streamType)
  }
  takePublishStreamSnapshot(channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.takePublishStreamSnapshot(channel)
  }
  takePlayStreamSnapshot(streamID) {
    return ZegoExpressNativeModule.takePlayStreamSnapshot(streamID)
  }
  mutePlayStreamAudio(streamID, mute) {
    return ZegoExpressNativeModule.mutePlayStreamAudio(streamID, mute)
  }
  mutePlayStreamVideo(streamID, mute) {
    return ZegoExpressNativeModule.mutePlayStreamVideo(streamID, mute)
  }
  muteAllPlayStreamAudio(mute) {
    return ZegoExpressNativeModule.muteAllPlayStreamAudio(mute)
  }
  muteAllPlayStreamVideo(mute) {
    return ZegoExpressNativeModule.muteAllPlayStreamVideo(mute)
  }
  enableHardwareDecoder(enable) {
    return ZegoExpressNativeModule.enableHardwareDecoder(enable)
  }
  isVideoDecoderSupported(codecID) {
    return ZegoExpressNativeModule.isVideoDecoderSupported(codecID)
  }
  muteMicrophone(mute) {
    return ZegoExpressNativeModule.muteMicrophone(mute)
  }
  isMicrophoneMuted() {
    return ZegoExpressNativeModule.isMicrophoneMuted()
  }
  muteSpeaker(mute) {
    return ZegoExpressNativeModule.muteSpeaker(mute)
  }
  isSpeakerMuted() {
    return ZegoExpressNativeModule.isSpeakerMuted()
  }
  enableAudioCaptureDevice(enable) {
    return ZegoExpressNativeModule.enableAudioCaptureDevice(enable)
  }
  getAudioRouteType() {
    return ZegoExpressNativeModule.getAudioRouteType()
  }
  setAudioRouteToSpeaker(defaultToSpeaker) {
    return ZegoExpressNativeModule.setAudioRouteToSpeaker(defaultToSpeaker)
  }
  enableCamera(enable, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enableCamera(enable, channel)
  }
  useFrontCamera(enable, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.useFrontCamera(enable, channel)
  }
  startSoundLevelMonitor(config) {
    return ZegoExpressNativeModule.startSoundLevelMonitor(config)
  }
  stopSoundLevelMonitor() {
    return ZegoExpressNativeModule.stopSoundLevelMonitor()
  }
  enableHeadphoneMonitor(enable) {
    return ZegoExpressNativeModule.enableHeadphoneMonitor(enable)
  }
  enableAEC(enable) {
    return ZegoExpressNativeModule.enableAEC(enable)
  }
  enableHeadphoneAEC(enable) {
    return ZegoExpressNativeModule.enableHeadphoneAEC(enable)
  }
  setAECMode(mode) {
    return ZegoExpressNativeModule.setAECMode(mode)
  }
  enableAGC(enable) {
    return ZegoExpressNativeModule.enableAGC(enable)
  }
  enableANS(enable) {
    return ZegoExpressNativeModule.enableANS(enable)
  }
  setANSMode(mode) {
    return ZegoExpressNativeModule.setANSMode(mode)
  }
  enableBeautify(feature, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enableBeautify(feature, channel)
  }
  setBeautifyOption(option, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setBeautifyOption(option, channel)
  }
  startNetworkSpeedTest(config, interval = 3000) {
    return ZegoExpressNativeModule.startNetworkSpeedTest(config, interval)
  }
  stopNetworkSpeedTest() {
    return ZegoExpressNativeModule.stopNetworkSpeedTest()
  }
  getNetworkTimeInfo() {
    return ZegoExpressNativeModule.getNetworkTimeInfo()
  }
  enableCustomAudioIO(enable, config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enableCustomAudioIO(enable, config, channel)
  }
  enableCustomVideoCapture(enable, config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enableCustomVideoCapture(enable, config, channel)
  }
  enableCustomVideoProcessing(enable, config, channel) {
    return ZegoExpressNativeModule.enableCustomVideoProcessing(enable, config, channel)
  }
  setVideoSource(source, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setVideoSource(source, channel)
  }
  setAudioSource(source, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.setAudioSource(source, channel)
  }
  enableVideoObjectSegmentation(enable, config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enableVideoObjectSegmentation(enable, config, channel)
  }
  enableAlphaChannelVideoEncoder(enable, alphaLayout, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.enableAlphaChannelVideoEncoder(enable, alphaLayout, channel)
  }
  startScreenCaptureInApp(config) {
    return ZegoExpressNativeModule.startScreenCaptureInApp(config)
  }
  startScreenCapture(config) {
    return ZegoExpressNativeModule.startScreenCapture(config)
  }
  stopScreenCapture() {
    return ZegoExpressNativeModule.stopScreenCapture()
  }
  updateScreenCaptureConfig(config) {
    return ZegoExpressNativeModule.updateScreenCaptureConfig(config)
  }
  async createMediaPlayer() {
    var index = await ZegoExpressNativeModule.createMediaPlayer()
    if (index >= 0) {
      var mediaPlayer = new ZegoMediaPlayerImpl(index)
      ZegoExpressEngineImpl._mediaPlayerMap.set(index, mediaPlayer)
      return mediaPlayer
    }
    return null
  }
  async destroyMediaPlayer(mediaPlayer) {
    var index = mediaPlayer.getIndex()
    if (index >= 0) {
      await ZegoExpressNativeModule.destroyMediaPlayer(index)
      ZegoExpressEngineImpl._mediaPlayerMap.delete(index)
      mediaPlayer.off('mediaPlayerStateUpdate', undefined)
      mediaPlayer.off('mediaPlayerNetworkEvent', undefined)
      mediaPlayer.off('mediaPlayerPlayingProgress', undefined)
    }
    return
  }
  async createAudioEffectPlayer() {
    let index = await ZegoExpressNativeModule.createAudioEffectPlayer()
    if (index >= 0) {
      let player = new ZegoAudioEffectPlayerImpl(index)
      ZegoExpressEngineImpl._audioEffectPlayerMap.set(index, player)
      return player
    }
    return null
  }
  async destroyAudioEffectPlayer(audioEffectPlayer) {
    let index = audioEffectPlayer.getIndex()
    if (index >= 0) {
      await ZegoExpressNativeModule.destroyAudioEffectPlayer(index)
      ZegoExpressEngineImpl._audioEffectPlayerMap.delete(index)
      audioEffectPlayer.off('audioEffectPlayerStateUpdate', undefined)
    }
    return
  }
  async createRealTimeSequentialDataManager(roomID) {
    let index = await ZegoExpressNativeModule.createRealTimeSequentialDataManager(roomID)
    if (index >= 0) {
      let manager = new ZegoRealTimeSequentialDataManagerImpl(index)
      ZegoExpressEngineImpl._realTimeSequentialDataManagerMap.set(index, manager)
      return manager
    }
    return null
  }
  async destroyRealTimeSequentialDataManager(manager) {
    let index = manager.getIndex()
    if (index >= 0) {
      await ZegoExpressNativeModule.destroyRealTimeSequentialDataManager(index)
      ZegoExpressEngineImpl._realTimeSequentialDataManagerMap.delete(index)
      manager.off('receiveRealTimeSequentialData', undefined)
    }
    return
  }
  async createCopyrightedMusic() {
    if (this._copyrightedMusic) {
      return this._copyrightedMusic
    }
    try {
      let index = await ZegoExpressNativeModule.createCopyrightedMusic()
      if (index >= 0) {
        this._copyrightedMusic = new ZegoCopyrightedMusicImpl()
        return this._copyrightedMusic
      }
      return null
    } catch (error) {
      return null
    }
  }
  async destroyCopyrightedMusic(copyrightedMusic) {
    if (this._copyrightedMusic === copyrightedMusic) {
      await ZegoExpressNativeModule.destroyCopyrightedMusic()
      this._copyrightedMusic = null
    }
  }
  startRecordingCapturedData(config, channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.startRecordingCapturedData(config, channel)
  }
  stopRecordingCapturedData(channel = zego.ZegoPublishChannel.Main) {
    return ZegoExpressNativeModule.stopRecordingCapturedData(channel)
  }
  startMixerTask(task) {
    return ZegoExpressNativeModule.startMixerTask(task)
  }
  stopMixerTask(task) {
    return ZegoExpressNativeModule.stopMixerTask(task)
  }
  startEffectsEnv() {
    return ZegoExpressNativeModule.startEffectsEnv()
  }
  stopEffectsEnv() {
    return ZegoExpressNativeModule.stopEffectsEnv()
  }
  enableEffectsBeauty(enable) {
    return ZegoExpressNativeModule.enableEffectsBeauty(enable)
  }
  setEffectsBeautyParam(param) {
    return ZegoExpressNativeModule.setEffectsBeautyParam(param)
  }
  setVoiceChangerPreset(preset) {
    return ZegoExpressNativeModule.setVoiceChangerPreset(preset)
  }
  setVoiceChangerParam(param) {
    return ZegoExpressNativeModule.setVoiceChangerParam(param)
  }
  setAudioEqualizerGain(bandIndex, bandGain) {
    return ZegoExpressNativeModule.setAudioEqualizerGain(bandIndex, bandGain)
  }
  setReverbPreset(preset) {
    return ZegoExpressNativeModule.setReverbPreset(preset)
  }
  setReverbAdvancedParam(param) {
    return ZegoExpressNativeModule.setReverbAdvancedParam(param)
  }
  setReverbEchoParam(param) {
    return ZegoExpressNativeModule.setReverbEchoParam(param)
  }
  setElectronicEffects(enable, mode, tonal) {
    return ZegoExpressNativeModule.setElectronicEffects(enable, mode, tonal)
  }
  setStreamAlignmentProperty(alignment, channel) {
    return ZegoExpressNativeModule.setStreamAlignmentProperty(alignment, channel)
  }
  setAudioCaptureStereoMode(mode) {
    return ZegoExpressNativeModule.setAudioCaptureStereoMode(mode)
  }
  setPlayStreamBufferIntervalRange(streamID, minBufferInterval, maxBufferInterval) {
    return ZegoExpressNativeModule.setPlayStreamBufferIntervalRange(
      streamID,
      minBufferInterval,
      maxBufferInterval
    )
  }
  setPlayStreamsAlignmentProperty(mode) {
    return ZegoExpressNativeModule.setPlayStreamsAlignmentProperty(mode)
  }
  setAudioDeviceMode(deviceMode) {
    return ZegoExpressNativeModule.setAudioDeviceMode(deviceMode)
  }
  enableVirtualStereo(enable, angle) {
    return ZegoExpressNativeModule.enableVirtualStereo(enable, angle)
  }
  enableCustomAudioCaptureProcessing(enable, config) {
    return ZegoExpressNativeModule.enableCustomAudioCaptureProcessing(enable, config)
  }
  enableAlignedAudioAuxData(enable, param) {
    return ZegoExpressNativeModule.enableAlignedAudioAuxData(enable, param)
  }
  enableBeforeAudioPrepAudioData(enable, param) {
    return ZegoExpressNativeModule.enableBeforeAudioPrepAudioData(enable, param)
  }
  enableCustomAudioPlaybackProcessing(enable, config) {
    return ZegoExpressNativeModule.enableCustomAudioPlaybackProcessing(enable, config)
  }
  enableCustomAudioRemoteProcessing(enable, config) {
    return ZegoExpressNativeModule.enableCustomAudioRemoteProcessing(enable, config)
  }
  enableCustomAudioCaptureProcessingAfterHeadphoneMonitor(enable, config) {
    return ZegoExpressNativeModule.enableCustomAudioCaptureProcessingAfterHeadphoneMonitor(
      enable,
      config
    )
  }
}
export class ZegoMediaPlayerImpl extends zego.ZegoMediaPlayer {
  _index
  constructor(index) {
    super()
    this._index = index
  }
  on(event, callback) {
    const native_listener = (res) => {
      const { data, idx } = res
      if (idx >= 0) {
        let mediaPlayer = ZegoExpressEngineImpl._mediaPlayerMap.get(idx)
        // @ts-ignore
        callback(mediaPlayer, ...data)
      }
    }
    let map = ZegoExpressEngineImpl._listeners.get(event)
    if (map === undefined) {
      map = new Map()
      ZegoExpressEngineImpl._listeners.set(event, map)
    }
    map.set(callback, native_listener)
    ZegoEvent.addListener(Prefix + event, native_listener)
    ZegoExpressEngineImpl._listeners.set(event, map)
  }
  off(event, callback) {
    if (callback === undefined) {
      ZegoEvent.removeAllListeners(Prefix + event)
      ZegoExpressEngineImpl._listeners.delete(event)
    } else {
      const map = ZegoExpressEngineImpl._listeners.get(event)
      if (map === undefined) return
      ZegoEvent.removeListener(Prefix + event, map.get(callback))
      map.delete(callback)
    }
  }
  loadResource(path) {
    return ZegoExpressNativeModule.mediaPlayerLoadResource(this._index, path)
  }
  loadResourceWithConfig(resource) {
    return ZegoExpressNativeModule.mediaPlayerLoadResourceWithConfig(this._index, resource)
  }
  start() {
    return ZegoExpressNativeModule.mediaPlayerStart(this._index)
  }
  stop() {
    return ZegoExpressNativeModule.mediaPlayerStop(this._index)
  }
  pause() {
    return ZegoExpressNativeModule.mediaPlayerPause(this._index)
  }
  resume() {
    return ZegoExpressNativeModule.mediaPlayerResume(this._index)
  }
  setPlayerView(view) {
    return ZegoExpressNativeModule.mediaPlayerSetPlayerCanvas(this._index, view)
  }
  seekTo(millisecond) {
    return ZegoExpressNativeModule.mediaPlayerSeekTo(this._index, millisecond)
  }
  setPlaySpeed(speed) {
    return ZegoExpressNativeModule.mediaPlayerSetPlaySpeed(this._index, speed)
  }
  enableRepeat(enable) {
    return ZegoExpressNativeModule.mediaPlayerEnableRepeat(this._index, enable)
  }
  enableAux(enable) {
    return ZegoExpressNativeModule.mediaPlayerEnableAux(this._index, enable)
  }
  muteLocal(mute) {
    return ZegoExpressNativeModule.mediaPlayerMuteLocal(this._index, mute)
  }
  setVolume(volume) {
    return ZegoExpressNativeModule.mediaPlayerSetVolume(this._index, volume)
  }
  setPlayVolume(volume) {
    return ZegoExpressNativeModule.mediaPlayerSetPlayVolume(this._index, volume)
  }
  setPublishVolume(volume) {
    return ZegoExpressNativeModule.mediaPlayerSetPublishVolume(this._index, volume)
  }
  setProgressInterval(millisecond) {
    return ZegoExpressNativeModule.mediaPlayerSetProgressInterval(this._index, millisecond)
  }
  getPlayVolume() {
    return ZegoExpressNativeModule.mediaPlayerGetPlayVolume(this._index)
  }
  getPublishVolume() {
    return ZegoExpressNativeModule.mediaPlayerGetPublishVolume(this._index)
  }
  getTotalDuration() {
    return ZegoExpressNativeModule.mediaPlayerGetTotalDuration(this._index)
  }
  getCurrentProgress() {
    return ZegoExpressNativeModule.mediaPlayerGetCurrentProgress(this._index)
  }
  getAudioTrackCount() {
    return ZegoExpressNativeModule.mediaPlayerGetAudioTrackCount(this._index)
  }
  setAudioTrackIndex(index) {
    return ZegoExpressNativeModule.mediaPlayerSetAudioTrackIndex(this._index, index)
  }
  getCurrentState() {
    return ZegoExpressNativeModule.mediaPlayerGetCurrentState(this._index)
  }
  getCurrentRenderingProgress() {
    return ZegoExpressNativeModule.mediaPlayerGetCurrentRenderingProgress(this._index)
  }
  getIndex() {
    return this._index
  }
  setAudioTrackMode(mode) {
    return ZegoExpressNativeModule.mediaPlayerSetAudioTrackMode(this._index, mode)
  }
  setAudioTrackPublishIndex(index) {
    return ZegoExpressNativeModule.mediaPlayerSetAudioTrackPublishIndex(this._index, index)
  }
  enableVoiceChanger(audioChannel, enable, param) {
    return ZegoExpressNativeModule.mediaPlayerEnableVoiceChanger(
      this._index,
      audioChannel,
      enable,
      param
    )
  }
  takeSnapshot() {
    return ZegoExpressNativeModule.mediaPlayerTakeSnapshot(this._index)
  }
  setNetWorkResourceMaxCache(time, size) {
    return ZegoExpressNativeModule.mediaPlayerSetNetWorkResourceMaxCache(this._index, time, size)
  }
  getNetWorkResourceCache() {
    return ZegoExpressNativeModule.mediaPlayerGetNetWorkResourceCache(this._index)
  }
  setNetWorkBufferThreshold(threshold) {
    return ZegoExpressNativeModule.mediaPlayerSetNetWorkBufferThreshold(this._index, threshold)
  }
  enableSoundLevelMonitor(enable, millisecond) {
    return ZegoExpressNativeModule.mediaPlayerEnableSoundLevelMonitor(
      this._index,
      enable,
      millisecond
    )
  }
  enableFrequencySpectrumMonitor(enable, millisecond) {
    return ZegoExpressNativeModule.mediaPlayerEnableFrequencySpectrumMonitor(
      this._index,
      enable,
      millisecond
    )
  }
  setActiveAudioChannel(channel) {
    return ZegoExpressNativeModule.mediaPlayerSetActiveAudioChannel(this._index, channel)
  }
  getMediaInfo() {
    return ZegoExpressNativeModule.mediaPlayerGetMediaInfo(this._index)
  }
  updatePosition(position) {
    return ZegoExpressNativeModule.mediaPlayerUpdatePosition(this._index, position)
  }
  setHttpHeader(headers) {
    return ZegoExpressNativeModule.mediaPlayerSetHttpHeader(this._index, headers)
  }
  setPlayMediaStreamType(streamType) {
    return ZegoExpressNativeModule.mediaPlayerSetPlayMediaStreamType(this._index, streamType)
  }
  clearView() {
    return ZegoExpressNativeModule.mediaPlayerClearView(this._index)
  }
  enableLiveAudioEffect(enable, mode) {
    return ZegoExpressNativeModule.mediaPlayerEnableLiveAudioEffect(this._index, enable, mode)
  }
  enableLocalCache(enable, cacheDir) {
    return ZegoExpressNativeModule.mediaPlayerEnableLocalCache(this._index, enable, cacheDir)
  }
  getPlaybackStatistics() {
    return ZegoExpressNativeModule.mediaPlayerGetPlaybackStatistics(this._index)
  }
  enableViewMirror(enable) {
    return ZegoExpressNativeModule.mediaPlayerEnableViewMirror(this._index, enable)
  }
}
export class ZegoAudioEffectPlayerImpl extends zego.ZegoAudioEffectPlayer {
  _index
  constructor(index) {
    super()
    this._index = index
  }
  on(event, callback) {
    const native_listener = (res) => {
      const { data, idx } = res
      if (idx >= 0) {
        let player = ZegoExpressEngineImpl._audioEffectPlayerMap.get(idx)
        // @ts-ignore
        callback(player, ...data)
      }
    }
    let map = ZegoExpressEngineImpl._listeners.get(event)
    if (map === undefined) {
      map = new Map()
      ZegoExpressEngineImpl._listeners.set(event, map)
    }
    map.set(callback, native_listener)
    ZegoEvent.addListener(Prefix + event, native_listener)
    ZegoExpressEngineImpl._listeners.set(event, map)
  }
  off(event, callback) {
    if (callback === undefined) {
      ZegoEvent.removeAllListeners(Prefix + event)
      ZegoExpressEngineImpl._listeners.delete(event)
    } else {
      const map = ZegoExpressEngineImpl._listeners.get(event)
      if (map === undefined) return
      ZegoEvent.removeListener(Prefix + event, map.get(callback))
      map.delete(callback)
    }
  }
  start(audioEffectID, path, config) {
    return ZegoExpressNativeModule.audioEffectPlayerStart(this._index, audioEffectID, path, config)
  }
  stop(audioEffectID) {
    return ZegoExpressNativeModule.audioEffectPlayerStop(this._index, audioEffectID)
  }
  pause(audioEffectID) {
    return ZegoExpressNativeModule.audioEffectPlayerPause(this._index, audioEffectID)
  }
  resume(audioEffectID) {
    return ZegoExpressNativeModule.audioEffectPlayerResume(this._index, audioEffectID)
  }
  stopAll() {
    return ZegoExpressNativeModule.audioEffectPlayerStopAll(this._index)
  }
  pauseAll() {
    return ZegoExpressNativeModule.audioEffectPlayerPauseAll(this._index)
  }
  resumeAll() {
    return ZegoExpressNativeModule.audioEffectPlayerResumeAll(this._index)
  }
  seekTo(audioEffectID, millisecond) {
    return ZegoExpressNativeModule.audioEffectPlayerSeekTo(this._index, audioEffectID, millisecond)
  }
  setVolume(audioEffectID, volume) {
    return ZegoExpressNativeModule.audioEffectPlayerSetVolume(this._index, audioEffectID, volume)
  }
  setVolumeAll(volume) {
    return ZegoExpressNativeModule.audioEffectPlayerSetVolumeAll(this._index, volume)
  }
  getTotalDuration(audioEffectID) {
    return ZegoExpressNativeModule.audioEffectPlayerGetTotalDuration(this._index, audioEffectID)
  }
  getCurrentProgress(audioEffectID) {
    return ZegoExpressNativeModule.audioEffectPlayerGetCurrentProgress(this._index, audioEffectID)
  }
  loadResource(audioEffectID, path) {
    return ZegoExpressNativeModule.audioEffectPlayerLoadResource(this._index, audioEffectID, path)
  }
  unloadResource(audioEffectID) {
    return ZegoExpressNativeModule.audioEffectPlayerUnloadResource(this._index, audioEffectID)
  }
  getIndex() {
    return this._index
  }
}
export class ZegoRealTimeSequentialDataManagerImpl extends zego.ZegoRealTimeSequentialDataManager {
  _index
  constructor(index) {
    super()
    this._index = index
  }
  on(event, callback) {
    const native_listener = (res) => {
      const { data, idx } = res
      if (idx >= 0) {
        let manager = ZegoExpressEngineImpl._realTimeSequentialDataManagerMap.get(idx)
        // @ts-ignore
        callback(manager, ...data)
      }
    }
    let map = ZegoExpressEngineImpl._listeners.get(event)
    if (map === undefined) {
      map = new Map()
      ZegoExpressEngineImpl._listeners.set(event, map)
    }
    map.set(callback, native_listener)
    ZegoEvent.addListener(Prefix + event, native_listener)
    ZegoExpressEngineImpl._listeners.set(event, map)
  }
  off(event, callback) {
    if (callback === undefined) {
      ZegoEvent.removeAllListeners(Prefix + event)
      ZegoExpressEngineImpl._listeners.delete(event)
    } else {
      const map = ZegoExpressEngineImpl._listeners.get(event)
      if (map === undefined) return
      ZegoEvent.removeListener(Prefix + event, map.get(callback))
      map.delete(callback)
    }
  }
  startBroadcasting(streamID) {
    return ZegoExpressNativeModule.realTimeSequentialDataManagerStartBroadcasting(
      this._index,
      streamID
    )
  }
  stopBroadcasting(streamID) {
    return ZegoExpressNativeModule.realTimeSequentialDataManagerStopBroadcasting(
      this._index,
      streamID
    )
  }
  startSubscribing(streamID) {
    return ZegoExpressNativeModule.realTimeSequentialDataManagerStartSubscribing(
      this._index,
      streamID
    )
  }
  stopSubscribing(streamID) {
    return ZegoExpressNativeModule.realTimeSequentialDataManagerStopSubscribing(
      this._index,
      streamID
    )
  }
  sendRealTimeSequentialData(data, streamID) {
    return ZegoExpressNativeModule.realTimeSequentialDataManagerSendRealTimeSequentialData(
      this._index,
      Array.from(data),
      streamID
    )
  }
  getIndex() {
    return this._index
  }
}
export class ZegoCopyrightedMusicImpl extends zego.ZegoCopyrightedMusic {
  _eventListeners = new Map()
  constructor() {
    super()
  }
  on(event, callback) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Map())
    }
    const native_listener = (res) => {
      const { data, idx } = res
      if (idx >= 0) {
        // @ts-ignore
        callback(ZegoExpressEngineImpl.getInstance()._copyrightedMusic, ...data)
      }
    }
    this._eventListeners.get(event).set(callback, native_listener)
    ZegoEvent.addListener(Prefix + 'CopyrightedMusic' + event, native_listener)
  }
  off(event, callback) {
    if (!this._eventListeners.has(event)) return
    if (callback && this._eventListeners.get(event).has(callback)) {
      const native_listener = this._eventListeners.get(event).get(callback)
      ZegoEvent.removeListener(Prefix + 'CopyrightedMusic' + event, native_listener)
      this._eventListeners.get(event).delete(callback)
    } else {
      this._eventListeners.get(event).forEach((native_listener, callback) => {
        ZegoEvent.removeListener(Prefix + 'CopyrightedMusic' + event, native_listener)
      })
      this._eventListeners.get(event).clear()
    }
  }
  initCopyrightedMusic(config) {
    return ZegoExpressNativeModule.copyrightedMusicInit(config)
  }
  getCacheSize() {
    return ZegoExpressNativeModule.copyrightedMusicGetCacheSize()
  }
  clearCache() {
    return ZegoExpressNativeModule.copyrightedMusicClearCache()
  }
  sendExtendedRequest(command, params) {
    return ZegoExpressNativeModule.copyrightedMusicSendExtendedRequest(command, params)
  }
  getLrcLyric(config) {
    return ZegoExpressNativeModule.copyrightedMusicGetLrcLyric(config)
  }
  getKrcLyricByToken(krcToken) {
    return ZegoExpressNativeModule.copyrightedMusicGetKrcLyricByToken(krcToken)
  }
  requestResource(config) {
    return ZegoExpressNativeModule.copyrightedMusicRequestResource(config)
  }
  getSharedResource(config) {
    return ZegoExpressNativeModule.copyrightedMusicGetSharedResource(config)
  }
  download(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicDownload(resourceID)
  }
  cancelDownload(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicCancelDownload(resourceID)
  }
  queryCache(config) {
    return ZegoExpressNativeModule.copyrightedMusicQueryCache(config)
  }
  getDuration(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetDuration(resourceID)
  }
  setScoringLevel(level) {
    return ZegoExpressNativeModule.copyrightedMusicSetScoringLevel(level)
  }
  startScore(resourceID, pitchValueInterval) {
    return ZegoExpressNativeModule.copyrightedMusicStartScore(resourceID, pitchValueInterval)
  }
  pauseScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicPauseScore(resourceID)
  }
  resumeScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicResumeScore(resourceID)
  }
  stopScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicStopScore(resourceID)
  }
  resetScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicResetScore(resourceID)
  }
  getPreviousScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetPreviousScore(resourceID)
  }
  getAverageScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetAverageScore(resourceID)
  }
  getTotalScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetTotalScore(resourceID)
  }
  getFullScore(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetFullScore(resourceID)
  }
  getStandardPitch(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetStandardPitch(resourceID)
  }
  getCurrentPitch(resourceID) {
    return ZegoExpressNativeModule.copyrightedMusicGetCurrentPitch(resourceID)
  }
}
