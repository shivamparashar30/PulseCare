import {
  ZegoAudioEffectPlayerListener,
  ZegoMediaPlayerListener,
  ZegoRealTimeSequentialDataEventHandler,
  ZegoCopyrightedMusicListener,
} from './ZegoExpressEventHandler'
/** Room scenario. */
export declare enum ZegoScenario {
  /** [Deprecated] Legacy general scenario, this scenario has been deprecated since version 3.0.0, and it is not recommended to use, please migrate to other new scenario as soon as possible. */
  General = 0,
  /** [Deprecated] Legacy communication scenario, this scenario has been deprecated since version 3.0.0, and it is not recommended to use, please migrate to other new scenario as soon as possible. */
  Communication = 1,
  /** [Deprecated] Legacy live broadcast scenario, this scenario has been deprecated since version 3.0.0, and it is not recommended to use, please migrate to other new scenario as soon as possible. */
  Live = 2,
  /** Available since: 3.0.0. Description: The default (generic) scenario. If none of the following scenarios conform to your actual application scenario, this default scenario can be used. */
  Default = 3,
  /** Available since: 3.0.0. Description: Standard video call scenario, it is suitable for one-to-one video call scenarios. */
  StandardVideoCall = 4,
  /** Available since: 3.0.0. Description: High quality video call scenario, it is similar to the standard video call scenario, but this scenario uses a higher video frame rate, bit rate, and resolution (540p) by default, which is suitable for video call scenario with high image quality requirements. */
  HighQualityVideoCall = 5,
  /** Available since: 3.0.0. Description: Standard chatroom scenario, suitable for multi-person pure voice calls (low data usage). Note: On the ExpressVideo SDK, the camera is not enabled by default in this scenario. */
  StandardChatroom = 6,
  /** Available since: 3.0.0. Description: High quality chatroom scenario, it is similar to the standard chatroom scenario, but this scenario uses a higher audio bit rate than the standard chatroom scenario by default. It is suitable for multi-person pure voice call scenarios with high requirements on sound quality. Note: On the ExpressVideo SDK, the camera is not enabled by default in this scenario. */
  HighQualityChatroom = 7,
  /** Available since: 3.0.0. Description: Live broadcast scenario, it is suitable for one-to-many live broadcast scenarios such as shows, games, e-commerce, and large educational classes. The audio and video quality, fluency, and compatibility have been optimized. Note: Even in live broadcast scenarios, the SDK has no business "roles" (such as anchors and viewers), and all users in the room can publish and play streams. */
  Broadcast = 8,
  /** Available since: 3.0.0. Description: Karaoke (KTV) scenario, it is suitable for real-time chorus and online karaoke scenarios, and has optimized delay, sound quality, ear return, echo cancellation, etc., and also ensures accurate alignment and ultra-low delay when multiple people chorus. */
  Karaoke = 9,
  /** Available since: 3.3.0. Description: Standard voice call scenario, it is suitable for one-to-one video or voice call scenarios. Note: On the ExpressVideo SDK, the camera is not enabled by default in this scenario. */
  StandardVoiceCall = 10,
}
/** Room mode. */
export declare enum ZegoRoomMode {
  /** Single room mode. */
  SingleRoom = 0,
  /** Multiple room mode. */
  MultiRoom = 1,
}
/** engine state. */
export declare enum ZegoEngineState {
  /** The engine has started */
  Start = 0,
  /** The engine has stoped */
  Stop = 1,
}
/** Room state. */
export declare enum ZegoRoomState {
  /** Unconnected state, enter this state before logging in and after exiting the room. If there is a steady state abnormality in the process of logging in to the room, such as AppID or Token are incorrect, or if the same user name is logged in elsewhere and the local end is KickOut, it will enter this state. */
  Disconnected = 0,
  /** The state that the connection is being requested. It will enter this state after successful execution login room function. The display of the UI is usually performed using this state. If the connection is interrupted due to poor network quality, the SDK will perform an internal retry and will return to the requesting connection status. */
  Connecting = 1,
  /** The status that is successfully connected. Entering this status indicates that the login to the room has been successful. The user can receive the callback notification of the user and the stream information in the room. */
  Connected = 2,
}
/** Room state change reason. */
export declare enum ZegoRoomStateChangedReason {
  /** Logging in to the room. When calling [loginRoom] to log in to the room or [switchRoom] to switch to the target room, it will enter this state, indicating that it is requesting to connect to the server. The application interface is usually displayed through this state. */
  Logining = 0,
  /** Log in to the room successfully. When the room is successfully logged in or switched, it will enter this state, indicating that the login to the room has been successful, and users can normally receive callback notifications of other users in the room and all stream information additions and deletions. */
  Logined = 1,
  /** Failed to log in to the room. When the login or switch room fails, it will enter this state, indicating that the login or switch room has failed, for example, AppID or Token is incorrect, etc. */
  LoginFailed = 2,
  /** The room connection is temporarily interrupted. If the interruption occurs due to poor network quality, the SDK will retry internally. */
  Reconnecting = 3,
  /** The room is successfully reconnected. If there is an interruption due to poor network quality, the SDK will retry internally, and enter this state after successful reconnection. */
  Reconnected = 4,
  /** The room fails to reconnect. If there is an interruption due to poor network quality, the SDK will retry internally, and enter this state after the reconnection fails. */
  ReconnectFailed = 5,
  /** Kicked out of the room by the server. For example, if you log in to the room with the same user name in other places, and the local end is kicked out of the room, it will enter this state. */
  KickOut = 6,
  /** Logout of the room is successful. It is in this state by default before logging into the room. When calling [logoutRoom] to log out of the room successfully or [switchRoom] to log out of the current room successfully, it will enter this state. */
  Logout = 7,
  /** Failed to log out of the room. Enter this state when calling [logoutRoom] fails to log out of the room or [switchRoom] fails to log out of the current room internally. */
  LogoutFailed = 8,
}
/** Publish channel. */
export declare enum ZegoPublishChannel {
  /** The main (default/first) publish channel. */
  Main = 0,
  /** The auxiliary (second) publish channel */
  Aux = 1,
  /** The third publish channel */
  Third = 2,
  /** The fourth publish channel */
  Fourth = 3,
}
/** Video rendering fill mode. */
export declare enum ZegoViewMode {
  /** The proportional scaling up, there may be black borders */
  AspectFit = 0,
  /** The proportional zoom fills the entire View and may be partially cut */
  AspectFill = 1,
  /** Fill the entire view, the image may be stretched */
  ScaleToFill = 2,
}
/** Mirror mode for previewing or playing the of the stream. */
export declare enum ZegoVideoMirrorMode {
  /** The mirror image only for previewing locally. This mode is used by default. When the mobile terminal uses a rear camera, this mode is still used by default, but it does not work. Local preview does not set mirroring. */
  OnlyPreviewMirror = 0,
  /** Both the video previewed locally and the far end playing the stream will see mirror image. */
  BothMirror = 1,
  /** Both the video previewed locally and the far end playing the stream will not see mirror image. */
  NoMirror = 2,
  /** The mirror image only for far end playing the stream. */
  OnlyPublishMirror = 3,
}
/** Publish stream status. */
export declare enum ZegoPublisherState {
  /** The state is not published, and it is in this state before publishing the stream. If a steady-state exception occurs in the publish process, such as AppID or Token are incorrect, or if other users are already publishing the stream, there will be a failure and enter this state. */
  NoPublish = 0,
  /** The state that it is requesting to publish the stream after the [startPublishingStream] function is successfully called. The UI is usually displayed through this state. If the connection is interrupted due to poor network quality, the SDK will perform an internal retry and will return to the requesting state. */
  PublishRequesting = 1,
  /** The state that the stream is being published, entering the state indicates that the stream has been successfully published, and the user can communicate normally. */
  Publishing = 2,
}
/** Voice changer preset value. */
export declare enum ZegoVoiceChangerPreset {
  /** No Voice changer */
  None = 0,
  /** Male to child voice (loli voice effect) */
  MenToChild = 1,
  /** Male to female voice (kindergarten voice effect) */
  MenToWomen = 2,
  /** Female to child voice */
  WomenToChild = 3,
  /** Female to male voice */
  WomenToMen = 4,
  /** Foreigner voice effect */
  Foreigner = 5,
  /** Autobot Optimus Prime voice effect */
  OptimusPrime = 6,
  /** Android robot voice effect */
  Android = 7,
  /** Ethereal voice effect */
  Ethereal = 8,
  /** Magnetic(Male) voice effect */
  MaleMagnetic = 9,
  /** Fresh(Female) voice effect */
  FemaleFresh = 10,
  /** Electronic effects in C major voice effect */
  MajorC = 11,
  /** Electronic effects in A minor voice effect */
  MinorA = 12,
  /** Electronic effects in harmonic minor voice effect */
  HarmonicMinor = 13,
  /** Female Vitality Sound effect */
  FemaleEnergetic = 14,
  /** Richness effect */
  RichNess = 15,
  /** Muffled effect */
  Muffled = 16,
  /** Roundness effect */
  Roundness = 17,
  /** Falsetto effect */
  Falsetto = 18,
  /** Fullness effect */
  Fullness = 19,
  /** Clear effect */
  Clear = 20,
  /** Hight effect */
  HighlyResonant = 21,
  /** Loud clear effect */
  LoudClear = 22,
  /** Minions effect */
  Minions = 23,
  /** Sunshine effect */
  Sunshine = 24,
  /** Gentle effect */
  Gentle = 25,
  /** Sweet effect */
  Sweet = 26,
  /** Sweet male effect */
  SweetMale = 27,
  /** Sweet female effec */
  SweetFemale = 28,
  /** Bright effect */
  Bright = 29,
  /** Autobot effect */
  Autobot = 30,
  /** Out of power effect */
  OutOfPower = 31,
}
/** Reverberation preset value. */
export declare enum ZegoReverbPreset {
  /** No Reverberation */
  None = 0,
  /** Soft room reverb effect */
  SoftRoom = 1,
  /** Large room reverb effect */
  LargeRoom = 2,
  /** Concert hall reverb effect */
  ConcertHall = 3,
  /** Valley reverb effect */
  Valley = 4,
  /** Recording studio reverb effect */
  RecordingStudio = 5,
  /** Basement reverb effect */
  Basement = 6,
  /** KTV reverb effect */
  KTV = 7,
  /** Popular reverb effect */
  Popular = 8,
  /** Rock reverb effect */
  Rock = 9,
  /** Vocal concert reverb effect */
  VocalConcert = 10,
  /** Gramophone reverb effect */
  GramoPhone = 11,
  /** Enhanced KTV reverb effect. Provide KTV effect with more concentrated voice and better brightness. Compared with the original KTV reverb effect, the reverberation time is shortened and the dry-wet ratio is increased. */
  EnhancedKTV = 12,
  /** Enhanced Rock reverb effect */
  EnhancedRock = 13,
  /** Enhanced misty reverb effect */
  EnhancedMisty = 14,
  /** Hip Hop reverb effect */
  HipHop = 15,
  /** Misty reverb effect */
  Misty = 16,
  /** 3D voice reverb effect */
  ThreeDimensionalVoice = 17,
}
/** Mode of Electronic Effects. */
export declare enum ZegoElectronicEffectsMode {
  /** Major */
  Major = 0,
  /** Minor */
  Minor = 1,
  /** Harmonic Minor */
  HarmonicMinor = 2,
}
/** Video configuration resolution and bitrate preset enumeration. The preset resolutions are adapted for mobile and desktop. On mobile, height is longer than width, and desktop is the opposite. For example, 1080p is actually 1080(w) x 1920(h) on mobile and 1920(w) x 1080(h) on desktop. */
export declare enum ZegoVideoConfigPreset {
  /** Set the resolution to 320x180, the default is 15 fps, the code rate is 300 kbps */
  Preset180P = 0,
  /** Set the resolution to 480x270, the default is 15 fps, the code rate is 400 kbps */
  Preset270P = 1,
  /** Set the resolution to 640x360, the default is 15 fps, the code rate is 600 kbps */
  Preset360P = 2,
  /** Set the resolution to 960x540, the default is 15 fps, the code rate is 1200 kbps */
  Preset540P = 3,
  /** Set the resolution to 1280x720, the default is 15 fps, the code rate is 1500 kbps */
  Preset720P = 4,
  /** Set the resolution to 1920x1080, the default is 15 fps, the code rate is 3000 kbps */
  Preset1080P = 5,
}
/** Stream quality level. */
export declare enum ZegoStreamQualityLevel {
  /** Excellent */
  Excellent = 0,
  /** Good */
  Good = 1,
  /** Normal */
  Medium = 2,
  /** Bad */
  Bad = 3,
  /** Failed */
  Die = 4,
  /** Unknown */
  Unknown = 5,
}
/** Audio channel type. */
export declare enum ZegoAudioChannel {
  /** Unknown */
  Unknown = 0,
  /** Mono */
  Mono = 1,
  /** Stereo */
  Stereo = 2,
}
/** Audio capture stereo mode. */
export declare enum ZegoAudioCaptureStereoMode {
  /** Disable stereo capture, that is, mono. */
  None = 0,
  /** Always enable stereo capture. */
  Always = 1,
  /** [Deprecated] Same as [Always], that is, always enable stereo capture, this mode has been deprecated since version 2.16.0. */
  Adaptive = 2,
}
/** Audio codec ID. */
export declare enum ZegoAudioCodecID {
  /** Default, determined by the [scenario] when calling [createEngine]. */
  Default = 0,
  /** Can be used for RTC and CDN streaming; bitrate range from 10kbps to 128kbps; supports stereo; latency is around 500ms. Server cloud transcoding is required when communicating with the Web SDK, and it is not required when relaying to CDN. */
  Normal = 1,
  /** Can be used for RTC and CDN streaming; good compatibility; bitrate range from 16kbps to 192kbps; supports stereo; latency is around 350ms; the sound quality is worse than [Normal] in the same (low) bitrate. Server cloud transcoding is required when communicating with the Web SDK, and it is not required when relaying to CDN. */
  Normal2 = 2,
  /** Not recommended; if you need to use it, please contact ZEGO technical support. Can only be used for RTC streaming. */
  Normal3 = 3,
  /** Not recommended; if you need to use it, please contact ZEGO technical support. Can only be used for RTC streaming. */
  Low = 4,
  /** Not recommended; if you need to use it, please contact ZEGO technical support. Can only be used for RTC streaming; maximum bitrate is 16kbps. */
  Low2 = 5,
  /** Can only be used for RTC streaming; bitrate range from 6kbps to 192kbps; supports stereo; latency is around 200ms; Under the same bitrate (low bitrate), the sound quality is significantly better than [Normal] and [Normal2]; low CPU overhead. Server cloud transcoding is not required when communicating with the Web SDK, and it is required when relaying to CDN. */
  Low3 = 6,
}
/** Video codec ID. */
export declare enum ZegoVideoCodecID {
  /** Default (H.264) */
  Default = 0,
  /** Scalable Video Coding (H.264 SVC) */
  Svc = 1,
  /** VP8 */
  Vp8 = 2,
  /** H.265 */
  H265 = 3,
  /** Dualstream Scalable Video Coding */
  H264DualStream = 4,
  /** Unknown Video Coding */
  Unknown = 100,
}
/** Video screen rotation direction. */
export declare enum ZegoOrientation {
  /** Not rotate */
  PortraitUp = 0,
  /** Rotate 90 degrees counterclockwise */
  LandscapeLeft = 1,
  /** Rotate 180 degrees counterclockwise */
  PortraitDown = 2,
  /** Rotate 270 degrees counterclockwise */
  LandscapeRight = 3,
}
/** Video stream type */
export declare enum ZegoVideoStreamType {
  /** The type to be played depends on the network status */
  Default = 0,
  /** small resolution type */
  Small = 1,
  /** big resolution type */
  Big = 2,
}
/** Audio echo cancellation mode. */
export declare enum ZegoAECMode {
  /** Aggressive echo cancellation may affect the sound quality slightly, but the echo will be very clean. */
  Aggressive = 0,
  /** Moderate echo cancellation, which may slightly affect a little bit of sound, but the residual echo will be less. */
  Medium = 1,
  /** Comfortable echo cancellation, that is, echo cancellation does not affect the sound quality of the sound, and sometimes there may be a little echo, but it will not affect the normal listening. */
  Soft = 2,
  /** AI echo cancellation. Supports intelligent recognition and elimination of echo, with a significant improvement in vocal fidelity compared to traditional AEC algorithms, without additional delay or power consumption increase. */
  AI = 3,
  /** AI Aggressive echo cancellation, Similar to ZegoAECModeAI, it offers cleaner echo cancellation in scenarios with significant reverberation, making it recommended for use in chat rooms with large reverberation. It can be left off in other scenarios, especially in KTV settings where music is played out loud, as it may cause slightly more distortion to the human voice. */
  AIAggressive = 4,
  /** Balanced AI echo cancellation, Compared with ZegoAECModeAIAggressive, the echo suppression is cleaner, but the human voice will be more damaged. It is recommended to use it in voice chat scenarios. */
  AIBalanced = 5,
}
/** Active Noise Suppression mode. */
export declare enum ZegoANSMode {
  /** Soft ANS. In most instances, the sound quality will not be damaged, but some noise will remain. */
  Soft = 0,
  /** Medium ANS. It may damage some sound quality, but it has a good noise reduction effect. */
  Medium = 1,
  /** Aggressive ANS. It may significantly impair the sound quality, but it has a good noise reduction effect. */
  Aggressive = 2,
  /** AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  AI = 3,
  /** Balanced AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  AIBalanced = 4,
  /** Low latency AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  AILowLatency = 5,
  /** Aggressive AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  AIAggressive = 6,
}
/** Stream alignment mode. */
export declare enum ZegoStreamAlignmentMode {
  /** Disable stream alignment. */
  None = 0,
  /** Streams should be aligned as much as possible, call the [setStreamAlignmentProperty] function to enable the stream alignment of the push stream network time alignment of the specified channel. */
  Try = 1,
}
/** Traffic control property (bitmask enumeration). */
export declare enum ZegoTrafficControlProperty {
  /** Basic (Adaptive (reduce) video bitrate) */
  Basic = 0,
  /** Adaptive (reduce) video FPS */
  AdaptiveFPS = 1,
  /** Adaptive (reduce) video resolution */
  AdaptiveResolution = 2,
  /** Adaptive (reduce) audio bitrate */
  AdaptiveAudioBitrate = 4,
}
/** Video transmission mode when current bitrate is lower than the set minimum bitrate. */
export declare enum ZegoTrafficControlMinVideoBitrateMode {
  /** Stop video transmission when current bitrate is lower than the set minimum bitrate */
  NoVideo = 0,
  /** Video is sent at a very low frequency (no more than 2fps) which is lower than the set minimum bitrate */
  UltraLowFPS = 1,
}
/** Playing stream status. */
export declare enum ZegoPlayerState {
  /** The state of the flow is not played, and it is in this state before the stream is played. If the steady flow anomaly occurs during the playing process, such as AppID or Token are incorrect, it will enter this state. */
  NoPlay = 0,
  /** The state that the stream is being requested for playing. After the [startPlayingStream] function is successfully called, it will enter the state. The UI is usually displayed through this state. If the connection is interrupted due to poor network quality, the SDK will perform an internal retry and will return to the requesting state. */
  PlayRequesting = 1,
  /** The state that the stream is being playing, entering the state indicates that the stream has been successfully played, and the user can communicate normally. */
  Playing = 2,
}
/** Media event when playing. */
export declare enum ZegoPlayerMediaEvent {
  /** Audio stuck event when playing */
  AudioBreakOccur = 0,
  /** Audio stuck event recovery when playing */
  AudioBreakResume = 1,
  /** Video stuck event when playing */
  VideoBreakOccur = 2,
  /** Video stuck event recovery when playing */
  VideoBreakResume = 3,
}
/** Stream Resource Mode */
export declare enum ZegoStreamResourceMode {
  /** Default mode. The SDK will automatically select the streaming resource according to the cdnConfig parameters set by the player config and the ready-made background configuration. */
  Default = 0,
  /** Playing stream only from CDN. */
  OnlyCDN = 1,
  /** Playing stream only from L3. */
  OnlyL3 = 2,
  /** Playing stream only from RTC. */
  OnlyRTC = 3,
  /** [Deprecated] CDN Plus mode. The SDK will automatically select the streaming resource according to the network condition. */
  CDNPlus = 4,
  /** Custom mode. The SDK selects the streaming resource based on the customResourceConfig parameter of the streaming settings. */
  Custom = 5,
}
/** Stream Switch Resource Mode */
export declare enum ZegoStreamResourceSwitchMode {
  /** Default mode. The SDK will automatically select the streaming resource according to the parameters set by the player config and the ready-made background configuration. */
  Default = 0,
  /** Auto switch to RTC resource when publishing. */
  SwitchToRTC = 1,
  /** Keep using original resource when publishing, not switch to RTC resource. */
  KeepOriginal = 2,
}
/** Stream Resource Type */
export declare enum ZegoStreamResourceType {
  /** Default mode. The SDK will automatically select the streaming resource according to the parameters set by the player config and the ready-made background configuration. */
  Default = 0,
  /** CDN resource. */
  CDN = 1,
  /** L3 resource. */
  L3 = 2,
}
/** Update type. */
export declare enum ZegoUpdateType {
  /** Add */
  Add = 0,
  /** Delete */
  Delete = 1,
}
/** State of CDN relay. */
export declare enum ZegoStreamRelayCDNState {
  /** The state indicates that there is no CDN relay */
  NoRelay = 0,
  /** The CDN relay is being requested */
  RelayRequesting = 1,
  /** Entering this status indicates that the CDN relay has been successful */
  Relaying = 2,
}
/** Reason for state of CDN relay changed. */
export declare enum ZegoStreamRelayCDNUpdateReason {
  /** No error */
  None = 0,
  /** Server error */
  ServerError = 1,
  /** Handshake error */
  HandshakeFailed = 2,
  /** Access point error */
  AccessPointError = 3,
  /** Stream create failure */
  CreateStreamFailed = 4,
  /** Bad stream ID */
  BadName = 5,
  /** CDN server actively disconnected */
  CDNServerDisconnected = 6,
  /** Active disconnect */
  Disconnected = 7,
  /** All mixer input streams sessions closed */
  MixStreamAllInputStreamClosed = 8,
  /** All mixer input streams have no data */
  MixStreamAllInputStreamNoData = 9,
  /** Internal error of stream mixer server */
  MixStreamServerInternalError = 10,
}
/** Device type. */
export declare enum ZegoDeviceType {
  /** Unknown device type. */
  Unknown = 0,
  /** Camera device. */
  Camera = 1,
  /** Microphone device. */
  Microphone = 2,
  /** Speaker device. */
  Speaker = 3,
  /** Audio device. (Other audio device that cannot be accurately classified into microphones or speakers.) */
  AudioDevice = 4,
  /** Audio Session. */
  AudioSession = 5,
}
/** The exception type for the device. */
export declare enum ZegoDeviceExceptionType {
  /** Unknown device exception. */
  Unknown = 0,
  /** Generic device exception. */
  Generic = 1,
  /** Invalid device ID exception. */
  InvalidId = 2,
  /** Device permission is not granted. */
  PermissionNotGranted = 3,
  /** The capture frame rate of the device is 0. */
  ZeroCaptureFps = 4,
  /** The device is being occupied. */
  DeviceOccupied = 5,
  /** The device is unplugged (not plugged in). */
  DeviceUnplugged = 6,
  /** The device requires the system to restart before it can work (Windows platform only). */
  RebootRequired = 7,
  /** The system media service is unavailable, e.g. when the iOS system detects that the current pressure is huge (such as playing a lot of animation), it is possible to disable all media related services (Apple platform only). */
  MediaServicesWereLost = 8,
  /** The device is being occupied by Siri (Apple platform only). */
  SiriIsRecording = 9,
  /** The device captured sound level is too low (Windows platform only). */
  SoundLevelTooLow = 10,
  /** The device is being occupied, and maybe cause by iPad magnetic case (Apple platform only). */
  MagneticCase = 11,
  /** Audio session deactive (Apple platform only). */
  AudioSessionDeactive = 12,
  /** Audio session category change (Apple platform only). */
  AudioSessionCategoryChange = 13,
}
/** Remote device status. */
export declare enum ZegoRemoteDeviceState {
  /** Device on */
  Open = 0,
  /** General device error */
  GenericError = 1,
  /** Invalid device ID */
  InvalidID = 2,
  /** No permission */
  NoAuthorization = 3,
  /** Captured frame rate is 0 */
  ZeroFPS = 4,
  /** The device is occupied */
  InUseByOther = 5,
  /** The device is not plugged in or unplugged */
  Unplugged = 6,
  /** The system needs to be restarted */
  RebootRequired = 7,
  /** System media services stop, such as under the iOS platform, when the system detects that the current pressure is huge (such as playing a lot of animation), it is possible to disable all media related services. */
  SystemMediaServicesLost = 8,
  /** The remote user calls [enableCamera] or [enableAudioCaptureDevice] to disable the camera or microphone. */
  Disable = 9,
  /** The remote user actively calls [muteMicrophone] or [mutePublishStreamAudio] or [mutePublishStreamVideo] to stop publish the audio or video stream. */
  Mute = 10,
  /** The device is interrupted, such as a phone call interruption, etc. */
  Interruption = 11,
  /** There are multiple apps at the same time in the foreground, such as the iPad app split screen, the system will prohibit all apps from using the camera. */
  InBackground = 12,
  /** CDN server actively disconnected */
  MultiForegroundApp = 13,
  /** The system is under high load pressure and may cause abnormal equipment. */
  BySystemPressure = 14,
  /** The remote device is not supported to publish the device state. */
  NotSupport = 15,
}
/** Audio device mode. */
export declare enum ZegoAudioDeviceMode {
  /** Enable system echo cancellation. */
  Communication = 1,
  /** The system echo cancellation function is disabled. */
  General = 2,
  /** Automatically select whether to enable system echo cancellation based on the scenario. */
  Auto = 3,
  /** Enable system echo cancellation. Compared with Communication, this mode always occupies the microphone device. */
  Communication2 = 4,
  /** Enable system echo cancellation. Compared with Communication, in this mode, the microphone is released and the media volume is reduced. */
  Communication3 = 5,
  /** Disable system echo cancellation. Compared with General, this mode is not released when a microphone device is used. */
  General2 = 6,
  /** Disable system echo cancellation. Compared with General, this mode will always occupy the microphone device. */
  General3 = 7,
  /** Enable system echo cancellation. Compared with Communication, this mode of wheat after releasing the microphone, maintain the call volume. */
  Communication4 = 8,
}
/** Audio route */
export declare enum ZegoAudioRoute {
  /** Speaker */
  Speaker = 0,
  /** Headphone */
  Headphone = 1,
  /** Bluetooth device */
  Bluetooth = 2,
  /** Receiver */
  Receiver = 3,
  /** External USB audio device */
  ExternalUSB = 4,
  /** Apple AirPlay */
  AirPlay = 5,
}
/** Mix stream content type. */
export declare enum ZegoMixerInputContentType {
  /** Mix stream for audio only */
  Audio = 0,
  /** Mix stream for both audio and video */
  Video = 1,
  /** Mix stream for video only. On web platforms, this property does not take effect */
  VideoOnly = 2,
}
/** Video frame buffer type. */
export declare enum ZegoVideoBufferType {
  /** Raw data type video frame */
  Unknown = 0,
  /** Raw data type video frame */
  RawData = 1,
  /** Encoded data type video frame */
  EncodedData = 2,
  /** Texture 2D type video frame */
  GLTexture2D = 3,
  /** CVPixelBuffer type video frame */
  CVPixelBuffer = 4,
  /** Surface Texture type video frame */
  SurfaceTexture = 5,
  /** GL_TEXTURE_EXTERNAL_OES type video frame */
  GLTextureExternalOES = 6,
  /** Texture 2D and raw data type video frame */
  GLTexture2DAndRawData = 7,
  /** D3D Texture2D type video frame */
  D3DTexture2D = 8,
  /** CVPixelBuffer type nv12 format video frame. Only for custom video processing */
  NV12CVPixelBuffer = 9,
}
/** Audio Config Preset. */
export declare enum ZegoAudioConfigPreset {
  /** Basic sound quality (16 kbps, Mono, ZegoAudioCodecIDDefault) */
  BasicQuality = 0,
  /** Standard sound quality (48 kbps, Mono, ZegoAudioCodecIDDefault) */
  StandardQuality = 1,
  /** Standard sound quality (56 kbps, Stereo, ZegoAudioCodecIDDefault) */
  StandardQualityStereo = 2,
  /** High sound quality (128 kbps, Mono, ZegoAudioCodecIDDefault) */
  HighQuality = 3,
  /** High sound quality (192 kbps, Stereo, ZegoAudioCodecIDDefault) */
  HighQualityStereo = 4,
}
/** Player state. */
export declare enum ZegoMediaPlayerState {
  /** Not playing */
  NoPlay = 0,
  /** Playing */
  Playing = 1,
  /** Pausing */
  Pausing = 2,
  /** End of play */
  PlayEnded = 3,
}
/** Player audio track mode. */
export declare enum ZegoMediaPlayerAudioTrackMode {
  /** Normal audio track mode */
  Normal = 0,
  /** Multiple audio track mode */
  Multiple = 1,
}
/** Player network event. */
export declare enum ZegoMediaPlayerNetworkEvent {
  /** Network resources are not playing well, and start trying to cache data */
  BufferBegin = 0,
  /** Network resources can be played smoothly */
  BufferEnded = 1,
}
/** Audio channel. */
export declare enum ZegoMediaPlayerAudioChannel {
  /** Audio channel left */
  Left = 0,
  /** Audio channel right */
  Right = 1,
  /** Audio channel all */
  All = 2,
}
/** Media player first frame event type. */
export declare enum ZegoMediaPlayerFirstFrameEvent {
  /** The first video frame is rendered event. */
  VideoRendered = 0,
  /** The first audio frame is rendered event. */
  AudioRendered = 1,
}
/** AudioEffectPlayer state. */
export declare enum ZegoAudioEffectPlayState {
  /** Not playing */
  NoPlay = 0,
  /** Playing */
  Playing = 1,
  /** Pausing */
  Pausing = 2,
  /** End of play */
  PlayEnded = 3,
}
/** audio sample rate. */
export declare enum ZegoAudioSampleRate {
  /** Unknown */
  Unknown = 0,
  /** 8K */
  SampleRate8K = 8000,
  /** 16K */
  SampleRate16K = 16000,
  /** 22.05K */
  SampleRate22K = 22050,
  /** 24K */
  SampleRate24K = 24000,
  /** 32K */
  SampleRate32K = 32000,
  /** 44.1K */
  SampleRate44K = 44100,
  /** 48K */
  SampleRate48K = 48000,
}
/** Audio capture source type. */
export declare enum ZegoAudioSourceType {
  /** Default audio capture source (the main channel uses custom audio capture by default; the aux channel uses the same sound as main channel by default). */
  Default = 0,
  /** Use custom audio capture, refer to [enableCustomAudioIO] or [setAudioSource]. */
  Custom = 1,
  /** Use media player as audio source, only support aux channel. */
  MediaPlayer = 2,
  /** No audio source. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  None = 3,
  /** Using microphone as audio source. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  Microphone = 4,
  /** Using main channel as audio source. Ineffective when used in main channel. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  MainPublishChannel = 5,
  /** Using screen capture as audio source. Typically used in mobile screen sharing scenarios. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  ScreenCapture = 6,
}
/** Record type. */
export declare enum ZegoDataRecordType {
  /** This field indicates that the Express-Audio SDK records audio by default, and the Express-Video SDK records audio and video by default. When recording files in .aac format, audio is also recorded by default. */
  Default = 0,
  /** only record audio */
  OnlyAudio = 1,
  /** only record video, Audio SDK and recording .aac format files are invalid. */
  OnlyVideo = 2,
  /** record audio and video. Express-Audio SDK and .aac format files are recorded only audio. */
  AudioAndVideo = 3,
}
/** Record state. */
export declare enum ZegoDataRecordState {
  /** Unrecorded state, which is the state when a recording error occurs or before recording starts. */
  NoRecord = 0,
  /** Recording in progress, in this state after successfully call [startRecordingCapturedData] function */
  Recording = 1,
  /** Record successs */
  Success = 2,
}
/** Network mode */
export declare enum ZegoNetworkMode {
  /** Offline (No network) */
  Offline = 0,
  /** Unknown network mode */
  Unknown = 1,
  /** Wired Ethernet (LAN) */
  Ethernet = 2,
  /** Wi-Fi (WLAN) */
  WiFi = 3,
  /** 2G Network (GPRS/EDGE/CDMA1x/etc.) */
  Mode2G = 4,
  /** 3G Network (WCDMA/HSDPA/EVDO/etc.) */
  Mode3G = 5,
  /** 4G Network (LTE) */
  Mode4G = 6,
  /** 5G Network (NR (NSA/SA)) */
  Mode5G = 7,
}
/** network speed test type */
export declare enum ZegoNetworkSpeedTestType {
  /** uplink */
  Uplink = 0,
  /** downlink */
  Downlink = 1,
}
/** VOD billing mode. */
export declare enum ZegoCopyrightedMusicBillingMode {
  /** Pay-per-use.Each time a user obtains a song resource, a charge is required, that is, the user will be charged for each time based on the actual call to obtain the song resource interface (such as [requestResource] etc.). */
  Count = 0,
  /** Monthly billing by user.Billing for a single user is based on the monthly dimension, that is, the statistics call to obtain song resources (such as [requestResource], etc.) and the parameters are the user ID of the monthly subscription, and the charging is based on the monthly dimension. */
  User = 1,
  /** Monthly billing by room.The room users are billed on a monthly basis, that is, statistical calls to obtain song resources (such as [requestResource], etc.) are passed as Roomid for a monthly subscription of the room, and fees are charged on a monthly basis. */
  Room = 2,
  /** Monthly billing by master. Every time a user obtains a resource, it is counted as the owner’s acquisition of resources, that is, according to the actual call to obtain the song resource interface (such as [requestResource], etc.), the parameters are passed as the Roomid of the room and the Masterid of the owner, and the fee is charged according to the owner. */
  Master = 3,
}
/** The music resource type. For [querycache] interface. */
export declare enum ZegoCopyrightedMusicType {
  /** Song. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicSong = 0,
  /** Song with high quality. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicSongHQ = 1,
  /** Song with super quality. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicSongSQ = 2,
  /** Song accompaniment. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicAccompaniment = 3,
  /** Song accompaniment clip. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicAccompanimentClip = 4,
  /** Song accompaniment segment. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicAccompanimentSegment = 5,
}
/** The music resource type. For [ZegoCopyrightedMusicRequestConfig], [ZegoCopyrightedMusicGetSharedConfig] and [ZegoCopyrightedMusicQueryCacheConfig]. */
export declare enum ZegoCopyrightedMusicResourceType {
  /** Song. */
  ZegoCopyrightedMusicResourceSong = 0,
  /** Song accompaniment. */
  ZegoCopyrightedMusicResourceAccompaniment = 1,
  /** Song accompaniment clip. */
  ZegoCopyrightedMusicResourceAccompanimentClip = 2,
  /** Song accompaniment segment. */
  ZegoCopyrightedMusicResourceAccompanimentSegment = 3,
}
/** Copyright music resource song copyright provider. For more information about the copyright owner, please contact ZEGO business personnel. */
export declare enum ZegoCopyrightedMusicVendorID {
  /** Default copyright provider. */
  ZegoCopyrightedMusicVendorDefault = 0,
  /** First copyright provider. */
  ZegoCopyrightedMusicVendor1 = 1,
  /** Second copyright provider. */
  ZegoCopyrightedMusicVendor2 = 2,
  /** Third copyright provider. */
  ZegoCopyrightedMusicVendor3 = 4,
}
/** The music resource quality type. For [ZegoCopyrightedMusicQueryCacheConfig]. */
export declare enum ZegoCopyrightedMusicResourceQualityType {
  /** Standard Definition Audio. */
  ZegoCopyrightedMusicResourceQualityNormal = 0,
  /** High Definition Audio. */
  ZegoCopyrightedMusicResourceQualityHQ = 1,
  /** Lossless Audio Quality. */
  ZegoCopyrightedMusicResourceQualitySQ = 2,
}
/** Publish or play stream event */
export declare enum ZegoStreamEvent {
  /** Start publishing stream */
  PublishStart = 100,
  /** The first publish stream was successful */
  PublishSuccess = 101,
  /** Failed to publish stream for the first time */
  PublishFail = 102,
  /** Start retrying publishing stream */
  RetryPublishStart = 103,
  /** Retry publishing stream successfully */
  RetryPublishSuccess = 104,
  /** Failed to retry publishing stream */
  RetryPublishFail = 105,
  /** End of publishing stream */
  PublishEnd = 106,
  /** Start playing stream */
  PlayStart = 200,
  /** The first play stream was successful */
  PlaySuccess = 201,
  /** Failed to play stream for the first time */
  PlayFail = 202,
  /** Start retrying playing stream */
  RetryPlayStart = 203,
  /** Retry playing stream successfully */
  RetryPlaySuccess = 204,
  /** Failed to retry playing stream */
  RetryPlayFail = 205,
  /** End of playing stream */
  PlayEnd = 206,
}
/** video capture source. */
export declare enum ZegoVideoSourceType {
  /** No capture, i.e. no video data. */
  None = 1,
  /** The video source comes from the camera (main channel default, and front camera is captured by default). The default is front camera, which can be adjusted to rear via [useFrontCamera]. */
  Camera = 2,
  /** Video source from custom capture. */
  Custom = 3,
  /** Video source from the main publish channel. When publishing the main channel, this value cannot be set. */
  MainPublishChannel = 4,
  /** Video source from media player. */
  Player = 5,
  /** Video source from screen capture. */
  ScreenCapture = 6,
  /** Video source from secondary camera, the rear camera when [useFrontCamera] is set to true, otherwise the front camera, only support iOS. */
  SecondaryCamera = 14,
}
/** Screen capture source exception type. (only for Android and iOS) */
export declare enum ZegoScreenCaptureExceptionType {
  /** Unknown exception type. */
  Unknown = 0,
  /** The video capture system version does not support it, and Android only supports 5.0 and above. */
  VideoNotSupported = 1,
  /** The capture target fails, such as the monitor is unplugged and the window is closed. */
  AudioNotSupported = 2,
  /** Audio recording object creation failed. Possible reasons: 1. The audio recording permission is not enabled; 2. The allocated memory for audio recording is insufficient; 3. The creation of AudioRecord fails. */
  AudioCreateFailed = 3,
  /** MediaProjection request for dynamic permissions was denied. */
  MediaProjectionPermissionDenied = 4,
  /** Capture is not started. Need to start capturing with [startScreenCapture] first. */
  NotStartCapture = 5,
  /** Screen capture has already started, repeated calls failed. You need to stop the capture with [stopScreenCapture] first. */
  AlreadyStarted = 6,
  /** Failed to start the foreground service. */
  ForegroundServiceFailed = 7,
  /** Before starting screen capture, you need to call [setVideoSource], [setAudioSource] to specify the video and audio source `ScreenCapture`. */
  SourceNotSpecified = 8,
  /** System error exception. For example, low memory, etc. */
  SystemError = 9,
  /** Exception interrupted. For example, the user clicks the stop button in the control center during the capture process. */
  ExceptionInterrupted = 10,
  /** Audio device exception. You need to restart the capture. */
  AudioDeviceException = 11,
}
/** Multimedia load type. */
export declare enum ZegoMultimediaLoadType {
  /** Load by file path. */
  FilePath = 0,
  /** Load by memory. */
  Memory = 1,
  /** Load by copyrighted music resource ID. */
  ResourceID = 2,
}
/** Alpha channel data layout. */
export declare enum ZegoAlphaLayoutType {
  /** There is no alpha data. */
  None = 0,
  /** Alpha channel data is to the left of RGB/YUV data. */
  Left = 1,
  /** Alpha channel data is to the right of RGB/YUV data. */
  Right = 2,
  /** Alpha channel data is to the bottom of RGB/YUV data. */
  Bottom = 3,
  /** Alpha channel data is to the upper right of RGB/YUV data. */
  RightTop = 4,
}
/** Object segmentation type. */
export declare enum ZegoObjectSegmentationType {
  /** Any background object segmentation. */
  AnyBackground = 0,
  /** Green screen background object segmentation. */
  GreenScreenBackground = 1,
}
/** Object segmentation state. */
export declare enum ZegoObjectSegmentationState {
  /** Object segmentation turned off. */
  Off = 0,
  /** Object segmentation turned on. */
  On = 1,
}
/** Video background process type. */
export declare enum ZegoBackgroundProcessType {
  /** Background is transparent. */
  Transparent = 0,
  /** Fill the background with a solid color. */
  Color = 1,
  /** Blur background. */
  Blur = 2,
  /** The background is the specified image. */
  Image = 3,
  /** The background is the specified video. */
  Video = 4,
}
/** Background blur level. */
export declare enum ZegoBackgroundBlurLevel {
  /** Background blur level low. */
  Low = 0,
  /** Background blur level medium. */
  Medium = 1,
  /** Background blur level high. */
  High = 2,
}
/** Live audio effect mode. */
export declare enum ZegoLiveAudioEffectMode {
  /** No audio effect. */
  None = 0,
  /** Only local play. */
  Local = 1,
  /** Only publish. */
  Publish = 2,
  /** Publish and local play. */
  All = 3,
}
/** Media stream type. */
export declare enum ZegoMediaStreamType {
  /** Media audio stream. */
  Audio = 0,
  /** Media video stream. */
  Video = 1,
  /** Media audio and video stream. */
  AV = 2,
}
/**
 * Log config.
 *
 * Description: This parameter is required when calling [setlogconfig] to customize log configuration.
 * Use cases: This configuration is required when you need to customize the log storage path or the maximum log file size.
 * Caution: None.
 */
export declare class ZegoLogConfig {
  /** The storage path of the log file. Description: Used to customize the storage path of the log file. Use cases: This configuration is required when you need to customize the log storage path. Required: False. Default value: The default path of each platform is different, please refer to the official website document https://docs.zegocloud.com/faq/express_sdkLog. Caution: Developers need to ensure read and write permissions for files under this path. */
  logPath: string
  /** Maximum log file size(Bytes). Description: Used to customize the maximum log file size. Use cases: This configuration is required when you need to customize the upper limit of the log file size. Required: False. Default value: 5MB (5 * 1024 * 1024 Bytes). Value range: Minimum 1MB (1 * 1024 * 1024 Bytes), maximum 100M (100 * 1024 * 1024 Bytes), 0 means no need to write logs. Caution: The larger the upper limit of the log file size, the more log information it carries, but the log upload time will be longer. */
  logSize: number
  /** Log files count. Default is 3. Value range is [3, 20]. */
  logCount: number
  constructor()
}
/**
 * Custom video capture configuration.
 *
 * Custom video capture, that is, the developer is responsible for collecting video data and sending the collected video data to SDK for video data encoding and publishing to the ZEGO RTC server. This feature is generally used by developers who use third-party beauty features or record game screen living.
 * When you need to use the custom video capture function, you need to set an instance of this class as a parameter to the [enableCustomVideoCapture] function.
 * Because when using custom video capture, SDK will no longer start the camera to capture video data. You need to collect video data from video sources by yourself.
 */
export declare class ZegoCustomVideoCaptureConfig {
  /** Custom video capture video frame data type */
  bufferType: ZegoVideoBufferType
  constructor(bufferType: ZegoVideoBufferType)
}
/**
 * Custom video process configuration.
 */
export declare class ZegoCustomVideoProcessConfig {
  /** Custom video process video frame data type */
  bufferType: ZegoVideoBufferType
  constructor(bufferType: ZegoVideoBufferType)
}
/**
 * Custom audio configuration.
 */
export declare class ZegoCustomAudioConfig {
  /** Audio capture source type */
  sourceType: ZegoAudioSourceType
  constructor(sourceType: ZegoAudioSourceType)
}
/**
 * Profile for create engine
 *
 * Profile for create engine
 */
export declare class ZegoEngineProfile {
  /** Application ID issued by ZEGO for developers, please apply from the ZEGO Admin Console https://console.zegocloud.com The value ranges from 0 to 4294967295. */
  appID: number
  /** Application signature for each AppID, please apply from the ZEGO Admin Console. Application signature is a 64 character string. Each character has a range of '0' ~ '9', 'a' ~ 'z'. AppSign 2.17.0 and later allows null or no transmission. If the token is passed empty or not passed, the token must be entered in the [ZegoRoomConfig] parameter for authentication when the [loginRoom] interface is called to login to the room. */
  appSign: string
  /** The room scenario. the SDK will optimize the audio and video configuration for the specified scenario to achieve the best effect in this scenario. After specifying the scenario, you can call other APIs to adjusting the audio and video configuration. Differences between scenarios and how to choose a suitable scenario, please refer to https://docs.zegocloud.com/article/14940 */
  scenario: ZegoScenario
  constructor(appID: number, appSign: string, scenario: ZegoScenario)
}
/**
 * Advanced engine configuration.
 */
export declare class ZegoEngineConfig {
  /** @deprecated This property has been deprecated since version 2.3.0, please use the [setLogConfig] function instead. */
  logConfig?: ZegoLogConfig
  /** Other special function switches, if not set, no special function will be used by default. Please contact ZEGO technical support before use. */
  advancedConfig?: Record<string, string>
  constructor()
}
/**
 * Advanced room configuration.
 *
 * Configure maximum number of users in the room and authentication token, etc.
 */
export declare class ZegoRoomConfig {
  /** The maximum number of users in the room, Passing 0 means unlimited, the default is unlimited. */
  maxMemberCount: number
  /** Whether to enable the user in and out of the room callback notification [onRoomUserUpdate], the default is off. If developers need to use ZEGO Room user notifications, make sure that each user who login sets this flag to true */
  isUserStatusNotify: boolean
  /** The token issued by the developer's business server is used to ensure security. For the generation rules, please refer to [Using Token Authentication](https://doc-zh.zego.im/article/10360), the default is an empty string, that is, no authentication. In versions 2.17.0 and above, if appSign is not passed in when calling the [createEngine] API to create an engine, or if appSign is empty, this parameter must be set for authentication when logging in to a room. */
  token: string
  constructor(maxMemberCount: number, isUserStatusNotify: boolean, token: string)
}
/**
 * Video config.
 *
 * Configure parameters used for publishing stream, such as bitrate, frame rate, and resolution.
 * Developers should note that the width and height resolution of the mobile and desktop are opposite. For example, 360p, the resolution of the mobile is 360x640, and the desktop is 640x360.
 * When using external capture, the capture and encoding resolution of RTC cannot be set to 0*0, otherwise, there will be no video data in the publishing stream in the entire engine life cycle.
 */
export declare class ZegoVideoConfig {
  /** Capture resolution width, control the width of camera image acquisition. SDK requires this member to be set to an even number. Only the camera is not started and the custom video capture is not used, the setting is effective. For performance reasons, the SDK scales the video frame to the encoding resolution after capturing from camera and before rendering to the preview view. Therefore, the resolution of the preview image is the encoding resolution. If you need the resolution of the preview image to be this value, Please call [setCapturePipelineScaleMode] first to change the capture pipeline scale mode to [Post] */
  captureWidth: number
  /** Capture resolution height, control the height of camera image acquisition. SDK requires this member to be set to an even number. Only the camera is not started and the custom video capture is not used, the setting is effective. For performance reasons, the SDK scales the video frame to the encoding resolution after capturing from camera and before rendering to the preview view. Therefore, the resolution of the preview image is the encoding resolution. If you need the resolution of the preview image to be this value, Please call [setCapturePipelineScaleMode] first to change the capture pipeline scale mode to [Post] */
  captureHeight: number
  /** Encode resolution width, control the image width of the encoder when publishing stream. SDK requires this member to be set to an even number. The settings before and after publishing stream can be effective */
  encodeWidth: number
  /** Encode resolution height, control the image height of the encoder when publishing stream. SDK requires this member to be set to an even number. The settings before and after publishing stream can be effective */
  encodeHeight: number
  /** Frame rate, control the frame rate of the camera and the frame rate of the encoder. Publishing stream set to 60 fps, playing stream to take effect need contact technical support */
  fps: number
  /** Bit rate in kbps. The settings before and after publishing stream can be effective. The SDK will automatically set the bit rate suitable for the scenario selected by the developer. If the bit rate manually set by the developer exceeds the reasonable range, the SDK will automatically process the bit rate according to the reasonable range. If you need to configure a high bit rate due to business needs, please contact ZEGO Business. */
  bitrate: number
  /** The codec id to be used, the default value is [default]. Settings only take effect before publishing stream */
  codecID: ZegoVideoCodecID
  /** Video keyframe interval, in seconds. Description: Required: No. Default value: 2 seconds. Value range: [2, 5]. Caution: The setting is only valid before pushing. */
  keyFrameInterval?: number
  /**
   * Create video configuration with preset enumeration values
   */
  constructor(preset?: ZegoVideoConfigPreset)
}
/**
 * Voice changer parameter.
 *
 * Developer can use the built-in presets of the SDK to change the parameters of the voice changer.
 */
export declare class ZegoVoiceChangerParam {
  /** Pitch parameter, value range [-12.0, 12.0], the larger the value, the sharper the sound, set it to 0.0 to turn off. Note that on v2.18.0 and older version, the value range is [-8.0, 8.0]. */
  pitch: number
  constructor(pitch: number)
}
/**
 * Audio reverberation advanced parameters.
 *
 * Developers can use the SDK's built-in presets to change the parameters of the reverb.
 */
export declare class ZegoReverbAdvancedParam {
  /** Room size(%), in the range [0.0, 1.0], to control the size of the "room" in which the reverb is generated, the larger the room, the stronger the reverb. */
  roomSize: number
  /** Echo(%), in the range [0.0, 100.0], to control the trailing length of the reverb. */
  reverberance: number
  /** Reverb Damping(%), range [0.0, 100.0], controls the attenuation of the reverb, the higher the damping, the higher the attenuation. */
  damping: number
  /** only wet */
  wetOnly: boolean
  /** wet gain(dB), range [-20.0, 10.0] */
  wetGain: number
  /** dry gain(dB), range [-20.0, 10.0] */
  dryGain: number
  /** Tone Low. 100% by default */
  toneLow: number
  /** Tone High. 100% by default */
  toneHigh: number
  /** PreDelay(ms), range [0.0, 200.0] */
  preDelay: number
  /** Stereo Width(%). 0% by default */
  stereoWidth: number
  constructor()
}
/**
 * Audio reverberation echo parameters.
 */
export declare class ZegoReverbEchoParam {
  /** Gain of input audio signal, in the range [0.0, 1.0] */
  inGain: number
  /** Gain of output audio signal, in the range [0.0, 1.0] */
  outGain: number
  /** Number of echos, in the range [0, 7] */
  numDelays: number
  /** Respective delay of echo signal, in milliseconds, in the range [0, 5000] ms */
  delay: Uint16Array
  /** Respective decay coefficient of echo signal, in the range [0.0, 1.0] */
  decay: Float32Array
  constructor()
}
/**
 * User object.
 *
 * Configure user ID and username to identify users in the room.
 * Note that the userID must be unique under the same appID, otherwise, there will be mutual kicks when logging in to the room.
 * It is strongly recommended that userID corresponds to the user ID of the business APP, that is, a userID and a real user are fixed and unique, and should not be passed to the SDK in a random userID. Because the unique and fixed userID allows ZEGO technicians to quickly locate online problems.
 */
export declare class ZegoUser {
  /** User ID, a utf8 string with a maximum length of 64 bytes or less.Privacy reminder: Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc.Caution: Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '\'. Do not use '%' if you need to communicate with the Web SDK. */
  userID: string
  /** User Name, a utf8 string with a maximum length of 256 bytes or less.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  userName: string
  constructor(userID: string, userName: string)
}
/**
 * Stream object.
 *
 * Identify an stream object
 */
export interface ZegoStream {
  /** User object instance.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  user: ZegoUser
  /** Stream ID, a string of up to 256 characters. Caution: You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '-', '_'. */
  streamID: string
  /** Stream extra info */
  extraInfo: string
}
/**
 * Room extra information.
 */
export interface ZegoRoomExtraInfo {
  /** The key of the room extra information. */
  key: string
  /** The value of the room extra information. */
  value: string
  /** The user who update the room extra information.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  updateUser: ZegoUser
  /** Update time of the room extra information, UNIX timestamp, in milliseconds. */
  updateTime: number
}
/**
 * View related coordinates.
 */
export declare class ZegoRect {
  /** The horizontal offset from the top-left corner */
  x: number
  /** The vertical offset from the top-left corner */
  y: number
  /** The width of the rectangle */
  width: number
  /** The height of the rectangle */
  height: number
  constructor(x: number, y: number, width: number, height: number)
}
/**
 * View object.
 *
 * Configure view object, view Mode, background color
 */
export declare class ZegoView {
  /** View mode, default is ZegoViewModeAspectFit */
  viewMode: ZegoViewMode
  /** Background color, the format is 0xRRGGBB, default is black, which is 0x000000 */
  backgroundColor: number
  /** If enable alpha blend render, default is false. */
  alphaBlend?: boolean
  /** reactTag is a tag for native and js to identify each component, and each root view must have a unique reactTag. */
  reactTag: number
  constructor(reactTag: number, viewMode: ZegoViewMode, backgroundColor: number)
}
/**
 * Advanced publisher configuration.
 *
 * Configure room id
 */
export declare class ZegoPublisherConfig {
  /** The Room ID, It is not necessary to pass in single room mode, but the ID of the corresponding room must be passed in multi-room mode */
  roomID?: string
  /** Whether to synchronize the network time when pushing streams. 1 is synchronized with 0 is not synchronized. And must be used with setStreamAlignmentProperty. It is used to align multiple streams at the mixed stream service or streaming end, such as the chorus scene of KTV. */
  forceSynchronousNetworkTime?: number
  constructor(roomID?: string)
}
/**
 * Published stream quality information.
 *
 * Audio and video parameters and network quality, etc.
 */
export interface ZegoPublishStreamQuality {
  /** Video capture frame rate. The unit of frame rate is f/s */
  videoCaptureFPS: number
  /** Video encoding frame rate. The unit of frame rate is f/s */
  videoEncodeFPS: number
  /** Video transmission frame rate. The unit of frame rate is f/s */
  videoSendFPS: number
  /** Video bit rate in kbps */
  videoKBPS: number
  /** Audio capture frame rate. The unit of frame rate is f/s */
  audioCaptureFPS: number
  /** Audio transmission frame rate. The unit of frame rate is f/s */
  audioSendFPS: number
  /** Audio bit rate in kbps */
  audioKBPS: number
  /** Local to server delay, in milliseconds */
  rtt: number
  /** Packet loss rate, in percentage, 0.0 ~ 1.0 */
  packetLostRate: number
  /** Published stream quality level */
  level: ZegoStreamQualityLevel
  /** Whether to enable hardware encoding */
  isHardwareEncode: boolean
  /** Video codec ID (Available since 1.17.0) */
  videoCodecID: ZegoVideoCodecID
  /** Total number of bytes sent, including audio, video, SEI */
  totalSendBytes: number
  /** Number of audio bytes sent */
  audioSendBytes: number
  /** Number of video bytes sent */
  videoSendBytes: number
}
/**
 * CDN config object.
 *
 * Includes CDN URL and authentication parameter string
 */
export declare class ZegoCDNConfig {
  /** CDN URL */
  url: string
  /** Auth param of URL. Please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored (set to null or empty string). */
  authParam?: string
  /** URL supported protocols, candidate values are "tcp" and "quic". If there are more than one, separate them with English commas and try them in order. Please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored (set to null or empty string). */
  protocol?: string
  /** QUIC version。 If [protocol] has the QUIC protocol, this information needs to be filled in. If there are multiple version numbers, separate them with commas. Please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored (set to null or empty string). */
  quicVersion?: string
  constructor(url: string, authParam?: string)
}
/**
 * Relay to CDN info.
 *
 * Including the URL of the relaying CDN, relaying state, etc.
 */
export interface ZegoStreamRelayCDNInfo {
  /** URL of publishing stream to CDN */
  url: string
  /** State of relaying to CDN */
  state: ZegoStreamRelayCDNState
  /** Reason for relay state changed */
  updateReason: ZegoStreamRelayCDNUpdateReason
  /** The timestamp when the state changed, UNIX timestamp, in milliseconds. */
  stateTime: number
}
/**
 * Advanced player configuration.
 *
 * Configure stream resource mode, CDN configuration and other advanced configurations.
 */
export declare class ZegoPlayerConfig {
  /** Stream resource mode. */
  resourceMode?: ZegoStreamResourceMode
  /** The CDN configuration for playing stream. If set, the stream is play according to the URL instead of the streamID. After that, the streamID is only used as the ID of SDK internal callback. */
  cdnConfig?: ZegoCDNConfig
  /** The Room ID. It only needs to be filled in the multi-room mode, which indicates which room this stream needs to be bound to. This parameter is ignored in single room mode. */
  roomID?: string
  /** The video encoding type of the stream, please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored. */
  videoCodecID?: ZegoVideoCodecID
  constructor(cdnConfig?: ZegoCDNConfig)
}
/**
 * Played stream quality information.
 *
 * Audio and video parameters and network quality, etc.
 */
export interface ZegoPlayStreamQuality {
  /** Video receiving frame rate. The unit of frame rate is f/s */
  videoRecvFPS: number
  /** Video dejitter frame rate. The unit of frame rate is f/s (Available since 1.17.0) */
  videoDejitterFPS: number
  /** Video decoding frame rate. The unit of frame rate is f/s */
  videoDecodeFPS: number
  /** Video rendering frame rate. The unit of frame rate is f/s */
  videoRenderFPS: number
  /** Video bit rate in kbps */
  videoKBPS: number
  /** Video break rate, the unit is (number of breaks / every 10 seconds) (Available since 1.17.0) */
  videoBreakRate: number
  /** Audio receiving frame rate. The unit of frame rate is f/s */
  audioRecvFPS: number
  /** Audio dejitter frame rate. The unit of frame rate is f/s (Available since 1.17.0) */
  audioDejitterFPS: number
  /** Audio decoding frame rate. The unit of frame rate is f/s */
  audioDecodeFPS: number
  /** Audio rendering frame rate. The unit of frame rate is f/s */
  audioRenderFPS: number
  /** Audio bit rate in kbps */
  audioKBPS: number
  /** Audio break rate, the unit is (number of breaks / every 10 seconds) (Available since 1.17.0) */
  audioBreakRate: number
  /** The audio quality of the playing stream determined by the audio MOS (Mean Opinion Score) measurement method, value range [-1, 5], where -1 means unknown, [0, 5] means valid score, the higher the score, the better the audio quality. For the subjective perception corresponding to the MOS value, please refer to https://docs.zegocloud.com/article/3720#4_4 (Available since 2.16.0) */
  mos: number
  /** Server to local delay, in milliseconds */
  rtt: number
  /** Packet loss rate, in percentage, 0.0 ~ 1.0 */
  packetLostRate: number
  /** Delay from peer to peer, in milliseconds */
  peerToPeerDelay: number
  /** Packet loss rate from peer to peer, in percentage, 0.0 ~ 1.0 */
  peerToPeerPacketLostRate: number
  /** Published stream quality level */
  level: ZegoStreamQualityLevel
  /** Delay after the data is received by the local end, in milliseconds */
  delay: number
  /** The difference between the video timestamp and the audio timestamp, used to reflect the synchronization of audio and video, in milliseconds. This value is less than 0 means the number of milliseconds that the video leads the audio, greater than 0 means the number of milliseconds that the video lags the audio, and 0 means no difference. When the absolute value is less than 200, it can basically be regarded as synchronized audio and video, when the absolute value is greater than 200 for 10 consecutive seconds, it can be regarded as abnormal (Available since 1.19.0) */
  avTimestampDiff: number
  /** Whether to enable hardware decoding */
  isHardwareDecode: boolean
  /** Video codec ID (Available since 1.17.0) */
  videoCodecID: ZegoVideoCodecID
  /** Total number of bytes received, including audio, video, SEI */
  totalRecvBytes: number
  /** Number of audio bytes received */
  audioRecvBytes: number
  /** Number of video bytes received */
  videoRecvBytes: number
}
/**
 * Beauty configuration options.
 *
 * Configure the parameters of skin peeling, whitening and sharpening
 */
export declare class ZegoBeautifyOption {
  /** The sample step size of beauty peeling, the value range is [0,1], default 0.2 */
  polishStep: number
  /** Brightness parameter for beauty and whitening, the larger the value, the brighter the brightness, ranging from [0,1], default 0.5 */
  whitenFactor: number
  /** Beauty sharpening parameter, the larger the value, the stronger the sharpening, value range [0,1], default 0.1 */
  sharpenFactor: number
  constructor(polishStep: number, whitenFactor: number, sharpenFactor: number)
}
/**
 * Beauty configuration param.
 *
 * Configure the whiten, rosy, smooth, and sharpen parameters for beauty.
 */
export declare class ZegoEffectsBeautyParam {
  /** The whiten intensity parameter, the value range is [0,100], and the default is 50. */
  whitenIntensity: number
  /** the rosy intensity parameter, value range [0,100], and the default is 50. */
  rosyIntensity: number
  /** the smooth intensity parameter, value range [0,100], and the default is 50. */
  smoothIntensity: number
  /** the sharpen intensity parameter, value range [0,100], and the default is 50. */
  sharpenIntensity: number
  constructor()
}
/**
 * Mix stream audio configuration.
 *
 * Configure video frame rate, bitrate, and resolution for mixer task
 */
export declare class ZegoMixerAudioConfig {
  /** Audio bitrate in kbps, default is 48 kbps, cannot be modified after starting a mixer task */
  bitrate: number
  /** Audio channel, default is Mono */
  channel: ZegoAudioChannel
  /** codec ID, default is ZegoAudioCodecIDDefault */
  codecID: ZegoAudioCodecID
  constructor(bitrate: number, channel: ZegoAudioChannel, codecID: ZegoAudioCodecID)
}
/**
 * Mix stream video config object.
 *
 * Configure video frame rate, bitrate, and resolution for mixer task
 */
export declare class ZegoMixerVideoConfig {
  /** Video resolution width */
  width: number
  /** Video resolution height */
  height: number
  /** Video FPS, cannot be modified after starting a mixer task */
  fps: number
  /** Video bitrate in kbps */
  bitrate: number
  constructor(width: number, height: number, fps: number, bitrate: number)
}
/**
 * Mixer input.
 *
 * Configure the mix stream input stream ID, type, and the layout
 */
export declare class ZegoMixerInput {
  /** Stream ID, a string of up to 256 characters. Caution: You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '-', '_'. */
  streamID: string
  /** Mix stream content type */
  contentType: ZegoMixerInputContentType
  /** Stream layout. When the mixed stream is an audio stream (that is, the ContentType parameter is set to the audio mixed stream type). Developers do not need to assign a value to this field, just use the SDK default. */
  layout: ZegoRect
  /** If enable soundLevel in mix stream task, an unique soundLevelID is need for every stream */
  soundLevelID: number
  constructor(
    streamID: string,
    contentType: ZegoMixerInputContentType,
    layout: ZegoRect,
    soundLevelID: number
  )
}
/**
 * Mixer output object, currently, a mixed-stream task only supports a maximum of four video streams with different resolutions.
 *
 * Configure mix stream output target URL or stream ID
 */
export declare class ZegoMixerOutput {
  /** Mix stream output target, URL or stream ID, if set to be URL format, only RTMP URL surpported, for example rtmp://xxxxxxxx, addresses with two identical mixed-stream outputs cannot be passed in. */
  target: string
  constructor(target: string)
}
/**
 * Mix stream task object.
 *
 * This class is the configuration class of the stream mixing task. When a stream mixing task is requested to the ZEGO RTC server, the configuration of the stream mixing task is required.
 * This class describes the detailed configuration information of this stream mixing task.
 */
export declare class ZegoMixerTask {
  /** The task ID of the task */
  taskID: string
  /** The input list of the task */
  inputList: ZegoMixerInput[]
  /** The output list of the task */
  outputList: ZegoMixerOutput[]
  /** The video config of the task */
  videoConfig: ZegoMixerVideoConfig
  /** The audio config of the task */
  audioConfig: ZegoMixerAudioConfig
  /** Enable or disable sound level callback for the task. If enabled, then the remote player can get the soundLevel of every stream in the inputlist by [onMixerSoundLevelUpdate] callback. */
  enableSoundLevel: boolean
  /** The stream mixing alignment mode */
  streamAlignmentMode: ZegoStreamAlignmentMode
  constructor(taskID: string)
}
/**
 * Configuration for start sound level monitor.
 */
export declare class ZegoSoundLevelConfig {
  /** Monitoring time period of the sound level, in milliseconds, has a value range of [100, 3000]. Default is 100 ms. */
  millisecond: number
  /** Set whether the sound level callback includes the VAD detection result. */
  enableVAD: boolean
  constructor(millisecond: number, enableVAD: boolean)
}
/**
 * Broadcast message info.
 *
 * The received object of the room broadcast message, including the message content, message ID, sender, sending time
 */
export declare class ZegoBroadcastMessageInfo {
  /** message content */
  message: string
  /** message id */
  messageID: number
  /** Message send time, UNIX timestamp, in milliseconds. */
  sendTime: number
  /** Message sender.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  fromUser: ZegoUser
  constructor(message: string, messageID: number, sendTime: number, fromUser: ZegoUser)
}
/**
 * Barrage message info.
 *
 * The received object of the room barrage message, including the message content, message ID, sender, sending time
 */
export declare class ZegoBarrageMessageInfo {
  /** message content */
  message: string
  /** message id */
  messageID: string
  /** Message send time, UNIX timestamp, in milliseconds. */
  sendTime: number
  /** Message sender.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  fromUser: ZegoUser
  constructor(message: string, messageID: string, sendTime: number, fromUser: ZegoUser)
}
/**
 * Parameter object for audio frame.
 *
 * Including the sampling rate and channel of the audio frame
 */
export declare class ZegoAudioFrameParam {
  /** Sampling Rate */
  sampleRate: ZegoAudioSampleRate
  /** Audio channel, default is Mono */
  channel: ZegoAudioChannel
  constructor(sampleRate: ZegoAudioSampleRate, channel: ZegoAudioChannel)
}
/**
 * Audio configuration.
 *
 * Configure audio bitrate, audio channel, audio encoding for publishing stream
 */
export declare class ZegoAudioConfig {
  /** Audio bitrate in kbps, default is 48 kbps. The settings before and after publishing stream can be effective */
  bitrate: number
  /** Audio channel, default is Mono. The setting only take effect before publishing stream */
  channel: ZegoAudioChannel
  /** codec ID, default is ZegoAudioCodecIDDefault. The setting only take effect before publishing stream */
  codecID: ZegoAudioCodecID
  /**
   * Create a default audio configuration (ZegoAudioConfigPresetStandardQuality, 48 kbps, Mono, ZegoAudioCodecIDDefault)
   */
  constructor(preset?: ZegoAudioConfigPreset)
}
/**
 * Customize the audio processing configuration object.
 *
 * Including custom audio acquisition type, sampling rate, channel number, sampling number and other parameters
 */
export declare class ZegoCustomAudioProcessConfig {
  /** Sampling rate, the sampling rate of the input data expected by the audio pre-processing module in App. If 0, the default is the SDK internal sampling rate. */
  sampleRate: ZegoAudioSampleRate
  /** Number of sound channels, the expected number of sound channels for input data of the audio pre-processing module in App. If 0, the default is the number of internal channels in the SDK */
  channel: ZegoAudioChannel
  /** The number of samples required to encode a frame; if samples = 0, the SDK will use the internal sample number, and the SDK will pass the audio data to the external pre-processing module. If the samples! = 0 (the effective value of samples is between [160, 2048]), and the SDK will send audio data to the external preprocessing module that sets the length of sample number. */
  samples: number
  constructor(sampleRate: ZegoAudioSampleRate, channel: ZegoAudioChannel, samples: number)
}
/**
 * Record config.
 */
export declare class ZegoDataRecordConfig {
  /** The path to save the recording file, absolute path, need to include the file name, the file name need to specify the suffix, currently supports .mp4/.flv/.aac format files, if multiple recording for the same path, will overwrite the file with the same name. The maximum length should be less than 1024 bytes. */
  filePath: string
  /** Type of recording media */
  recordType: ZegoDataRecordType
  constructor(filePath: string, recordType: ZegoDataRecordType)
}
/**
 * File recording progress.
 */
export declare class ZegoDataRecordProgress {
  /** Current recording duration in milliseconds */
  duration: number
  /** Current recording file size in byte */
  currentFileSize: number
  /** The quality of current recording file */
  quality: ZegoPublishStreamQuality
  constructor(duration: number, currentFileSize: number, quality: ZegoPublishStreamQuality)
}
/**
 * Network speed test config
 */
export declare class ZegoNetworkSpeedTestConfig {
  /** Test uplink or not */
  testUplink: boolean
  /** The unit is kbps. Recommended to use the bitrate in ZegoVideoConfig when call startPublishingStream to determine whether the network uplink environment is suitable. */
  expectedUplinkBitrate: number
  /** Test downlink or not */
  testDownlink: boolean
  /** The unit is kbps. Recommended to use the bitrate in ZegoVideoConfig when call startPublishingStream to determine whether the network downlink environment is suitable. */
  expectedDownlinkBitrate: number
  constructor(
    testUplink: boolean,
    expectedUplinkBitrate: number,
    testDownlink: boolean,
    expectedDownlinkBitrate: number
  )
}
/**
 * network speed test quality
 */
export interface ZegoNetworkSpeedTestQuality {
  /** Time to connect to the server, in milliseconds. During the speed test, if the network connection is disconnected, it will automatically initiate a reconnection, and this variable will be updated accordingly. */
  connectCost: number
  /** rtt, in milliseconds */
  rtt: number
  /** packet lost rate. in percentage, 0.0 ~ 1.0 */
  packetLostRate: number
  /** network quality. excellent, good, medium and poor */
  quality: ZegoStreamQualityLevel
}
/**
 * The NTP info
 */
export interface ZegoNetworkTimeInfo {
  /** Network timestamp after synchronization, 0 indicates not yet synchronized */
  timestamp: number
  /** The max deviation */
  maxDeviation: number
}
/**
 * AudioEffectPlayer play configuration.
 */
export declare class ZegoAudioEffectPlayConfig {
  /** The number of play counts. When set to 0, it will play in an infinite loop until the user invoke [stop]. The default is 1, which means it will play only once. */
  playCount: number
  /** Whether to mix audio effects into the publishing stream, the default is false. */
  isPublishOut: boolean
  constructor(playCount: number, isPublishOut: boolean)
}
/**
 * Media player network cache information
 */
export interface ZegoNetWorkResourceCache {
  /** Cached playable duration, unit ms */
  time: number
  /** Cached playable size, unit byte */
  size: number
}
/**
 * CopyrightedMusic play configuration.
 */
export declare class ZegoCopyrightedMusicConfig {
  /** User object instance, configure userID, userName. Note that the user ID set here needs to be consistent with the user ID set when logging in to the room, otherwise the request for the copyright music background service will fail. */
  user: ZegoUser
  constructor(user: ZegoUser)
}
/**
 * The configuration of getting lyric.
 */
export declare class ZegoCopyrightedMusicGetLyricConfig {
  /** the ID of the song. */
  songID: string
  /** Copyright music resource song copyright provider. */
  vendorID: number
  constructor(songID: string, vendorID: number)
}
/**
 * The configuration of requesting resource.
 */
export declare class ZegoCopyrightedMusicRequestConfigV2 {
  /** the ID of the song. */
  songID: string
  /** VOD billing mode. Refer to the value of [ZegoCopyrightedMusicBillingMode]. */
  mode: number
  /** Copyright music resource song copyright provider. Refer to the value of [ZegoCopyrightedMusicVendorID]. */
  vendorID: number
  /** The room ID, the single-room mode can not be passed, and the corresponding room ID must be passed in the multi-room mode. Indicate in which room to order song/accompaniment/accompaniment clip/accompaniment segment. */
  roomID: string
  /** The master ID, which must be passed when the billing mode is billed by host. Indicate which homeowner to order song/accompaniment/accompaniment clip/accompaniment segment. */
  masterID: string
  /** The scene ID, indicate the actual business. For details, please consult ZEGO technical support. */
  sceneID: number
  /** The resource type of music. Refer to the value of [ZegoCopyrightedMusicResourceType]. */
  resourceType: number
  constructor(
    songID: string,
    mode: number,
    vendorID: number,
    roomID: string,
    masterID: string,
    sceneID: number,
    resourceType: number
  )
}
/**
 * The configuration of getting shared resource.
 */
export declare class ZegoCopyrightedMusicGetSharedConfigV2 {
  /** the ID of the song. */
  songID: string
  /** Copyright music resource song copyright provider. Refer to the value of [ZegoCopyrightedMusicVendorID]. */
  vendorID: number
  /** The room ID, the single-room mode can not be passed, and the corresponding room ID must be passed in the multi-room mode. Indicates which room to get resources from. */
  roomID: string
  /** The resource type of music. */
  resourceType: number
  constructor(songID: string, vendorID: number, roomID: string, resourceType: number)
}
/**
 * The configuration of querying cache.
 */
export declare class ZegoCopyrightedMusicQueryCacheConfigV2 {
  /** the ID of the song. */
  songID: string
  /** The resource type of music. Refer to the value of [ZegoCopyrightedMusicResourceType]. */
  resourceType: number
  /** The resource quality type of music. Refer to the value of [ZegoCopyrightedMusicResourceQualityType]. */
  resourceQualityType: number
  /** Copyright music resource song copyright provider. Refer to the value of [ZegoCopyrightedMusicVendorID]. */
  vendorID: number
  constructor(songID: string, resourceType: number, resourceQualityType: number, vendorID: number)
}
/**
 * Screen capture configuration parameters.
 */
export declare class ZegoScreenCaptureConfig {
  /** Whether to capture video when screen capture. The default is true. */
  captureVideo: boolean
  /** Whether to capture audio when screen capture. The default is true. */
  captureAudio: boolean
  /** Set Microphone audio volume for ReplayKit. The range is 0 ~ 200. The default is 100. (only for iOS) */
  microphoneVolume: number
  /** Set Application audio volume for ReplayKit. The range is 0 ~ 200. The default is 100. (only for iOS and Android) */
  applicationVolume: number
  /** Set the audio capture parameters during screen capture. (only for Android) */
  audioParam?: ZegoAudioFrameParam
  constructor(
    captureVideo: boolean,
    captureAudio: boolean,
    microphoneVolume: number,
    applicationVolume: number
  )
}
/**
 * Multimedia resource for ZEGO media player.
 *
 * Used to configure loading parameters when loading multimedia resources.
 */
export declare class ZegoMediaPlayerResource {
  /** Used to specify the loading type of multimedia resources. */
  loadType: ZegoMultimediaLoadType
  /** The progress at which the plaback started. */
  startPosition?: number
  /** If the specified resource has a transparent effect, you need to specify the layout position of the alpha data. */
  alphaLayout?: ZegoAlphaLayoutType
  /** Common resource path.The absolute resource path or the URL of the network resource and cannot be null or "". Android can set this path string with Uri. */
  filePath?: string
  /** binary data memory. */
  memory?: Uint8Array
  /** The resource ID obtained from the copyrighted music module. */
  resourceID?: string
  constructor()
}
/**
 * Background config.
 *
 * It is used to configure background when the object segmentation is turned on.
 */
export declare class ZegoBackgroundConfig {
  /** Background process type. */
  processType: ZegoBackgroundProcessType
  /** Background color, the format is 0xRRGGBB, default is black, which is 0x000000 */
  color: number
  /** Background image URL. Support local file absolute path (file://xxx). The format supports png, jpg. */
  imageURL: string
  /** Background video URL. Caution: 1. The video will be played in a loop. 2. Support local file absolute path (file://xxx). 3. The format supports MP4, FLV, MKV, AVI. 4. The maximum resolution should not exceed 4096px, and it is recommended to be within 1920px. 5. The maximum video duration should not exceed 30 seconds, and it is recommended to be within 15 seconds. 6. The maximum video size should not exceed 50MB, and 10MB is recommended. */
  videoURL: string
  /** Background blur level. */
  blurLevel: ZegoBackgroundBlurLevel
  constructor()
}
/**
 * Object segmentation config.
 *
 * It is used to configure parameters when the object segmentation is turned on.
 */
export declare class ZegoObjectSegmentationConfig {
  /** The type of object segmentation. */
  objectSegmentationType: ZegoObjectSegmentationType
  /** Background config. */
  backgroundConfig: ZegoBackgroundConfig
  constructor()
}
/**
 * Media Infomration of media file.
 *
 * Meida information such as video resolution of media file.
 */
export interface ZegoMediaPlayerMediaInfo {
  /** Video resolution width. */
  width: number
  /** Video resolution height. */
  height: number
  /** Video frame rate. */
  frameRate: number
}
/**
 * Media player play statistics.
 *
 * Media player play statistics.
 */
export interface ZegoMediaPlayerStatisticsInfo {
  /** Video source fps. */
  videoSourceFps: number
  /** Video decode fps. */
  videoDecodeFps: number
  /** Video render fps. */
  videoRenderFps: number
  /** Audio source fps. */
  audioSourceFps: number
  /** Audio decode fps. */
  audioDecodeFps: number
  /** Audio render fps. */
  audioRenderFps: number
}
export declare abstract class ZegoRealTimeSequentialDataManager {
  /**
   * Start broadcasting real-time sequential data stream.
   *
   * Available since: 2.14.0
   * Description: This function allows users to broadcast their local real-time sequential data stream to the ZEGO RTC server, and other users in the same room can subscribe to the real-time sequential data stream for intercommunication through "streamID".
   * Use cases: Before sending real-time sequential data, you need to call this function to start broadcasting.
   * When to call: After creating the [ZegoRealTimeSequentialDataManager] instance.
   * Restrictions: None.
   * Caution: After calling this function, you will receive the [onPublisherStateUpdate] callback to tell you the broadcast state (publish state) of this stream. After the broadcast is successful, other users in the same room will receive the [onRoomStreamUpdate] callback to tell them this stream has been added to the room.
   *
   * @param streamID Stream ID, a string of up to 256 characters.
   *   Caution:
   *   1. Need to be globally unique within the entire AppID (Note that it cannot be the same as the stream ID passed in [startPublishingStream]). If in the same AppID, different users publish each stream and the stream ID is the same, which will cause the user to publish the stream failure. You cannot include URL keywords, otherwise publishing stream and playing stream will fails.
   *   2. Only support numbers, English characters and '-', '_'.
   */
  abstract startBroadcasting(streamID: string): Promise<void>
  /**
   * Stop broadcasting real-time sequential data stream.
   *
   * Available since: 2.14.0
   * Description: This function allows users to stop broadcasting their local real-time sequential data stream.
   * Use cases: When you no longer need to send real-time sequential data, you need to call this function to stop broadcasting.
   * When to call: After creating the [ZegoRealTimeSequentialDataManager] instance.
   * Restrictions: None.
   * Caution: After calling this function, you will receive the [onPublisherStateUpdate] callback to tell you the broadcast state (publish state) of this stream. After stopping the broadcast, other users in the same room will receive the [onRoomStreamUpdate] callback to tell them this stream has been deleted from the room.
   *
   * @param streamID The ID of the stream that needs to stop broadcasting.
   */
  abstract stopBroadcasting(streamID: string): Promise<void>
  /**
   * Send real-time sequential data to the broadcasting stream ID.
   *
   * Available since: 2.14.0
   * Description: This function can be used to send real-time sequential data on the stream currently being broadcast.
   * Use cases: You need to call this function when you need to send real-time sequential data.
   * When to call: After calling [startBroadcasting].
   * Restrictions: None.
   * Caution: None.
   *
   * @param data The real-time sequential data to be sent.
   * @param streamID The stream ID to which the real-time sequential data is sent.
   * @return Send real-time sequential data result notification.
   */
  abstract sendRealTimeSequentialData(
    data: Uint8Array,
    streamID: string
  ): Promise<ZegoRealTimeSequentialDataSentResult>
  /**
   * Start subscribing real-time sequential data stream.
   *
   * Available since: 2.14.0
   * Description: This function allows users to subscribe to the real-time sequential data stream of remote users from the ZEGO RTC server.
   * Use cases: When you need to receive real-time sequential data sent from other remote users, you need to call this function to start subscribing to the stream broadcasted by other remote users.
   * When to call: After creating the [ZegoRealTimeSequentialDataManager] instance.
   * Restrictions: None.
   * Caution: After calling this function, you will receive the [onPlayerStateUpdate] callback to tell you the subscribe state (play state) of this stream.
   *
   * @param streamID Stream ID, a string of up to 256 characters.
   *   Caution:
   *   Only support numbers, English characters and '-', '_'.
   */
  abstract startSubscribing(streamID: string): Promise<void>
  /**
   * Stop subscribing real-time sequential data stream.
   *
   * Available since: 2.14.0
   * Description: This function can be used to stop subscribing to the real-time sequential data stream.
   * Use cases: When you no longer need to receive real-time sequential data sent by other users, you need to call this function to stop subscribing to the other user's stream.
   * When to call: After creating the [ZegoRealTimeSequentialDataManager] instance.
   * Restrictions: None.
   * Caution: After calling this function, you will receive the [onPlayerStateUpdate] callback to tell you the subscribe state (play state) of this stream.
   *
   * @param streamID The ID of the stream that needs to stop subscribing.
   */
  abstract stopSubscribing(streamID: string): Promise<void>
  /**
   * Get real-time sequential data manager index.
   *
   * @return Index of the real-time sequential data manager.
   */
  abstract getIndex(): number
  /**
   * Register the event handler of real-time sequential data
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract on<RealTimeSequentialDataEventType extends keyof ZegoRealTimeSequentialDataEventHandler>(
    event: RealTimeSequentialDataEventType,
    callback: ZegoRealTimeSequentialDataEventHandler[RealTimeSequentialDataEventType]
  ): void
  /**
   * Unregister the event handler of real-time sequential data
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract off<
    RealTimeSequentialDataEventType extends keyof ZegoRealTimeSequentialDataEventHandler,
  >(
    event: RealTimeSequentialDataEventType,
    callback: undefined | ZegoRealTimeSequentialDataEventHandler[RealTimeSequentialDataEventType]
  ): void
}
export declare abstract class ZegoMediaPlayer {
  /**
   * Load local or network media resource.
   *
   * Available: since 1.3.4
   * Description: Load media resources.
   * Use case: Developers can load the absolute path to the local resource or the URL of the network resource incoming.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Related APIs: Resources can be loaded through the [loadResourceWithPosition] or [loadResourceFromMediaData] function.
   * Caution: If the mediaplayer has already loaded resources or is in the process of playing, please first call the [stop] interface to halt the playback, and then proceed to call the interface to load the media resources; failure to do so will result in an unsuccessful load.
   *
   * @param path The absolute resource path or the URL of the network resource and cannot be null or "". Android can set this path string with Uri.
   * @return Callback result of loading media resource.
   */
  abstract loadResource(path: string): Promise<ZegoMediaPlayerLoadResourceResult>
  /**
   * Load local or network media resource with config.
   *
   * Available: since 3.3.0
   * Description: Load media resources.
   * Use case: Developers can load the absolute path to the local resource or the URL of the network resource incoming.
   * When to call: Called after the engine [createEngine] has been initialized and the media player [createMediaPlayer] has been created.
   * Related APIs: Support for loading resources through the [loadResourceWithPosition] or [loadResourceFromMediaData] interface.
   * Caution: If the mediaplayer has already loaded resources or is in the process of playing, please first call the [stop] interface to halt the playback, and then proceed to call the interface to load the media resources; failure to do so will result in an unsuccessful load.
   *
   * @param resource Multimedia resources that need to be loaded.
   * @return Callback result of loading media resource.
   */
  abstract loadResourceWithConfig(
    resource: ZegoMediaPlayerResource
  ): Promise<ZegoMediaPlayerLoadResourceResult>
  /**
   * Start playing.
   *
   * You need to load resources before playing
   */
  abstract start(): Promise<void>
  /**
   * Stop playing.
   */
  abstract stop(): Promise<void>
  /**
   * Pause playing.
   */
  abstract pause(): Promise<void>
  /**
   * Resume playing.
   */
  abstract resume(): Promise<void>
  /**
   * Set the specified playback progress.
   *
   * Unit is millisecond
   *
   * @param millisecond Point in time of specified playback progress
   * @return The result notification of set the specified playback progress
   */
  abstract seekTo(millisecond: number): Promise<ZegoMediaPlayerSeekToResult>
  /**
   * Whether to repeat playback.
   *
   * @param enable repeat playback flag. The default is false.
   */
  abstract enableRepeat(enable: boolean): Promise<void>
  /**
   * Set the speed of play.
   *
   * Available since: 2.12.0
   * Description: Set the playback speed of the player.
   * When to call: You should load resource before invoking this function.
   * Restrictions: None.
   * Related APIs: Resources can be loaded through the [loadResource] function.
   *
   * @param speed The speed of play. The default is 1.0.
   *   Versions 2.12.0 to 3.15.1: The range is 0.5 ~ 4.0.
   *   Versions 3.16.0 and above: The range is 0.3 ~ 4.0.
   */
  abstract setPlaySpeed(speed: number): Promise<void>
  /**
   * Whether to mix the player's sound into the stream being published.
   *
   * This interface will only mix the media player sound into the main channel
   *
   * @param enable Aux audio flag. The default is false.
   */
  abstract enableAux(enable: boolean): Promise<void>
  /**
   * Whether to play locally silently.
   *
   * If [enableAux] switch is turned on, there is still sound in the publishing stream. The default is false.
   *
   * @param mute Mute local audio flag, The default is false.
   */
  abstract muteLocal(mute: boolean): Promise<void>
  /**
   * Set the view of the player playing video.
   * Note: This function is only available in ZegoExpressVideo SDK!
   *
   * @param view Video rendered canvas object
   */
  abstract setPlayerView(view: ZegoView): Promise<void>
  /**
   * Set mediaplayer volume. Both the local play volume and the publish volume are set.
   *
   * @param volume The range is 0 ~ 200. The default is 60.
   */
  abstract setVolume(volume: number): Promise<void>
  /**
   * Set mediaplayer local playback volume.
   *
   * @param volume The range is 0 ~ 200. The default is 60.
   */
  abstract setPlayVolume(volume: number): Promise<void>
  /**
   * Set mediaplayer publish volume.
   *
   * @param volume The range is 0 ~ 200. The default is 60.
   */
  abstract setPublishVolume(volume: number): Promise<void>
  /**
   * Set playback progress callback interval.
   *
   * This function can control the callback frequency of [onMediaPlayerPlayingProgress]. When the callback interval is set to 0, the callback is stopped. The default callback interval is 1s
   * This callback are not returned exactly at the set callback interval, but rather at the frequency at which the audio or video frames are processed to determine whether the callback is needed to call
   *
   * @param millisecond Interval of playback progress callback in milliseconds
   */
  abstract setProgressInterval(millisecond: number): Promise<void>
  /**
   * Gets the current local playback volume of the mediaplayer, the range is 0 ~ 200, with the default value of 60.
   *
   * @return current volume
   */
  abstract getPlayVolume(): Promise<number>
  /**
   * Gets the current publish volume of the mediaplayer, the range is 0 ~ 200, with the default value of 60.
   *
   * @return current volume
   */
  abstract getPublishVolume(): Promise<number>
  /**
   * Get the total progress of your media resources.
   *
   * You should load resource before invoking this function, otherwise the return value is 0
   *
   * @return Unit is millisecond
   */
  abstract getTotalDuration(): Promise<number>
  /**
   * Get current playing progress.
   *
   * You should load resource before invoking this function, otherwise the return value is 0
   *
   * @return current progress
   */
  abstract getCurrentProgress(): Promise<number>
  /**
   * Get current rendering progress.
   *
   * You should load resource before invoking this function, otherwise the return value is 0
   *
   * @return current rendering progress
   */
  abstract getCurrentRenderingProgress(): Promise<number>
  /**
   * Get the number of audio tracks of the playback file.
   *
   * @return Number of audio tracks
   */
  abstract getAudioTrackCount(): Promise<number>
  /**
   * Set the audio track of the playback file.
   *
   * @param index Audio track index, the number of audio tracks can be obtained through the [getAudioTrackCount] function.
   */
  abstract setAudioTrackIndex(index: number): Promise<void>
  /**
   * Set the audio track mode of the player.
   *
   * Available since: 3.1.0
   * Description: Set the audio track mode of the player.
   * Use case: Under the real-time chorus (KTV), call the interface enable multi-track mode, call the interface [setAudioTrackIndex] to specify the original track to play, call interface [setAudioTrackPublishIndex] specified need publish of accompaniment tracks.
   * When to call: The call takes effect before [start] starts playing
   * Related APIs: Call [setAudioTrackIndex] to specified the play track of media file and call [setAudioTrackPublishIndex] to specified the publish track of media file.
   * Caution: When multi-track mode is enabled, the resource consumption of the hardware device is increased.
   *
   * @param mode Audio track mode.
   */
  abstract setAudioTrackMode(mode: ZegoMediaPlayerAudioTrackMode): Promise<void>
  /**
   * Set the audio track for the media file to be publish.
   *
   * Available since: 3.1.0
   * Description: Set the audio track for the media file to be publish.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Related APIs: The number of audio tracks can be obtained through the [getAudioTrackCount] function.
   * Caution: This call takes effect only after multitrack mode is enabled by calling the interface [setAudioTrackMode].
   *
   * @param index Audio track index, the number of audio tracks can be obtained through the [getAudioTrackCount] function.
   */
  abstract setAudioTrackPublishIndex(index: number): Promise<void>
  /**
   * Enable voice changer, set up the specific voice changer parameters.
   *
   * Available since: 3.15.0
   * Description: Enable voice changer, set up the specific voice changer parameters.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   *
   * @param audioChannel The audio channel to be voice changed
   * @param enable Whether enable voice changer or not. True - enabled, false - disabled, default value is false.
   * @param param Voice changer parameters
   */
  abstract enableVoiceChanger(
    audioChannel: ZegoMediaPlayerAudioChannel,
    enable: boolean,
    param: ZegoVoiceChangerParam
  ): Promise<void>
  /**
   * Get the current playback status.
   *
   * @return current state
   */
  abstract getCurrentState(): Promise<ZegoMediaPlayerState>
  /**
   * Get media player index.
   *
   * Description: Get media player index.
   * When to call: It can be called after [createMediaPlayer].
   * Restrictions: None.
   *
   * @return Media player index.
   */
  abstract getIndex(): number
  /**
   * Take a screenshot of the current playing screen of the media player.
   *
   * Only in the case of calling [setPlayerCanvas] to set the display controls and the playback state, can the screenshot be taken normally
   * Note: This function is only available in ZegoExpressVideo SDK!
   */
  abstract takeSnapshot(): Promise<ZegoMediaPlayerTakeSnapshotResult>
  /**
   * Set the maximum cache duration and cache data size of web materials.
   *
   * The setting must be called before loading the resource, and it will take effect during the entire life cycle of the media player.
   * Time and size are not allowed to be 0 at the same time. The SDK internal default time is 5000, and the size is 15*1024*1024 byte.When one of time and size reaches the set value first, the cache will stop.
   *
   * @param time The maximum length of the cache time, in ms, the SDK internal default is 5000; the effective value is greater than or equal to 2000; if you fill in 0, it means no limit.
   * @param size The maximum size of the cache, the unit is byte, the internal default size of the SDK is 15*1024*1024 byte; the effective value is greater than or equal to 5000000, if you fill in 0, it means no limit.
   */
  abstract setNetWorkResourceMaxCache(time: number, size: number): Promise<void>
  /**
   * Get the playable duration and size of the cached data of the current network material cache queue
   *
   * @return Returns the current cached information, including the length of time the data can be played and the size of the cached data.
   */
  abstract getNetWorkResourceCache(): Promise<ZegoNetWorkResourceCache>
  /**
   * Use this interface to set the cache threshold that the media player needs to resume playback. The SDK default value is 5000ms，The valid value is greater than or equal to 1000ms
   *
   * The setting must be called before loading the resource, and it will take effect during the entire life cycle of the media player.
   * When the network status is poor and the media player has finished playing the cached network resources, it will stop playing, and notify the user through the `ZegoMediaPlayerNetworkEvent.BUFFER_BEGIN` state of the callback interface `onMediaPlayerNetworkEvent` that the network resources are being recached.
   * Only when the cached network resources are greater than the set threshold, the media player will automatically resume playback at the original paused position, and notify the user through the `ZegoMediaPlayerNetworkEvent.BUFFER_ENDED` of the callback interface `onMediaPlayerNetworkEvent` that the user has cached the network resources The threshold was reached and playback resumed.
   *
   * @param threshold Threshold that needs to be reached to resume playback, unit ms.
   */
  abstract setNetWorkBufferThreshold(threshold: number): Promise<void>
  /**
   * Whether to enable sound level monitoring.
   *
   * Available since: 2.15.0
   * Description: Whether to enable sound level monitoring.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: None.
   * Related callbacks: After it is turned on, user can use the [onMediaPlayerSoundLevelUpdate] callback to monitor sound level updates.
   *
   * @param enable Whether to enable monitoring, true is enabled, false is disabled.
   * @param millisecond Monitoring time period of the sound level, in milliseconds, has a value range of [100, 3000].
   */
  abstract enableSoundLevelMonitor(enable: boolean, millisecond: number): Promise<void>
  /**
   * Whether to enable frequency spectrum monitoring.
   *
   * Available since: 2.15.0
   * Description: Whether to enable frequency spectrum monitoring.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: None.
   * Related APIs: After it is turned on, user can use the [onMediaPlayerFrequencySpectrumUpdate] callback to monitor frequency spectrum updates.
   *
   * @param enable Whether to enable monitoring, true is enabled, false is disabled.
   * @param millisecond Monitoring time period of the frequency spectrum, in milliseconds, has a value range of [10, 3000]. Note that on v3.19.0 and older version, the value range is [100, 3000].
   */
  abstract enableFrequencySpectrumMonitor(enable: boolean, millisecond: number): Promise<void>
  /**
   * Set the playback channel.
   *
   * Available since: 2.20.0
   * Description: Set the playback channel.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: None.
   *
   * @param audioChannel Playback channel, the default is ZegoMediaPlayerAudioChannelAll.
   */
  abstract setActiveAudioChannel(audioChannel: ZegoMediaPlayerAudioChannel): Promise<void>
  /**
   * Clears the last frame of the playback control that remains on the control after playback ends.
   *
   * Available since: 2.20.0
   * Description: Clears the last frame of the playback control that remains on the control after playback ends.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: The interface call takes effect only when the media player ends playing.
   */
  abstract clearView(): Promise<void>
  /**
   * Get meida information such as video resolution from media file.
   *
   * Available since: 3.6.0
   * Description: Get meida information such as video resolution from media file.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: None.
   */
  abstract getMediaInfo(): Promise<ZegoMediaPlayerMediaInfo>
  /**
   * Register the event handler of mediaplayer
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract on<MediaPlayerEventType extends keyof ZegoMediaPlayerListener>(
    event: MediaPlayerEventType,
    callback: ZegoMediaPlayerListener[MediaPlayerEventType]
  ): void
  /**
   * Unregister the event handler of mediaplayer
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract off<MediaPlayerEventType extends keyof ZegoMediaPlayerListener>(
    event: MediaPlayerEventType,
    callback: undefined | ZegoMediaPlayerListener[MediaPlayerEventType]
  ): void
  /**
   * Update the position of the media player (audio source).
   *
   * Available since: 3.6.0
   * Description: Update the position of the media player (audio source).
   * Use cases: The media player also needs to have 3D spatial sound.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: This interface needs to be used in conjunction with the RangeAudio/RangeScene module. This interface can only be called successfully after the RangeAudio/RangeScene module enables 3D sound effects.
   *
   * @param position The unit vector of the front axis of its own coordinate system. The parameter is a float array with a length of 3.
   */
  abstract updatePosition(position: number[]): Promise<void>
  /**
   * Set http headers.
   *
   * Available since: 3.8.0
   * Description: Call this function to set the http headers of the http network resource.
   * Use cases: When the network resource needs to set special header information.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Restrictions: Called before the corresponding network resource is loaded.
   *
   * @param headers Headers info.
   */
  abstract setHttpHeader(headers: Record<string, string>): Promise<void>
  /**
   * Set play media stream type.
   *
   * Available since: 3.10.0
   * Description: Configure the media stream type to be played. You can only play video streams or audio streams. This will take effect during the life cycle of the media player.
   * Use cases: When only the video stream or audio stream needs to be played.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Caution: Changing the media stream type during playing will take effect in the next playing.
   *
   * @param streamType Stream type.
   */
  abstract setPlayMediaStreamType(streamType: ZegoMediaStreamType): Promise<void>
  /**
   * Enable live audio effect.
   *
   * Available since: 3.10.0
   * Description: When the live audio effect is turned on, the spatial sense is enhanced and the instrument sounds become more prominent, without any increase in delay.
   * Use cases: It is commonly used in voice chat rooms and karaoke scenarios to enhance the live audio effects of the accompaniment.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   * Caution: To enhance the live audio effect experience, it is recommended to configure dual-channel stereo encoding. Developers can achieve this configuration by using the [setAudioCaptureStereoMode] method. Failure to configure dual-channel stereo encoding may significantly diminish the effects of certain songs, as the left and right channel effects may cancel each other out when synthesizing mono audio, resulting in less noticeable effects.
   *
   * @param enable Whether to enable live audio effect.
   * @param mode Live audio effect mode.
   */
  abstract enableLiveAudioEffect(enable: boolean, mode: ZegoLiveAudioEffectMode): Promise<void>
  /**
   * Enable local caching of http/https network resources.
   *
   * Available since: 3.12.0
   * Description: When playing http/https network resources, when the local cache is enabled, the network resources will be saved locally and the cache information will be called back through [onMediaPlayerLocalCache].
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer]. Called after [loadResource] or during playback, it will take effect next playback.
   * Caution: Only http/https single file type network resources are supported. If there is a [seek] operation during playback, the cache will fail.
   *
   * @param enable Whether to enable local caching.
   * @param cacheDir Cache dir. If left blank, the directory specified internally by SDK will be used.
   */
  abstract enableLocalCache(enable: boolean, cacheDir: string): Promise<void>
  /**
   * Enable the view mirror.
   *
   * Available since: 3.14.0
   * Description: Enable view mirror.
   * When to call: It can be called after the engine by [createEngine] has been initialized and the media player has been created by [createMediaPlayer].
   *
   * @param enable Whether to enable view mirror.
   */
  abstract enableViewMirror(enable: boolean): Promise<void>
  /**
   * Get playback statistics.
   *
   * Available since: 3.12.0
   * Description: Get current playback statistics to monitor whether decoding and rendering anomalies occur in the player.
   * Use cases: Typically used in cloud-based media player scenarios.
   * When to call: Invoke after the [loadResource] callback succeeds.
   */
  abstract getPlaybackStatistics(): Promise<ZegoMediaPlayerStatisticsInfo>
}
export declare abstract class ZegoAudioEffectPlayer {
  /**
   * Start playing audio effect.
   *
   * Available since: 1.16.0
   * Description: Start playing audio effect. The default is only played once and is not mixed into the publishing stream, if you want to change this please modify [config] param.
   * Use cases: When you need to play short sound effects, such as applause, cheers, etc., you can use this interface to achieve, and further configure the number of plays through the [config] parameter, and mix the sound effects into the push stream.
   * When to call: It can be called after [createAudioEffectPlayer].
   * Restrictions: None.
   *
   * @param audioEffectID Description: ID for the audio effect. The SDK uses audioEffectID to control the playback of sound effects. The SDK does not force the user to pass in this parameter as a fixed value. It is best to ensure that each sound effect can have a unique ID. The recommended methods are static self-incrementing ID or the hash of the incoming sound effect file path.
   * @param path The absolute path of the local resource. <br>Value range: "assets://"、"ipod-library://" and network url are not supported. Set path as null or "" if resource is loaded already using [loadResource].
   * @param config Audio effect playback configuration. <br>Default value: Set null will only be played once, and will not be mixed into the publishing stream.
   */
  abstract start(
    audioEffectID: number,
    path: undefined | string,
    config: undefined | ZegoAudioEffectPlayConfig
  ): Promise<void>
  /**
   * Stop playing audio effect.
   *
   * Available since: 1.16.0
   * Description: Stop playing the specified audio effect [audioEffectID].
   * When to call: The specified [audioEffectID] is [start].
   * Restrictions: None.
   *
   * @param audioEffectID ID for the audio effect.
   */
  abstract stop(audioEffectID: number): Promise<void>
  /**
   * Pause playing audio effect.
   *
   * Available since: 1.16.0
   * Description: Pause playing the specified audio effect [audioEffectID].
   * When to call: The specified [audioEffectID] is [start].
   * Restrictions: None.
   *
   * @param audioEffectID ID for the audio effect.
   */
  abstract pause(audioEffectID: number): Promise<void>
  /**
   * Resume playing audio effect.
   *
   * Available since: 1.16.0
   * Description: Resume playing the specified audio effect [audioEffectID].
   * When to call: The specified [audioEffectID] is [pause].
   * Restrictions: None.
   *
   * @param audioEffectID ID for the audio effect.
   */
  abstract resume(audioEffectID: number): Promise<void>
  /**
   * Stop playing all audio effect.
   *
   * Available since: 1.16.0
   * Description: Stop playing all audio effect.
   * When to call: Some audio effects are Playing.
   * Restrictions: None.
   */
  abstract stopAll(): Promise<void>
  /**
   * Pause playing all audio effect.
   *
   * Available since: 1.16.0
   * Description: Pause playing all audio effect.
   * When to call: It can be called after [createAudioEffectPlayer].
   * Restrictions: None.
   */
  abstract pauseAll(): Promise<void>
  /**
   * Resume playing all audio effect.
   *
   * Available since: 1.16.0
   * Description: Resume playing all audio effect.
   * When to call: It can be called after [pauseAll].
   * Restrictions: None.
   */
  abstract resumeAll(): Promise<void>
  /**
   * Set the specified playback progress.
   *
   * Available since: 1.16.0
   * Description: Set the specified audio effect playback progress. Unit is millisecond.
   * When to call: The specified [audioEffectID] is[start], and not finished.
   * Restrictions: None.
   *
   * @param audioEffectID ID for the audio effect.
   * @param millisecond Point in time of specified playback progress.
   * @return Result for audio effect player seek to playback progress
   */
  abstract seekTo(
    audioEffectID: number,
    millisecond: number
  ): Promise<ZegoAudioEffectPlayerSeekToResult>
  /**
   * Set volume for a single audio effect. Both the local play volume and the publish volume are set.
   *
   * Available since: 1.16.0
   * Description: Set volume for a single audio effect. Both the local play volume and the publish volume are set.
   * When to call: The specified [audioEffectID] is [start].
   * Restrictions: None.
   *
   * @param audioEffectID ID for the audio effect.
   * @param volume Volume. <br>Value range: The range is 0 ~ 200. <br>Default value: The default is 100.
   */
  abstract setVolume(audioEffectID: number, volume: number): Promise<void>
  /**
   * Set volume for all audio effect. Both the local play volume and the publish volume are set.
   *
   * Available since: 1.16.0
   * Description: Set volume for all audio effect. Both the local play volume and the publish volume are set.
   * When to call: It can be called after [createAudioEffectPlayer].
   * Restrictions: None.
   *
   * @param volume Volume. <br>Value range: The range is 0 ~ 200. <br>Default value: The default is 100.
   */
  abstract setVolumeAll(volume: number): Promise<void>
  /**
   * Get the total duration of the specified audio effect resource.
   *
   * Available since: 1.16.0
   * Description: Get the total duration of the specified audio effect resource. Unit is millisecond.
   * When to call: You should invoke this function after the audio effect resource already loaded, otherwise the return value is 0.
   * Restrictions: It can be called after [createAudioEffectPlayer].
   * Related APIs: [start], [loadResource].
   *
   * @param audioEffectID ID for the audio effect.
   * @return Unit is millisecond.
   */
  abstract getTotalDuration(audioEffectID: number): Promise<number>
  /**
   * Get current playback progress.
   *
   * Available since: 1.16.0
   * Description: Get current playback progress of the specified audio effect. Unit is millisecond.
   * When to call: You should invoke this function after the audio effect resource already loaded, otherwise the return value is 0.
   * Restrictions: None.
   * Related APIs: [start], [loadResource].
   *
   * @param audioEffectID ID for the audio effect.
   */
  abstract getCurrentProgress(audioEffectID: number): Promise<number>
  /**
   * Load audio effect resource.
   *
   * Available since: 1.16.0
   * Description: Load audio effect resource.
   * Use cases: In a scene where the same sound effect is played frequently, the SDK provides the function of preloading the sound effect file into the memory in order to optimize the performance of repeatedly reading and decoding the file.
   * When to call: It can be called after [createAudioEffectPlayer].
   * Restrictions: Preloading supports loading up to 15 sound effect files at the same time, and the duration of the sound effect files cannot exceed 30s, otherwise an error will be reported when loading.
   *
   * @param audioEffectID ID for the audio effect.
   * @param path the absolute path of the audio effect resource and cannot be null or "". <br>Value range: "assets://"、"ipod-library://" and network url are not supported.
   * @return Result for audio effect player loads resources
   */
  abstract loadResource(
    audioEffectID: number,
    path: string
  ): Promise<ZegoAudioEffectPlayerLoadResourceResult>
  /**
   * Unload audio effect resource.
   *
   * Available since: 1.16.0
   * Description: Unload the specified audio effect resource.
   * When to call: After the sound effects are used up, related resources can be released through this function; otherwise, the SDK will release the loaded resources when the AudioEffectPlayer instance is destroyed.
   * Restrictions: None.
   * Related APIs: [loadResource].
   *
   * @param audioEffectID ID for the audio effect loaded.
   */
  abstract unloadResource(audioEffectID: number): Promise<void>
  /**
   * Get audio effect player index.
   *
   * Available since: 1.16.0
   * Description: Get audio effect player index.
   * When to call: It can be called after [createAudioEffectPlayer].
   * Restrictions: None.
   *
   * @return Audio effect player index.
   */
  abstract getIndex(): number
  /**
   * Register the event handler of mediaplayer
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract on<AudioEffectPlayerEventType extends keyof ZegoAudioEffectPlayerListener>(
    event: AudioEffectPlayerEventType,
    callback: ZegoAudioEffectPlayerListener[AudioEffectPlayerEventType]
  ): void
  /**
   * Unregister the event handler of mediaplayer
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract off<AudioEffectPlayerEventType extends keyof ZegoAudioEffectPlayerListener>(
    event: AudioEffectPlayerEventType,
    callback: undefined | ZegoAudioEffectPlayerListener[AudioEffectPlayerEventType]
  ): void
}
export declare abstract class ZegoCopyrightedMusic {
  /**
   * Initialize the copyrighted music module.
   *
   * Available since: 2.13.0
   * Description: Initialize the copyrighted music so that you can use the function of the copyrighted music later.
   * When to call: After call [createCopyrightedMusic] and [loginRoom].
   * Caution: 1. The real user information must be passed in, otherwise the song resources cannot be obtained for playback. 2. The user ID set when initializing copyrighted music needs to be the same as the user ID set when logging in to the room.
   *
   * @param config the copyrighted music configuration.
   * @return The result of initializing the copyrighted music module.
   */
  abstract initCopyrightedMusic(
    config: ZegoCopyrightedMusicConfig
  ): Promise<ZegoCopyrightedMusicInitResult>
  /**
   * Get cache size.
   *
   * Available since: 2.13.0
   * Description: When using this module, some cache files may be generated, and the size of the cache file can be obtained through this interface.
   * Use case: Used to display the cache size of the App.
   * When to call: After initializing the copyrighted music [createCopyrightedMusic].
   *
   * @return cache file size, in byte.
   */
  abstract getCacheSize(): Promise<number>
  /**
   * Clear cache.
   *
   * Available since: 2.13.0
   * Description: When using this module, some cache files may be generated, which can be cleared through this interface.
   * Use case: Used to clear the cache of the App.
   * When to call: After initializing the copyrighted music [createCopyrightedMusic].
   */
  abstract clearCache(): Promise<void>
  /**
   * Send extended feature request.
   *
   * Available since: 2.13.0
   * Description: Initialize the copyrighted music so that you can use the function of the copyrighted music later.
   * Use case: Used to get a list of songs.
   * When to call: After initializing the copyrighted music success [initCopyrightedMusic].
   *
   * @param command request command, details about the commands supported.
   * @param params request parameters, each request command has corresponding request parameters.
   * @return Send the extension function to request the result callback.
   */
  abstract sendExtendedRequest(
    command: string,
    params: string
  ): Promise<ZegoCopyrightedMusicSendExtendedRequestResult>
  /**
   * Get lyrics in lrc format.
   *
   * Available since: 3.12.0
   * Description: Get lyrics in lrc format, support parsing lyrics line by line.
   * Use case: Used to display lyrics line by line.
   * When to call: After initializing the copyrighted music success [initCopyrightedMusic].
   *
   * @param config The configuration of get lyric.
   * @return The result of getting lrc lyrics.
   */
  abstract getLrcLyric(
    config: ZegoCopyrightedMusicGetLyricConfig
  ): Promise<ZegoCopyrightedMusicGetLrcLyricResult>
  /**
   * Get lyrics in krc format.
   *
   * Available since: 2.13.0
   * Description: Get verbatim lyrics, support parsing lyrics word by word.
   * Use case: Used to display lyrics word by word.
   * When to call: After initializing the copyrighted music success [initCopyrightedMusic].
   *
   * @param krcToken The krcToken obtained when calling [requestResource] for accompaniment or climax clips, or when obtaining shared resources through the [getSharedResource] interface. For more details, please refer to https://doc-zh.zego.im/article/15079#2_2
   * @return The result of getting verbatim lyrics.
   */
  abstract getKrcLyricByToken(
    krcToken: string
  ): Promise<ZegoCopyrightedMusicGetKrcLyricByTokenResult>
  /**
   * Request music resource.
   *
   * Available since: 3.12.0
   * Description: In addition to obtaining the basic information of the song (duration, song name, singer, etc.), and the most important resource id that can be used for local playback, there are also some related authentications information.
   * Use case: Get copyrighted songs for local playback and sharing.
   * Related APIs: After a user in the room successfully calls this interface to request a music resource, other users in the room can call the [getsharedresource] interface to get the music resource for free once.
   * When to call: After initializing the copyrighted music [initCopyrightedMusic].
   * Note:
   *   1. Each resource has a unique resource ID.
   *   2. Every time this API is called, it will be billed once, please consult ZEGO business personnel for details.
   *   3. Each resource has a unique resource ID. The resources obtained by calling this API are time-sensitive, the valid duration is the minimum value between the SDK life cycle and 24-hour.
   *
   * @param config The configuration of requesting music resource.
   * @return Result of requesting music resource.
   */
  abstract requestResource(
    config: ZegoCopyrightedMusicRequestConfigV2
  ): Promise<ZegoCopyrightedMusicRequestResourceResult>
  /**
   * Get shared music resource.
   *
   * Available since: 3.12.0
   * Description: In addition to obtaining the basic information of the song (duration, song name, singer, etc.), and the most important resource id that can be used for local playback, there are also some related authentications information.
   * Use case: Get copyrighted songs for local playback.
   * Related APIs: After a user in the room calls the [requestresource] interface to request a music resource successfully, other users in the room can call this interface to get the music resource for free once.
   * When to call: After initializing the copyrighted music [initCopyrightedMusic].
   * Note: Each resource has a unique resource ID. The resources obtained by calling this API are time-sensitive, the valid duration is the minimum value between the SDK life cycle and 24-hour.
   *
   * @param config The configuration of getting shared music resource.
   * @return Result of getting shared music resource.
   */
  abstract getSharedResource(
    config: ZegoCopyrightedMusicGetSharedConfigV2
  ): Promise<ZegoCopyrightedMusicGetSharedResourceResult>
  /**
   * Download music resource.
   *
   * Available since: 2.13.0
   * Description: Download music resource. It can only be played after downloading successfully.
   * Use case: After obtaining the music resource authorization, use this interface to download the corresponding resources.
   * When to call: After initializing the copyrighted music success [initCopyrightedMusic].
   * Caution: Downloading copyrighted music resources is affected by the Internet.
   *
   * @param resourceID the resource ID corresponding to the song or accompaniment.
   * @return download song or accompaniment result.
   */
  abstract download(resourceID: string): Promise<ZegoCopyrightedMusicDownloadResult>
  /**
   * Cancel download of music resource.
   *
   * Available since: 3.11.0
   * Description: Cancel download of music resource.
   * Use case: After starting to download music resources, use this interface to cancel the corresponding download task.
   * When to call: After starting the download [download].
   * Caution: When a valid resourceID is passed in, only unfinished download tasks will be cancelled. When empty is passed in, all unfinished download tasks will be canceled.
   *
   * @param resourceID the resource ID corresponding to the song or accompaniment.
   */
  abstract cancelDownload(resourceID: string): Promise<void>
  /**
   * Query the resource's cache is existed or not.
   *
   * Available since: 3.12.0
   * Description: Query the resource is existed or not, query the Yinsuda resource cache by default
   * Use case: Can be used to check the resource's cache is existed or not
   * When to call: After initializing the copyrighted music success [initCopyrightedMusic].
   *
   * @param config The configuration of querying cache.
   */
  abstract queryCache(config: ZegoCopyrightedMusicQueryCacheConfigV2): Promise<boolean>
  /**
   * Get the playing time of a song or accompaniment file.
   *
   * Available since: 2.13.0
   * Description: Get the playing time of a song or accompaniment file.
   * Use case: Can be used to display the playing time information of the song or accompaniment on the view.
   * When to call: After initializing the copyrighted music success [initCopyrightedMusic].
   *
   * @param resourceID the resource ID corresponding to the song or accompaniment.
   */
  abstract getDuration(resourceID: string): Promise<number>
  /**
   * Set the difficulty level of scoring.
   *
   * Available since: 2.22.0
   * Description: Users can set the scoring difficulty level through this function.
   * When to call: After calling [initCopyrightedMusic] to initialize copyrighted music successfully, call [startScore] to start scoring.
   * Default value: When this function is not called, the difficulty level of scoring is 4.
   * Restrictions: This function does not support dynamic settings. After calling this function successfully, the next call to [startScore] will take effect.
   *
   * @param level The difficulty level of scoring. The level ranges from 0 to 4. The scoring difficulty decreases from 0 to 4.
   */
  abstract setScoringLevel(level: number): Promise<void>
  /**
   * Start scoring.
   *
   * Available since: 2.15.0
   * Description: Start the scoring function.After starting scoring, the scoring result OnCurrentPitchValueUpdate callback will be received according to the set callback time interval.
   * Use case: Can be used to display the singing score on the view.
   * When to call: After obtaining verbatim lyrics and playing the accompaniment resources of copyrighted music.
   * Restrictions: Only support use this api after [startPublishingStream].
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @param pitchValueInterval the time interval of real-time pitch line callback, in milliseconds, the default is 50 milliseconds.
   * @return Error code. Refer to the value of [ZegoErrorCode].
   */
  abstract startScore(resourceID: string, pitchValueInterval: number): Promise<number>
  /**
   * Pause scoring.
   *
   * Available since: 2.15.0
   * Description: Pause ongoing scoring,will stop the [OnCurrentPitchValueUpdate] callback.
   * Use case: You can call this interface to pause the scoring function while scoring.
   * When to call: It can be called while grading.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Error code. Refer to the value of [ZegoErrorCode].
   */
  abstract pauseScore(resourceID: string): Promise<number>
  /**
   * Resume scoring.
   *
   * Available since: 2.15.0
   * Description: Resume currently paused scoring.
   * Use case: When there is currently paused scoring, this interface can be called to resume the scoring function.
   * When to call: It can be called when there is currently a paused scoring.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Error code. Refer to the value of [ZegoErrorCode].
   */
  abstract resumeScore(resourceID: string): Promise<number>
  /**
   * Stop scoring.
   *
   * Available since: 2.15.0
   * Description: End the current rating.The [OnCurrentPitchValueUpdate] callback will be stopped, but the average or total score can still be obtained normally.
   * Use case: You can call this interface to end the scoring while scoring.
   * When to call: It can be called while grading.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Error code. Refer to the value of [ZegoErrorCode].
   */
  abstract stopScore(resourceID: string): Promise<number>
  /**
   * Reset scoring.
   *
   * Available since: 2.15.0
   * Description: Reset the scores that have already been performed,The [OnCurrentPitchValueUpdate] callback will be stopped and the average or total score will be 0.
   * Use case: Often used in scenes where the same song is re-sung.
   * When to call: It can be called after scoring has been performed.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Error code. Refer to the value of [ZegoErrorCode].
   */
  abstract resetScore(resourceID: string): Promise<number>
  /**
   * Get the score of the previous sentence.
   *
   * Available since: 2.15.0
   * Description: Get the score of the previous sentence.
   * Use case: Can be used to display the score of each sentence on the view.
   * When to call: It can be called after playing the copyright accompaniment or accompaniment clip and starting to score.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return The score of the previous sentence.
   */
  abstract getPreviousScore(resourceID: string): Promise<number>
  /**
   * Get average score.
   *
   * Available since: 2.15.0
   * Description: Get the average score.
   * Use case: Can be used to display the average score on the view.
   * When to call: It can be called after playing the copyright accompaniment or accompaniment clip and starting to score.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Average score.
   */
  abstract getAverageScore(resourceID: string): Promise<number>
  /**
   * Get total score .
   *
   * Available since: 2.15.0
   * Description: Get the total score.
   * Use case: Can be used to display the total score on the view.
   * When to call: It can be called after playing the copyright accompaniment or accompaniment clip and starting to score.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Total score.
   */
  abstract getTotalScore(resourceID: string): Promise<number>
  /**
   * Get full score .
   *
   * Available since: 3.0.2
   * Description: Get the full score.
   * Use case: Can be used to display the full score on the view.
   * When to call: It can be called after playing the copyright accompaniment or accompaniment clip and starting to score.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return Full score.
   */
  abstract getFullScore(resourceID: string): Promise<number>
  /**
   * Get standard pitch data.
   *
   * Available since: 2.15.0
   * Description: Get standard pitch data.
   * Use case: Can be used to display standard pitch lines on the view.
   * Caution: Only accompaniment or climactic clip assets have pitch lines.
   *
   * @param resourceID the resource ID corresponding to the accompaniment or accompaniment clip.
   * @return The result of getting standard pitch data.
   */
  abstract getStandardPitch(resourceID: string): Promise<ZegoCopyrightedMusicGetStandardPitchResult>
  /**
   * Get real-time pitch data.
   *
   * Available since: 2.15.0
   * Description: Get real-time pitch data.
   * Use case: Can be used to display real-time pitch lines on the view.
   * When to call: It can be called after playing the copyright accompaniment or accompaniment clip and starting to score.
   *
   * @param resourceID the resource ID corresponding to the song or accompaniment.
   * @return Real-time pitch data.
   */
  abstract getCurrentPitch(resourceID: string): Promise<number>
  /**
   * Register the event handler of copyrighted music
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract on<CopyrightedMusicEventType extends keyof ZegoCopyrightedMusicListener>(
    event: CopyrightedMusicEventType,
    callback: ZegoCopyrightedMusicListener[CopyrightedMusicEventType]
  ): void
  /**
   * Unregister the event handler of copyrighted music
   *
   * @param event Event type.
   * @param callback Call back.
   */
  abstract off<CopyrightedMusicEventType extends keyof ZegoCopyrightedMusicListener>(
    event: CopyrightedMusicEventType,
    callback: undefined | ZegoCopyrightedMusicListener[CopyrightedMusicEventType]
  ): void
}
/**
 * Callback for setting room extra information.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoRoomSetRoomExtraInfoResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Login room result callback.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param extendedData Extended Information
 */
export interface ZegoRoomLoginResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Extended Information */
  extendedData: string
}
/**
 * Logout room result callback.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param extendedData Extended Information
 */
export interface ZegoRoomLogoutResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Extended Information */
  extendedData: string
}
/**
 * Callback for setting stream extra information.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoPublisherSetStreamExtraInfoResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for add/remove CDN URL.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoPublisherUpdateCdnUrlResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Results of take publish stream snapshot.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param imageBase64 Screenshot image base64 encoding
 */
export interface ZegoPublisherTakeSnapshotResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Screenshot image base64 encoding */
  imageBase64: string
}
/**
 * Results of take play stream snapshot.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param imageBase64 Screenshot image base64 encoding
 */
export interface ZegoPlayerTakeSnapshotResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Screenshot image base64 encoding */
  imageBase64: string
}
/**
 * Results of starting a mixer task.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param extendedData Extended Information
 */
export interface ZegoMixerStartResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Extended Information */
  extendedData: string
}
/**
 * Results of stoping a mixer task.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoMixerStopResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for sending real-time sequential data.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoRealTimeSequentialDataSentResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for sending broadcast messages.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param messageID ID of this message
 */
export interface ZegoIMSendBroadcastMessageResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** ID of this message */
  messageID: number
}
/**
 * Callback for sending barrage message.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param messageID ID of this message
 */
export interface ZegoIMSendBarrageMessageResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** ID of this message */
  messageID: string
}
/**
 * Callback for sending custom command.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoIMSendCustomCommandResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for media player loads resources.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoMediaPlayerLoadResourceResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for media player seek to playback progress.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoMediaPlayerSeekToResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * The callback of the screenshot of the media player playing screen
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param imageBase64 Screenshot image base64 encoding
 */
export interface ZegoMediaPlayerTakeSnapshotResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Screenshot image base64 encoding */
  imageBase64: string
}
/**
 * Callback for audio effect player loads resources.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoAudioEffectPlayerLoadResourceResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for audio effect player seek to playback progress.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoAudioEffectPlayerSeekToResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback for copyrighted music init.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoCopyrightedMusicInitResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Callback of sending extended feature request.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param command request command.
 * @param result request result, each request command has corresponding request result.
 */
export interface ZegoCopyrightedMusicSendExtendedRequestResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** request command. */
  command: string
  /** request result, each request command has corresponding request result. */
  result: string
}
/**
 * Get lrc format lyrics complete callback.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param lyrics lrc format lyrics.
 */
export interface ZegoCopyrightedMusicGetLrcLyricResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** lrc format lyrics. */
  lyrics: string
}
/**
 * Get verbatim lyrics complete callback.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param lyrics verbatim lyrics.
 */
export interface ZegoCopyrightedMusicGetKrcLyricByTokenResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** verbatim lyrics. */
  lyrics: string
}
/**
 * Callback of requesting music resource.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param resource The JSON string returned by the song ordering service, including music resource information.
 */
export declare class ZegoCopyrightedMusicRequestResourceResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** The JSON string returned by the song ordering service, including music resource information. */
  resource: string
  constructor(errorCode: number, resource: string)
}
/**
 * Callback of getting shared music resource.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param resource The JSON string returned by the song ordering service, including music resource information.
 */
export interface ZegoCopyrightedMusicGetSharedResourceResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** The JSON string returned by the song ordering service, including music resource information. */
  resource: string
}
/**
 * Callback for download song or accompaniment.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 */
export interface ZegoCopyrightedMusicDownloadResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
}
/**
 * Get standard pitch data complete callback.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param pitch Standard pitch data.
 */
export interface ZegoCopyrightedMusicGetStandardPitchResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode: number
  /** Standard pitch data. */
  pitch: string
}
