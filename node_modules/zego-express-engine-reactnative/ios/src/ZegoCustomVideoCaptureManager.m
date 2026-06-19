//
//  ZegoCustomVideoCaptureManager.m
//  react-native-zego-express-engine
//
//  Created by zego on 2024/6/5.
//

#import "ZegoCustomVideoCaptureManager.h"

@interface ZegoCustomVideoCaptureManager()

@property (nonatomic, weak) id<ZegoReactNativeCustomVideoCaptureHandler> handler;

@property (nonatomic, assign)ZegoVideoMirrorMode mirrorMode;
@property (nonatomic, strong)ZegoVideoFrameParam *videoParam;
@end

@implementation ZegoCustomVideoCaptureManager

+ (instancetype)sharedInstance {
    static ZegoCustomVideoCaptureManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[ZegoCustomVideoCaptureManager alloc] init];
    });
    return instance;
}

- (void)setCustomVideoCaptureHandler:(id<ZegoReactNativeCustomVideoCaptureHandler>)handler {
    
    self.handler = handler;
}

- (void)setVideoMirrorMode:(ZegoVideoMirrorMode)mode channel:(ZegoPublishChannel)channel{
    [[ZegoExpressEngine sharedEngine] setVideoMirrorMode:mode channel:channel];
}

- (void)setFillMode:(ZegoViewMode)mode channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] setCustomVideoCaptureFillMode:mode channel:channel];
}

- (void)setFlipMode:(ZegoVideoFlipMode)mode channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] setCustomVideoCaptureFlipMode:mode channel:channel];
}

- (void)setRotation:(int)rotation channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] setCustomVideoCaptureRotation:rotation channel:channel];
}

-(ZegoVideoFrameFormat)osTypeToZegoVideoFrameFormat:(OSType) type {
    ZegoVideoFrameFormat format = ZegoVideoFrameFormatUnknown;
    switch(type) {
        case kCVPixelFormatType_420YpCbCr8Planar:
        case kCVPixelFormatType_420YpCbCr8PlanarFullRange:
            format = ZegoVideoFrameFormatI420;
            break;
        case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
        case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
            format = ZegoVideoFrameFormatNV12;
            break;
        case kCVPixelFormatType_32BGRA:
            format = ZegoVideoFrameFormatBGRA32;
            break;
        case kCVPixelFormatType_32ARGB:
            format = ZegoVideoFrameFormatARGB32;
            break;
    }
    return format;
}

- (void)sendCVPixelBuffer:(CVPixelBufferRef)buffer timestamp:(CMTime)timestamp channel:(ZegoPublishChannel)channel{
    [[ZegoExpressEngine sharedEngine] sendCustomVideoCapturePixelBuffer:buffer timestamp:timestamp channel:channel];
}

- (void)sendGLTextureData:(GLuint)textureID size:(CGSize)size timestamp:(CMTime)timestamp channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] sendCustomVideoCaptureTextureData:textureID size:size timestamp:timestamp channel:channel];
}

- (void)sendEncodedData:(NSData *)data
                                   params:(ZegoVideoEncodedFrameParam *)params
                                timestamp:(CMTime)timestamp
                                  channel:(ZegoPublishChannel)channel {
    [[ZegoExpressEngine sharedEngine] sendCustomVideoCaptureEncodedData:data params:params timestamp:timestamp channel:channel];
}

# pragma mark ZegoCustomVideoCaptureHandler
- (void)onStart:(ZegoPublishChannel)channel {
    if([self.handler respondsToSelector:@selector(onStart:)]) {
        [self.handler onStart:channel];
    }
}


- (void)onStop:(ZegoPublishChannel)channel {
    if([self.handler respondsToSelector:@selector(onStop:)]) {
        [self.handler onStop:channel];
    }
}

- (void)onEncodedDataTrafficControl:(ZegoTrafficControlInfo *)trafficControlInfo
                            channel:(ZegoPublishChannel)channel {
    if([self.handler respondsToSelector:@selector(onEncodedDataTrafficControl:channel:)]) {
        [self.handler onEncodedDataTrafficControl:trafficControlInfo channel:channel];
    }
}

@end
