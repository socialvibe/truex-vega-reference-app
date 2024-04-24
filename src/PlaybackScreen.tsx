import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackScreenProps } from '@amzn/react-navigation__stack';

import { KeplerVideoSurfaceView, VideoPlayer } from '@amzn/react-native-w3cmedia';

import {
  AdBreak,
  getAdBreakAt,
  getAdBreaks,
  getNextAdBreak,
  getVideoContentTimeAt,
  getVideoStreamTimeAt,
  timeDebug,
  timeLabel
} from './video/AdBreak';

import { VideoStreamConfig } from './video/VideoStreamConfig';
import { AdEventHandler, TruexAd, TruexAdEvent } from '@truex/ad-renderer-kepler';
import { BackHandler, HWEvent, Image, useTVEventHandler } from "@amzn/react-native-kepler";
import pauseIcon from './assets/pause.png';
import playIcon from './assets/play.png';

import videoStreamJson from './data/video-stream.json';
const videoStream = videoStreamJson as VideoStreamConfig;

const disableSeeksInAds = false; // enable for demo purposes, set to true normally
const debugVideoTime = false;

const timelineW = 1480;
const timelineH = 20;
const playSize = 34;
const padding = 8;
const gap = 10;
const timeDisplayW = 90;
const controlBarH = playSize + 2 * padding;

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
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 240,
    height: controlBarH,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: padding
  },
  playPauseIcon: {
    width: playSize,
    height: playSize
  },
  timeline: {
    verticalAlign: 'middle',
    position: 'relative',
    marginLeft: gap,
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
    height: 22,
    lineHeight: 22,
    marginTop: 'auto',
    marginBottom: 'auto',
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
  duration: {
    verticalAlign: 'middle',
    textAlign: 'center',
    marginLeft: gap,
    width: timeDisplayW,
    height: playSize
  }
});

function timelineWidth(time: number, duration: number): number {
  // Try to stick to 2 decimal places of precision.
  return duration > 0 ? Math.floor(((time * timelineW) / duration) * 100) / 100 : 0;
}

interface AdBreakMarkerProps {
  contentTime: number;
  duration: number;
}

function AdBreakMarker({ contentTime, duration }: AdBreakMarkerProps) {
  const layout = useMemo(
    () => [styles.adBreak, { left: timelineWidth(contentTime, duration) }],
    [contentTime, duration]
  );
  return <View style={layout} />;
}

export function PlaybackScreen({ navigation, route }: StackScreenProps<any>) {
  const video = useMemo(() => new VideoPlayer(), []);

  // Would be passed in as a page route arg in a real app, as would the video steam itself.
  const adPlaylist = useMemo(() => {
    return getAdBreaks(videoStream.adBreaks);
  }, []);

  const surfaceRef = useRef<string | undefined>();

  const [canPlayVideo, setCanPlayVideo] = useState(false);

  const showVideo = useCallback(() => {
    if (!surfaceRef.current) return;
    if (!video.src) return;
    video.setSurfaceHandle(surfaceRef.current);
    setCanPlayVideo(true);
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
    console.log('*** playback page mounted');

    video.initialize().then(() => {
      console.log('*** video initialized');
      video.autoplay = false;

      video.src = videoStream.stream;
      console.log('*** video src: ' + video.src);
      video.autoplay = false;
      video.pause();
      video.load();
      showVideo();
    });

    return () => {
      console.log('*** playback page unmounted');
    };
  }, [video, navigateBack, showVideo]);

  const onSurfaceViewCreated = (surfaceHandle: string): void => {
    console.log('*** video surface created: ' + surfaceHandle);
    surfaceRef.current = surfaceHandle;
    showVideo();
  };

  const [isPlaying, setPlaying] = useState(false);
  const [isShowingControls, setIsShowingControls] = useState(false);
  const [seekTarget, setSeekTarget] = useState(-1);

  const [currStreamTime, setCurrStreamTime] = useState(0);

  const [currAdBreak, setCurrAdBreak] = useState<AdBreak | undefined>();
  const currAdBreakRef = useRef<AdBreak | undefined>(); // use to reduce re-renders, see video event listeners below
  const [showTruexAd, setShowTruexAd] = useState(false);

  const hasAdCredit = useRef(false);
  const afterAdResumeTarget = useRef<number | undefined>();

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

  const play = useCallback((afterPlaying?: () => void) => {
    console.log('*** play');
    setPlaying(true);
    showControls(true);
    setTimeout(() => {
      video.play().then(() => afterPlaying?.());
    }, 100); // avoid crashes by using a separate "thread"
  }, [video, showControls]);

  const pause = useCallback(() => {
    console.log('*** pause');
    setPlaying(false);
    showControls(true, false);
    setTimeout(() => video.pause(), 100); // avoid crashes by using a separate "thread"
  }, [video, showControls]);

  const showAdBreak = useCallback(
    (adBreak: AdBreak | undefined) => {
      setCurrAdBreak(adBreak);

      // Also set the ref, so allow reduced dependency re-renders.
      currAdBreakRef.current = adBreak;

      const isTruex = adBreak?.isTruexAd || false;
      setShowTruexAd(isTruex);

      hasAdCredit.current = false;

      // ensure we don't see the last second of the ad
      afterAdResumeTarget.current = adBreak ? adBreak.endTime + 1 : undefined;

      if (isTruex) {
        console.log(`*** showing truex ad`);
        // pause the ad videos, will resume later once truex ad completes
        pause();
      } else if (adBreak) {
        console.log(`*** showing regular ad break`);
      } else {
        console.log(`*** removing ad break`);
      }
    },
    [pause]
  );

  const currContentTime = useMemo(
    () => getVideoContentTimeAt(currStreamTime, adPlaylist),
    [currStreamTime, adPlaylist]
  );
  const contentDuration = useMemo(
    () => getVideoContentTimeAt(video.duration, adPlaylist),
    [video.duration, adPlaylist]
  );
  const currDisplayTime = useMemo(() => {
    if (seekTarget >= 0) {
      // Show the seek target instead of the playback time.
      return getVideoContentTimeAt(seekTarget, adPlaylist);
    }
    return getVideoContentTimeAt(currStreamTime, adPlaylist);
  }, [currStreamTime, adPlaylist, seekTarget]);

  const currDisplayDuration = useMemo(
    () => (currAdBreak ? currAdBreak.duration : contentDuration),
    [currAdBreak, contentDuration]
  );

  const seekTo = useCallback(
    (newTime: number) => {
      const newTarget = Math.max(0, Math.min(newTime, video.duration));
      if (newTarget == video.currentTime) {
        console.log('*** seekTo ignored: ' + timeDebug(newTarget, adPlaylist));
      } else {
        console.log('*** seekTo: ' + timeDebug(newTarget, adPlaylist));
        setSeekTarget(newTarget);
        setTimeout(() => video.currentTime = newTarget, 100); // do actual seek in its own "thread"
      }
    },
    [video, adPlaylist]
  );

  const onAdEvent: AdEventHandler = useCallback<AdEventHandler>(
    (event, data) => {
      console.log(`*** truex event: ${event}`);
      switch (event) {
        case TruexAdEvent.AdFreePod:
          // Remember for later that we have the ad credit.
          hasAdCredit.current = true;
          break;

        case TruexAdEvent.AdCompleted:
        case TruexAdEvent.AdError:
        case TruexAdEvent.NoAdsAvailable:
          play(() => {
            if (hasAdCredit.current && afterAdResumeTarget.current !== undefined) {
              // skip over the fallback ads.
              seekTo(afterAdResumeTarget.current);
            }
            // keep playing either the fallback ads or else main video
          });
          setShowTruexAd(false);
          break;
      }
    },
    [seekTo, play]
  );

  useEffect(() => {
    // Show controls initially.
    showControls(true);

    // Ensure the preroll ad break is known as soon as possible.
    const preRoll = getAdBreakAt(0, adPlaylist);
    showAdBreak(preRoll);

    if (!preRoll && canPlayVideo) {
      // Start the initial playback.
      play();
    }

    // Ensure timer is cleaned up.
    return () => stopControlsDisplayTimer();
  }, [canPlayVideo, play, showControls, adPlaylist, showAdBreak]);

  useEffect(() => {
    const onPlaying = () => setPlaying(true);
    const onPaused = () => setPlaying(false);
    const onSeeked = () => setSeekTarget(-1); // does not seem to fire in the simulator

    const onTimeUpdate = (event: any) => {
      const newStreamTime = Math.floor(video.currentTime);
      let newSeekTarget: number | undefined;
      let newAdBreak: AdBreak | undefined = currAdBreakRef.current;
      setCurrStreamTime(prevStreamTime => {
        if (prevStreamTime == newStreamTime) return prevStreamTime;

        const adBreak = getAdBreakAt(newStreamTime, adPlaylist);
        if (adBreak) {
          if (adBreak.completed) {
            // We have played this ad break before. Skip over it
            newSeekTarget = adBreak.endTime + 1;
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

      if (currAdBreakRef.current != newAdBreak) {
        showAdBreak(newAdBreak);
      }

      // Process any seek changes.
      setSeekTarget(prevTarget => {
        if (newSeekTarget && newSeekTarget != prevTarget) {
          return newSeekTarget; // we have a new seek target
        } else if (prevTarget >= 0 && Math.abs(prevTarget - newStreamTime) <= 2) {
          return -1; // backup to ensure we know when seeking is complete
        }
        return prevTarget;
      });
    };

    console.log('*** video adding event listeners');
    video.addEventListener('playing', onPlaying);
    video.addEventListener('paused', onPaused);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeked', onSeeked);

    return () => {
      console.log('*** video removing event listeners');
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('paused', onPaused);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [video, adPlaylist, showAdBreak]);

  const progressBarLayout = useMemo(() => {
    const progressBar = styles.timelineProgress;
    return {
      ...progressBar,
      width: timelineWidth(currDisplayTime, currDisplayDuration)
    };
  }, [currDisplayTime, currDisplayDuration]);

  const seekLayout = useMemo(() => {
    let seekBarX = 0;
    let seekBarW = 0;
    if (seekTarget >= 0) {
      const minSeekTarget = currAdBreak ? currAdBreak.startTime : 0;
      const maxSeekTarget = currAdBreak ? currAdBreak.endTime : video.duration;
      // Stay within the current ad break or the overall video.
      const constrainedTarget = Math.max(minSeekTarget, Math.min(maxSeekTarget, seekTarget));
      const currTarget = getVideoContentTimeAt(constrainedTarget, adPlaylist);
      const targetDiff = Math.abs(currTarget - currContentTime);
      seekBarW = timelineWidth(targetDiff, currDisplayDuration);
      if (currContentTime <= currTarget) {
        seekBarX = timelineWidth(currContentTime, currDisplayDuration);
      } else {
        seekBarX = timelineWidth(currContentTime - targetDiff, currDisplayDuration);
      }
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
      left: timelineWidth(currDisplayTime, currDisplayDuration)
    };
  }, [currDisplayTime, currDisplayDuration]);

  const seekStep = useCallback(
    (steps: number) => {
      if (disableSeeksInAds && currAdBreak) return;

      const minStepSeconds = 10;
      const maxSeekSteps = 70; // ensure seek stepping has reasonable progress even on long videos.
      const stepSeconds =
        currDisplayDuration > 0
          ? Math.max(minStepSeconds, Math.round(currDisplayDuration / maxSeekSteps))
          : minStepSeconds;


      const initialTarget = Math.max(0, currStreamTime + steps * stepSeconds);
      let newTarget = initialTarget;

      if (currAdBreak) {
        // We are stepping thru an ad (not usually supported).

      } else {
        // We are stepping thru content, ensure we skip over completed ads, stop on unplayed ones.
        const newContentTarget = Math.max(0, currContentTime + steps * stepSeconds);
        newTarget = getVideoStreamTimeAt(newContentTarget, adPlaylist);
        const nextAdBreak = getNextAdBreak(Math.min(currStreamTime, newTarget), adPlaylist);
        if (nextAdBreak) {
          const skipForwardOverAdBreak = currStreamTime < newTarget && nextAdBreak.startTime < newTarget;
          const skipBackOverAdBreak = newTarget < currStreamTime && nextAdBreak.startTime < currStreamTime;
          if (newTarget == nextAdBreak.startTime && nextAdBreak.completed) {
            // We are landing on a completed ad, just skip over it.
            newTarget = nextAdBreak.endTime + 1; // ensure we don't see the last second of the ad

          } else if (skipForwardOverAdBreak || skipBackOverAdBreak) {
            if (nextAdBreak.completed) {
              // We are skipping over a completed ad break. Ignore it.
            } else {
              // Ensure we do not skip over an ad that still needs to be played.
              newTarget = nextAdBreak.startTime;
            }
          }
        }

//         console.log(`*** seekStep: step: ${steps} stepS: ${stepSeconds}
// *** iT: ${timeDebug(initialTarget, adPlaylist)} cT: ${timeDebug(newContentTarget, adPlaylist)} nT: ${timeDebug(newTarget, adPlaylist)}`)
      }

      seekTo(newTarget);
      showControls(true);
    },
    [adPlaylist, currStreamTime, currContentTime, currAdBreak, currDisplayDuration, seekTo, showControls]
  );

  useEffect(() => {
    const onBackHandler = () => {
      navigateBack();
      return true; // handled
    };
    BackHandler.addEventListener('hardwareBackPress', onBackHandler);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackHandler);
  });

  const onHWEvent = useCallback((evt: HWEvent) => {
    if (showTruexAd) return; // do not interfere with Truex's own interactive processing.
    if (evt.eventKeyAction !== 0) return; // ignore key up events
    switch (evt.eventType) {
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
        break;

      case 'skip_backward':
      case 'left':
        seekStep(-1);
        break;
    }
  }, [video, showTruexAd, pause, play, seekStep]);

  useTVEventHandler(onHWEvent);

  return (
    <View style={styles.playbackPage}>
      <KeplerVideoSurfaceView style={styles.videoView} onSurfaceViewCreated={onSurfaceViewCreated} />
      {isShowingControls && !showTruexAd && (
        <View style={styles.controlBar}>
          <Image source={isPlaying ? pauseIcon : playIcon} style={styles.playPauseIcon} />
          <View style={styles.timeline}>
            <View style={progressBarLayout} />
            {seekLayout.width > 0 && <View style={seekLayout} />}
            {contentDuration > 0 && adPlaylist?.length > 0 && !currAdBreak && (
              <View style={styles.adMarkers}>
                {adPlaylist.map(adBreak => (
                  <AdBreakMarker contentTime={adBreak.contentTime} duration={contentDuration} />
                ))}
              </View>
            )}
            <View style={timeDisplayLayout}>
              <Text style={styles.timeLabel}>{timeLabel(currDisplayTime)}</Text>
            </View>
          </View>
          <View style={styles.duration}>
            <Text style={styles.timeLabel}>{timeLabel(currDisplayDuration)}</Text>
          </View>
        </View>
      )}
      {currAdBreak && (
        <View style={styles.adIndicator}>
          <Text style={styles.adLabel}>Ad</Text>
        </View>
      )}
      {currAdBreak && showTruexAd && (
        <TruexAd vastConfigUrl={currAdBreak.vastUrl} onAdEvent={onAdEvent} />
      )}
    </View>
  );
}

export default PlaybackScreen;
