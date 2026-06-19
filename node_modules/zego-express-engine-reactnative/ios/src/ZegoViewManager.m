//
//  ZegoViewManager.m
//  react-native-zego-express-engine
//
//  Created by zego on 2025/3/1.
//

#import "ZegoViewManager.h"

@implementation ZegoViewManager

RCT_EXPORT_MODULE(RCTZegoView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

@end
