import { VideoPlayer } from '@amazon-devices/react-native-w3cmedia';
import { PlayerControlsBlocker } from '../../PlayerControlsBlocker';

interface VideoPlayerCallbacks {
  onTimeUpdate: (time: number) => void;
  onPlaying: () => void;
  onPaused: () => void;
  onDurationChange: (duration: number) => void;
  onSeeking: () => void;
  onSeeked: () => void;
  onBuffering: (buffering: boolean) => void;
}

/**
 * VideoPlayerController - Manages video player lifecycle and events
 * Pure TypeScript class with no React dependencies
 */
export class VideoPlayerController {
  private player: VideoPlayer | null = null;
  private surfaceHandle: string | null = null;
  private controlsBlocker = new PlayerControlsBlocker();

  constructor(private callbacks: VideoPlayerCallbacks) {}

  initialize(): void {
    this.player = new VideoPlayer();

    // Attach event listeners
    this.player.addEventListener('timeupdate', () => {
      if (this.player) {
        this.callbacks.onTimeUpdate(this.player.currentTime);
      }
    });

    this.player.addEventListener('playing', () => {
      this.callbacks.onPlaying();
    });

    this.player.addEventListener('pause', () => {
      this.callbacks.onPaused();
    });

    this.player.addEventListener('durationchange', () => {
      if (this.player) {
        this.callbacks.onDurationChange(this.player.duration);
      }
    });

    this.player.addEventListener('seeking', () => {
      this.callbacks.onSeeking();
    });

    this.player.addEventListener('seeked', () => {
      this.callbacks.onSeeked();
    });

    this.player.addEventListener('waiting', () => {
      this.callbacks.onBuffering(true);
    });

    this.player.addEventListener('canplay', () => {
      this.callbacks.onBuffering(false);
    });

    this.player.initialize();
  }

  setSurfaceHandle(handle: string): void {
    this.surfaceHandle = handle;
    this.player?.setSurfaceHandle(handle);
  }

  load(url: string): void {
    if (this.player) {
      this.player.src = url;
      this.player.load();
    }
  }

  play(): void {
    this.player?.play();
  }

  pause(): void {
    this.player?.pause();
  }

  seek(time: number): void {
    if (this.player) {
      this.player.currentTime = time;
    }
  }

  getCurrentTime(): number {
    return this.player?.currentTime || 0;
  }

  getDuration(): number {
    return this.player?.duration || 0;
  }

  getPlayer(): VideoPlayer | null {
    return this.player;
  }

  dispose(): void {
    if (this.player && this.surfaceHandle) {
      this.player.clearSurfaceHandle(this.surfaceHandle);
    }
    this.player?.deinitialize();
    this.player = null;
  }
}
