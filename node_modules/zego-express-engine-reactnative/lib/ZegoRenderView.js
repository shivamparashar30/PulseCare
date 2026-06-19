//@ts-expect-error
import React, { Component } from 'react'
//@ts-expect-error
import { requireNativeComponent, Platform } from 'react-native'
const ZegoView = requireNativeComponent('RCTZegoView')
const ZegoSurfaceViewManager = Platform.select({
  ios: ZegoView, // UIView
  android: requireNativeComponent('RCTZegoSurfaceView'), // * android.view.SurfaceView
})
const ZegoTextureViewManager = Platform.select({
  ios: ZegoView, // UIView
  android: requireNativeComponent('RCTZegoTextureView'), // * android.view.TextureView
})
export class ZegoSurfaceView extends Component {
  render() {
    //@ts-expect-error
    return <ZegoSurfaceViewManager {...this.props} />
  }
}
export class ZegoTextureView extends Component {
  render() {
    //@ts-expect-error
    return <ZegoTextureViewManager {...this.props} />
  }
}
