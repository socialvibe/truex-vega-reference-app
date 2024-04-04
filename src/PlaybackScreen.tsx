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

export function PlaybackScreen({navigation, route}: StackScreenProps<any>) {
  // Get the full screen resolution
  const {width: deviceWidth, height: deviceHeight} = useWindowDimensions();

  const videoRef = useRef<VideoPlayer | undefined>(new VideoPlayer());
  const surfaceRef = useRef<string|undefined>();

  const startVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!surfaceRef.current) return;
    if (!video.src) return;
    video.setSurfaceHandle(surfaceRef.current);

    // Starting playback "later" seems to help.
    setTimeout(() => {
      video.play()
        .then(() => {
          console.log('*** video playing');
        })
        .catch(err => {
          console.error(`*** video play error: ${err}`);
        });
    }, 5);
  }

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.clearSurfaceHandle('');
    surfaceRef.current = undefined;
    videoRef.current = undefined;
    console.log('*** video stopped');
  }

  const navigateBack = useCallback(() => {
    stopVideo();
    navigation.goBack();
    return true;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.error('*** video was not created!');
      return;
    }
    console.log('*** playback page mounted');

    if (Platform.isTV) {
      BackHandler.addEventListener('hardwareBackPress', navigateBack);
    }

    video.initialize().then(() => {
      console.log('*** video initialized');
      video.autoplay = false;

      video.src = content.uri;
      console.log('*** video src: ' + video.src);
      video.autoplay = false;
      video.pause();
      video.load();
      setTimeout(() => startVideo(), 100);
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
    setTimeout(() => startVideo(), 100);
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
