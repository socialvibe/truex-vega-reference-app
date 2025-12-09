import { useEffect, useRef, useState, useCallback } from 'react';
import { ExampleConfig } from '../../ExampleData';
import { PlaybackContext, PlaybackPhase, PlaybackState, SeekConfig } from '../types';
import { AdBreakManager } from '../AdBreakManager';
import { useVideoPlayer } from './useVideoPlayer';
import { useAdPlayback } from './useAdPlayback';
import { useRemoteControl } from './useRemoteControl';
import { isInteractiveAd } from '../utils';

interface UseCSAIPlaybackConfig {
  content: ExampleConfig;
  seekConfig?: SeekConfig;
}

export function useCSAIPlayback({ content, seekConfig }: UseCSAIPlaybackConfig) {
  const adBreakManager = useRef(new AdBreakManager()).current;

  // State
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>('content');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('not_started');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // Handle content time updates
  const handleContentTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);

      // Check for midroll triggers only during content playback
      if (playbackPhase === 'content') {
        const nextBreak = adBreakManager.shouldStartAdBreak(content.adBreaks, time);
        if (nextBreak) {
          pause();
          setPlaybackPhase('ad');
          startAdBreak(nextBreak);
        }
      }
    },
    [playbackPhase, content.adBreaks]
  );

  // Video player hook
  const {
    initialize: initializePlayer,
    onSurfaceViewCreated,
    play: playContent,
    pause: pauseContent,
    seek: seekContent,
    load: loadContent,
  } = useVideoPlayer({
    onTimeUpdate: handleContentTimeUpdate,
    onPlaying: () => setPlaybackState('playing'),
    onPaused: () => setPlaybackState('paused'),
    onDurationChange: setDuration,
    onSeeking: () => setSeeking(true),
    onSeeked: () => setSeeking(false),
    onBuffering: setBuffering,
  });

  // Handle ad break completion
  const handleAdBreakComplete = useCallback(() => {
    setPlaybackPhase('content');

    // Resume or start content
    if (playbackState === 'not_started') {
      loadContent(content.videoUrl);
      playContent(); // Play after load - player will wait until ready
    } else {
      playContent(); // Resume
    }
  }, [playbackState, content.videoUrl]);

  // Ad playback hook
  const {
    currentAd,
    currentAdIndex,
    adCountdown,
    startAdBreak,
    completeAd,
    handleAdFreePod,
  } = useAdPlayback({
    adBreakManager,
    onAdBreakComplete: handleAdBreakComplete,
  });

  // Handle seek
  const handleSeek = useCallback(
    (seekDelta: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seekDelta));
      seekContent(newTime);
    },
    [currentTime, duration]
  );

  // Remote control hook
  const { registerSeek } = useRemoteControl({
    enabled: playbackPhase === 'content',
    seekConfig: seekConfig || { seekDelta: 5, accumulationWindow: 2000 },
    onSeek: handleSeek,
  });

  // Convenience methods
  const play = useCallback(() => {
    playContent();
  }, []);

  const pause = useCallback(() => {
    pauseContent();
  }, []);

  // Initialize playback
  useEffect(() => {
    initializePlayer();

    // Check for preroll
    const preroll = adBreakManager.shouldStartAdBreak(content.adBreaks, 0);
    if (preroll) {
      setPlaybackPhase('ad');
      startAdBreak(preroll);
    } else {
      // Start content immediately
      loadContent(content.videoUrl);
      playContent();
    }

    return () => {
      adBreakManager.reset();
    };
  }, []);

  // Start playback with optional position
  const startPlayback = useCallback(
    (startPosition: number = 0) => {
      loadContent(content.videoUrl);

      if (startPosition > 0) {
        seekContent(startPosition);
      }
      playContent();
    },
    [content.videoUrl]
  );

  // Build playback context
  const playbackContext: PlaybackContext = {
    phase: playbackPhase,
    state: playbackState,
    currentTime,
    duration,
    seeking,
    buffering,
    currentAdBreak: adBreakManager.getCurrentBreakState()?.break || null,
    currentAd,
    currentAdIndex,
    adCountdown,
    showVideoSurface:
      playbackPhase === 'content' || (currentAd !== null && !isInteractiveAd(currentAd)),
    showTruexAd: playbackPhase === 'ad' && currentAd !== null && isInteractiveAd(currentAd),
  };

  return {
    playbackContext,
    onSurfaceViewCreated,
    play,
    pause,
    startPlayback,
    registerSeek,
    completeAd,
    handleAdFreePod,
  };
}
