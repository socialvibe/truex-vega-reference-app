import React, {useCallback, useEffect, useRef} from "react";
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {StackScreenProps} from "@amzn/react-navigation__stack";

import {KeplerVideoSurfaceView, VideoPlayer} from "@amzn/react-native-w3cmedia";
import {BackHandler, Platform, Text} from "@amzn/react-native-kepler";

const content =
  {
    secure: "false", // true : Use Secure Video Buffers. false: Use Unsecure Video Buffers.
    uri: "https://ctv.truex.com/assets/reference-app-stream-no-cards-720p.mp4",
    drm_scheme: "", // com.microsoft.playready, com.widevine.alpha depending on the drm schema
    drm_license_uri: "", // DRM License acquisition server URL : needed only if the content is DRM protected
  };

// Use a singleton player for the app, to work around video recreation issues.
const videoPlayer = new VideoPlayer();

export function PlaybackScreen({navigation, route}: StackScreenProps<any>) {
  // Get the full screen resolution
  const {width: deviceWidth, height: deviceHeight} = useWindowDimensions();

  const surfaceRef = useRef<string|undefined>();

  const startVideo = () => {
    console.log('*** attempting video start');
    if (!surfaceRef.current) return;
    if (!videoPlayer.src) return;
    console.log(`*** video starting: ${surfaceRef.current}: ${videoPlayer.src}`);
    videoPlayer.setSurfaceHandle(surfaceRef.current);
    //videoPlayer.currentTime = 0;
    videoPlayer.play()
      .then(() => {
        console.log('*** video playing');
      })
      .catch(err => {
        console.error(`*** video play error: ${err}`);
      });
    console.log('*** video started');
  }

  const stopVideo = () => {
    console.log('*** stopping video');
    videoPlayer.pause();
    videoPlayer.clearSurfaceHandle('');
    surfaceRef.current = undefined;
    //videoPlayer.src = ''; // try to unload the video
    console.log('*** video stopped');
  }

  const navigateBack = useCallback(() => {
    console.log('*** navigating back');
    stopVideo();
    navigation.goBack();
    return true;
  }, []);

  useEffect(() => {
    console.log(`*** playback page mounted: ${videoPlayer.src}`);

    if (Platform.isTV) {
      BackHandler.addEventListener('hardwareBackPress', navigateBack);
    }

    videoPlayer.initialize().then(() => {
      console.log('*** video initialized');
      videoPlayer.autoplay = false;
      if (videoPlayer.src != content.uri) {
        videoPlayer.src = content.uri;
        console.log('*** video src: ' + videoPlayer.src);
      }
      videoPlayer.load();
      console.log('*** video loaded');
      videoPlayer.pause();
      console.log('*** video paused');
      startVideo();
    });

    return () => {
      console.log('*** playback page unmounted');
      if (Platform.isTV) {
        BackHandler.removeEventListener('hardwareBackPress', navigateBack);
      }
    };
  }, []);

  const onSurfaceViewCreated = (surfaceHandle: string): void => {
    console.log('*** video surface created: ' + surfaceHandle);
    surfaceRef.current = surfaceHandle;
    startVideo();
  }

  // const onSurfaceViewDestroyed = (surfaceHandle: string): void => {
  //   console.log(`*** video surface destroyed: ${surfaceHandle}, has video: ${!!videoRef.current}`);
  //   if (!videoRef.current) return;
  //   videoRef.current?.clearSurfaceHandle(surfaceHandle);
  //   stopVideo();
  // }

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
    backgroundColor: '#606060',
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
