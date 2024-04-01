import React from "react";
import {useRef, useState, useEffect} from 'react';
import {useWindowDimensions, StyleSheet, Text, View} from 'react-native';
import {StackScreenProps} from "@amzn/react-navigation__stack";

import {
  Video,
  VideoPlayer,
  KeplerVideoSurfaceView,
  KeplerCaptionsView
} from "@amzn/react-native-w3cmedia";

const content =
  {
    secure: "false", // true : Use Secure Video Buffers. false: Use Unsecure Video Buffers.
    uri: "https://ctv.truex.com/assets/reference-app-stream-no-cards-720p.mp4",
    drm_scheme: "", // com.microsoft.playready, com.widevine.alpha depending on the drm schema
    drm_license_uri: "", // DRM License acquisition server URL : needed only if the content is DRM protected
  };

export function PlaybackScreen({navigation, route}: StackScreenProps<any>) {
  // Get the full screen resolution
  const {width: deviceWidth, height: deviceHeight} = useWindowDimensions();

  const videoRef = useRef<Video | VideoPlayer | null>(null);

  // Start video playback when the video is mounted to render tree.
  const onVideoMounted = () => {
    if (videoRef.current !== null) {
      videoRef.current.src = content.uri; // set HTMLMediaElement's src attribute
    }
  }

  useEffect(() => {
    initializingPreBuffering();
  }, []);


  const onEnded = () => {
    (videoRef.current as VideoPlayer).deinitialize().then(() => {
      removeEventListeners();
      onVideoUnMounted();
    });
  }

  const initializingPreBuffering = () => {
    videoRef.current = new VideoPlayer();
    videoRef.current.initialize().then(() => {
      setUpEventListeners();
      videoRef.current!.autoplay = true;
      onVideoMounted();
    });
  }

  const setUpEventListeners = (): void => {
    videoRef.current?.addEventListener("ended", onEnded);
  }

  const removeEventListeners = (): void => {
    videoRef.current?.removeEventListener("ended", onEnded);
  }

  const onSurfaceViewCreated = (_surfaceHandle: string): void => {
    (videoRef.current as VideoPlayer).setSurfaceHandle(_surfaceHandle);
    videoRef.current?.play();
  }

  const onSurfaceViewDestroyed = (_surfaceHandle: string): void => {
    (videoRef.current as VideoPlayer).clearSurfaceHandle(_surfaceHandle);
  }

  const onCaptionViewCreated = (captionsHandle: string): void => {
    (videoRef.current as VideoPlayer).setCaptionViewHandle(captionsHandle);
  }

  const onVideoUnMounted = (): void => {
    videoRef.current = null;
  }

  return (
    <View style={styles.playbackPage}>
      <KeplerVideoSurfaceView style={{zIndex: 0}}
        onSurfaceViewCreated={onSurfaceViewCreated} onSurfaceViewDestroyed={onSurfaceViewDestroyed}/>
      <KeplerCaptionsView
        onCaptionViewCreated={onCaptionViewCreated}
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          position: 'absolute',
          backgroundColor: 'transparent',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  playbackPage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    alignItems: "stretch"
  },
  text: {
    fontSize: 30,
    color: 'white',
    marginLeft: 200,
    marginTop: 200
  }
});

export default PlaybackScreen;
