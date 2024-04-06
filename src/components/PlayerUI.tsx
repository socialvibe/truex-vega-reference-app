import React, {useCallback, useMemo, useState} from 'react';
import {Platform, StyleSheet, Text, useWindowDimensions, View,} from 'react-native';
import {HWEvent, Image, useTVEventHandler} from "@amzn/react-native-kepler";
import {VideoPlayer} from "@amzn/react-native-w3cmedia";

import playIcon from '../assets/play.png';
import pauseIcon from '../assets/pause.png';
import {AdBreak, getDisplayVideoDurationAt, getDisplayVideoTimeAt, timeLabel} from "../ads/AdBreak";

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
  },
  timeline: {
    verticalAlign: 'middle',
    position: 'relative',
    marginLeft: 10,
    width: timelineW,
    height: timelineH,
    backgroundColor: '#555555'
  },
  timelineProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: timelineH,
    backgroundColor: 'white'
  },
  timelineSeek: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: timelineH,
    backgroundColor: '#888888'
  },
  adMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: timelineH
  },
  adBreak: {
    position: 'absolute',
    backgroundColor: 'darkgoldenrod',
    width: 4,
    height: '100%'
  },
  currentTime: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 'auto',
    padding: padding,
    height: 25,
    top: -34,
    left: -20, // tbd: center this better
    //transform: translateX(-50%)
  },
  duration: {
    color: 'white',
    fontSize: 20,
    verticalAlign: 'middle',
    marginLeft: gap,
    textAlign: 'left',
    height: timelineH,
    lineHeight: timelineH
  }
});

interface PlayerUIProps {
  video: VideoPlayer;
  navigateBack: () => void;
  title: string;
  adPlaylist: AdBreak[];
}

export function PlayerUI({ navigateBack, title, video, adPlaylist }: PlayerUIProps) {
  // Get the full screen resolution
  const {width: deviceWidth, height: deviceHeight} = useWindowDimensions();

  const [isPlaying, setPlaying] = useState(!video.paused);
  const [showControls, setShowControls] = useState(true);
  const [streamTime, setStreamTime] = useState(0);
  const [seekTarget, setSeekTarget] = useState(0);

  const durationToDisplay = useMemo(() => getDisplayVideoDurationAt(streamTime, video.duration, adPlaylist),
    [streamTime, video.duration, adPlaylist]);

  const percentage = useCallback((time: number): `${number}%` => {
    const result = durationToDisplay > 0 ? (time / durationToDisplay) * 100 : 0;
    return `${result}%`;
  }, [durationToDisplay]);

  const currentDisplayTime = useMemo(() => getDisplayVideoTimeAt(streamTime, false, adPlaylist), [streamTime, adPlaylist]);

  const timelineDisplayTime = useMemo(() => {
    if (seekTarget >= 0) {
      // Show the seek target instead of the playback time.
      return getDisplayVideoTimeAt(seekTarget, true, adPlaylist);
    }
    return currentDisplayTime;
  }, [currentDisplayTime, adPlaylist, seekTarget]);

  const controlBarLayout = useMemo(() => {
    const controlBar = styles.controlBar;
    return {
      ...controlBar,
      top: (deviceWidth - controlBar.width) / 2,
      bottom: deviceHeight - controlBar.height - 200
    };
  }, [deviceWidth, deviceHeight]);

  const progressBarLayout = useMemo(() => {
    const progressBar = styles.timelineProgress;
    return {
      ...progressBar,
      width: percentage(timelineDisplayTime)
    };
  }, [timelineDisplayTime]);

  const seekLayout = useMemo(() => {
    const seekTargetDiff = Math.abs(currentDisplayTime - timelineDisplayTime);
    const seekBarW = percentage(seekTargetDiff);
    let seekBarX;
    if (currentDisplayTime <= timelineDisplayTime) {
      seekBarX = percentage(currentDisplayTime);
    } else {
      seekBarX = percentage(currentDisplayTime - seekTargetDiff);
    }
    return {
      ...styles.timelineSeek,
      width: seekBarW,
      left: seekBarX
    };
  }, [currentDisplayTime, timelineDisplayTime, seekTarget]);

  const currentTimeLayout = useMemo(() => {
    return {
      ...styles.currentTime,
      left: percentage(currentDisplayTime)
    };
  }, []);

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

  return (
    <>
      {showControls && (
        <View style={styles.playbackContainer}>
          <View style={controlBarLayout}>
            <View style={styles.playPauseButton}>
              <Image source={isPlaying ? pauseIcon : playIcon} style={styles.playPauseIcon}/>
            </View>
            <View style={styles.timeline}>
              <View style={progressBarLayout}/>
              <View style={seekLayout}/>
              <View style={styles.adMarkers}>{/* TODO */}</View>
              <View style={currentTimeLayout}><Text>{timeLabel(timelineDisplayTime)}</Text></View>
            </View>
            <View style={styles.duration}><Text>{timeLabel(durationToDisplay)}</Text></View>
          </View>
        </View>
      )}
    </>
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
