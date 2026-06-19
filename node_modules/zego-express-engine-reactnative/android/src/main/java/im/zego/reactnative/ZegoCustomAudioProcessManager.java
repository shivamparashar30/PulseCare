package im.zego.reactnative;

import java.nio.ByteBuffer;

import im.zego.zegoexpress.ZegoExpressEngine;
import im.zego.zegoexpress.callback.IZegoCustomAudioProcessHandler;
import im.zego.zegoexpress.constants.ZegoPublishChannel;
import im.zego.zegoexpress.entity.ZegoAudioFrameParam;

/**
 * Custom audio processing manager for React Native Zego Express Engine
 */
public class ZegoCustomAudioProcessManager extends IZegoCustomAudioProcessHandler {

    private static volatile ZegoCustomAudioProcessManager instance;
    private IZegoReactNativeCustomAudioProcessHandler handler;

    private ZegoCustomAudioProcessManager() {
        // Private constructor to prevent instantiation
    }

    /**
     * Get the singleton instance of ZegoCustomAudioProcessManager
     *
     * @return The singleton instance
     */
    public static ZegoCustomAudioProcessManager sharedInstance() {
        if (instance == null) {
            synchronized (ZegoCustomAudioProcessManager.class) {
                if (instance == null) {
                    instance = new ZegoCustomAudioProcessManager();
                }
            }
        }
        return instance;
    }

    /**
     * Sets up the event callback handler for custom audio processing.
     *
     * Description: Sets up the event callback handler for custom audio processing.
     * Use cases: When the developer needs to customize the audio processing logic, you can set the custom audio processing callback to obtain the audio data.
     * When to call: It can be called before [startPreview] and [startPublishingStream], otherwise it may cause the timing of obtaining audio data to be too slow.
     * 
     * @param handler Custom audio process handler. Required: Yes.
     */
    public void setCustomAudioProcessHandler(IZegoReactNativeCustomAudioProcessHandler handler) {
        this.handler = handler;
    }

    /**
     * Sends AAC audio data produced by custom audio capture to the SDK (for the specified channel).
     *
     * Description: Sends the captured audio AAC data to the SDK.
     * Use cases: The customer needs to obtain input after acquisition from the existing audio stream, audio file, or customized acquisition system, and hand it over to the SDK for transmission.
     * When to call: After [enableCustomAudioIO] and publishing stream successfully.
     * Restrictions: None.
     * Related APIs: Enable the custom audio IO function [enableCustomAudioIO], and start the push stream [startPublishingStream].
     *
     * @param data AAC buffer data.
     * @param dataLength The total length of the buffer data.
     * @param configLength The length of AAC specific config (Note: The AAC encoded data length is 'encodedLength = dataLength - configLength'). Value range: [0,64]
     * @param timestamp The timestamp of this AAC audio frame.
     * @param samples The number of samples for this AAC audio frame. Value range: [480,512,1024,1960,2048].
     * @param param The param of this AAC audio frame.
     * @param channel Publish channel for capturing audio frames.
     */
    public void sendCustomAudioCaptureAACData(ByteBuffer data, int dataLength, int configLength,
                                              long timestamp, int samples, ZegoAudioFrameParam param,
                                              ZegoPublishChannel channel) {
        ZegoExpressEngine.getEngine().sendCustomAudioCaptureAACData(data, dataLength, configLength, 
                                                                   timestamp, samples, param, channel);
    }

    /**
     * Sends PCM audio data produced by custom audio capture to the SDK (for the specified channel).
     *
     * Description: Sends the captured audio PCM data to the SDK.
     * Use cases: 1.The customer needs to obtain input after acquisition from the existing audio stream, audio file, or customized acquisition system, and hand it over to the SDK for transmission. 2.Customers have their own requirements for special sound processing for PCM input sources. After the sound processing, the input will be sent to the SDK for transmission.
     * When to call: After [enableCustomAudioIO] and publishing stream successfully.
     * Restrictions: None.
     * Related APIs: Enable the custom audio IO function [enableCustomAudioIO], and start the push stream [startPublishingStream].
     *
     * @param data PCM buffer data.
     * @param dataLength The total length of the buffer data.
     * @param param The param of this PCM audio frame.
     * @param channel Publish channel for capturing audio frames.
     */
    public void sendCustomAudioCapturePCMData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param,
                                             ZegoPublishChannel channel) {
        ZegoExpressEngine.getEngine().sendCustomAudioCapturePCMData(data, dataLength, param, channel);
    }

    /**
     * Fetches PCM audio data of the remote stream from the SDK for custom audio rendering.
     *
     * Description: Fetches PCM audio data of the remote stream from the SDK for custom audio rendering, it is recommended to use the system framework to periodically invoke this function to drive audio data rendering.
     * Use cases: When developers have their own rendering requirements, such as special applications or processing and rendering of the original PCM data that are pulled, it is recommended to use the custom audio rendering function of the SDK.
     * When to call: After [enableCustomAudioIO] and playing stream successfully.
     * Restrictions: None.
     * Related APIs: Enable the custom audio IO function [enableCustomAudioIO], and start the play stream [startPlayingStream].
     *
     * @param data A block of memory for storing audio PCM data that requires user to manage the memory block's lifecycle, the SDK will copy the audio frame rendering data to this memory block.
     * @param dataLength The length of the audio data to be fetch this time (dataLength = duration * sampleRate * channels * 2(16 bit depth i.e. 2 Btye)).
     * @param param Specify the parameters of the fetched audio frame. sampleRate in ZegoAudioFrameParam must assignment
     */
    public void fetchCustomAudioRenderPCMData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param) {
        ZegoExpressEngine.getEngine().fetchCustomAudioRenderPCMData(data, dataLength, param);
    }


    // IZegoCustomAudioProcessHandler implementation
    @Override
    public void onAlignedAudioAuxData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param) {
        if (handler != null) {
            handler.onAlignedAudioAuxData(data, dataLength, param);
        }
    }

    @Override
    public void onBeforeAudioPrepAudioData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param) {
        if (handler != null) {
            handler.onBeforeAudioPrepAudioData(data, dataLength, param);
        }
    }

    @Override
    public void onProcessCapturedAudioData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param, double timestamp) {
        if (handler != null) {
            handler.onProcessCapturedAudioData(data, dataLength, param, timestamp);
        }
    }

    @Override
    public void onProcessPlaybackAudioData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param, double timestamp) {
        if (handler != null) {
            handler.onProcessPlaybackAudioData(data, dataLength, param, timestamp);
        }
    }

    @Override
    public void onProcessRemoteAudioData(ByteBuffer data, int dataLength, ZegoAudioFrameParam param, String streamID, double timestamp) {
        if (handler != null) {
            handler.onProcessRemoteAudioData(data, dataLength, param, streamID, timestamp);
        }
    }

    @Override
    public void onProcessCapturedAudioDataAfterUsedHeadphoneMonitor(ByteBuffer data, int dataLength, ZegoAudioFrameParam param, double timestamp) {
        if (handler != null) {
            handler.onProcessCapturedAudioDataAfterUsedHeadphoneMonitor(data, dataLength, param, timestamp);
        }
    }
} 