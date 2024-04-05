import React, {useState} from 'react';
import {Platform, StyleSheet, Text, View,} from 'react-native';
import {VideoPlayer} from '@amzn/react-native-w3cmedia';
import BackButton from './BackButton';

import PlaybackControls, {seekBackward, seekForward, VideoPlayerRef} from './PlaybackControls';

interface PlayerUIProps {
  videoRef: VideoPlayerRef;
  navigateBack: () => void;
  title: string;
}

interface Header {
  title: string;
  navigateBack: () => void;
}

const Header = ({ title, navigateBack }: Header) => {
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
  const [captionMenuVisibility, setCaptionMenuVisibility] = useState(false);
  if (Platform.isTV) {
    useTVEventHandler((evt: HWEvent) => {
      if (evt && evt.eventKeyAction === 0 && videoRef.current) {
        let playbackEvent = null;
        try {
          if (evt.eventType === 'playpause') {
            console.log("k_content_per: PlayerUI : playpause");
            if (videoRef.current.paused) {
              videoRef.current.play();
              playbackEvent = getMockPlaybackEventForVideo(videoRef, title, PlaybackState.PLAYING);

            } else {
              videoRef.current.pause();
              playbackEvent = getMockPlaybackEventForVideo(videoRef, title, PlaybackState.PAUSED);
            }
          } else if (evt.eventType === 'play') {
            console.log("k_content_per: PlayerUI : play");
            videoRef.current.play();
            playbackEvent = getMockPlaybackEventForVideo(videoRef, title, PlaybackState.PLAYING);
          } else if (evt.eventType === 'pause') {
            console.log("k_content_per: PlayerUI : pause");
            videoRef.current.pause();
            playbackEvent = getMockPlaybackEventForVideo(videoRef, title, PlaybackState.PAUSED);
          } else if (evt.eventType === 'skip_forward') {
            console.log("k_content_per: PlayerUI : skip_forward");
            seekForward(videoRef);
            playbackEvent = getMockPlaybackEventForVideo(videoRef, title, PlaybackState.PLAYING);
          } else if (evt.eventType === 'skip_backward') {
            console.log("k_content_per: PlayerUI : skip_backward");
            seekBackward(videoRef);
            playbackEvent = getMockPlaybackEventForVideo(videoRef, title, PlaybackState.PLAYING);
          }
        }
        catch (e) {
          console.error(`k_content_per: ${e}`);
      }
        if (playbackEvent) {
          console.log(`k_content_per: useTvEventHandler: Reporting new playback event : ${JSON.stringify(playbackEvent)}`);
          ContentPersonalizationServer.reportNewPlaybackEvent(playbackEvent);
        }
      }
    });
  }

  const toggleCaption = () => {
    setCaptionMenuVisibility(!captionMenuVisibility);
  };

  const ControlBarMenu = () => {
    return (
      <View style={styles.playerMenusContainer}>
        <CaptionMenu
          captionMenuVisibility={captionMenuVisibility}
          video={videoRef.current as VideoPlayer}
        />
      </View>
    );
  };
  return (
    <View style={styles.uiContainer}>
      <View style={styles.ui}>
        <Header navigateBack={navigateBack} title={title} />
        <PlaybackControls videoRef={videoRef} />
        <ControlBar
          videoRef={videoRef}
          captions={toggleCaption}
          captionMenuVisibility={captionMenuVisibility}
        />
      </View>
      <ControlBarMenu />
    </View>
  );
};

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
    color: COLORS.WHITE,
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
