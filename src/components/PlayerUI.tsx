import React, {useMemo, useState} from 'react';
import {Platform, StyleSheet, useWindowDimensions, View,} from 'react-native';
import {HWEvent, Image, useTVEventHandler} from "@amzn/react-native-kepler";
import {VideoPlayer} from "@amzn/react-native-w3cmedia";

import playIcon from '../assets/play.png';
import pauseIcon from '../assets/pause.png';

const playW = 18;
const timelineW = 1300;
const timelineH = 7;
const padding = 6;
const gap = 10;
const durationW = 90;

const styles = StyleSheet.create({
  playbackContainer: {
    position: 'absolute',
    zIndex: 5,
    height: '100%',
    width: '100%',
  },
  adIndicator: {
    position: 'absolute',
    padding: 12,
    left: 40,
    top: 40,
    color: 'white',
    fontSize: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  controlBar: {
    position: 'absolute',
    width: padding + playW + gap + timelineW + gap + durationW,
    height: timelineH + 2*padding,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: padding
  },
  playPauseButton: {
    verticalAlign: 'middle',
    width: playW,
    height: 26
  },
  playPauseIcon: {
    width: playW,
    height: playW
  }
});

interface PlayerUIProps {
  video: VideoPlayer;
  navigateBack: () => void;
  title: string;
}

export function PlayerUI({ navigateBack, title, video }: PlayerUIProps) {
  // Get the full screen resolution
  const {width: deviceWidth, height: deviceHeight} = useWindowDimensions();

  const controlBarLayout = useMemo(() => {
    const controlBar = styles.controlBar;
    return {
      ...controlBar,
      top: (deviceWidth - controlBar.width) / 2,
      bottom: deviceHeight - controlBar.height - 200
    };
  }, [deviceWidth, deviceHeight]);

  const [isPlaying, setPlaying] = useState(!video.paused);
  const [showControls, setShowControls] = useState(true);

  if (Platform.isTV) {
    useTVEventHandler((evt: HWEvent) => {
      const event = evt.eventKeyAction === 0 && evt.eventType;
      switch (event) {
        case 'back':
          navigateBack();
          break;

        case 'playpause':
        case 'select':
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
          break;

        case 'play':
          video.play();
          break;

        case 'pause':
          video.pause();
          break;

        case 'skip_forward':
        case 'right':
          seekForward(video);
          break;

        case 'skip_backward':
        case 'left':
          seekBackward(video);
          break;
      }
    });
  }

  return showControls && (
    <View style={styles.playbackContainer}>
      <View style={controlBarLayout}>
        <View style={styles.playPauseButton}>
          <Image source={isPlaying ? pauseIcon : playIcon} style={styles.playPauseIcon}/>
        </View>

      </View>
    </View>
  );
}

export default PlayerUI;

export function seek(seekSeconds: number, video: VideoPlayer) {
  if (video.currentTime >= 0) {
    const { currentTime, duration } = video;
    let newTime = currentTime + seekSeconds;
    if (newTime > duration) {
      newTime = duration;
    } else if (newTime < 0) {
      newTime = 0;
    }
    video.currentTime = newTime;
  }
}

export function seekForward(video: VideoPlayer) {
  seek(10, video);
}

export function seekBackward(video: VideoPlayer) {
  seek(-10, video);
}
