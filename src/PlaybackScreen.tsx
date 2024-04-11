import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { StackScreenProps } from '@amzn/react-navigation__stack';

import { KeplerVideoSurfaceView, VideoPlayer } from '@amzn/react-native-w3cmedia';
import PlayerUI from './video/PlayerUI';

import { getAdBreaks } from './video/AdBreak';

import { VideoStreamConfig } from './video/VideoStreamConfig';
import videoStreamJson from './data/video-stream.json';
const videoStream = videoStreamJson as VideoStreamConfig;


export function PlaybackScreen({ navigation, route }: StackScreenProps<any>) {
  const video = useMemo(() => new VideoPlayer(), []);

  // Would be passed in as a page route arg in a real app, as would the video steam itself.
  const adPlaylist = useMemo(() => {
    return getAdBreaks(videoStream.adBreaks);
  }, []);

  const surfaceRef = useRef<string | undefined>();

  const startVideo = useCallback(() => {
    if (!surfaceRef.current) return;
    if (!video.src) return;
    video.setSurfaceHandle(surfaceRef.current);

    // Starting playback "later" seems to help.
    setTimeout(() => {
      video
        .play()
        .then(() => {
          console.log('*** video playing');
        })
        .catch(err => {
          console.error(`*** video play error: ${err}`);
        });
    }, 5);
  }, [video]);

  const stopVideo = useCallback(() => {
    video.pause();
    video.clearSurfaceHandle('');
    video.deinitialize().then(() => console.log('*** video deinitialized'));
    surfaceRef.current = undefined;
    console.log('*** video stopped');
  }, [video]);

  const navigateBack = useCallback(() => {
    stopVideo();
    navigation.goBack();
    return true;
  }, [navigation, stopVideo]);

  useEffect(() => {
    if (!video) {
      console.error('*** video was not created!');
      return;
    }
    console.log('*** playback page mounted');

    video.initialize().then(() => {
      console.log('*** video initialized');
      video.autoplay = false;

      video.src = videoStream.stream;
      console.log('*** video src: ' + video.src);
      video.autoplay = false;
      video.pause();
      video.load();
      setTimeout(() => startVideo(), 100);
    });

    return () => {
      console.log('*** playback page unmounted');
    };
  }, [video, navigateBack, startVideo]);

  const onSurfaceViewCreated = (surfaceHandle: string): void => {
    console.log('*** video surface created: ' + surfaceHandle);
    surfaceRef.current = surfaceHandle;
    setTimeout(() => startVideo(), 100);
  };

  return (
    <View style={styles.playbackPage}>
      <KeplerVideoSurfaceView style={styles.videoView} onSurfaceViewCreated={onSurfaceViewCreated} />
      <PlayerUI video={video} navigateBack={navigateBack} title={videoStream.title} adPlaylist={adPlaylist} />
    </View>
  );
}

const styles = StyleSheet.create({
  playbackPage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#606060',
    alignItems: 'stretch'
  },
  videoView: {
    zIndex: 0,
    top: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
    height: '100%'
  }
});

export default PlaybackScreen;
