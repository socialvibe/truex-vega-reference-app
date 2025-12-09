import { useEffect, useRef } from 'react';
import { VideoPlayer } from '@amazon-devices/react-native-w3cmedia';
import { PlayerControlsBlocker } from '../../PlayerControlsBlocker';

interface VideoPlayerCallbacks {
  onTimeUpdate?: (time: number) => void;
  onPlaying?: () => void;
  onPaused?: () => void;
  onDurationChange?: (duration: number) => void;
  onSeeking?: () => void;
  onSeeked?: () => void;
  onBuffering?: (buffering: boolean) => void;
}

export function useVideoPlayer(callbacks: VideoPlayerCallbacks) {
  const playerRef = useRef<VideoPlayer | null>(null);
  const surfaceHandleRef = useRef<string | null>(null);
  const controlsBlocker = useRef(new PlayerControlsBlocker()).current;

  function initialize() {
    const player = new VideoPlayer();
    playerRef.current = player;

    // Attach event listeners
    player.addEventListener('timeupdate', () => {
      callbacks.onTimeUpdate?.(player.currentTime);
    });

    player.addEventListener('playing', () => {
      callbacks.onPlaying?.();
    });

    player.addEventListener('pause', () => {
      callbacks.onPaused?.();
    });

    player.addEventListener('durationchange', () => {
      callbacks.onDurationChange?.(player.duration);
    });

    player.addEventListener('seeking', () => {
      callbacks.onSeeking?.();
    });

    player.addEventListener('seeked', () => {
      callbacks.onSeeked?.();
    });

    player.addEventListener('waiting', () => {
      callbacks.onBuffering?.(true);
    });

    player.addEventListener('canplay', () => {
      callbacks.onBuffering?.(false);
    });

    // Initialize player
    player.initialize();
  }

  function onSurfaceViewCreated(handle: string) {
    surfaceHandleRef.current = handle;
    if (playerRef.current) {
      playerRef.current.setSurfaceHandle(handle);
    }
  }

  function load(url: string) {
    if (playerRef.current) {
      playerRef.current.src = url;
      playerRef.current.load();
    }
  }

  function play() {
    playerRef.current?.play();
  }

  function pause() {
    playerRef.current?.pause();
  }

  function seek(time: number) {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  }

  function getCurrentTime(): number {
    return playerRef.current?.currentTime || 0;
  }

  function getDuration(): number {
    return playerRef.current?.duration || 0;
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && surfaceHandleRef.current) {
        playerRef.current.clearSurfaceHandle(surfaceHandleRef.current);
      }
      playerRef.current?.deinitialize();
    };
  }, []);

  return {
    playerRef,
    surfaceHandleRef,
    initialize,
    onSurfaceViewCreated,
    load,
    play,
    pause,
    seek,
    getCurrentTime,
    getDuration,
  };
}
