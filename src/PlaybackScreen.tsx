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

  const startVideo = () => {
    if (!surfaceRef.current) return;
    if (!videoRef.current) return;
    if (!videoRef.current.src) return;
    videoRef.current.setSurfaceHandle(surfaceRef.current);
    videoRef.current.play();
    console.log('*** video started');
  }

  const stopVideo = () => {
    if (!videoRef.current) return;
    //if (surfaceRef.current) videoRef.current.clearSurfaceHandle(surfaceRef.current);
    videoRef.current.pause();
    //videoRef.current.deinitialize();
    videoRef.current = undefined;
    console.log('*** video stopped');
  }

  useEffect(() => {
    console.log("*** playback page mounted");

    if (videoRef.current) {
      console.log('*** stopping previous video');
      stopVideo();
    }

    videoRef.current = new VideoPlayer();
    videoRef.current.autoplay = false;
    videoRef.current.initialize().then(() => {
      if (!videoRef.current) return;
      console.log('*** video initialized');
      videoRef.current.src = content.uri;
      startVideo();
    })

    return () => {
      console.log('*** playback page unmounted');
      stopVideo();
    };
  }, []);

  const onSurfaceViewCreated = (surfaceHandle: string): void => {
    surfaceRef.current = surfaceHandle;
    startVideo();
  }

  return (
    <View style={styles.playbackPage}>
      <KeplerVideoSurfaceView style={styles.videoView} onSurfaceViewCreated={onSurfaceViewCreated}/>
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
