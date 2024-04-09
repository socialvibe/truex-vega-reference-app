import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { HWEvent, Image, useTVEventHandler } from '@amzn/react-native-kepler';
import { VideoPlayer } from '@amzn/react-native-w3cmedia';

import playIcon from '../assets/play.png';
import pauseIcon from '../assets/pause.png';
import {
  AdBreak,
  getAdBreakAt,
  getNextAvailableAdBreak,
  getVideoContentTimeAt,
  getVideoStreamTimeAt,
  timeDebug,
  timeLabel
} from '../ads/AdBreak';

const disableSeeksInAds = false; // enable for demo purposes, set to true normally
const debugVideoTime = false;

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
    padding: padding
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
    left: 0,
    marginLeft: -timeDisplayW / 2,
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

function percentageSize(time: number, duration: number): `${number}%` {
  const result = duration > 0 ? (time / duration) * 100 : 0;
  return `${result}%`;
}

interface PlayerUIProps {
  video: VideoPlayer;
  navigateBack: () => void;
  title: string;
  adPlaylist: AdBreak[];
}

export function PlayerUI({ navigateBack, title, video, adPlaylist }: PlayerUIProps) {
  // Get the full screen resolution
  const { width: deviceWidth } = useWindowDimensions();

  const [isPlaying, setPlaying] = useState(!video.paused);
  const [isShowingControls, setIsShowingControls] = useState(false);
  const [seekTarget, setSeekTarget] = useState(-1);

  const [currStreamTime, setCurrStreamTime] = useState(0);
  const [currAdBreak, setCurrAdBreak] = useState<AdBreak | undefined>();

  const currContentTime = useMemo(
    () => getVideoContentTimeAt(currStreamTime, adPlaylist),
    [currStreamTime, adPlaylist]
  );
  const contentDuration = useMemo(
    () => getVideoContentTimeAt(video.duration, adPlaylist),
    [video.duration, adPlaylist]
  );
  const currDisplayDuration = useMemo(
    () => (currAdBreak ? currAdBreak.duration : contentDuration),
    [currAdBreak, contentDuration]
  );

  const seekTo = useCallback(
    (newTime: number) => {
      const newTarget = Math.max(0, Math.min(newTime, video.duration));
      if (newTarget == currStreamTime) {
        console.log('*** seekTo ignored: ' + timeDebug(newTarget, adPlaylist));
      } else {
        console.log('*** seekTo: ' + timeDebug(newTarget, adPlaylist));
        setSeekTarget(newTarget);
        video.currentTime = newTarget;
      }
    },
    [video, adPlaylist, currStreamTime]
  );

  const controlsDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  function stopControlsDisplayTimer() {
    if (controlsDisplayTimerRef.current) {
      clearTimeout(controlsDisplayTimerRef.current);
      controlsDisplayTimerRef.current = undefined;
    }
  }

  const showControls = useCallback((show: boolean, useTimeout = true) => {
    stopControlsDisplayTimer();
    setIsShowingControls(show);
    if (show && useTimeout) {
      controlsDisplayTimerRef.current = setTimeout(() => showControls(false), 5 * 1000);
    }
  }, []);

  useEffect(() => {
    // Show controls initially.
    showControls(true);

    // Ensure timer is cleaned up.
    return () => stopControlsDisplayTimer();
  }, [showControls]);

  useEffect(() => {
    const onPlaying = () => setPlaying(true);
    const onPaused = () => setPlaying(false);
    const onSeeked = () => setSeekTarget(-1); // does not seem to fire in the simulator

    const onTimeUpdate = (event: any) => {
      const newStreamTime = Math.floor(video.currentTime);
      let newSeekTarget = seekTarget;
      let newAdBreak: AdBreak | undefined = currAdBreak;
      setCurrStreamTime(prevStreamTime => {
        if (prevStreamTime == newStreamTime) return prevStreamTime;

        const adBreak = getAdBreakAt(newStreamTime, adPlaylist);
        if (adBreak) {
          if (adBreak.completed) {
            // We have played this ad break before. Skip over it
            newSeekTarget = adBreak.endTime + 1; // ensure we don't see the last second of the ad
            return newStreamTime;
          }

          // Go with the new current ad.
          adBreak.started = true;
          if (adBreak.endTime == newStreamTime) {
            adBreak.completed = true;
          }
        }
        newAdBreak = adBreak;

        if (debugVideoTime) {
          const newTimeLabel = timeDebug(newStreamTime, adPlaylist);
          const adStartLabel = adBreak ? timeDebug(adBreak.startTime, adPlaylist) : '';
          const adEndLabel = adBreak ? timeDebug(adBreak.endTime, adPlaylist) : '';
          const adState = adBreak?.completed ? 'completed' : adBreak?.started ? 'started' : 'none';
          console.log(`*** video time: ${newTimeLabel} ad: ${adState} ${adStartLabel} ${adEndLabel}`);
        }

        return newStreamTime;
      });

      if (currAdBreak != newAdBreak) {
        setCurrAdBreak(newAdBreak);
      }

      // Process any seek changes.
      if (newSeekTarget != seekTarget) {
        seekTo(newSeekTarget);
      } else if (seekTarget >= 0 && Math.abs(seekTarget - newStreamTime) <= 2) {
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
  }, [video, currAdBreak, adPlaylist, seekTarget, seekTo]);

  const timelineDisplayTime = useMemo(() => {
    if (seekTarget >= 0) {
      // Show the seek target instead of the playback time.
      return getVideoContentTimeAt(seekTarget, adPlaylist);
    }
    return getVideoContentTimeAt(currStreamTime, adPlaylist);
  }, [currStreamTime, adPlaylist, seekTarget]);

  const controlBarLayout = useMemo(() => {
    const controlBar = styles.controlBar;
    return {
      ...controlBar,
      left: (deviceWidth - controlBar.width) / 2,
      bottom: 240
    };
  }, [deviceWidth]);

  const progressBarLayout = useMemo(() => {
    const progressBar = styles.timelineProgress;
    return {
      ...progressBar,
      width: percentageSize(timelineDisplayTime, currDisplayDuration)
    };
  }, [timelineDisplayTime, currDisplayDuration]);

  const seekLayout = useMemo(() => {
    const minSeekTarget = currAdBreak ? currAdBreak.startTime : 0;
    const maxSeekTarget = currAdBreak ? currAdBreak.endTime : video.duration;
    // Stay within the current ad break or the overall video.
    const constrainedTarget = Math.max(minSeekTarget, Math.min(maxSeekTarget, seekTarget));
    const currTarget = getVideoContentTimeAt(constrainedTarget, adPlaylist);
    const targetDiff = Math.abs(currTarget - currContentTime);
    const seekBarW = percentageSize(targetDiff, currDisplayDuration);
    let seekBarX;
    if (currContentTime <= constrainedTarget) {
      seekBarX = percentageSize(currContentTime, currDisplayDuration);
    } else {
      seekBarX = percentageSize(currContentTime - targetDiff, currDisplayDuration);
    }
    return {
      ...styles.timelineSeek,
      width: seekBarW,
      left: seekBarX
    };
  }, [currAdBreak, video.duration, currDisplayDuration, currContentTime, seekTarget, adPlaylist]);

  const timeDisplayLayout = useMemo(() => {
    return {
      ...styles.currentTime,
      left: percentageSize(timelineDisplayTime, currDisplayDuration)
    };
  }, [timelineDisplayTime, currDisplayDuration]);

  const seekStep = useCallback(
    (steps: number) => {
      if (disableSeeksInAds && currAdBreak) return;

      const minStepSeconds = 10;
      const maxSeekSteps = 70; // ensure seek stepping has reasonable progress even on long videos.
      const stepSeconds =
        currDisplayDuration > 0
          ? Math.max(minStepSeconds, currDisplayDuration / maxSeekSteps)
          : minStepSeconds;

      let newTarget = Math.max(0, currStreamTime + steps * stepSeconds);

      if (currAdBreak) {
        // We are stepping thru an ad (not usually supported).

      } else {
        // We are stepping thru content, ensure we skip over completed ads, stop on unplayed ones.
        const newContentTarget = Math.max(0, currContentTime + steps * stepSeconds);
        newTarget = getVideoStreamTimeAt(newContentTarget, adPlaylist);
        const nextAdBreak = getNextAvailableAdBreak(Math.min(currStreamTime, newTarget), adPlaylist);
        if (nextAdBreak) {
          const skipForwardOverAdBreak = currStreamTime < newTarget && nextAdBreak.startTime < newTarget;
          const skipBackOverAdBreak = newTarget < currStreamTime && nextAdBreak.startTime < currStreamTime;
          if (newTarget == nextAdBreak.startTime && nextAdBreak.completed) {
            // We are landing on a completed ad, just skip over it.
            newTarget = nextAdBreak.endTime + 1; // ensure we don't see the last second of the ad

          } else if (skipForwardOverAdBreak || skipBackOverAdBreak) {
            if (nextAdBreak.completed) {
              // We are skipping forward over a completed ad break. Ignore it.
            } else {
              // Ensure we do not skip over an ad that still needs to be played.
              newTarget = nextAdBreak.startTime;
            }
          }
        }
      }

      seekTo(newTarget);
    },
    [adPlaylist, currStreamTime, currContentTime, currAdBreak, currDisplayDuration, seekTo]
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
        seekStep(1);
        showControls(true);
        break;

      case 'skip_backward':
      case 'left':
        seekStep(-1);
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
              {seekTarget >= 0 && <View style={seekLayout} />}
              <View style={styles.adMarkers}>{/* TODO */}</View>
              <View style={timeDisplayLayout}>
                <Text style={[styles.timeLabel, styles.currentTimeOffset]}>
                  {timeLabel(timelineDisplayTime)}
                </Text>
              </View>
            </View>
            <View style={styles.duration}>
              <Text style={styles.timeLabel}>{timeLabel(currDisplayDuration)}</Text>
            </View>
          </View>
        </View>
      )}
      {currAdBreak && (
        <View style={styles.adIndicator}>
          <Text style={styles.adLabel}>Ad</Text>
        </View>
      )}
    </>
  );
}

export default PlayerUI;
