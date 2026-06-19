//
//  ZegoCustomAudioProcessManager.m
//  react-native-zego-express-engine
//
//  Created by zego on 2025/3/14.
//

#import "ZegoCustomAudioProcessManager.h"

@interface ZegoCustomAudioProcessManager ()

@property (nonatomic, weak) id<ZegoReactNativeCustomAudioProcessHandler> handler;

@end

@implementation ZegoCustomAudioProcessManager

+ (instancetype)sharedInstance {
    static ZegoCustomAudioProcessManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[ZegoCustomAudioProcessManager alloc] init];
    });
    return instance;
}

- (void)setCustomAudioProcessHandler:(id<ZegoReactNativeCustomAudioProcessHandler>)handler {
    self.handler = handler;
}

- (void)sendCustomAudioCaptureAACData:(unsigned char *)data dataLength:(unsigned int)dataLength configLength:(unsigned int)configLength timestamp:(CMTime)timestamp samples:(unsigned int)samples param:(ZegoAudioFrameParam *)param channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] sendCustomAudioCaptureAACData:data dataLength:dataLength configLength:configLength timestamp:timestamp samples:samples param:param channel:channel];
}

- (void)sendCustomAudioCapturePCMData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] sendCustomAudioCapturePCMData:data dataLength:dataLength param:param channel:channel];
}

- (void)fetchCustomAudioRenderPCMData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param {
    [[ZegoExpressEngine sharedEngine] fetchCustomAudioRenderPCMData:data dataLength:dataLength param:param];
}

- (void)sendReferenceAudioPCMData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param {
    [[ZegoExpressEngine sharedEngine] sendReferenceAudioPCMData:data dataLength:dataLength param:param];
}

# pragma mark ZegoCustomAudioProcessHandler
- (void)onAlignedAudioAuxData:(const unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param {
    if ([self.handler respondsToSelector:@selector(onAlignedAudioAuxData:dataLength:param:)]) {
        [self.handler onAlignedAudioAuxData:data dataLength:dataLength param:param];
    }
}

- (void)onBeforeAudioPrepAudioData:(const unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param {
    if ([self.handler respondsToSelector:@selector(onBeforeAudioPrepAudioData:dataLength:param:)]) {
        [self.handler onBeforeAudioPrepAudioData:data dataLength:dataLength param:param];
    }
}

- (void)onProcessCapturedAudioData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param timestamp:(double)timestamp {
    if ([self.handler respondsToSelector:@selector(onProcessCapturedAudioData:dataLength:param:timestamp:)]) {
        [self.handler onProcessCapturedAudioData:data dataLength:dataLength param:param timestamp:timestamp];
    }
}

- (void)onProcessPlaybackAudioData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param timestamp:(double)timestamp {
    if ([self.handler respondsToSelector:@selector(onProcessPlaybackAudioData:dataLength:param:timestamp:)]) {
        [self.handler onProcessPlaybackAudioData:data dataLength:dataLength param:param timestamp:timestamp];
    }
}

- (void)onProcessRemoteAudioData:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param streamID:(NSString *)streamID timestamp:(double)timestamp {
    if ([self.handler respondsToSelector:@selector(onProcessRemoteAudioData:dataLength:param:streamID:timestamp:)]) {
        [self.handler onProcessRemoteAudioData:data dataLength:dataLength param:param streamID:streamID timestamp:timestamp];
    }
}

- (void)onProcessCapturedAudioDataAfterUsedHeadphoneMonitor:(unsigned char *)data dataLength:(unsigned int)dataLength param:(ZegoAudioFrameParam *)param timestamp:(double)timestamp {
    if ([self.handler respondsToSelector:@selector(onProcessCapturedAudioDataAfterUsedHeadphoneMonitor:dataLength:param:timestamp:)]) {
        [self.handler onProcessCapturedAudioDataAfterUsedHeadphoneMonitor:data dataLength:dataLength param:param timestamp:timestamp];
    }
}

@end
