import React from 'react';
import {Platform, StyleSheet, Text, View,} from 'react-native';
import BackButton from './BackButton';

import PlaybackControls, {seekBackward, seekForward, VideoPlayerRef} from './PlaybackControls';
import {HWEvent, useTVEventHandler} from "@amzn/react-native-kepler";

interface PlayerUIProps {
  videoRef: VideoPlayerRef;
  navigateBack: () => void;
  title: string;
}

interface Header {
  title: string;
  navigateBack: () => void;
}

const Header = ({title, navigateBack}: Header) => {
  return (
    <View style={styles.header}>
      <BackButton onPress={navigateBack} hasTVPreferredFocus={true}/>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </View>
  );
};


export const PlayerUI = ({
                           navigateBack,
                           title,
                           videoRef,
                         }: PlayerUIProps) => {
  if (Platform.isTV) {
    useTVEventHandler((evt: HWEvent) => {
      if (evt && evt.eventKeyAction === 0 && videoRef.current) {
        if (evt.eventType === 'playpause') {
          if (videoRef.current.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        } else if (evt.eventType === 'play') {
          videoRef.current.play();
        } else if (evt.eventType === 'pause') {
          videoRef.current.pause();
        } else if (evt.eventType === 'skip_forward') {
          seekForward(videoRef);
        } else if (evt.eventType === 'skip_backward') {
          seekBackward(videoRef);
        }
      }
    });
  }
  return (
    <View style={styles.uiContainer}>
      <View style={styles.ui}>
        <Header navigateBack={navigateBack} title={title}/>
        <PlaybackControls videoRef={videoRef}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerMenusContainer: {
    position: 'absolute',
    bottom: 90,
    right: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.8,
    width: '100%',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontWeight: '500',
    fontSize: 70,
    marginLeft: 90,
    textAlign: 'right',
    width: '50%',
  },
  ui: {
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  uiContainer: {
    position: 'absolute',
    zIndex: 5,
    height: '100%',
    width: '100%',
  }
});

export default PlayerUI;
