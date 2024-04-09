import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { HWEvent, Image, useTVEventHandler } from '@amzn/react-native-kepler';
import { VideoPlayer } from '@amzn/react-native-w3cmedia';

import playIcon from '../assets/play.png';
import pauseIcon from '../assets/pause.png';
import {
  AdBreak,
  getContentVideoTimeAt,
  getVideoDurationAt,
  hasAdBreakAt,
  percentageSize,
  timeLabel
} from '../ads/AdBreak';

const timelineW = 1480;
const timelineH = 20;
const playSize = 28;
const padding = 8;
const gap = 10;
const timeDisplayW = 90;
const controlBarW = padding + playSize + gap + timelineW + gap + timeDisplayW;
const controlBarH = playSize + 2 * padding;

const styles = StyleSheet.create({
  playbackContainer: {
    position: 'absolute',
    zIndex: 5,
    top: 0,
    left: 0,
    height: '100%',
    width: '100%'
  },
  adLabel: {
    color: 'white',
    fontSize: 50
  },
  adIndicator: {
    position: 'absolute',
    padding: 12,
    left: 40,
    top: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  controlBar: {
    display: 'flex',
    flexDirection: 'row',
    verticalAlign: 'middle',
    position: 'absolute',
    width: controlBarW,
    height: controlBarH,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: padding,
  },
  playPauseButton: {
    verticalAlign: 'middle',
    width: playSize,
    height: controlBarH
  },
  playPauseIcon: {
    width: playSize,
    height: playSize
  },
  timeline: {
    verticalAlign: 'middle',
    position: 'relative',
    marginLeft: 10,
    marginTop: 'auto',
    marginBottom: 'auto',
    width: timelineW,
    height: timelineH,
    backgroundColor: '#555555',
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
  timeLabel: {
    color: 'white',
    fontSize: 20,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  currentTime: {
    textAlign: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: padding,
    width: timeDisplayW,
    height: 25,
    bottom: '100%',
    left: 0, // tbd: center this better
    marginLeft: -timeDisplayW/2,
    marginBottom: 8
  },
  currentTimeOffset: {
    marginBottom: 5
  },
  duration: {
    verticalAlign: 'middle',
    marginLeft: gap,
    textAlign: 'center',
    width: timeDisplayW,
    height: controlBarH,
    lineHeight: controlBarH
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
  const { width: deviceWidth, height: deviceHeight } = useWindowDimensions();

  const [isPlaying, setPlaying] = useState(!video.paused);
  const [isShowingControls, setIsShowingControls] = useState(false);
  const [streamTime, setStreamTime] = useState(0);
  const [seekTarget, setSeekTarget] = useState(-1);

  const isShowingAd = useMemo(() => hasAdBreakAt(streamTime, adPlaylist), [streamTime, adPlaylist]);

  const controlsDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  function stopControlsDisplayTimer() {
    if (controlsDisplayTimerRef.current) {
      clearTimeout(controlsDisplayTimerRef.current);
      controlsDisplayTimerRef.current = undefined;
    }
  }

  function showControls(show: boolean, useTimeout = true) {
    stopControlsDisplayTimer();
    setIsShowingControls(show);
    if (show && useTimeout) {
      controlsDisplayTimerRef.current = setTimeout(() => showControls(false), 5 * 1000);
    }
  }


  useEffect(() => {
    showControls(true);

    // Ensure timer is cleaned up.
    return () => stopControlsDisplayTimer();
  }, [video]);


  useEffect(() => {
    const onPlaying = () => setPlaying(true);
    const onPaused = () => setPlaying(false);
    const onSeeked = () => setSeekTarget(-1); // does not seem to fire in the simulator

    const onTimeUpdate = (event: any) => {
      const currTime = Math.floor(video.currentTime);
      setStreamTime(currTime);
      if (seekTarget >= 0 && Math.abs(seekTarget - currTime) <= 2) {
        // backup to ensure we know when seeking is complete
        setSeekTarget(-1);
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('paused', onPaused);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('paused', onPaused);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [video, seekTarget]);

  const durationToDisplay = useMemo(
    () => getVideoDurationAt(streamTime, video.duration, adPlaylist),
    [streamTime, video.duration, adPlaylist]
  );

  const currentDisplayTime = useMemo(
    () => getContentVideoTimeAt(streamTime, false, adPlaylist),
    [streamTime, adPlaylist]
  );

  const timelineDisplayTime = useMemo(() => {
    if (seekTarget >= 0) {
      // Show the seek target instead of the playback time.
      return getContentVideoTimeAt(seekTarget, true, adPlaylist);
    }
    return currentDisplayTime;
  }, [currentDisplayTime, adPlaylist, seekTarget]);

  const controlBarLayout = useMemo(() => {
    const controlBar = styles.controlBar;
    return {
      ...controlBar,
      left: (deviceWidth - controlBar.width) / 2,
      bottom: 240
    };
  }, [deviceWidth, deviceHeight]);

  const progressBarLayout = useMemo(() => {
    const progressBar = styles.timelineProgress;
    return {
      ...progressBar,
      width: percentageSize(timelineDisplayTime, durationToDisplay)
    };
  }, [timelineDisplayTime, durationToDisplay]);

  const seekLayout = useMemo(() => {
    const seekTargetDiff = Math.abs(currentDisplayTime - timelineDisplayTime);
    const seekBarW = percentageSize(seekTargetDiff, durationToDisplay);
    let seekBarX;
    if (currentDisplayTime <= timelineDisplayTime) {
      seekBarX = percentageSize(currentDisplayTime, durationToDisplay);
    } else {
      seekBarX = percentageSize(currentDisplayTime - seekTargetDiff, durationToDisplay);
    }
    return {
      ...styles.timelineSeek,
      width: seekBarW,
      left: seekBarX
    };
  }, [currentDisplayTime, timelineDisplayTime, durationToDisplay]);

  const timeDisplayLayout = useMemo(() => {
    return {
      ...styles.currentTime,
      left: percentageSize(timelineDisplayTime, durationToDisplay)
    };
  }, [timelineDisplayTime, durationToDisplay]);

  const seekTo = useCallback(
    (newTime: number) => {
      const newTarget = Math.max(0, Math.min(newTime, video.duration));
      console.log('*** seekTo: ' + timeLabel(newTarget));
      setSeekTarget(newTarget);
      video.currentTime = newTarget;
    },
    [video]
  );

  const seekStep = useCallback(
    (seekSeconds: number) => {
      //if (isShowingAd) return; // prevent user seeks during an ad
      seekTo(video.currentTime + seekSeconds);
    },
    [video, seekTo/*, isShowingAd */]
  );

  function play() {
    video.play();
    setPlaying(true);
    showControls(true);
  }

  function pause() {
    video.pause();
    setPlaying(false);
    showControls(true, false);
  }

  useTVEventHandler((evt: HWEvent) => {
    if (evt.eventKeyAction !== 0) return; // ignore key up events
    switch (evt.eventType) {
      case 'back':
        navigateBack();
        break;

      case 'playpause':
      case 'select':
        if (video.paused) {
          play();
        } else {
          pause();
        }
        break;

      case 'play':
        play();
        break;

      case 'pause':
        pause();
        break;

      case 'skip_forward':
      case 'right':
        seekStep(10);
        showControls(true);
        break;

      case 'skip_backward':
      case 'left':
        seekStep(-10);
        showControls(true);
        break;
    }
  });

  return (
    <>
      {isShowingControls && (
        <View style={styles.playbackContainer}>
          <View style={controlBarLayout}>
            <View style={styles.playPauseButton}>
              {/* show that the next play/pause action will do */}
              <Image source={isPlaying ? pauseIcon : playIcon} style={styles.playPauseIcon} />
            </View>
            <View style={styles.timeline}>
              <View style={progressBarLayout} />
              <View style={seekLayout} />
              <View style={styles.adMarkers}>{/* TODO */}</View>
              <View style={timeDisplayLayout}>
                <Text style={[styles.timeLabel, styles.currentTimeOffset]}>{timeLabel(timelineDisplayTime)}</Text>
              </View>
            </View>
            <View style={styles.duration}>
              <Text style={styles.timeLabel}>{timeLabel(durationToDisplay)}</Text>
            </View>
          </View>
        </View>
      )}
      {isShowingAd && (
        <View style={styles.adIndicator}>
          <Text style={styles.adLabel}>Ad</Text>
        </View>
      )}
    </>
  );
}

export default PlayerUI;
