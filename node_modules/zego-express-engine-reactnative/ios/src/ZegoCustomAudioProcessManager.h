//
//  ZegoCustomAudioProcessManager.h
//  react-native-zego-express-engine
//
//  Created by zego on 2025/3/14.
//

#import <Foundation/Foundation.h>
#import <ZegoExpressEngine/ZegoExpressEngine.h>

NS_ASSUME_NONNULL_BEGIN

@protocol ZegoReactNativeCustomAudioProcessHandler <NSObject>

@required

/// Aligned audio aux frames callback.
///
/// Description: In this callback, you can receive the audio aux frames which aligned with accompany. Developers can record locally.
/// When to trigger: This callback function will not be triggered until [enableAlignedAudioAuxData] is called to turn on the function and [startpublishingstream] or [startrecordingcaptureddata] is called.
/// Restrictions: To obtain audio aux data of the media player from this callback, developers need to call [enableAux] and [start] of MediaPlayer.
/// Caution: This callback is a high-frequency callback, please do not perform time-consuming operations in this callback, and the data in this callback cannot be modified.
///
/// @param data Audio data in PCM format.
/// @param dataLength Length of the data.
/// @param param Parameters of the audio frame.
- (void)onAlignedAudioAuxData:(const unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param;

/// Audio data callback before SDK internal audio preprocessing.
///
/// Description: In this callback, you can receive the audio data before SDK internal audio preprocessing.
/// When to trigger: This callback function will not be triggered until [enableBeforeAudioPrepAudioData] is called to turn on the function and [startpublishingstream] is called.
/// Restrictions: None.
/// Caution: This callback is a high-frequency callback, please do not perform time-consuming operations in this callback, and the data in this callback cannot be modified.
///
/// @param data Audio data in PCM format.
/// @param dataLength Length of the data.
/// @param param Parameters of the audio frame.
- (void)onBeforeAudioPrepAudioData:(const unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param;

/// Custom audio processing local captured PCM audio frame callback.
///
/// Description: In this callback, you can receive the PCM audio frames captured locally after used headphone monitor. Developers can modify the audio frame data, as well as the audio channels and sample rate. The timestamp can be used for data synchronization, such as lyrics, etc. If you need the data after used headphone monitor, please use the [onProcessCapturedAudioDataAfterUsedHeadphoneMonitor] callback.
/// When to trigger: You need to call [enableCustomAudioCaptureProcessing] to enable the function first, and call [startPreivew] or [startPublishingStream] to trigger this callback function.
/// Restrictions: None.
/// Caution: This callback is a high-frequency callback, please do not perform time-consuming operations in this callback.
///
/// @param data Audio data in PCM format.
/// @param dataLength Length of the data.
/// @param param Parameters of the audio frame.
/// @param timestamp The audio frame timestamp, starting from 0 when capture is started, the unit is milliseconds.
- (void)onProcessCapturedAudioData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param timestamp:(double)timestamp;

/// Custom audio processing SDK playback PCM audio frame callback.
///
/// Description: In this callback, you can receive the SDK playback PCM audio frame. Developers can modify the audio frame data, as well as the audio channels and sample rate. The timestamp can be used for data synchronization, such as lyrics, etc.
/// When to trigger: You need to call [enableCustomAudioPlaybackProcessing] to enable the function first, and call [startPublishingStream], [startPlayingStream], [startPreview], [createMediaPlayer] or [createAudioEffectPlayer] to trigger this callback function.
/// Restrictions: None.
/// Caution: This callback is a high-frequency callback, please do not perform time-consuming operations in this callback.
///
/// @param data Audio data in PCM format.
/// @param dataLength Length of the data.
/// @param param Parameters of the audio frame.
/// @param timestamp The audio frame timestamp, starting from 0 when capture is started, the unit is milliseconds (It is effective when there is one and only one stream).
- (void)onProcessPlaybackAudioData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param timestamp:(double)timestamp;

/// Custom audio processing remote playing stream PCM audio frame callback.
///
/// Description: In this callback, you can receive the PCM audio frames of remote playing stream. Developers can modify the audio frame data, as well as the audio channels and sample rate. The timestamp can be used for data synchronization, such as lyrics, etc.
/// When to trigger: You need to call [enableCustomAudioRemoteProcessing] to enable the function first, and call [startPlayingStream] to trigger this callback function.
/// Restrictions: None.
/// Caution: This callback is a high-frequency callback, please do not perform time-consuming operations in this callback.
///
/// @param data Audio data in PCM format.
/// @param dataLength Length of the data.
/// @param param Parameters of the audio frame.
/// @param streamID Corresponding stream ID.
/// @param timestamp The audio frame timestamp, starting from 0 when capture is started, the unit is milliseconds.
- (void)onProcessRemoteAudioData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param streamID:(NSString *)streamID timestamp:(double)timestamp;

/// Custom audio processing local captured PCM audio frame callback after used headphone monitor.
///
/// Description: In this callback, you can receive the PCM audio frames captured locally after used headphone monitor. Developers can modify the audio frame data, as well as the audio channels and sample rate. The timestamp can be used for data synchronization, such as lyrics, etc.
/// When to trigger: You need to call [enableCustomAudioCaptureProcessingAfterHeadphoneMonitor] to enable the function first, and call [startPreivew] or [startPublishingStream] to trigger this callback function.
/// Caution: This callback is a high-frequency callback, please do not perform time-consuming operations in this callback.
///
/// @param data Audio data in PCM format
/// @param dataLength Length of the data
/// @param param Parameters of the audio frame
/// @param timestamp The audio frame timestamp, starting from 0 when capture is started, the unit is milliseconds.
- (void)onProcessCapturedAudioDataAfterUsedHeadphoneMonitor:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param timestamp:(double)timestamp;

@end

@interface ZegoCustomAudioProcessManager : NSObject <ZegoCustomAudioProcessHandler>

+ (instancetype)sharedInstance;

/// Sets up the event callback handler for custom audio processing.
///
/// Description: Sets up the event callback handler for custom audio processing.
/// Use cases: When the developer needs to customize the audio processing logic, you can set the custom audio processing callback to obtain the audio data.
/// When to call: It can be called before [startPreview] and [startPublishingStream], otherwise it may cause the timing of obtaining audio data to be too slow.
/// @param handler Custom audio process handler.Required: Yes.
- (void)setCustomAudioProcessHandler:(id<ZegoReactNativeCustomAudioProcessHandler>)handler;

/// Sends AAC audio data produced by custom audio capture to the SDK (for the specified channel).
///
/// Description: Sends the captured audio AAC data to the SDK.
/// Use cases: The customer needs to obtain input after acquisition from the existing audio stream, audio file, or customized acquisition system, and hand it over to the SDK for transmission.
/// When to call: After [enableCustomAudioIO] and publishing stream successfully.
/// Restrictions: None.
/// Related APIs: Enable the custom audio IO function [enableCustomAudioIO], and start the push stream [startPublishingStream].
///
/// @param data AAC buffer data.
/// @param dataLength The total length of the buffer data.
/// @param configLength The length of AAC specific config (Note: The AAC encoded data length is 'encodedLength = dataLength - configLength').Value range: [0,64]
/// @param timestamp The UNIX timestamp of this AAC audio frame.
/// @param samples The number of samples for this AAC audio frame.Value range: [480,512,1024,1960,2048].
/// @param param The param of this AAC audio frame.
/// @param channel Publish channel for capturing audio frames.
- (void)sendCustomAudioCaptureAACData:(unsigned char *)data
                           dataLength:(unsigned int)dataLength
                         configLength:(unsigned int)configLength
                            timestamp:(CMTime)timestamp
                              samples:(unsigned int)samples
                                param:(ZegoAudioFrameParam *)param
                              channel:(ZegoPublishChannel)channel;

/// Sends PCM audio data produced by custom audio capture to the SDK (for the specified channel).
///
/// Description: Sends the captured audio PCM data to the SDK.
/// Use cases: 1.The customer needs to obtain input after acquisition from the existing audio stream, audio file, or customized acquisition system, and hand it over to the SDK for transmission. 2.Customers have their own requirements for special sound processing for PCM input sources. After the sound processing, the input will be sent to the SDK for transmission.
/// When to call: After [enableCustomAudioIO] and publishing stream successfully.
/// Restrictions: None.
/// Related APIs: Enable the custom audio IO function [enableCustomAudioIO], and start the push stream [startPublishingStream].
///
/// @param data PCM buffer data.
/// @param dataLength The total length of the buffer data.
/// @param param The param of this PCM audio frame.
/// @param channel Publish channel for capturing audio frames.
- (void)sendCustomAudioCapturePCMData:(unsigned char *)data
                           dataLength:(unsigned int)dataLength
                                param:(ZegoAudioFrameParam *)param
                              channel:(ZegoPublishChannel)channel;

/// Fetches PCM audio data of the remote stream from the SDK for custom audio rendering.
///
/// Description: Fetches PCM audio data of the remote stream from the SDK for custom audio rendering, it is recommended to use the system framework to periodically invoke this function to drive audio data rendering.
/// Use cases: When developers have their own rendering requirements, such as special applications or processing and rendering of the original PCM data that are pulled, it is recommended to use the custom audio rendering function of the SDK.
/// When to call: After [enableCustomAudioIO] and playing stream successfully.
/// Restrictions: None.
/// Related APIs: Enable the custom audio IO function [enableCustomAudioIO], and start the play stream [startPlayingStream].
///
/// @param data A block of memory for storing audio PCM data that requires user to manage the memory block's lifecycle, the SDK will copy the audio frame rendering data to this memory block.
/// @param dataLength The length of the audio data to be fetch this time (dataLength = duration * sampleRate * channels * 2(16 bit depth i.e. 2 Btye)).
/// @param param Specify the parameters of the fetched audio frame. sampleRate in ZegoAudioFrameParam must assignment
- (void)fetchCustomAudioRenderPCMData:(unsigned char *)data
                           dataLength:(unsigned int)dataLength
                                param:(ZegoAudioFrameParam *)param;

/// Send the PCM audio data customized by the developer to the SDK, which is used as a reference for custom rendering audio to eliminate echo.
///
/// Description：Developers use the audio device clock as the driver to capture PCM audio data, and use it for custom audio rendering after processing. When submitting for rendering, call this function to send the processed audio data back to the SDK so that the SDK can use it as an echo cancellation reference.
/// Use cases：In entertainment scenarios, it may be necessary to customize the processing of PCM audio data from the remote end, such as synthesizing a background sound and KTV accompaniment before rendering and playing. At the same time, developers are required to send the audio data processed by themselves to the SDK for reference, so that the processed sound effects can be echo canceled after collection.
/// When to call：After calling [fetchCustomAudioRenderPCMData] to fetch and process the PCM audio data, this function is called while submitting to the system for rendering and playback.
/// Restrictions：You must call [setEngineConfig] to enable the external audio data as a reference for this function to take effect. If you need to get the use of the function or the details, please consult ZEGO technical support.
///
/// @param data PCM buffer data
/// @param dataLength The total length of the buffer data
/// @param param The param of this PCM audio frame
- (void)sendReferenceAudioPCMData:(unsigned char *)data
                       dataLength:(unsigned int)dataLength
                            param:(ZegoAudioFrameParam *)param;


@end

NS_ASSUME_NONNULL_END
