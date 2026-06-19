/** Room scenario. */
export var ZegoScenario
;(function (ZegoScenario) {
  /** [Deprecated] Legacy general scenario, this scenario has been deprecated since version 3.0.0, and it is not recommended to use, please migrate to other new scenario as soon as possible. */
  ZegoScenario[(ZegoScenario['General'] = 0)] = 'General'
  /** [Deprecated] Legacy communication scenario, this scenario has been deprecated since version 3.0.0, and it is not recommended to use, please migrate to other new scenario as soon as possible. */
  ZegoScenario[(ZegoScenario['Communication'] = 1)] = 'Communication'
  /** [Deprecated] Legacy live broadcast scenario, this scenario has been deprecated since version 3.0.0, and it is not recommended to use, please migrate to other new scenario as soon as possible. */
  ZegoScenario[(ZegoScenario['Live'] = 2)] = 'Live'
  /** Available since: 3.0.0. Description: The default (generic) scenario. If none of the following scenarios conform to your actual application scenario, this default scenario can be used. */
  ZegoScenario[(ZegoScenario['Default'] = 3)] = 'Default'
  /** Available since: 3.0.0. Description: Standard video call scenario, it is suitable for one-to-one video call scenarios. */
  ZegoScenario[(ZegoScenario['StandardVideoCall'] = 4)] = 'StandardVideoCall'
  /** Available since: 3.0.0. Description: High quality video call scenario, it is similar to the standard video call scenario, but this scenario uses a higher video frame rate, bit rate, and resolution (540p) by default, which is suitable for video call scenario with high image quality requirements. */
  ZegoScenario[(ZegoScenario['HighQualityVideoCall'] = 5)] = 'HighQualityVideoCall'
  /** Available since: 3.0.0. Description: Standard chatroom scenario, suitable for multi-person pure voice calls (low data usage). Note: On the ExpressVideo SDK, the camera is not enabled by default in this scenario. */
  ZegoScenario[(ZegoScenario['StandardChatroom'] = 6)] = 'StandardChatroom'
  /** Available since: 3.0.0. Description: High quality chatroom scenario, it is similar to the standard chatroom scenario, but this scenario uses a higher audio bit rate than the standard chatroom scenario by default. It is suitable for multi-person pure voice call scenarios with high requirements on sound quality. Note: On the ExpressVideo SDK, the camera is not enabled by default in this scenario. */
  ZegoScenario[(ZegoScenario['HighQualityChatroom'] = 7)] = 'HighQualityChatroom'
  /** Available since: 3.0.0. Description: Live broadcast scenario, it is suitable for one-to-many live broadcast scenarios such as shows, games, e-commerce, and large educational classes. The audio and video quality, fluency, and compatibility have been optimized. Note: Even in live broadcast scenarios, the SDK has no business "roles" (such as anchors and viewers), and all users in the room can publish and play streams. */
  ZegoScenario[(ZegoScenario['Broadcast'] = 8)] = 'Broadcast'
  /** Available since: 3.0.0. Description: Karaoke (KTV) scenario, it is suitable for real-time chorus and online karaoke scenarios, and has optimized delay, sound quality, ear return, echo cancellation, etc., and also ensures accurate alignment and ultra-low delay when multiple people chorus. */
  ZegoScenario[(ZegoScenario['Karaoke'] = 9)] = 'Karaoke'
  /** Available since: 3.3.0. Description: Standard voice call scenario, it is suitable for one-to-one video or voice call scenarios. Note: On the ExpressVideo SDK, the camera is not enabled by default in this scenario. */
  ZegoScenario[(ZegoScenario['StandardVoiceCall'] = 10)] = 'StandardVoiceCall'
})(ZegoScenario || (ZegoScenario = {}))
/** Room mode. */
export var ZegoRoomMode
;(function (ZegoRoomMode) {
  /** Single room mode. */
  ZegoRoomMode[(ZegoRoomMode['SingleRoom'] = 0)] = 'SingleRoom'
  /** Multiple room mode. */
  ZegoRoomMode[(ZegoRoomMode['MultiRoom'] = 1)] = 'MultiRoom'
})(ZegoRoomMode || (ZegoRoomMode = {}))
/** engine state. */
export var ZegoEngineState
;(function (ZegoEngineState) {
  /** The engine has started */
  ZegoEngineState[(ZegoEngineState['Start'] = 0)] = 'Start'
  /** The engine has stoped */
  ZegoEngineState[(ZegoEngineState['Stop'] = 1)] = 'Stop'
})(ZegoEngineState || (ZegoEngineState = {}))
/** Room state. */
export var ZegoRoomState
;(function (ZegoRoomState) {
  /** Unconnected state, enter this state before logging in and after exiting the room. If there is a steady state abnormality in the process of logging in to the room, such as AppID or Token are incorrect, or if the same user name is logged in elsewhere and the local end is KickOut, it will enter this state. */
  ZegoRoomState[(ZegoRoomState['Disconnected'] = 0)] = 'Disconnected'
  /** The state that the connection is being requested. It will enter this state after successful execution login room function. The display of the UI is usually performed using this state. If the connection is interrupted due to poor network quality, the SDK will perform an internal retry and will return to the requesting connection status. */
  ZegoRoomState[(ZegoRoomState['Connecting'] = 1)] = 'Connecting'
  /** The status that is successfully connected. Entering this status indicates that the login to the room has been successful. The user can receive the callback notification of the user and the stream information in the room. */
  ZegoRoomState[(ZegoRoomState['Connected'] = 2)] = 'Connected'
})(ZegoRoomState || (ZegoRoomState = {}))
/** Room state change reason. */
export var ZegoRoomStateChangedReason
;(function (ZegoRoomStateChangedReason) {
  /** Logging in to the room. When calling [loginRoom] to log in to the room or [switchRoom] to switch to the target room, it will enter this state, indicating that it is requesting to connect to the server. The application interface is usually displayed through this state. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['Logining'] = 0)] = 'Logining'
  /** Log in to the room successfully. When the room is successfully logged in or switched, it will enter this state, indicating that the login to the room has been successful, and users can normally receive callback notifications of other users in the room and all stream information additions and deletions. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['Logined'] = 1)] = 'Logined'
  /** Failed to log in to the room. When the login or switch room fails, it will enter this state, indicating that the login or switch room has failed, for example, AppID or Token is incorrect, etc. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['LoginFailed'] = 2)] = 'LoginFailed'
  /** The room connection is temporarily interrupted. If the interruption occurs due to poor network quality, the SDK will retry internally. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['Reconnecting'] = 3)] = 'Reconnecting'
  /** The room is successfully reconnected. If there is an interruption due to poor network quality, the SDK will retry internally, and enter this state after successful reconnection. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['Reconnected'] = 4)] = 'Reconnected'
  /** The room fails to reconnect. If there is an interruption due to poor network quality, the SDK will retry internally, and enter this state after the reconnection fails. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['ReconnectFailed'] = 5)] =
    'ReconnectFailed'
  /** Kicked out of the room by the server. For example, if you log in to the room with the same user name in other places, and the local end is kicked out of the room, it will enter this state. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['KickOut'] = 6)] = 'KickOut'
  /** Logout of the room is successful. It is in this state by default before logging into the room. When calling [logoutRoom] to log out of the room successfully or [switchRoom] to log out of the current room successfully, it will enter this state. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['Logout'] = 7)] = 'Logout'
  /** Failed to log out of the room. Enter this state when calling [logoutRoom] fails to log out of the room or [switchRoom] fails to log out of the current room internally. */
  ZegoRoomStateChangedReason[(ZegoRoomStateChangedReason['LogoutFailed'] = 8)] = 'LogoutFailed'
})(ZegoRoomStateChangedReason || (ZegoRoomStateChangedReason = {}))
/** Publish channel. */
export var ZegoPublishChannel
;(function (ZegoPublishChannel) {
  /** The main (default/first) publish channel. */
  ZegoPublishChannel[(ZegoPublishChannel['Main'] = 0)] = 'Main'
  /** The auxiliary (second) publish channel */
  ZegoPublishChannel[(ZegoPublishChannel['Aux'] = 1)] = 'Aux'
  /** The third publish channel */
  ZegoPublishChannel[(ZegoPublishChannel['Third'] = 2)] = 'Third'
  /** The fourth publish channel */
  ZegoPublishChannel[(ZegoPublishChannel['Fourth'] = 3)] = 'Fourth'
})(ZegoPublishChannel || (ZegoPublishChannel = {}))
/** Video rendering fill mode. */
export var ZegoViewMode
;(function (ZegoViewMode) {
  /** The proportional scaling up, there may be black borders */
  ZegoViewMode[(ZegoViewMode['AspectFit'] = 0)] = 'AspectFit'
  /** The proportional zoom fills the entire View and may be partially cut */
  ZegoViewMode[(ZegoViewMode['AspectFill'] = 1)] = 'AspectFill'
  /** Fill the entire view, the image may be stretched */
  ZegoViewMode[(ZegoViewMode['ScaleToFill'] = 2)] = 'ScaleToFill'
})(ZegoViewMode || (ZegoViewMode = {}))
/** Mirror mode for previewing or playing the of the stream. */
export var ZegoVideoMirrorMode
;(function (ZegoVideoMirrorMode) {
  /** The mirror image only for previewing locally. This mode is used by default. When the mobile terminal uses a rear camera, this mode is still used by default, but it does not work. Local preview does not set mirroring. */
  ZegoVideoMirrorMode[(ZegoVideoMirrorMode['OnlyPreviewMirror'] = 0)] = 'OnlyPreviewMirror'
  /** Both the video previewed locally and the far end playing the stream will see mirror image. */
  ZegoVideoMirrorMode[(ZegoVideoMirrorMode['BothMirror'] = 1)] = 'BothMirror'
  /** Both the video previewed locally and the far end playing the stream will not see mirror image. */
  ZegoVideoMirrorMode[(ZegoVideoMirrorMode['NoMirror'] = 2)] = 'NoMirror'
  /** The mirror image only for far end playing the stream. */
  ZegoVideoMirrorMode[(ZegoVideoMirrorMode['OnlyPublishMirror'] = 3)] = 'OnlyPublishMirror'
})(ZegoVideoMirrorMode || (ZegoVideoMirrorMode = {}))
/** Publish stream status. */
export var ZegoPublisherState
;(function (ZegoPublisherState) {
  /** The state is not published, and it is in this state before publishing the stream. If a steady-state exception occurs in the publish process, such as AppID or Token are incorrect, or if other users are already publishing the stream, there will be a failure and enter this state. */
  ZegoPublisherState[(ZegoPublisherState['NoPublish'] = 0)] = 'NoPublish'
  /** The state that it is requesting to publish the stream after the [startPublishingStream] function is successfully called. The UI is usually displayed through this state. If the connection is interrupted due to poor network quality, the SDK will perform an internal retry and will return to the requesting state. */
  ZegoPublisherState[(ZegoPublisherState['PublishRequesting'] = 1)] = 'PublishRequesting'
  /** The state that the stream is being published, entering the state indicates that the stream has been successfully published, and the user can communicate normally. */
  ZegoPublisherState[(ZegoPublisherState['Publishing'] = 2)] = 'Publishing'
})(ZegoPublisherState || (ZegoPublisherState = {}))
/** Voice changer preset value. */
export var ZegoVoiceChangerPreset
;(function (ZegoVoiceChangerPreset) {
  /** No Voice changer */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['None'] = 0)] = 'None'
  /** Male to child voice (loli voice effect) */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['MenToChild'] = 1)] = 'MenToChild'
  /** Male to female voice (kindergarten voice effect) */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['MenToWomen'] = 2)] = 'MenToWomen'
  /** Female to child voice */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['WomenToChild'] = 3)] = 'WomenToChild'
  /** Female to male voice */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['WomenToMen'] = 4)] = 'WomenToMen'
  /** Foreigner voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Foreigner'] = 5)] = 'Foreigner'
  /** Autobot Optimus Prime voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['OptimusPrime'] = 6)] = 'OptimusPrime'
  /** Android robot voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Android'] = 7)] = 'Android'
  /** Ethereal voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Ethereal'] = 8)] = 'Ethereal'
  /** Magnetic(Male) voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['MaleMagnetic'] = 9)] = 'MaleMagnetic'
  /** Fresh(Female) voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['FemaleFresh'] = 10)] = 'FemaleFresh'
  /** Electronic effects in C major voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['MajorC'] = 11)] = 'MajorC'
  /** Electronic effects in A minor voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['MinorA'] = 12)] = 'MinorA'
  /** Electronic effects in harmonic minor voice effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['HarmonicMinor'] = 13)] = 'HarmonicMinor'
  /** Female Vitality Sound effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['FemaleEnergetic'] = 14)] = 'FemaleEnergetic'
  /** Richness effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['RichNess'] = 15)] = 'RichNess'
  /** Muffled effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Muffled'] = 16)] = 'Muffled'
  /** Roundness effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Roundness'] = 17)] = 'Roundness'
  /** Falsetto effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Falsetto'] = 18)] = 'Falsetto'
  /** Fullness effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Fullness'] = 19)] = 'Fullness'
  /** Clear effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Clear'] = 20)] = 'Clear'
  /** Hight effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['HighlyResonant'] = 21)] = 'HighlyResonant'
  /** Loud clear effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['LoudClear'] = 22)] = 'LoudClear'
  /** Minions effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Minions'] = 23)] = 'Minions'
  /** Sunshine effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Sunshine'] = 24)] = 'Sunshine'
  /** Gentle effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Gentle'] = 25)] = 'Gentle'
  /** Sweet effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Sweet'] = 26)] = 'Sweet'
  /** Sweet male effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['SweetMale'] = 27)] = 'SweetMale'
  /** Sweet female effec */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['SweetFemale'] = 28)] = 'SweetFemale'
  /** Bright effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Bright'] = 29)] = 'Bright'
  /** Autobot effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['Autobot'] = 30)] = 'Autobot'
  /** Out of power effect */
  ZegoVoiceChangerPreset[(ZegoVoiceChangerPreset['OutOfPower'] = 31)] = 'OutOfPower'
})(ZegoVoiceChangerPreset || (ZegoVoiceChangerPreset = {}))
/** Reverberation preset value. */
export var ZegoReverbPreset
;(function (ZegoReverbPreset) {
  /** No Reverberation */
  ZegoReverbPreset[(ZegoReverbPreset['None'] = 0)] = 'None'
  /** Soft room reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['SoftRoom'] = 1)] = 'SoftRoom'
  /** Large room reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['LargeRoom'] = 2)] = 'LargeRoom'
  /** Concert hall reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['ConcertHall'] = 3)] = 'ConcertHall'
  /** Valley reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['Valley'] = 4)] = 'Valley'
  /** Recording studio reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['RecordingStudio'] = 5)] = 'RecordingStudio'
  /** Basement reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['Basement'] = 6)] = 'Basement'
  /** KTV reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['KTV'] = 7)] = 'KTV'
  /** Popular reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['Popular'] = 8)] = 'Popular'
  /** Rock reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['Rock'] = 9)] = 'Rock'
  /** Vocal concert reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['VocalConcert'] = 10)] = 'VocalConcert'
  /** Gramophone reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['GramoPhone'] = 11)] = 'GramoPhone'
  /** Enhanced KTV reverb effect. Provide KTV effect with more concentrated voice and better brightness. Compared with the original KTV reverb effect, the reverberation time is shortened and the dry-wet ratio is increased. */
  ZegoReverbPreset[(ZegoReverbPreset['EnhancedKTV'] = 12)] = 'EnhancedKTV'
  /** Enhanced Rock reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['EnhancedRock'] = 13)] = 'EnhancedRock'
  /** Enhanced misty reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['EnhancedMisty'] = 14)] = 'EnhancedMisty'
  /** Hip Hop reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['HipHop'] = 15)] = 'HipHop'
  /** Misty reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['Misty'] = 16)] = 'Misty'
  /** 3D voice reverb effect */
  ZegoReverbPreset[(ZegoReverbPreset['ThreeDimensionalVoice'] = 17)] = 'ThreeDimensionalVoice'
})(ZegoReverbPreset || (ZegoReverbPreset = {}))
/** Mode of Electronic Effects. */
export var ZegoElectronicEffectsMode
;(function (ZegoElectronicEffectsMode) {
  /** Major */
  ZegoElectronicEffectsMode[(ZegoElectronicEffectsMode['Major'] = 0)] = 'Major'
  /** Minor */
  ZegoElectronicEffectsMode[(ZegoElectronicEffectsMode['Minor'] = 1)] = 'Minor'
  /** Harmonic Minor */
  ZegoElectronicEffectsMode[(ZegoElectronicEffectsMode['HarmonicMinor'] = 2)] = 'HarmonicMinor'
})(ZegoElectronicEffectsMode || (ZegoElectronicEffectsMode = {}))
/** Video configuration resolution and bitrate preset enumeration. The preset resolutions are adapted for mobile and desktop. On mobile, height is longer than width, and desktop is the opposite. For example, 1080p is actually 1080(w) x 1920(h) on mobile and 1920(w) x 1080(h) on desktop. */
export var ZegoVideoConfigPreset
;(function (ZegoVideoConfigPreset) {
  /** Set the resolution to 320x180, the default is 15 fps, the code rate is 300 kbps */
  ZegoVideoConfigPreset[(ZegoVideoConfigPreset['Preset180P'] = 0)] = 'Preset180P'
  /** Set the resolution to 480x270, the default is 15 fps, the code rate is 400 kbps */
  ZegoVideoConfigPreset[(ZegoVideoConfigPreset['Preset270P'] = 1)] = 'Preset270P'
  /** Set the resolution to 640x360, the default is 15 fps, the code rate is 600 kbps */
  ZegoVideoConfigPreset[(ZegoVideoConfigPreset['Preset360P'] = 2)] = 'Preset360P'
  /** Set the resolution to 960x540, the default is 15 fps, the code rate is 1200 kbps */
  ZegoVideoConfigPreset[(ZegoVideoConfigPreset['Preset540P'] = 3)] = 'Preset540P'
  /** Set the resolution to 1280x720, the default is 15 fps, the code rate is 1500 kbps */
  ZegoVideoConfigPreset[(ZegoVideoConfigPreset['Preset720P'] = 4)] = 'Preset720P'
  /** Set the resolution to 1920x1080, the default is 15 fps, the code rate is 3000 kbps */
  ZegoVideoConfigPreset[(ZegoVideoConfigPreset['Preset1080P'] = 5)] = 'Preset1080P'
})(ZegoVideoConfigPreset || (ZegoVideoConfigPreset = {}))
/** Stream quality level. */
export var ZegoStreamQualityLevel
;(function (ZegoStreamQualityLevel) {
  /** Excellent */
  ZegoStreamQualityLevel[(ZegoStreamQualityLevel['Excellent'] = 0)] = 'Excellent'
  /** Good */
  ZegoStreamQualityLevel[(ZegoStreamQualityLevel['Good'] = 1)] = 'Good'
  /** Normal */
  ZegoStreamQualityLevel[(ZegoStreamQualityLevel['Medium'] = 2)] = 'Medium'
  /** Bad */
  ZegoStreamQualityLevel[(ZegoStreamQualityLevel['Bad'] = 3)] = 'Bad'
  /** Failed */
  ZegoStreamQualityLevel[(ZegoStreamQualityLevel['Die'] = 4)] = 'Die'
  /** Unknown */
  ZegoStreamQualityLevel[(ZegoStreamQualityLevel['Unknown'] = 5)] = 'Unknown'
})(ZegoStreamQualityLevel || (ZegoStreamQualityLevel = {}))
/** Audio channel type. */
export var ZegoAudioChannel
;(function (ZegoAudioChannel) {
  /** Unknown */
  ZegoAudioChannel[(ZegoAudioChannel['Unknown'] = 0)] = 'Unknown'
  /** Mono */
  ZegoAudioChannel[(ZegoAudioChannel['Mono'] = 1)] = 'Mono'
  /** Stereo */
  ZegoAudioChannel[(ZegoAudioChannel['Stereo'] = 2)] = 'Stereo'
})(ZegoAudioChannel || (ZegoAudioChannel = {}))
/** Audio capture stereo mode. */
export var ZegoAudioCaptureStereoMode
;(function (ZegoAudioCaptureStereoMode) {
  /** Disable stereo capture, that is, mono. */
  ZegoAudioCaptureStereoMode[(ZegoAudioCaptureStereoMode['None'] = 0)] = 'None'
  /** Always enable stereo capture. */
  ZegoAudioCaptureStereoMode[(ZegoAudioCaptureStereoMode['Always'] = 1)] = 'Always'
  /** [Deprecated] Same as [Always], that is, always enable stereo capture, this mode has been deprecated since version 2.16.0. */
  ZegoAudioCaptureStereoMode[(ZegoAudioCaptureStereoMode['Adaptive'] = 2)] = 'Adaptive'
})(ZegoAudioCaptureStereoMode || (ZegoAudioCaptureStereoMode = {}))
/** Audio codec ID. */
export var ZegoAudioCodecID
;(function (ZegoAudioCodecID) {
  /** Default, determined by the [scenario] when calling [createEngine]. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Default'] = 0)] = 'Default'
  /** Can be used for RTC and CDN streaming; bitrate range from 10kbps to 128kbps; supports stereo; latency is around 500ms. Server cloud transcoding is required when communicating with the Web SDK, and it is not required when relaying to CDN. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Normal'] = 1)] = 'Normal'
  /** Can be used for RTC and CDN streaming; good compatibility; bitrate range from 16kbps to 192kbps; supports stereo; latency is around 350ms; the sound quality is worse than [Normal] in the same (low) bitrate. Server cloud transcoding is required when communicating with the Web SDK, and it is not required when relaying to CDN. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Normal2'] = 2)] = 'Normal2'
  /** Not recommended; if you need to use it, please contact ZEGO technical support. Can only be used for RTC streaming. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Normal3'] = 3)] = 'Normal3'
  /** Not recommended; if you need to use it, please contact ZEGO technical support. Can only be used for RTC streaming. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Low'] = 4)] = 'Low'
  /** Not recommended; if you need to use it, please contact ZEGO technical support. Can only be used for RTC streaming; maximum bitrate is 16kbps. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Low2'] = 5)] = 'Low2'
  /** Can only be used for RTC streaming; bitrate range from 6kbps to 192kbps; supports stereo; latency is around 200ms; Under the same bitrate (low bitrate), the sound quality is significantly better than [Normal] and [Normal2]; low CPU overhead. Server cloud transcoding is not required when communicating with the Web SDK, and it is required when relaying to CDN. */
  ZegoAudioCodecID[(ZegoAudioCodecID['Low3'] = 6)] = 'Low3'
})(ZegoAudioCodecID || (ZegoAudioCodecID = {}))
/** Video codec ID. */
export var ZegoVideoCodecID
;(function (ZegoVideoCodecID) {
  /** Default (H.264) */
  ZegoVideoCodecID[(ZegoVideoCodecID['Default'] = 0)] = 'Default'
  /** Scalable Video Coding (H.264 SVC) */
  ZegoVideoCodecID[(ZegoVideoCodecID['Svc'] = 1)] = 'Svc'
  /** VP8 */
  ZegoVideoCodecID[(ZegoVideoCodecID['Vp8'] = 2)] = 'Vp8'
  /** H.265 */
  ZegoVideoCodecID[(ZegoVideoCodecID['H265'] = 3)] = 'H265'
  /** Dualstream Scalable Video Coding */
  ZegoVideoCodecID[(ZegoVideoCodecID['H264DualStream'] = 4)] = 'H264DualStream'
  /** Unknown Video Coding */
  ZegoVideoCodecID[(ZegoVideoCodecID['Unknown'] = 100)] = 'Unknown'
})(ZegoVideoCodecID || (ZegoVideoCodecID = {}))
/** Video screen rotation direction. */
export var ZegoOrientation
;(function (ZegoOrientation) {
  /** Not rotate */
  ZegoOrientation[(ZegoOrientation['PortraitUp'] = 0)] = 'PortraitUp'
  /** Rotate 90 degrees counterclockwise */
  ZegoOrientation[(ZegoOrientation['LandscapeLeft'] = 1)] = 'LandscapeLeft'
  /** Rotate 180 degrees counterclockwise */
  ZegoOrientation[(ZegoOrientation['PortraitDown'] = 2)] = 'PortraitDown'
  /** Rotate 270 degrees counterclockwise */
  ZegoOrientation[(ZegoOrientation['LandscapeRight'] = 3)] = 'LandscapeRight'
})(ZegoOrientation || (ZegoOrientation = {}))
/** Video stream type */
export var ZegoVideoStreamType
;(function (ZegoVideoStreamType) {
  /** The type to be played depends on the network status */
  ZegoVideoStreamType[(ZegoVideoStreamType['Default'] = 0)] = 'Default'
  /** small resolution type */
  ZegoVideoStreamType[(ZegoVideoStreamType['Small'] = 1)] = 'Small'
  /** big resolution type */
  ZegoVideoStreamType[(ZegoVideoStreamType['Big'] = 2)] = 'Big'
})(ZegoVideoStreamType || (ZegoVideoStreamType = {}))
/** Audio echo cancellation mode. */
export var ZegoAECMode
;(function (ZegoAECMode) {
  /** Aggressive echo cancellation may affect the sound quality slightly, but the echo will be very clean. */
  ZegoAECMode[(ZegoAECMode['Aggressive'] = 0)] = 'Aggressive'
  /** Moderate echo cancellation, which may slightly affect a little bit of sound, but the residual echo will be less. */
  ZegoAECMode[(ZegoAECMode['Medium'] = 1)] = 'Medium'
  /** Comfortable echo cancellation, that is, echo cancellation does not affect the sound quality of the sound, and sometimes there may be a little echo, but it will not affect the normal listening. */
  ZegoAECMode[(ZegoAECMode['Soft'] = 2)] = 'Soft'
  /** AI echo cancellation. Supports intelligent recognition and elimination of echo, with a significant improvement in vocal fidelity compared to traditional AEC algorithms, without additional delay or power consumption increase. */
  ZegoAECMode[(ZegoAECMode['AI'] = 3)] = 'AI'
  /** AI Aggressive echo cancellation, Similar to ZegoAECModeAI, it offers cleaner echo cancellation in scenarios with significant reverberation, making it recommended for use in chat rooms with large reverberation. It can be left off in other scenarios, especially in KTV settings where music is played out loud, as it may cause slightly more distortion to the human voice. */
  ZegoAECMode[(ZegoAECMode['AIAggressive'] = 4)] = 'AIAggressive'
  /** Balanced AI echo cancellation, Compared with ZegoAECModeAIAggressive, the echo suppression is cleaner, but the human voice will be more damaged. It is recommended to use it in voice chat scenarios. */
  ZegoAECMode[(ZegoAECMode['AIBalanced'] = 5)] = 'AIBalanced'
})(ZegoAECMode || (ZegoAECMode = {}))
/** Active Noise Suppression mode. */
export var ZegoANSMode
;(function (ZegoANSMode) {
  /** Soft ANS. In most instances, the sound quality will not be damaged, but some noise will remain. */
  ZegoANSMode[(ZegoANSMode['Soft'] = 0)] = 'Soft'
  /** Medium ANS. It may damage some sound quality, but it has a good noise reduction effect. */
  ZegoANSMode[(ZegoANSMode['Medium'] = 1)] = 'Medium'
  /** Aggressive ANS. It may significantly impair the sound quality, but it has a good noise reduction effect. */
  ZegoANSMode[(ZegoANSMode['Aggressive'] = 2)] = 'Aggressive'
  /** AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  ZegoANSMode[(ZegoANSMode['AI'] = 3)] = 'AI'
  /** Balanced AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  ZegoANSMode[(ZegoANSMode['AIBalanced'] = 4)] = 'AIBalanced'
  /** Low latency AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  ZegoANSMode[(ZegoANSMode['AILowLatency'] = 5)] = 'AILowLatency'
  /** Aggressive AI mode ANS. It will cause great damage to music, so it can not be used for noise suppression of sound sources that need to collect background sound. Please contact ZEGO technical support before use. */
  ZegoANSMode[(ZegoANSMode['AIAggressive'] = 6)] = 'AIAggressive'
})(ZegoANSMode || (ZegoANSMode = {}))
/** Stream alignment mode. */
export var ZegoStreamAlignmentMode
;(function (ZegoStreamAlignmentMode) {
  /** Disable stream alignment. */
  ZegoStreamAlignmentMode[(ZegoStreamAlignmentMode['None'] = 0)] = 'None'
  /** Streams should be aligned as much as possible, call the [setStreamAlignmentProperty] function to enable the stream alignment of the push stream network time alignment of the specified channel. */
  ZegoStreamAlignmentMode[(ZegoStreamAlignmentMode['Try'] = 1)] = 'Try'
})(ZegoStreamAlignmentMode || (ZegoStreamAlignmentMode = {}))
/** Traffic control property (bitmask enumeration). */
export var ZegoTrafficControlProperty
;(function (ZegoTrafficControlProperty) {
  /** Basic (Adaptive (reduce) video bitrate) */
  ZegoTrafficControlProperty[(ZegoTrafficControlProperty['Basic'] = 0)] = 'Basic'
  /** Adaptive (reduce) video FPS */
  ZegoTrafficControlProperty[(ZegoTrafficControlProperty['AdaptiveFPS'] = 1)] = 'AdaptiveFPS'
  /** Adaptive (reduce) video resolution */
  ZegoTrafficControlProperty[(ZegoTrafficControlProperty['AdaptiveResolution'] = 2)] =
    'AdaptiveResolution'
  /** Adaptive (reduce) audio bitrate */
  ZegoTrafficControlProperty[(ZegoTrafficControlProperty['AdaptiveAudioBitrate'] = 4)] =
    'AdaptiveAudioBitrate'
})(ZegoTrafficControlProperty || (ZegoTrafficControlProperty = {}))
/** Video transmission mode when current bitrate is lower than the set minimum bitrate. */
export var ZegoTrafficControlMinVideoBitrateMode
;(function (ZegoTrafficControlMinVideoBitrateMode) {
  /** Stop video transmission when current bitrate is lower than the set minimum bitrate */
  ZegoTrafficControlMinVideoBitrateMode[(ZegoTrafficControlMinVideoBitrateMode['NoVideo'] = 0)] =
    'NoVideo'
  /** Video is sent at a very low frequency (no more than 2fps) which is lower than the set minimum bitrate */
  ZegoTrafficControlMinVideoBitrateMode[
    (ZegoTrafficControlMinVideoBitrateMode['UltraLowFPS'] = 1)
  ] = 'UltraLowFPS'
})(ZegoTrafficControlMinVideoBitrateMode || (ZegoTrafficControlMinVideoBitrateMode = {}))
/** Playing stream status. */
export var ZegoPlayerState
;(function (ZegoPlayerState) {
  /** The state of the flow is not played, and it is in this state before the stream is played. If the steady flow anomaly occurs during the playing process, such as AppID or Token are incorrect, it will enter this state. */
  ZegoPlayerState[(ZegoPlayerState['NoPlay'] = 0)] = 'NoPlay'
  /** The state that the stream is being requested for playing. After the [startPlayingStream] function is successfully called, it will enter the state. The UI is usually displayed through this state. If the connection is interrupted due to poor network quality, the SDK will perform an internal retry and will return to the requesting state. */
  ZegoPlayerState[(ZegoPlayerState['PlayRequesting'] = 1)] = 'PlayRequesting'
  /** The state that the stream is being playing, entering the state indicates that the stream has been successfully played, and the user can communicate normally. */
  ZegoPlayerState[(ZegoPlayerState['Playing'] = 2)] = 'Playing'
})(ZegoPlayerState || (ZegoPlayerState = {}))
/** Media event when playing. */
export var ZegoPlayerMediaEvent
;(function (ZegoPlayerMediaEvent) {
  /** Audio stuck event when playing */
  ZegoPlayerMediaEvent[(ZegoPlayerMediaEvent['AudioBreakOccur'] = 0)] = 'AudioBreakOccur'
  /** Audio stuck event recovery when playing */
  ZegoPlayerMediaEvent[(ZegoPlayerMediaEvent['AudioBreakResume'] = 1)] = 'AudioBreakResume'
  /** Video stuck event when playing */
  ZegoPlayerMediaEvent[(ZegoPlayerMediaEvent['VideoBreakOccur'] = 2)] = 'VideoBreakOccur'
  /** Video stuck event recovery when playing */
  ZegoPlayerMediaEvent[(ZegoPlayerMediaEvent['VideoBreakResume'] = 3)] = 'VideoBreakResume'
})(ZegoPlayerMediaEvent || (ZegoPlayerMediaEvent = {}))
/** Stream Resource Mode */
export var ZegoStreamResourceMode
;(function (ZegoStreamResourceMode) {
  /** Default mode. The SDK will automatically select the streaming resource according to the cdnConfig parameters set by the player config and the ready-made background configuration. */
  ZegoStreamResourceMode[(ZegoStreamResourceMode['Default'] = 0)] = 'Default'
  /** Playing stream only from CDN. */
  ZegoStreamResourceMode[(ZegoStreamResourceMode['OnlyCDN'] = 1)] = 'OnlyCDN'
  /** Playing stream only from L3. */
  ZegoStreamResourceMode[(ZegoStreamResourceMode['OnlyL3'] = 2)] = 'OnlyL3'
  /** Playing stream only from RTC. */
  ZegoStreamResourceMode[(ZegoStreamResourceMode['OnlyRTC'] = 3)] = 'OnlyRTC'
  /** [Deprecated] CDN Plus mode. The SDK will automatically select the streaming resource according to the network condition. */
  ZegoStreamResourceMode[(ZegoStreamResourceMode['CDNPlus'] = 4)] = 'CDNPlus'
  /** Custom mode. The SDK selects the streaming resource based on the customResourceConfig parameter of the streaming settings. */
  ZegoStreamResourceMode[(ZegoStreamResourceMode['Custom'] = 5)] = 'Custom'
})(ZegoStreamResourceMode || (ZegoStreamResourceMode = {}))
/** Stream Switch Resource Mode */
export var ZegoStreamResourceSwitchMode
;(function (ZegoStreamResourceSwitchMode) {
  /** Default mode. The SDK will automatically select the streaming resource according to the parameters set by the player config and the ready-made background configuration. */
  ZegoStreamResourceSwitchMode[(ZegoStreamResourceSwitchMode['Default'] = 0)] = 'Default'
  /** Auto switch to RTC resource when publishing. */
  ZegoStreamResourceSwitchMode[(ZegoStreamResourceSwitchMode['SwitchToRTC'] = 1)] = 'SwitchToRTC'
  /** Keep using original resource when publishing, not switch to RTC resource. */
  ZegoStreamResourceSwitchMode[(ZegoStreamResourceSwitchMode['KeepOriginal'] = 2)] = 'KeepOriginal'
})(ZegoStreamResourceSwitchMode || (ZegoStreamResourceSwitchMode = {}))
/** Stream Resource Type */
export var ZegoStreamResourceType
;(function (ZegoStreamResourceType) {
  /** Default mode. The SDK will automatically select the streaming resource according to the parameters set by the player config and the ready-made background configuration. */
  ZegoStreamResourceType[(ZegoStreamResourceType['Default'] = 0)] = 'Default'
  /** CDN resource. */
  ZegoStreamResourceType[(ZegoStreamResourceType['CDN'] = 1)] = 'CDN'
  /** L3 resource. */
  ZegoStreamResourceType[(ZegoStreamResourceType['L3'] = 2)] = 'L3'
})(ZegoStreamResourceType || (ZegoStreamResourceType = {}))
/** Update type. */
export var ZegoUpdateType
;(function (ZegoUpdateType) {
  /** Add */
  ZegoUpdateType[(ZegoUpdateType['Add'] = 0)] = 'Add'
  /** Delete */
  ZegoUpdateType[(ZegoUpdateType['Delete'] = 1)] = 'Delete'
})(ZegoUpdateType || (ZegoUpdateType = {}))
/** State of CDN relay. */
export var ZegoStreamRelayCDNState
;(function (ZegoStreamRelayCDNState) {
  /** The state indicates that there is no CDN relay */
  ZegoStreamRelayCDNState[(ZegoStreamRelayCDNState['NoRelay'] = 0)] = 'NoRelay'
  /** The CDN relay is being requested */
  ZegoStreamRelayCDNState[(ZegoStreamRelayCDNState['RelayRequesting'] = 1)] = 'RelayRequesting'
  /** Entering this status indicates that the CDN relay has been successful */
  ZegoStreamRelayCDNState[(ZegoStreamRelayCDNState['Relaying'] = 2)] = 'Relaying'
})(ZegoStreamRelayCDNState || (ZegoStreamRelayCDNState = {}))
/** Reason for state of CDN relay changed. */
export var ZegoStreamRelayCDNUpdateReason
;(function (ZegoStreamRelayCDNUpdateReason) {
  /** No error */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['None'] = 0)] = 'None'
  /** Server error */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['ServerError'] = 1)] =
    'ServerError'
  /** Handshake error */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['HandshakeFailed'] = 2)] =
    'HandshakeFailed'
  /** Access point error */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['AccessPointError'] = 3)] =
    'AccessPointError'
  /** Stream create failure */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['CreateStreamFailed'] = 4)] =
    'CreateStreamFailed'
  /** Bad stream ID */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['BadName'] = 5)] = 'BadName'
  /** CDN server actively disconnected */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['CDNServerDisconnected'] = 6)] =
    'CDNServerDisconnected'
  /** Active disconnect */
  ZegoStreamRelayCDNUpdateReason[(ZegoStreamRelayCDNUpdateReason['Disconnected'] = 7)] =
    'Disconnected'
  /** All mixer input streams sessions closed */
  ZegoStreamRelayCDNUpdateReason[
    (ZegoStreamRelayCDNUpdateReason['MixStreamAllInputStreamClosed'] = 8)
  ] = 'MixStreamAllInputStreamClosed'
  /** All mixer input streams have no data */
  ZegoStreamRelayCDNUpdateReason[
    (ZegoStreamRelayCDNUpdateReason['MixStreamAllInputStreamNoData'] = 9)
  ] = 'MixStreamAllInputStreamNoData'
  /** Internal error of stream mixer server */
  ZegoStreamRelayCDNUpdateReason[
    (ZegoStreamRelayCDNUpdateReason['MixStreamServerInternalError'] = 10)
  ] = 'MixStreamServerInternalError'
})(ZegoStreamRelayCDNUpdateReason || (ZegoStreamRelayCDNUpdateReason = {}))
/** Device type. */
export var ZegoDeviceType
;(function (ZegoDeviceType) {
  /** Unknown device type. */
  ZegoDeviceType[(ZegoDeviceType['Unknown'] = 0)] = 'Unknown'
  /** Camera device. */
  ZegoDeviceType[(ZegoDeviceType['Camera'] = 1)] = 'Camera'
  /** Microphone device. */
  ZegoDeviceType[(ZegoDeviceType['Microphone'] = 2)] = 'Microphone'
  /** Speaker device. */
  ZegoDeviceType[(ZegoDeviceType['Speaker'] = 3)] = 'Speaker'
  /** Audio device. (Other audio device that cannot be accurately classified into microphones or speakers.) */
  ZegoDeviceType[(ZegoDeviceType['AudioDevice'] = 4)] = 'AudioDevice'
  /** Audio Session. */
  ZegoDeviceType[(ZegoDeviceType['AudioSession'] = 5)] = 'AudioSession'
})(ZegoDeviceType || (ZegoDeviceType = {}))
/** The exception type for the device. */
export var ZegoDeviceExceptionType
;(function (ZegoDeviceExceptionType) {
  /** Unknown device exception. */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['Unknown'] = 0)] = 'Unknown'
  /** Generic device exception. */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['Generic'] = 1)] = 'Generic'
  /** Invalid device ID exception. */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['InvalidId'] = 2)] = 'InvalidId'
  /** Device permission is not granted. */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['PermissionNotGranted'] = 3)] =
    'PermissionNotGranted'
  /** The capture frame rate of the device is 0. */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['ZeroCaptureFps'] = 4)] = 'ZeroCaptureFps'
  /** The device is being occupied. */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['DeviceOccupied'] = 5)] = 'DeviceOccupied'
  /** The device is unplugged (not plugged in). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['DeviceUnplugged'] = 6)] = 'DeviceUnplugged'
  /** The device requires the system to restart before it can work (Windows platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['RebootRequired'] = 7)] = 'RebootRequired'
  /** The system media service is unavailable, e.g. when the iOS system detects that the current pressure is huge (such as playing a lot of animation), it is possible to disable all media related services (Apple platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['MediaServicesWereLost'] = 8)] =
    'MediaServicesWereLost'
  /** The device is being occupied by Siri (Apple platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['SiriIsRecording'] = 9)] = 'SiriIsRecording'
  /** The device captured sound level is too low (Windows platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['SoundLevelTooLow'] = 10)] = 'SoundLevelTooLow'
  /** The device is being occupied, and maybe cause by iPad magnetic case (Apple platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['MagneticCase'] = 11)] = 'MagneticCase'
  /** Audio session deactive (Apple platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['AudioSessionDeactive'] = 12)] =
    'AudioSessionDeactive'
  /** Audio session category change (Apple platform only). */
  ZegoDeviceExceptionType[(ZegoDeviceExceptionType['AudioSessionCategoryChange'] = 13)] =
    'AudioSessionCategoryChange'
})(ZegoDeviceExceptionType || (ZegoDeviceExceptionType = {}))
/** Remote device status. */
export var ZegoRemoteDeviceState
;(function (ZegoRemoteDeviceState) {
  /** Device on */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['Open'] = 0)] = 'Open'
  /** General device error */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['GenericError'] = 1)] = 'GenericError'
  /** Invalid device ID */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['InvalidID'] = 2)] = 'InvalidID'
  /** No permission */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['NoAuthorization'] = 3)] = 'NoAuthorization'
  /** Captured frame rate is 0 */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['ZeroFPS'] = 4)] = 'ZeroFPS'
  /** The device is occupied */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['InUseByOther'] = 5)] = 'InUseByOther'
  /** The device is not plugged in or unplugged */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['Unplugged'] = 6)] = 'Unplugged'
  /** The system needs to be restarted */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['RebootRequired'] = 7)] = 'RebootRequired'
  /** System media services stop, such as under the iOS platform, when the system detects that the current pressure is huge (such as playing a lot of animation), it is possible to disable all media related services. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['SystemMediaServicesLost'] = 8)] =
    'SystemMediaServicesLost'
  /** The remote user calls [enableCamera] or [enableAudioCaptureDevice] to disable the camera or microphone. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['Disable'] = 9)] = 'Disable'
  /** The remote user actively calls [muteMicrophone] or [mutePublishStreamAudio] or [mutePublishStreamVideo] to stop publish the audio or video stream. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['Mute'] = 10)] = 'Mute'
  /** The device is interrupted, such as a phone call interruption, etc. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['Interruption'] = 11)] = 'Interruption'
  /** There are multiple apps at the same time in the foreground, such as the iPad app split screen, the system will prohibit all apps from using the camera. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['InBackground'] = 12)] = 'InBackground'
  /** CDN server actively disconnected */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['MultiForegroundApp'] = 13)] = 'MultiForegroundApp'
  /** The system is under high load pressure and may cause abnormal equipment. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['BySystemPressure'] = 14)] = 'BySystemPressure'
  /** The remote device is not supported to publish the device state. */
  ZegoRemoteDeviceState[(ZegoRemoteDeviceState['NotSupport'] = 15)] = 'NotSupport'
})(ZegoRemoteDeviceState || (ZegoRemoteDeviceState = {}))
/** Audio device mode. */
export var ZegoAudioDeviceMode
;(function (ZegoAudioDeviceMode) {
  /** Enable system echo cancellation. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['Communication'] = 1)] = 'Communication'
  /** The system echo cancellation function is disabled. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['General'] = 2)] = 'General'
  /** Automatically select whether to enable system echo cancellation based on the scenario. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['Auto'] = 3)] = 'Auto'
  /** Enable system echo cancellation. Compared with Communication, this mode always occupies the microphone device. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['Communication2'] = 4)] = 'Communication2'
  /** Enable system echo cancellation. Compared with Communication, in this mode, the microphone is released and the media volume is reduced. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['Communication3'] = 5)] = 'Communication3'
  /** Disable system echo cancellation. Compared with General, this mode is not released when a microphone device is used. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['General2'] = 6)] = 'General2'
  /** Disable system echo cancellation. Compared with General, this mode will always occupy the microphone device. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['General3'] = 7)] = 'General3'
  /** Enable system echo cancellation. Compared with Communication, this mode of wheat after releasing the microphone, maintain the call volume. */
  ZegoAudioDeviceMode[(ZegoAudioDeviceMode['Communication4'] = 8)] = 'Communication4'
})(ZegoAudioDeviceMode || (ZegoAudioDeviceMode = {}))
/** Audio route */
export var ZegoAudioRoute
;(function (ZegoAudioRoute) {
  /** Speaker */
  ZegoAudioRoute[(ZegoAudioRoute['Speaker'] = 0)] = 'Speaker'
  /** Headphone */
  ZegoAudioRoute[(ZegoAudioRoute['Headphone'] = 1)] = 'Headphone'
  /** Bluetooth device */
  ZegoAudioRoute[(ZegoAudioRoute['Bluetooth'] = 2)] = 'Bluetooth'
  /** Receiver */
  ZegoAudioRoute[(ZegoAudioRoute['Receiver'] = 3)] = 'Receiver'
  /** External USB audio device */
  ZegoAudioRoute[(ZegoAudioRoute['ExternalUSB'] = 4)] = 'ExternalUSB'
  /** Apple AirPlay */
  ZegoAudioRoute[(ZegoAudioRoute['AirPlay'] = 5)] = 'AirPlay'
})(ZegoAudioRoute || (ZegoAudioRoute = {}))
/** Mix stream content type. */
export var ZegoMixerInputContentType
;(function (ZegoMixerInputContentType) {
  /** Mix stream for audio only */
  ZegoMixerInputContentType[(ZegoMixerInputContentType['Audio'] = 0)] = 'Audio'
  /** Mix stream for both audio and video */
  ZegoMixerInputContentType[(ZegoMixerInputContentType['Video'] = 1)] = 'Video'
  /** Mix stream for video only. On web platforms, this property does not take effect */
  ZegoMixerInputContentType[(ZegoMixerInputContentType['VideoOnly'] = 2)] = 'VideoOnly'
})(ZegoMixerInputContentType || (ZegoMixerInputContentType = {}))
/** Video frame buffer type. */
export var ZegoVideoBufferType
;(function (ZegoVideoBufferType) {
  /** Raw data type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['Unknown'] = 0)] = 'Unknown'
  /** Raw data type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['RawData'] = 1)] = 'RawData'
  /** Encoded data type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['EncodedData'] = 2)] = 'EncodedData'
  /** Texture 2D type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['GLTexture2D'] = 3)] = 'GLTexture2D'
  /** CVPixelBuffer type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['CVPixelBuffer'] = 4)] = 'CVPixelBuffer'
  /** Surface Texture type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['SurfaceTexture'] = 5)] = 'SurfaceTexture'
  /** GL_TEXTURE_EXTERNAL_OES type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['GLTextureExternalOES'] = 6)] = 'GLTextureExternalOES'
  /** Texture 2D and raw data type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['GLTexture2DAndRawData'] = 7)] = 'GLTexture2DAndRawData'
  /** D3D Texture2D type video frame */
  ZegoVideoBufferType[(ZegoVideoBufferType['D3DTexture2D'] = 8)] = 'D3DTexture2D'
  /** CVPixelBuffer type nv12 format video frame. Only for custom video processing */
  ZegoVideoBufferType[(ZegoVideoBufferType['NV12CVPixelBuffer'] = 9)] = 'NV12CVPixelBuffer'
})(ZegoVideoBufferType || (ZegoVideoBufferType = {}))
/** Audio Config Preset. */
export var ZegoAudioConfigPreset
;(function (ZegoAudioConfigPreset) {
  /** Basic sound quality (16 kbps, Mono, ZegoAudioCodecIDDefault) */
  ZegoAudioConfigPreset[(ZegoAudioConfigPreset['BasicQuality'] = 0)] = 'BasicQuality'
  /** Standard sound quality (48 kbps, Mono, ZegoAudioCodecIDDefault) */
  ZegoAudioConfigPreset[(ZegoAudioConfigPreset['StandardQuality'] = 1)] = 'StandardQuality'
  /** Standard sound quality (56 kbps, Stereo, ZegoAudioCodecIDDefault) */
  ZegoAudioConfigPreset[(ZegoAudioConfigPreset['StandardQualityStereo'] = 2)] =
    'StandardQualityStereo'
  /** High sound quality (128 kbps, Mono, ZegoAudioCodecIDDefault) */
  ZegoAudioConfigPreset[(ZegoAudioConfigPreset['HighQuality'] = 3)] = 'HighQuality'
  /** High sound quality (192 kbps, Stereo, ZegoAudioCodecIDDefault) */
  ZegoAudioConfigPreset[(ZegoAudioConfigPreset['HighQualityStereo'] = 4)] = 'HighQualityStereo'
})(ZegoAudioConfigPreset || (ZegoAudioConfigPreset = {}))
/** Player state. */
export var ZegoMediaPlayerState
;(function (ZegoMediaPlayerState) {
  /** Not playing */
  ZegoMediaPlayerState[(ZegoMediaPlayerState['NoPlay'] = 0)] = 'NoPlay'
  /** Playing */
  ZegoMediaPlayerState[(ZegoMediaPlayerState['Playing'] = 1)] = 'Playing'
  /** Pausing */
  ZegoMediaPlayerState[(ZegoMediaPlayerState['Pausing'] = 2)] = 'Pausing'
  /** End of play */
  ZegoMediaPlayerState[(ZegoMediaPlayerState['PlayEnded'] = 3)] = 'PlayEnded'
})(ZegoMediaPlayerState || (ZegoMediaPlayerState = {}))
/** Player audio track mode. */
export var ZegoMediaPlayerAudioTrackMode
;(function (ZegoMediaPlayerAudioTrackMode) {
  /** Normal audio track mode */
  ZegoMediaPlayerAudioTrackMode[(ZegoMediaPlayerAudioTrackMode['Normal'] = 0)] = 'Normal'
  /** Multiple audio track mode */
  ZegoMediaPlayerAudioTrackMode[(ZegoMediaPlayerAudioTrackMode['Multiple'] = 1)] = 'Multiple'
})(ZegoMediaPlayerAudioTrackMode || (ZegoMediaPlayerAudioTrackMode = {}))
/** Player network event. */
export var ZegoMediaPlayerNetworkEvent
;(function (ZegoMediaPlayerNetworkEvent) {
  /** Network resources are not playing well, and start trying to cache data */
  ZegoMediaPlayerNetworkEvent[(ZegoMediaPlayerNetworkEvent['BufferBegin'] = 0)] = 'BufferBegin'
  /** Network resources can be played smoothly */
  ZegoMediaPlayerNetworkEvent[(ZegoMediaPlayerNetworkEvent['BufferEnded'] = 1)] = 'BufferEnded'
})(ZegoMediaPlayerNetworkEvent || (ZegoMediaPlayerNetworkEvent = {}))
/** Audio channel. */
export var ZegoMediaPlayerAudioChannel
;(function (ZegoMediaPlayerAudioChannel) {
  /** Audio channel left */
  ZegoMediaPlayerAudioChannel[(ZegoMediaPlayerAudioChannel['Left'] = 0)] = 'Left'
  /** Audio channel right */
  ZegoMediaPlayerAudioChannel[(ZegoMediaPlayerAudioChannel['Right'] = 1)] = 'Right'
  /** Audio channel all */
  ZegoMediaPlayerAudioChannel[(ZegoMediaPlayerAudioChannel['All'] = 2)] = 'All'
})(ZegoMediaPlayerAudioChannel || (ZegoMediaPlayerAudioChannel = {}))
/** Media player first frame event type. */
export var ZegoMediaPlayerFirstFrameEvent
;(function (ZegoMediaPlayerFirstFrameEvent) {
  /** The first video frame is rendered event. */
  ZegoMediaPlayerFirstFrameEvent[(ZegoMediaPlayerFirstFrameEvent['VideoRendered'] = 0)] =
    'VideoRendered'
  /** The first audio frame is rendered event. */
  ZegoMediaPlayerFirstFrameEvent[(ZegoMediaPlayerFirstFrameEvent['AudioRendered'] = 1)] =
    'AudioRendered'
})(ZegoMediaPlayerFirstFrameEvent || (ZegoMediaPlayerFirstFrameEvent = {}))
/** AudioEffectPlayer state. */
export var ZegoAudioEffectPlayState
;(function (ZegoAudioEffectPlayState) {
  /** Not playing */
  ZegoAudioEffectPlayState[(ZegoAudioEffectPlayState['NoPlay'] = 0)] = 'NoPlay'
  /** Playing */
  ZegoAudioEffectPlayState[(ZegoAudioEffectPlayState['Playing'] = 1)] = 'Playing'
  /** Pausing */
  ZegoAudioEffectPlayState[(ZegoAudioEffectPlayState['Pausing'] = 2)] = 'Pausing'
  /** End of play */
  ZegoAudioEffectPlayState[(ZegoAudioEffectPlayState['PlayEnded'] = 3)] = 'PlayEnded'
})(ZegoAudioEffectPlayState || (ZegoAudioEffectPlayState = {}))
/** audio sample rate. */
export var ZegoAudioSampleRate
;(function (ZegoAudioSampleRate) {
  /** Unknown */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['Unknown'] = 0)] = 'Unknown'
  /** 8K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate8K'] = 8000)] = 'SampleRate8K'
  /** 16K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate16K'] = 16000)] = 'SampleRate16K'
  /** 22.05K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate22K'] = 22050)] = 'SampleRate22K'
  /** 24K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate24K'] = 24000)] = 'SampleRate24K'
  /** 32K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate32K'] = 32000)] = 'SampleRate32K'
  /** 44.1K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate44K'] = 44100)] = 'SampleRate44K'
  /** 48K */
  ZegoAudioSampleRate[(ZegoAudioSampleRate['SampleRate48K'] = 48000)] = 'SampleRate48K'
})(ZegoAudioSampleRate || (ZegoAudioSampleRate = {}))
/** Audio capture source type. */
export var ZegoAudioSourceType
;(function (ZegoAudioSourceType) {
  /** Default audio capture source (the main channel uses custom audio capture by default; the aux channel uses the same sound as main channel by default). */
  ZegoAudioSourceType[(ZegoAudioSourceType['Default'] = 0)] = 'Default'
  /** Use custom audio capture, refer to [enableCustomAudioIO] or [setAudioSource]. */
  ZegoAudioSourceType[(ZegoAudioSourceType['Custom'] = 1)] = 'Custom'
  /** Use media player as audio source, only support aux channel. */
  ZegoAudioSourceType[(ZegoAudioSourceType['MediaPlayer'] = 2)] = 'MediaPlayer'
  /** No audio source. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  ZegoAudioSourceType[(ZegoAudioSourceType['None'] = 3)] = 'None'
  /** Using microphone as audio source. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  ZegoAudioSourceType[(ZegoAudioSourceType['Microphone'] = 4)] = 'Microphone'
  /** Using main channel as audio source. Ineffective when used in main channel. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  ZegoAudioSourceType[(ZegoAudioSourceType['MainPublishChannel'] = 5)] = 'MainPublishChannel'
  /** Using screen capture as audio source. Typically used in mobile screen sharing scenarios. This audio source type can only be used in [setAudioSource] interface, has no effect when used in [enableCustomAudioIO] interface. */
  ZegoAudioSourceType[(ZegoAudioSourceType['ScreenCapture'] = 6)] = 'ScreenCapture'
})(ZegoAudioSourceType || (ZegoAudioSourceType = {}))
/** Record type. */
export var ZegoDataRecordType
;(function (ZegoDataRecordType) {
  /** This field indicates that the Express-Audio SDK records audio by default, and the Express-Video SDK records audio and video by default. When recording files in .aac format, audio is also recorded by default. */
  ZegoDataRecordType[(ZegoDataRecordType['Default'] = 0)] = 'Default'
  /** only record audio */
  ZegoDataRecordType[(ZegoDataRecordType['OnlyAudio'] = 1)] = 'OnlyAudio'
  /** only record video, Audio SDK and recording .aac format files are invalid. */
  ZegoDataRecordType[(ZegoDataRecordType['OnlyVideo'] = 2)] = 'OnlyVideo'
  /** record audio and video. Express-Audio SDK and .aac format files are recorded only audio. */
  ZegoDataRecordType[(ZegoDataRecordType['AudioAndVideo'] = 3)] = 'AudioAndVideo'
})(ZegoDataRecordType || (ZegoDataRecordType = {}))
/** Record state. */
export var ZegoDataRecordState
;(function (ZegoDataRecordState) {
  /** Unrecorded state, which is the state when a recording error occurs or before recording starts. */
  ZegoDataRecordState[(ZegoDataRecordState['NoRecord'] = 0)] = 'NoRecord'
  /** Recording in progress, in this state after successfully call [startRecordingCapturedData] function */
  ZegoDataRecordState[(ZegoDataRecordState['Recording'] = 1)] = 'Recording'
  /** Record successs */
  ZegoDataRecordState[(ZegoDataRecordState['Success'] = 2)] = 'Success'
})(ZegoDataRecordState || (ZegoDataRecordState = {}))
/** Network mode */
export var ZegoNetworkMode
;(function (ZegoNetworkMode) {
  /** Offline (No network) */
  ZegoNetworkMode[(ZegoNetworkMode['Offline'] = 0)] = 'Offline'
  /** Unknown network mode */
  ZegoNetworkMode[(ZegoNetworkMode['Unknown'] = 1)] = 'Unknown'
  /** Wired Ethernet (LAN) */
  ZegoNetworkMode[(ZegoNetworkMode['Ethernet'] = 2)] = 'Ethernet'
  /** Wi-Fi (WLAN) */
  ZegoNetworkMode[(ZegoNetworkMode['WiFi'] = 3)] = 'WiFi'
  /** 2G Network (GPRS/EDGE/CDMA1x/etc.) */
  ZegoNetworkMode[(ZegoNetworkMode['Mode2G'] = 4)] = 'Mode2G'
  /** 3G Network (WCDMA/HSDPA/EVDO/etc.) */
  ZegoNetworkMode[(ZegoNetworkMode['Mode3G'] = 5)] = 'Mode3G'
  /** 4G Network (LTE) */
  ZegoNetworkMode[(ZegoNetworkMode['Mode4G'] = 6)] = 'Mode4G'
  /** 5G Network (NR (NSA/SA)) */
  ZegoNetworkMode[(ZegoNetworkMode['Mode5G'] = 7)] = 'Mode5G'
})(ZegoNetworkMode || (ZegoNetworkMode = {}))
/** network speed test type */
export var ZegoNetworkSpeedTestType
;(function (ZegoNetworkSpeedTestType) {
  /** uplink */
  ZegoNetworkSpeedTestType[(ZegoNetworkSpeedTestType['Uplink'] = 0)] = 'Uplink'
  /** downlink */
  ZegoNetworkSpeedTestType[(ZegoNetworkSpeedTestType['Downlink'] = 1)] = 'Downlink'
})(ZegoNetworkSpeedTestType || (ZegoNetworkSpeedTestType = {}))
/** VOD billing mode. */
export var ZegoCopyrightedMusicBillingMode
;(function (ZegoCopyrightedMusicBillingMode) {
  /** Pay-per-use.Each time a user obtains a song resource, a charge is required, that is, the user will be charged for each time based on the actual call to obtain the song resource interface (such as [requestResource] etc.). */
  ZegoCopyrightedMusicBillingMode[(ZegoCopyrightedMusicBillingMode['Count'] = 0)] = 'Count'
  /** Monthly billing by user.Billing for a single user is based on the monthly dimension, that is, the statistics call to obtain song resources (such as [requestResource], etc.) and the parameters are the user ID of the monthly subscription, and the charging is based on the monthly dimension. */
  ZegoCopyrightedMusicBillingMode[(ZegoCopyrightedMusicBillingMode['User'] = 1)] = 'User'
  /** Monthly billing by room.The room users are billed on a monthly basis, that is, statistical calls to obtain song resources (such as [requestResource], etc.) are passed as Roomid for a monthly subscription of the room, and fees are charged on a monthly basis. */
  ZegoCopyrightedMusicBillingMode[(ZegoCopyrightedMusicBillingMode['Room'] = 2)] = 'Room'
  /** Monthly billing by master. Every time a user obtains a resource, it is counted as the owner’s acquisition of resources, that is, according to the actual call to obtain the song resource interface (such as [requestResource], etc.), the parameters are passed as the Roomid of the room and the Masterid of the owner, and the fee is charged according to the owner. */
  ZegoCopyrightedMusicBillingMode[(ZegoCopyrightedMusicBillingMode['Master'] = 3)] = 'Master'
})(ZegoCopyrightedMusicBillingMode || (ZegoCopyrightedMusicBillingMode = {}))
/** The music resource type. For [querycache] interface. */
export var ZegoCopyrightedMusicType
;(function (ZegoCopyrightedMusicType) {
  /** Song. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicType[(ZegoCopyrightedMusicType['ZegoCopyrightedMusicSong'] = 0)] =
    'ZegoCopyrightedMusicSong'
  /** Song with high quality. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicType[(ZegoCopyrightedMusicType['ZegoCopyrightedMusicSongHQ'] = 1)] =
    'ZegoCopyrightedMusicSongHQ'
  /** Song with super quality. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicType[(ZegoCopyrightedMusicType['ZegoCopyrightedMusicSongSQ'] = 2)] =
    'ZegoCopyrightedMusicSongSQ'
  /** Song accompaniment. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicType[(ZegoCopyrightedMusicType['ZegoCopyrightedMusicAccompaniment'] = 3)] =
    'ZegoCopyrightedMusicAccompaniment'
  /** Song accompaniment clip. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicType[
    (ZegoCopyrightedMusicType['ZegoCopyrightedMusicAccompanimentClip'] = 4)
  ] = 'ZegoCopyrightedMusicAccompanimentClip'
  /** Song accompaniment segment. Deprecated since version 3.9.0. */
  ZegoCopyrightedMusicType[
    (ZegoCopyrightedMusicType['ZegoCopyrightedMusicAccompanimentSegment'] = 5)
  ] = 'ZegoCopyrightedMusicAccompanimentSegment'
})(ZegoCopyrightedMusicType || (ZegoCopyrightedMusicType = {}))
/** The music resource type. For [ZegoCopyrightedMusicRequestConfig], [ZegoCopyrightedMusicGetSharedConfig] and [ZegoCopyrightedMusicQueryCacheConfig]. */
export var ZegoCopyrightedMusicResourceType
;(function (ZegoCopyrightedMusicResourceType) {
  /** Song. */
  ZegoCopyrightedMusicResourceType[
    (ZegoCopyrightedMusicResourceType['ZegoCopyrightedMusicResourceSong'] = 0)
  ] = 'ZegoCopyrightedMusicResourceSong'
  /** Song accompaniment. */
  ZegoCopyrightedMusicResourceType[
    (ZegoCopyrightedMusicResourceType['ZegoCopyrightedMusicResourceAccompaniment'] = 1)
  ] = 'ZegoCopyrightedMusicResourceAccompaniment'
  /** Song accompaniment clip. */
  ZegoCopyrightedMusicResourceType[
    (ZegoCopyrightedMusicResourceType['ZegoCopyrightedMusicResourceAccompanimentClip'] = 2)
  ] = 'ZegoCopyrightedMusicResourceAccompanimentClip'
  /** Song accompaniment segment. */
  ZegoCopyrightedMusicResourceType[
    (ZegoCopyrightedMusicResourceType['ZegoCopyrightedMusicResourceAccompanimentSegment'] = 3)
  ] = 'ZegoCopyrightedMusicResourceAccompanimentSegment'
})(ZegoCopyrightedMusicResourceType || (ZegoCopyrightedMusicResourceType = {}))
/** Copyright music resource song copyright provider. For more information about the copyright owner, please contact ZEGO business personnel. */
export var ZegoCopyrightedMusicVendorID
;(function (ZegoCopyrightedMusicVendorID) {
  /** Default copyright provider. */
  ZegoCopyrightedMusicVendorID[
    (ZegoCopyrightedMusicVendorID['ZegoCopyrightedMusicVendorDefault'] = 0)
  ] = 'ZegoCopyrightedMusicVendorDefault'
  /** First copyright provider. */
  ZegoCopyrightedMusicVendorID[(ZegoCopyrightedMusicVendorID['ZegoCopyrightedMusicVendor1'] = 1)] =
    'ZegoCopyrightedMusicVendor1'
  /** Second copyright provider. */
  ZegoCopyrightedMusicVendorID[(ZegoCopyrightedMusicVendorID['ZegoCopyrightedMusicVendor2'] = 2)] =
    'ZegoCopyrightedMusicVendor2'
  /** Third copyright provider. */
  ZegoCopyrightedMusicVendorID[(ZegoCopyrightedMusicVendorID['ZegoCopyrightedMusicVendor3'] = 4)] =
    'ZegoCopyrightedMusicVendor3'
})(ZegoCopyrightedMusicVendorID || (ZegoCopyrightedMusicVendorID = {}))
/** The music resource quality type. For [ZegoCopyrightedMusicQueryCacheConfig]. */
export var ZegoCopyrightedMusicResourceQualityType
;(function (ZegoCopyrightedMusicResourceQualityType) {
  /** Standard Definition Audio. */
  ZegoCopyrightedMusicResourceQualityType[
    (ZegoCopyrightedMusicResourceQualityType['ZegoCopyrightedMusicResourceQualityNormal'] = 0)
  ] = 'ZegoCopyrightedMusicResourceQualityNormal'
  /** High Definition Audio. */
  ZegoCopyrightedMusicResourceQualityType[
    (ZegoCopyrightedMusicResourceQualityType['ZegoCopyrightedMusicResourceQualityHQ'] = 1)
  ] = 'ZegoCopyrightedMusicResourceQualityHQ'
  /** Lossless Audio Quality. */
  ZegoCopyrightedMusicResourceQualityType[
    (ZegoCopyrightedMusicResourceQualityType['ZegoCopyrightedMusicResourceQualitySQ'] = 2)
  ] = 'ZegoCopyrightedMusicResourceQualitySQ'
})(ZegoCopyrightedMusicResourceQualityType || (ZegoCopyrightedMusicResourceQualityType = {}))
/** Publish or play stream event */
export var ZegoStreamEvent
;(function (ZegoStreamEvent) {
  /** Start publishing stream */
  ZegoStreamEvent[(ZegoStreamEvent['PublishStart'] = 100)] = 'PublishStart'
  /** The first publish stream was successful */
  ZegoStreamEvent[(ZegoStreamEvent['PublishSuccess'] = 101)] = 'PublishSuccess'
  /** Failed to publish stream for the first time */
  ZegoStreamEvent[(ZegoStreamEvent['PublishFail'] = 102)] = 'PublishFail'
  /** Start retrying publishing stream */
  ZegoStreamEvent[(ZegoStreamEvent['RetryPublishStart'] = 103)] = 'RetryPublishStart'
  /** Retry publishing stream successfully */
  ZegoStreamEvent[(ZegoStreamEvent['RetryPublishSuccess'] = 104)] = 'RetryPublishSuccess'
  /** Failed to retry publishing stream */
  ZegoStreamEvent[(ZegoStreamEvent['RetryPublishFail'] = 105)] = 'RetryPublishFail'
  /** End of publishing stream */
  ZegoStreamEvent[(ZegoStreamEvent['PublishEnd'] = 106)] = 'PublishEnd'
  /** Start playing stream */
  ZegoStreamEvent[(ZegoStreamEvent['PlayStart'] = 200)] = 'PlayStart'
  /** The first play stream was successful */
  ZegoStreamEvent[(ZegoStreamEvent['PlaySuccess'] = 201)] = 'PlaySuccess'
  /** Failed to play stream for the first time */
  ZegoStreamEvent[(ZegoStreamEvent['PlayFail'] = 202)] = 'PlayFail'
  /** Start retrying playing stream */
  ZegoStreamEvent[(ZegoStreamEvent['RetryPlayStart'] = 203)] = 'RetryPlayStart'
  /** Retry playing stream successfully */
  ZegoStreamEvent[(ZegoStreamEvent['RetryPlaySuccess'] = 204)] = 'RetryPlaySuccess'
  /** Failed to retry playing stream */
  ZegoStreamEvent[(ZegoStreamEvent['RetryPlayFail'] = 205)] = 'RetryPlayFail'
  /** End of playing stream */
  ZegoStreamEvent[(ZegoStreamEvent['PlayEnd'] = 206)] = 'PlayEnd'
})(ZegoStreamEvent || (ZegoStreamEvent = {}))
/** video capture source. */
export var ZegoVideoSourceType
;(function (ZegoVideoSourceType) {
  /** No capture, i.e. no video data. */
  ZegoVideoSourceType[(ZegoVideoSourceType['None'] = 1)] = 'None'
  /** The video source comes from the camera (main channel default, and front camera is captured by default). The default is front camera, which can be adjusted to rear via [useFrontCamera]. */
  ZegoVideoSourceType[(ZegoVideoSourceType['Camera'] = 2)] = 'Camera'
  /** Video source from custom capture. */
  ZegoVideoSourceType[(ZegoVideoSourceType['Custom'] = 3)] = 'Custom'
  /** Video source from the main publish channel. When publishing the main channel, this value cannot be set. */
  ZegoVideoSourceType[(ZegoVideoSourceType['MainPublishChannel'] = 4)] = 'MainPublishChannel'
  /** Video source from media player. */
  ZegoVideoSourceType[(ZegoVideoSourceType['Player'] = 5)] = 'Player'
  /** Video source from screen capture. */
  ZegoVideoSourceType[(ZegoVideoSourceType['ScreenCapture'] = 6)] = 'ScreenCapture'
  /** Video source from secondary camera, the rear camera when [useFrontCamera] is set to true, otherwise the front camera, only support iOS. */
  ZegoVideoSourceType[(ZegoVideoSourceType['SecondaryCamera'] = 14)] = 'SecondaryCamera'
})(ZegoVideoSourceType || (ZegoVideoSourceType = {}))
/** Screen capture source exception type. (only for Android and iOS) */
export var ZegoScreenCaptureExceptionType
;(function (ZegoScreenCaptureExceptionType) {
  /** Unknown exception type. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['Unknown'] = 0)] = 'Unknown'
  /** The video capture system version does not support it, and Android only supports 5.0 and above. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['VideoNotSupported'] = 1)] =
    'VideoNotSupported'
  /** The capture target fails, such as the monitor is unplugged and the window is closed. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['AudioNotSupported'] = 2)] =
    'AudioNotSupported'
  /** Audio recording object creation failed. Possible reasons: 1. The audio recording permission is not enabled; 2. The allocated memory for audio recording is insufficient; 3. The creation of AudioRecord fails. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['AudioCreateFailed'] = 3)] =
    'AudioCreateFailed'
  /** MediaProjection request for dynamic permissions was denied. */
  ZegoScreenCaptureExceptionType[
    (ZegoScreenCaptureExceptionType['MediaProjectionPermissionDenied'] = 4)
  ] = 'MediaProjectionPermissionDenied'
  /** Capture is not started. Need to start capturing with [startScreenCapture] first. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['NotStartCapture'] = 5)] =
    'NotStartCapture'
  /** Screen capture has already started, repeated calls failed. You need to stop the capture with [stopScreenCapture] first. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['AlreadyStarted'] = 6)] =
    'AlreadyStarted'
  /** Failed to start the foreground service. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['ForegroundServiceFailed'] = 7)] =
    'ForegroundServiceFailed'
  /** Before starting screen capture, you need to call [setVideoSource], [setAudioSource] to specify the video and audio source `ScreenCapture`. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['SourceNotSpecified'] = 8)] =
    'SourceNotSpecified'
  /** System error exception. For example, low memory, etc. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['SystemError'] = 9)] =
    'SystemError'
  /** Exception interrupted. For example, the user clicks the stop button in the control center during the capture process. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['ExceptionInterrupted'] = 10)] =
    'ExceptionInterrupted'
  /** Audio device exception. You need to restart the capture. */
  ZegoScreenCaptureExceptionType[(ZegoScreenCaptureExceptionType['AudioDeviceException'] = 11)] =
    'AudioDeviceException'
})(ZegoScreenCaptureExceptionType || (ZegoScreenCaptureExceptionType = {}))
/** Multimedia load type. */
export var ZegoMultimediaLoadType
;(function (ZegoMultimediaLoadType) {
  /** Load by file path. */
  ZegoMultimediaLoadType[(ZegoMultimediaLoadType['FilePath'] = 0)] = 'FilePath'
  /** Load by memory. */
  ZegoMultimediaLoadType[(ZegoMultimediaLoadType['Memory'] = 1)] = 'Memory'
  /** Load by copyrighted music resource ID. */
  ZegoMultimediaLoadType[(ZegoMultimediaLoadType['ResourceID'] = 2)] = 'ResourceID'
})(ZegoMultimediaLoadType || (ZegoMultimediaLoadType = {}))
/** Alpha channel data layout. */
export var ZegoAlphaLayoutType
;(function (ZegoAlphaLayoutType) {
  /** There is no alpha data. */
  ZegoAlphaLayoutType[(ZegoAlphaLayoutType['None'] = 0)] = 'None'
  /** Alpha channel data is to the left of RGB/YUV data. */
  ZegoAlphaLayoutType[(ZegoAlphaLayoutType['Left'] = 1)] = 'Left'
  /** Alpha channel data is to the right of RGB/YUV data. */
  ZegoAlphaLayoutType[(ZegoAlphaLayoutType['Right'] = 2)] = 'Right'
  /** Alpha channel data is to the bottom of RGB/YUV data. */
  ZegoAlphaLayoutType[(ZegoAlphaLayoutType['Bottom'] = 3)] = 'Bottom'
  /** Alpha channel data is to the upper right of RGB/YUV data. */
  ZegoAlphaLayoutType[(ZegoAlphaLayoutType['RightTop'] = 4)] = 'RightTop'
})(ZegoAlphaLayoutType || (ZegoAlphaLayoutType = {}))
/** Object segmentation type. */
export var ZegoObjectSegmentationType
;(function (ZegoObjectSegmentationType) {
  /** Any background object segmentation. */
  ZegoObjectSegmentationType[(ZegoObjectSegmentationType['AnyBackground'] = 0)] = 'AnyBackground'
  /** Green screen background object segmentation. */
  ZegoObjectSegmentationType[(ZegoObjectSegmentationType['GreenScreenBackground'] = 1)] =
    'GreenScreenBackground'
})(ZegoObjectSegmentationType || (ZegoObjectSegmentationType = {}))
/** Object segmentation state. */
export var ZegoObjectSegmentationState
;(function (ZegoObjectSegmentationState) {
  /** Object segmentation turned off. */
  ZegoObjectSegmentationState[(ZegoObjectSegmentationState['Off'] = 0)] = 'Off'
  /** Object segmentation turned on. */
  ZegoObjectSegmentationState[(ZegoObjectSegmentationState['On'] = 1)] = 'On'
})(ZegoObjectSegmentationState || (ZegoObjectSegmentationState = {}))
/** Video background process type. */
export var ZegoBackgroundProcessType
;(function (ZegoBackgroundProcessType) {
  /** Background is transparent. */
  ZegoBackgroundProcessType[(ZegoBackgroundProcessType['Transparent'] = 0)] = 'Transparent'
  /** Fill the background with a solid color. */
  ZegoBackgroundProcessType[(ZegoBackgroundProcessType['Color'] = 1)] = 'Color'
  /** Blur background. */
  ZegoBackgroundProcessType[(ZegoBackgroundProcessType['Blur'] = 2)] = 'Blur'
  /** The background is the specified image. */
  ZegoBackgroundProcessType[(ZegoBackgroundProcessType['Image'] = 3)] = 'Image'
  /** The background is the specified video. */
  ZegoBackgroundProcessType[(ZegoBackgroundProcessType['Video'] = 4)] = 'Video'
})(ZegoBackgroundProcessType || (ZegoBackgroundProcessType = {}))
/** Background blur level. */
export var ZegoBackgroundBlurLevel
;(function (ZegoBackgroundBlurLevel) {
  /** Background blur level low. */
  ZegoBackgroundBlurLevel[(ZegoBackgroundBlurLevel['Low'] = 0)] = 'Low'
  /** Background blur level medium. */
  ZegoBackgroundBlurLevel[(ZegoBackgroundBlurLevel['Medium'] = 1)] = 'Medium'
  /** Background blur level high. */
  ZegoBackgroundBlurLevel[(ZegoBackgroundBlurLevel['High'] = 2)] = 'High'
})(ZegoBackgroundBlurLevel || (ZegoBackgroundBlurLevel = {}))
/** Live audio effect mode. */
export var ZegoLiveAudioEffectMode
;(function (ZegoLiveAudioEffectMode) {
  /** No audio effect. */
  ZegoLiveAudioEffectMode[(ZegoLiveAudioEffectMode['None'] = 0)] = 'None'
  /** Only local play. */
  ZegoLiveAudioEffectMode[(ZegoLiveAudioEffectMode['Local'] = 1)] = 'Local'
  /** Only publish. */
  ZegoLiveAudioEffectMode[(ZegoLiveAudioEffectMode['Publish'] = 2)] = 'Publish'
  /** Publish and local play. */
  ZegoLiveAudioEffectMode[(ZegoLiveAudioEffectMode['All'] = 3)] = 'All'
})(ZegoLiveAudioEffectMode || (ZegoLiveAudioEffectMode = {}))
/** Media stream type. */
export var ZegoMediaStreamType
;(function (ZegoMediaStreamType) {
  /** Media audio stream. */
  ZegoMediaStreamType[(ZegoMediaStreamType['Audio'] = 0)] = 'Audio'
  /** Media video stream. */
  ZegoMediaStreamType[(ZegoMediaStreamType['Video'] = 1)] = 'Video'
  /** Media audio and video stream. */
  ZegoMediaStreamType[(ZegoMediaStreamType['AV'] = 2)] = 'AV'
})(ZegoMediaStreamType || (ZegoMediaStreamType = {}))
/**
 * Log config.
 *
 * Description: This parameter is required when calling [setlogconfig] to customize log configuration.
 * Use cases: This configuration is required when you need to customize the log storage path or the maximum log file size.
 * Caution: None.
 */
export class ZegoLogConfig {
  /** The storage path of the log file. Description: Used to customize the storage path of the log file. Use cases: This configuration is required when you need to customize the log storage path. Required: False. Default value: The default path of each platform is different, please refer to the official website document https://docs.zegocloud.com/faq/express_sdkLog. Caution: Developers need to ensure read and write permissions for files under this path. */
  logPath
  /** Maximum log file size(Bytes). Description: Used to customize the maximum log file size. Use cases: This configuration is required when you need to customize the upper limit of the log file size. Required: False. Default value: 5MB (5 * 1024 * 1024 Bytes). Value range: Minimum 1MB (1 * 1024 * 1024 Bytes), maximum 100M (100 * 1024 * 1024 Bytes), 0 means no need to write logs. Caution: The larger the upper limit of the log file size, the more log information it carries, but the log upload time will be longer. */
  logSize
  /** Log files count. Default is 3. Value range is [3, 20]. */
  logCount
  constructor() {
    this.logPath = ''
    this.logSize = 5 * 1024 * 1024
    this.logCount = 3
  }
}
/**
 * Custom video capture configuration.
 *
 * Custom video capture, that is, the developer is responsible for collecting video data and sending the collected video data to SDK for video data encoding and publishing to the ZEGO RTC server. This feature is generally used by developers who use third-party beauty features or record game screen living.
 * When you need to use the custom video capture function, you need to set an instance of this class as a parameter to the [enableCustomVideoCapture] function.
 * Because when using custom video capture, SDK will no longer start the camera to capture video data. You need to collect video data from video sources by yourself.
 */
export class ZegoCustomVideoCaptureConfig {
  /** Custom video capture video frame data type */
  bufferType
  constructor(bufferType) {
    this.bufferType = bufferType
  }
}
/**
 * Custom video process configuration.
 */
export class ZegoCustomVideoProcessConfig {
  /** Custom video process video frame data type */
  bufferType
  constructor(bufferType) {
    this.bufferType = bufferType
  }
}
/**
 * Custom audio configuration.
 */
export class ZegoCustomAudioConfig {
  /** Audio capture source type */
  sourceType
  constructor(sourceType) {
    this.sourceType = sourceType
  }
}
/**
 * Profile for create engine
 *
 * Profile for create engine
 */
export class ZegoEngineProfile {
  /** Application ID issued by ZEGO for developers, please apply from the ZEGO Admin Console https://console.zegocloud.com The value ranges from 0 to 4294967295. */
  appID
  /** Application signature for each AppID, please apply from the ZEGO Admin Console. Application signature is a 64 character string. Each character has a range of '0' ~ '9', 'a' ~ 'z'. AppSign 2.17.0 and later allows null or no transmission. If the token is passed empty or not passed, the token must be entered in the [ZegoRoomConfig] parameter for authentication when the [loginRoom] interface is called to login to the room. */
  appSign
  /** The room scenario. the SDK will optimize the audio and video configuration for the specified scenario to achieve the best effect in this scenario. After specifying the scenario, you can call other APIs to adjusting the audio and video configuration. Differences between scenarios and how to choose a suitable scenario, please refer to https://docs.zegocloud.com/article/14940 */
  scenario
  constructor(appID, appSign, scenario) {
    this.appID = appID
    this.appSign = appSign
    this.scenario = scenario
  }
}
/**
 * Advanced engine configuration.
 */
export class ZegoEngineConfig {
  /** @deprecated This property has been deprecated since version 2.3.0, please use the [setLogConfig] function instead. */
  logConfig
  /** Other special function switches, if not set, no special function will be used by default. Please contact ZEGO technical support before use. */
  advancedConfig
  constructor() {}
}
/**
 * Advanced room configuration.
 *
 * Configure maximum number of users in the room and authentication token, etc.
 */
export class ZegoRoomConfig {
  /** The maximum number of users in the room, Passing 0 means unlimited, the default is unlimited. */
  maxMemberCount
  /** Whether to enable the user in and out of the room callback notification [onRoomUserUpdate], the default is off. If developers need to use ZEGO Room user notifications, make sure that each user who login sets this flag to true */
  isUserStatusNotify
  /** The token issued by the developer's business server is used to ensure security. For the generation rules, please refer to [Using Token Authentication](https://doc-zh.zego.im/article/10360), the default is an empty string, that is, no authentication. In versions 2.17.0 and above, if appSign is not passed in when calling the [createEngine] API to create an engine, or if appSign is empty, this parameter must be set for authentication when logging in to a room. */
  token
  constructor(maxMemberCount, isUserStatusNotify, token) {
    this.maxMemberCount = maxMemberCount
    this.isUserStatusNotify = isUserStatusNotify
    this.token = token
  }
}
/**
 * Video config.
 *
 * Configure parameters used for publishing stream, such as bitrate, frame rate, and resolution.
 * Developers should note that the width and height resolution of the mobile and desktop are opposite. For example, 360p, the resolution of the mobile is 360x640, and the desktop is 640x360.
 * When using external capture, the capture and encoding resolution of RTC cannot be set to 0*0, otherwise, there will be no video data in the publishing stream in the entire engine life cycle.
 */
export class ZegoVideoConfig {
  /** Capture resolution width, control the width of camera image acquisition. SDK requires this member to be set to an even number. Only the camera is not started and the custom video capture is not used, the setting is effective. For performance reasons, the SDK scales the video frame to the encoding resolution after capturing from camera and before rendering to the preview view. Therefore, the resolution of the preview image is the encoding resolution. If you need the resolution of the preview image to be this value, Please call [setCapturePipelineScaleMode] first to change the capture pipeline scale mode to [Post] */
  captureWidth
  /** Capture resolution height, control the height of camera image acquisition. SDK requires this member to be set to an even number. Only the camera is not started and the custom video capture is not used, the setting is effective. For performance reasons, the SDK scales the video frame to the encoding resolution after capturing from camera and before rendering to the preview view. Therefore, the resolution of the preview image is the encoding resolution. If you need the resolution of the preview image to be this value, Please call [setCapturePipelineScaleMode] first to change the capture pipeline scale mode to [Post] */
  captureHeight
  /** Encode resolution width, control the image width of the encoder when publishing stream. SDK requires this member to be set to an even number. The settings before and after publishing stream can be effective */
  encodeWidth
  /** Encode resolution height, control the image height of the encoder when publishing stream. SDK requires this member to be set to an even number. The settings before and after publishing stream can be effective */
  encodeHeight
  /** Frame rate, control the frame rate of the camera and the frame rate of the encoder. Publishing stream set to 60 fps, playing stream to take effect need contact technical support */
  fps
  /** Bit rate in kbps. The settings before and after publishing stream can be effective. The SDK will automatically set the bit rate suitable for the scenario selected by the developer. If the bit rate manually set by the developer exceeds the reasonable range, the SDK will automatically process the bit rate according to the reasonable range. If you need to configure a high bit rate due to business needs, please contact ZEGO Business. */
  bitrate
  /** The codec id to be used, the default value is [default]. Settings only take effect before publishing stream */
  codecID
  /** Video keyframe interval, in seconds. Description: Required: No. Default value: 2 seconds. Value range: [2, 5]. Caution: The setting is only valid before pushing. */
  keyFrameInterval
  /**
   * Create video configuration with preset enumeration values
   */
  constructor(preset) {
    preset = preset ?? ZegoVideoConfigPreset.Preset360P
    this.codecID = ZegoVideoCodecID.Default
    this.keyFrameInterval = 2
    switch (preset) {
      case ZegoVideoConfigPreset.Preset180P:
        this.captureWidth = 320
        this.captureHeight = 180
        this.encodeWidth = 320
        this.encodeHeight = 180
        this.fps = 15
        this.bitrate = 300
        break
      case ZegoVideoConfigPreset.Preset270P:
        this.captureWidth = 480
        this.captureHeight = 270
        this.encodeWidth = 480
        this.encodeHeight = 270
        this.fps = 15
        this.bitrate = 400
        break
      case ZegoVideoConfigPreset.Preset360P:
        this.captureWidth = 640
        this.captureHeight = 360
        this.encodeWidth = 640
        this.encodeHeight = 360
        this.fps = 15
        this.bitrate = 600
        break
      case ZegoVideoConfigPreset.Preset540P:
        this.captureWidth = 960
        this.captureHeight = 540
        this.encodeWidth = 960
        this.encodeHeight = 540
        this.fps = 15
        this.bitrate = 1200
        break
      case ZegoVideoConfigPreset.Preset720P:
        this.captureWidth = 1280
        this.captureHeight = 720
        this.encodeWidth = 1280
        this.encodeHeight = 720
        this.fps = 15
        this.bitrate = 1500
        break
      case ZegoVideoConfigPreset.Preset1080P:
        this.captureWidth = 1920
        this.captureHeight = 1080
        this.encodeWidth = 1920
        this.encodeHeight = 1080
        this.fps = 15
        this.bitrate = 3000
        break
    }
  }
}
/**
 * Voice changer parameter.
 *
 * Developer can use the built-in presets of the SDK to change the parameters of the voice changer.
 */
export class ZegoVoiceChangerParam {
  /** Pitch parameter, value range [-12.0, 12.0], the larger the value, the sharper the sound, set it to 0.0 to turn off. Note that on v2.18.0 and older version, the value range is [-8.0, 8.0]. */
  pitch
  constructor(pitch) {
    this.pitch = pitch
  }
}
/**
 * Audio reverberation advanced parameters.
 *
 * Developers can use the SDK's built-in presets to change the parameters of the reverb.
 */
export class ZegoReverbAdvancedParam {
  /** Room size(%), in the range [0.0, 1.0], to control the size of the "room" in which the reverb is generated, the larger the room, the stronger the reverb. */
  roomSize
  /** Echo(%), in the range [0.0, 100.0], to control the trailing length of the reverb. */
  reverberance
  /** Reverb Damping(%), range [0.0, 100.0], controls the attenuation of the reverb, the higher the damping, the higher the attenuation. */
  damping
  /** only wet */
  wetOnly
  /** wet gain(dB), range [-20.0, 10.0] */
  wetGain
  /** dry gain(dB), range [-20.0, 10.0] */
  dryGain
  /** Tone Low. 100% by default */
  toneLow
  /** Tone High. 100% by default */
  toneHigh
  /** PreDelay(ms), range [0.0, 200.0] */
  preDelay
  /** Stereo Width(%). 0% by default */
  stereoWidth
  constructor() {
    this.roomSize = 0
    this.reverberance = 0
    this.damping = 0
    this.wetOnly = false
    this.wetGain = 0
    this.dryGain = 0
    this.toneLow = 100
    this.toneHigh = 100
    this.preDelay = 0
    this.stereoWidth = 0
  }
}
/**
 * Audio reverberation echo parameters.
 */
export class ZegoReverbEchoParam {
  /** Gain of input audio signal, in the range [0.0, 1.0] */
  inGain
  /** Gain of output audio signal, in the range [0.0, 1.0] */
  outGain
  /** Number of echos, in the range [0, 7] */
  numDelays
  /** Respective delay of echo signal, in milliseconds, in the range [0, 5000] ms */
  delay
  /** Respective decay coefficient of echo signal, in the range [0.0, 1.0] */
  decay
  constructor() {
    this.inGain = 0
    this.outGain = 0
    this.numDelays = 0
    this.delay = new Uint16Array(7)
    this.decay = new Float32Array(7)
  }
}
/**
 * User object.
 *
 * Configure user ID and username to identify users in the room.
 * Note that the userID must be unique under the same appID, otherwise, there will be mutual kicks when logging in to the room.
 * It is strongly recommended that userID corresponds to the user ID of the business APP, that is, a userID and a real user are fixed and unique, and should not be passed to the SDK in a random userID. Because the unique and fixed userID allows ZEGO technicians to quickly locate online problems.
 */
export class ZegoUser {
  /** User ID, a utf8 string with a maximum length of 64 bytes or less.Privacy reminder: Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc.Caution: Only support numbers, English characters and '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '\'. Do not use '%' if you need to communicate with the Web SDK. */
  userID
  /** User Name, a utf8 string with a maximum length of 256 bytes or less.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  userName
  constructor(userID, userName) {
    this.userID = userID
    this.userName = userName
  }
}
/**
 * View related coordinates.
 */
export class ZegoRect {
  /** The horizontal offset from the top-left corner */
  x
  /** The vertical offset from the top-left corner */
  y
  /** The width of the rectangle */
  width
  /** The height of the rectangle */
  height
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}
/**
 * View object.
 *
 * Configure view object, view Mode, background color
 */
export class ZegoView {
  /** View mode, default is ZegoViewModeAspectFit */
  viewMode
  /** Background color, the format is 0xRRGGBB, default is black, which is 0x000000 */
  backgroundColor
  /** If enable alpha blend render, default is false. */
  alphaBlend
  /** reactTag is a tag for native and js to identify each component, and each root view must have a unique reactTag. */
  reactTag
  constructor(reactTag, viewMode, backgroundColor) {
    this.viewMode = viewMode
    this.backgroundColor = backgroundColor
    this.reactTag = reactTag
  }
}
/**
 * Advanced publisher configuration.
 *
 * Configure room id
 */
export class ZegoPublisherConfig {
  /** The Room ID, It is not necessary to pass in single room mode, but the ID of the corresponding room must be passed in multi-room mode */
  roomID
  /** Whether to synchronize the network time when pushing streams. 1 is synchronized with 0 is not synchronized. And must be used with setStreamAlignmentProperty. It is used to align multiple streams at the mixed stream service or streaming end, such as the chorus scene of KTV. */
  forceSynchronousNetworkTime
  constructor(roomID) {
    this.roomID = roomID
  }
}
/**
 * CDN config object.
 *
 * Includes CDN URL and authentication parameter string
 */
export class ZegoCDNConfig {
  /** CDN URL */
  url
  /** Auth param of URL. Please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored (set to null or empty string). */
  authParam
  /** URL supported protocols, candidate values are "tcp" and "quic". If there are more than one, separate them with English commas and try them in order. Please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored (set to null or empty string). */
  protocol
  /** QUIC version。 If [protocol] has the QUIC protocol, this information needs to be filled in. If there are multiple version numbers, separate them with commas. Please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored (set to null or empty string). */
  quicVersion
  constructor(url, authParam) {
    this.url = url
    this.authParam = authParam
  }
}
/**
 * Advanced player configuration.
 *
 * Configure stream resource mode, CDN configuration and other advanced configurations.
 */
export class ZegoPlayerConfig {
  /** Stream resource mode. */
  resourceMode
  /** The CDN configuration for playing stream. If set, the stream is play according to the URL instead of the streamID. After that, the streamID is only used as the ID of SDK internal callback. */
  cdnConfig
  /** The Room ID. It only needs to be filled in the multi-room mode, which indicates which room this stream needs to be bound to. This parameter is ignored in single room mode. */
  roomID
  /** The video encoding type of the stream, please contact ZEGO technical support if you need to use it, otherwise this parameter can be ignored. */
  videoCodecID
  constructor(cdnConfig) {
    this.cdnConfig = cdnConfig
  }
}
/**
 * Beauty configuration options.
 *
 * Configure the parameters of skin peeling, whitening and sharpening
 */
export class ZegoBeautifyOption {
  /** The sample step size of beauty peeling, the value range is [0,1], default 0.2 */
  polishStep
  /** Brightness parameter for beauty and whitening, the larger the value, the brighter the brightness, ranging from [0,1], default 0.5 */
  whitenFactor
  /** Beauty sharpening parameter, the larger the value, the stronger the sharpening, value range [0,1], default 0.1 */
  sharpenFactor
  constructor(polishStep, whitenFactor, sharpenFactor) {
    this.polishStep = polishStep
    this.whitenFactor = whitenFactor
    this.sharpenFactor = sharpenFactor
  }
}
/**
 * Beauty configuration param.
 *
 * Configure the whiten, rosy, smooth, and sharpen parameters for beauty.
 */
export class ZegoEffectsBeautyParam {
  /** The whiten intensity parameter, the value range is [0,100], and the default is 50. */
  whitenIntensity
  /** the rosy intensity parameter, value range [0,100], and the default is 50. */
  rosyIntensity
  /** the smooth intensity parameter, value range [0,100], and the default is 50. */
  smoothIntensity
  /** the sharpen intensity parameter, value range [0,100], and the default is 50. */
  sharpenIntensity
  constructor() {
    this.whitenIntensity = 50
    this.rosyIntensity = 50
    this.smoothIntensity = 50
    this.sharpenIntensity = 50
  }
}
/**
 * Mix stream audio configuration.
 *
 * Configure video frame rate, bitrate, and resolution for mixer task
 */
export class ZegoMixerAudioConfig {
  /** Audio bitrate in kbps, default is 48 kbps, cannot be modified after starting a mixer task */
  bitrate
  /** Audio channel, default is Mono */
  channel
  /** codec ID, default is ZegoAudioCodecIDDefault */
  codecID
  constructor(bitrate, channel, codecID) {
    this.bitrate = bitrate
    this.channel = channel
    this.codecID = codecID
  }
}
/**
 * Mix stream video config object.
 *
 * Configure video frame rate, bitrate, and resolution for mixer task
 */
export class ZegoMixerVideoConfig {
  /** Video resolution width */
  width
  /** Video resolution height */
  height
  /** Video FPS, cannot be modified after starting a mixer task */
  fps
  /** Video bitrate in kbps */
  bitrate
  constructor(width, height, fps, bitrate) {
    this.width = width
    this.height = height
    this.fps = fps
    this.bitrate = bitrate
  }
}
/**
 * Mixer input.
 *
 * Configure the mix stream input stream ID, type, and the layout
 */
export class ZegoMixerInput {
  /** Stream ID, a string of up to 256 characters. Caution: You cannot include URL keywords, otherwise publishing stream and playing stream will fails. Only support numbers, English characters and '-', '_'. */
  streamID
  /** Mix stream content type */
  contentType
  /** Stream layout. When the mixed stream is an audio stream (that is, the ContentType parameter is set to the audio mixed stream type). Developers do not need to assign a value to this field, just use the SDK default. */
  layout
  /** If enable soundLevel in mix stream task, an unique soundLevelID is need for every stream */
  soundLevelID
  constructor(streamID, contentType, layout, soundLevelID) {
    this.streamID = streamID
    this.contentType = contentType
    this.layout = layout
    this.soundLevelID = soundLevelID
  }
}
/**
 * Mixer output object, currently, a mixed-stream task only supports a maximum of four video streams with different resolutions.
 *
 * Configure mix stream output target URL or stream ID
 */
export class ZegoMixerOutput {
  /** Mix stream output target, URL or stream ID, if set to be URL format, only RTMP URL surpported, for example rtmp://xxxxxxxx, addresses with two identical mixed-stream outputs cannot be passed in. */
  target
  constructor(target) {
    this.target = target
  }
}
/**
 * Mix stream task object.
 *
 * This class is the configuration class of the stream mixing task. When a stream mixing task is requested to the ZEGO RTC server, the configuration of the stream mixing task is required.
 * This class describes the detailed configuration information of this stream mixing task.
 */
export class ZegoMixerTask {
  /** The task ID of the task */
  taskID
  /** The input list of the task */
  inputList
  /** The output list of the task */
  outputList
  /** The video config of the task */
  videoConfig
  /** The audio config of the task */
  audioConfig
  /** Enable or disable sound level callback for the task. If enabled, then the remote player can get the soundLevel of every stream in the inputlist by [onMixerSoundLevelUpdate] callback. */
  enableSoundLevel
  /** The stream mixing alignment mode */
  streamAlignmentMode
  constructor(taskID) {
    this.taskID = taskID
    this.inputList = []
    this.outputList = []
    this.audioConfig = {
      bitrate: 48,
      channel: ZegoAudioChannel.Mono,
      codecID: ZegoAudioCodecID.Normal,
    }
    this.videoConfig = { width: 360, height: 640, fps: 15, bitrate: 600 }
    this.enableSoundLevel = false
    this.streamAlignmentMode = ZegoStreamAlignmentMode.None
  }
}
/**
 * Configuration for start sound level monitor.
 */
export class ZegoSoundLevelConfig {
  /** Monitoring time period of the sound level, in milliseconds, has a value range of [100, 3000]. Default is 100 ms. */
  millisecond
  /** Set whether the sound level callback includes the VAD detection result. */
  enableVAD
  constructor(millisecond, enableVAD) {
    this.millisecond = millisecond
    this.enableVAD = enableVAD
  }
}
/**
 * Broadcast message info.
 *
 * The received object of the room broadcast message, including the message content, message ID, sender, sending time
 */
export class ZegoBroadcastMessageInfo {
  /** message content */
  message
  /** message id */
  messageID
  /** Message send time, UNIX timestamp, in milliseconds. */
  sendTime
  /** Message sender.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  fromUser
  constructor(message, messageID, sendTime, fromUser) {
    this.message = message
    this.messageID = messageID
    this.sendTime = sendTime
    this.fromUser = fromUser
  }
}
/**
 * Barrage message info.
 *
 * The received object of the room barrage message, including the message content, message ID, sender, sending time
 */
export class ZegoBarrageMessageInfo {
  /** message content */
  message
  /** message id */
  messageID
  /** Message send time, UNIX timestamp, in milliseconds. */
  sendTime
  /** Message sender.Please do not fill in sensitive user information in this field, including but not limited to mobile phone number, ID number, passport number, real name, etc. */
  fromUser
  constructor(message, messageID, sendTime, fromUser) {
    this.message = message
    this.messageID = messageID
    this.sendTime = sendTime
    this.fromUser = fromUser
  }
}
/**
 * Parameter object for audio frame.
 *
 * Including the sampling rate and channel of the audio frame
 */
export class ZegoAudioFrameParam {
  /** Sampling Rate */
  sampleRate
  /** Audio channel, default is Mono */
  channel
  constructor(sampleRate, channel) {
    this.sampleRate = sampleRate
    this.channel = channel
  }
}
/**
 * Audio configuration.
 *
 * Configure audio bitrate, audio channel, audio encoding for publishing stream
 */
export class ZegoAudioConfig {
  /** Audio bitrate in kbps, default is 48 kbps. The settings before and after publishing stream can be effective */
  bitrate
  /** Audio channel, default is Mono. The setting only take effect before publishing stream */
  channel
  /** codec ID, default is ZegoAudioCodecIDDefault. The setting only take effect before publishing stream */
  codecID
  /**
   * Create a default audio configuration (ZegoAudioConfigPresetStandardQuality, 48 kbps, Mono, ZegoAudioCodecIDDefault)
   */
  constructor(preset) {
    preset = preset ?? ZegoAudioConfigPreset.StandardQuality
    this.codecID = ZegoAudioCodecID.Default
    switch (preset) {
      case ZegoAudioConfigPreset.BasicQuality:
        this.bitrate = 16
        this.channel = ZegoAudioChannel.Mono
        break
      case ZegoAudioConfigPreset.StandardQuality:
        this.bitrate = 48
        this.channel = ZegoAudioChannel.Mono
        break
      case ZegoAudioConfigPreset.StandardQualityStereo:
        this.bitrate = 56
        this.channel = ZegoAudioChannel.Stereo
        break
      case ZegoAudioConfigPreset.HighQuality:
        this.bitrate = 128
        this.channel = ZegoAudioChannel.Mono
        break
      case ZegoAudioConfigPreset.HighQualityStereo:
        this.bitrate = 192
        this.channel = ZegoAudioChannel.Stereo
        break
      default:
        this.bitrate = 48
        this.channel = ZegoAudioChannel.Mono
        break
    }
  }
}
/**
 * Customize the audio processing configuration object.
 *
 * Including custom audio acquisition type, sampling rate, channel number, sampling number and other parameters
 */
export class ZegoCustomAudioProcessConfig {
  /** Sampling rate, the sampling rate of the input data expected by the audio pre-processing module in App. If 0, the default is the SDK internal sampling rate. */
  sampleRate
  /** Number of sound channels, the expected number of sound channels for input data of the audio pre-processing module in App. If 0, the default is the number of internal channels in the SDK */
  channel
  /** The number of samples required to encode a frame; if samples = 0, the SDK will use the internal sample number, and the SDK will pass the audio data to the external pre-processing module. If the samples! = 0 (the effective value of samples is between [160, 2048]), and the SDK will send audio data to the external preprocessing module that sets the length of sample number. */
  samples
  constructor(sampleRate, channel, samples) {
    this.sampleRate = sampleRate
    this.channel = channel
    this.samples = samples
  }
}
/**
 * Record config.
 */
export class ZegoDataRecordConfig {
  /** The path to save the recording file, absolute path, need to include the file name, the file name need to specify the suffix, currently supports .mp4/.flv/.aac format files, if multiple recording for the same path, will overwrite the file with the same name. The maximum length should be less than 1024 bytes. */
  filePath
  /** Type of recording media */
  recordType
  constructor(filePath, recordType) {
    this.filePath = filePath
    this.recordType = recordType
  }
}
/**
 * File recording progress.
 */
export class ZegoDataRecordProgress {
  /** Current recording duration in milliseconds */
  duration
  /** Current recording file size in byte */
  currentFileSize
  /** The quality of current recording file */
  quality
  constructor(duration, currentFileSize, quality) {
    this.duration = duration
    this.currentFileSize = currentFileSize
    this.quality = quality
  }
}
/**
 * Network speed test config
 */
export class ZegoNetworkSpeedTestConfig {
  /** Test uplink or not */
  testUplink
  /** The unit is kbps. Recommended to use the bitrate in ZegoVideoConfig when call startPublishingStream to determine whether the network uplink environment is suitable. */
  expectedUplinkBitrate
  /** Test downlink or not */
  testDownlink
  /** The unit is kbps. Recommended to use the bitrate in ZegoVideoConfig when call startPublishingStream to determine whether the network downlink environment is suitable. */
  expectedDownlinkBitrate
  constructor(testUplink, expectedUplinkBitrate, testDownlink, expectedDownlinkBitrate) {
    this.testUplink = testUplink
    this.expectedUplinkBitrate = expectedUplinkBitrate
    this.testDownlink = testDownlink
    this.expectedDownlinkBitrate = expectedDownlinkBitrate
  }
}
/**
 * AudioEffectPlayer play configuration.
 */
export class ZegoAudioEffectPlayConfig {
  /** The number of play counts. When set to 0, it will play in an infinite loop until the user invoke [stop]. The default is 1, which means it will play only once. */
  playCount
  /** Whether to mix audio effects into the publishing stream, the default is false. */
  isPublishOut
  constructor(playCount, isPublishOut) {
    this.playCount = playCount
    this.isPublishOut = isPublishOut
  }
}
/**
 * CopyrightedMusic play configuration.
 */
export class ZegoCopyrightedMusicConfig {
  /** User object instance, configure userID, userName. Note that the user ID set here needs to be consistent with the user ID set when logging in to the room, otherwise the request for the copyright music background service will fail. */
  user
  constructor(user) {
    this.user = user
  }
}
/**
 * The configuration of getting lyric.
 */
export class ZegoCopyrightedMusicGetLyricConfig {
  /** the ID of the song. */
  songID
  /** Copyright music resource song copyright provider. */
  vendorID
  constructor(songID, vendorID) {
    this.songID = songID
    this.vendorID = vendorID
  }
}
/**
 * The configuration of requesting resource.
 */
export class ZegoCopyrightedMusicRequestConfigV2 {
  /** the ID of the song. */
  songID
  /** VOD billing mode. Refer to the value of [ZegoCopyrightedMusicBillingMode]. */
  mode
  /** Copyright music resource song copyright provider. Refer to the value of [ZegoCopyrightedMusicVendorID]. */
  vendorID
  /** The room ID, the single-room mode can not be passed, and the corresponding room ID must be passed in the multi-room mode. Indicate in which room to order song/accompaniment/accompaniment clip/accompaniment segment. */
  roomID
  /** The master ID, which must be passed when the billing mode is billed by host. Indicate which homeowner to order song/accompaniment/accompaniment clip/accompaniment segment. */
  masterID
  /** The scene ID, indicate the actual business. For details, please consult ZEGO technical support. */
  sceneID
  /** The resource type of music. Refer to the value of [ZegoCopyrightedMusicResourceType]. */
  resourceType
  constructor(songID, mode, vendorID, roomID, masterID, sceneID, resourceType) {
    this.songID = songID
    this.mode = mode
    this.vendorID = vendorID
    this.roomID = roomID
    this.masterID = masterID
    this.sceneID = sceneID
    this.resourceType = resourceType
  }
}
/**
 * The configuration of getting shared resource.
 */
export class ZegoCopyrightedMusicGetSharedConfigV2 {
  /** the ID of the song. */
  songID
  /** Copyright music resource song copyright provider. Refer to the value of [ZegoCopyrightedMusicVendorID]. */
  vendorID
  /** The room ID, the single-room mode can not be passed, and the corresponding room ID must be passed in the multi-room mode. Indicates which room to get resources from. */
  roomID
  /** The resource type of music. */
  resourceType
  constructor(songID, vendorID, roomID, resourceType) {
    this.songID = songID
    this.vendorID = vendorID
    this.roomID = roomID
    this.resourceType = resourceType
  }
}
/**
 * The configuration of querying cache.
 */
export class ZegoCopyrightedMusicQueryCacheConfigV2 {
  /** the ID of the song. */
  songID
  /** The resource type of music. Refer to the value of [ZegoCopyrightedMusicResourceType]. */
  resourceType
  /** The resource quality type of music. Refer to the value of [ZegoCopyrightedMusicResourceQualityType]. */
  resourceQualityType
  /** Copyright music resource song copyright provider. Refer to the value of [ZegoCopyrightedMusicVendorID]. */
  vendorID
  constructor(songID, resourceType, resourceQualityType, vendorID) {
    this.songID = songID
    this.resourceType = resourceType
    this.resourceQualityType = resourceQualityType
    this.vendorID = vendorID
  }
}
/**
 * Screen capture configuration parameters.
 */
export class ZegoScreenCaptureConfig {
  /** Whether to capture video when screen capture. The default is true. */
  captureVideo
  /** Whether to capture audio when screen capture. The default is true. */
  captureAudio
  /** Set Microphone audio volume for ReplayKit. The range is 0 ~ 200. The default is 100. (only for iOS) */
  microphoneVolume
  /** Set Application audio volume for ReplayKit. The range is 0 ~ 200. The default is 100. (only for iOS and Android) */
  applicationVolume
  /** Set the audio capture parameters during screen capture. (only for Android) */
  audioParam
  constructor(captureVideo, captureAudio, microphoneVolume, applicationVolume) {
    this.captureVideo = captureVideo
    this.captureAudio = captureAudio
    this.microphoneVolume = microphoneVolume
    this.applicationVolume = applicationVolume
  }
}
/**
 * Multimedia resource for ZEGO media player.
 *
 * Used to configure loading parameters when loading multimedia resources.
 */
export class ZegoMediaPlayerResource {
  /** Used to specify the loading type of multimedia resources. */
  loadType
  /** The progress at which the plaback started. */
  startPosition
  /** If the specified resource has a transparent effect, you need to specify the layout position of the alpha data. */
  alphaLayout
  /** Common resource path.The absolute resource path or the URL of the network resource and cannot be null or "". Android can set this path string with Uri. */
  filePath
  /** binary data memory. */
  memory
  /** The resource ID obtained from the copyrighted music module. */
  resourceID
  constructor() {
    this.loadType = ZegoMultimediaLoadType.FilePath
    this.startPosition = 0
    this.alphaLayout = ZegoAlphaLayoutType.None
    this.filePath = ''
    this.memory = undefined
    this.resourceID = ''
  }
}
/**
 * Background config.
 *
 * It is used to configure background when the object segmentation is turned on.
 */
export class ZegoBackgroundConfig {
  /** Background process type. */
  processType
  /** Background color, the format is 0xRRGGBB, default is black, which is 0x000000 */
  color
  /** Background image URL. Support local file absolute path (file://xxx). The format supports png, jpg. */
  imageURL
  /** Background video URL. Caution: 1. The video will be played in a loop. 2. Support local file absolute path (file://xxx). 3. The format supports MP4, FLV, MKV, AVI. 4. The maximum resolution should not exceed 4096px, and it is recommended to be within 1920px. 5. The maximum video duration should not exceed 30 seconds, and it is recommended to be within 15 seconds. 6. The maximum video size should not exceed 50MB, and 10MB is recommended. */
  videoURL
  /** Background blur level. */
  blurLevel
  constructor() {
    this.processType = ZegoBackgroundProcessType.Transparent
    this.color = 0
    this.imageURL = ''
    this.videoURL = ''
    this.blurLevel = ZegoBackgroundBlurLevel.Medium
  }
}
/**
 * Object segmentation config.
 *
 * It is used to configure parameters when the object segmentation is turned on.
 */
export class ZegoObjectSegmentationConfig {
  /** The type of object segmentation. */
  objectSegmentationType
  /** Background config. */
  backgroundConfig
  constructor() {
    this.objectSegmentationType = ZegoObjectSegmentationType.AnyBackground
    this.backgroundConfig = new ZegoBackgroundConfig()
  }
}
export class ZegoRealTimeSequentialDataManager {}
export class ZegoMediaPlayer {}
export class ZegoAudioEffectPlayer {}
export class ZegoCopyrightedMusic {}
/**
 * Callback of requesting music resource.
 *
 * @param errorCode Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details.
 * @param resource The JSON string returned by the song ordering service, including music resource information.
 */
export class ZegoCopyrightedMusicRequestResourceResult {
  /** Error code, please refer to the error codes document https://docs.zegocloud.com/en/5548.html for details. */
  errorCode
  /** The JSON string returned by the song ordering service, including music resource information. */
  resource
  constructor(errorCode, resource) {
    this.errorCode = errorCode
    this.resource = resource
  }
}
