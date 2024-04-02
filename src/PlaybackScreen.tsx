import React, {useEffect, useRef} from "react";
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {StackScreenProps} from "@amzn/react-navigation__stack";

import {KeplerVideoSurfaceView, VideoPlayer} from "@amzn/react-native-w3cmedia";

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

  const videoRef = useRef<VideoPlayer|undefined>();
  const surfaceRef = useRef<string|undefined>();

  const showVideo = () => {
    if (!surfaceRef.current) return;
    if (!videoRef.current) return;
    if (!videoRef.current.src) return;
    videoRef.current.setSurfaceHandle(surfaceRef.current);
    videoRef.current.play();
    console.log('playback: video started');
  }

  useEffect(() => {
    videoRef.current = new VideoPlayer();
    videoRef.current.autoplay = false;
    videoRef.current.addEventListener("ended", destroyVideoPlayer);
    console.log('playback: video created');

    videoRef.current.initialize().then(() => {
      if (!videoRef.current) return;
      videoRef.current.src = content.uri; // set HTMLMediaElement's src attribute
      console.log('playback: video initialized: ' + content.uri);
      showVideo();
    });
  }, []);


  const destroyVideoPlayer = () => {
    if (!videoRef.current) return;
    videoRef.current.removeEventListener("ended", destroyVideoPlayer);
    videoRef.current.deinitialize();
    videoRef.current = undefined;
    console.log('playback: video destroyed');
  }

  const onSurfaceViewCreated = (surfaceHandle: string): void => {
    surfaceRef.current = surfaceHandle;
    console.log('playback: surface created');
    showVideo();
  }

  const onSurfaceViewDestroyed = (surfaceHandle: string): void => {
    if (!videoRef.current) return;
    videoRef.current.clearSurfaceHandle(surfaceHandle);
    destroyVideoPlayer();
  }

  return (
    <View style={styles.playbackPage}>
      <KeplerVideoSurfaceView style={styles.videoView}
        onSurfaceViewCreated={onSurfaceViewCreated} onSurfaceViewDestroyed={onSurfaceViewDestroyed}/>
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
  },
  videoView: {
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default PlaybackScreen;
