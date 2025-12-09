import { ExampleConfig } from '../../ExampleData';
import { PlaybackContext, PlaybackPhase, PlaybackState, SeekConfig } from '../types';
import { AdBreakManager } from '../AdBreakManager';
import { VideoPlayerController } from './VideoPlayerController';
import { AdPlaybackController } from './AdPlaybackController';
import { SeekAccumulator } from '../SeekAccumulator';
import { isInteractiveAd } from '../utils';
import { VideoPlayer } from '@amazon-devices/react-native-w3cmedia';

type StateChangeCallback = (context: PlaybackContext) => void;

/**
 * CSAIPlaybackViewModel - Main ViewModel class
 * Pure TypeScript class with no React dependencies
 * React components subscribe to state changes via useSyncExternalStore
 */
export class CSAIPlaybackViewModel {
  private subscribers: Set<StateChangeCallback> = new Set();

  // Controllers
  private videoController: VideoPlayerController;
  private adController: AdPlaybackController;
  private adBreakManager: AdBreakManager;
  private seekAccumulator: SeekAccumulator;

  // State
  private playbackPhase: PlaybackPhase = 'content';
  private playbackState: PlaybackState = 'not_started';
  private currentTime: number = 0;
  private duration: number = 0;
  private seeking: boolean = false;
  private buffering: boolean = false;

  constructor(
    private content: ExampleConfig,
    private seekConfig: SeekConfig = { seekDelta: 5, accumulationWindow: 2000 }
  ) {
    this.adBreakManager = new AdBreakManager();

    // Initialize video controller
    this.videoController = new VideoPlayerController({
      onTimeUpdate: this.handleContentTimeUpdate.bind(this),
      onPlaying: () => this.updatePlaybackState('playing'),
      onPaused: () => this.updatePlaybackState('paused'),
      onDurationChange: (duration) => {
        this.duration = duration;
        this.notifySubscribers();
      },
      onSeeking: () => {
        this.seeking = true;
        this.notifySubscribers();
      },
      onSeeked: () => {
        this.seeking = false;
        this.notifySubscribers();
      },
      onBuffering: (buffering) => {
        this.buffering = buffering;
        this.notifySubscribers();
      },
    });

    // Initialize ad controller
    this.adController = new AdPlaybackController({
      adBreakManager: this.adBreakManager,
      onAdBreakComplete: this.handleAdBreakComplete.bind(this),
      onAdStateChange: () => this.notifySubscribers(),
    });

    // Initialize seek accumulator
    this.seekAccumulator = new SeekAccumulator(seekConfig, this.handleSeek.bind(this));
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: StateChangeCallback): () => void {
    this.subscribers.add(callback);

    // Immediately notify with current state
    callback(this.getPlaybackContext());

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current snapshot of playback context
   */
  getPlaybackContext(): PlaybackContext {
    const adState = this.adController.getCurrentState();

    return {
      phase: this.playbackPhase,
      state: this.playbackState,
      currentTime: this.currentTime,
      duration: this.duration,
      seeking: this.seeking,
      buffering: this.buffering,
      currentAdBreak: this.adBreakManager.getCurrentBreakState()?.break || null,
      currentAd: adState.currentAd,
      currentAdIndex: adState.currentAdIndex,
      adCountdown: adState.countdown,
      showVideoSurface: (
        this.playbackPhase === 'content'
        || (adState.currentAd != null && !isInteractiveAd(adState.currentAd))
      ),
      showTruexAd: (
        this.playbackPhase === 'ad'
        && adState.currentAd != null
        && isInteractiveAd(adState.currentAd)
      ),
    };
  }

  /**
   * Initialize playback
   */
  initialize(): void {
    this.videoController.initialize();

    // Check for preroll
    const preroll = this.adBreakManager.shouldStartAdBreak(this.content.adBreaks, 0);
    if (preroll) {
      this.playbackPhase = 'ad';
      this.adController.startAdBreak(preroll);
      this.notifySubscribers();
    } else {
      // Start content immediately
      this.videoController.load(this.content.videoUrl);
      this.videoController.play();
    }
  }

  /**
   * Set surface handle for video rendering
   */
  setSurfaceHandle(handle: string): void {
    this.videoController.setSurfaceHandle(handle);
  }

  /**
   * Start playback at optional position
   */
  startPlayback(startPosition: number = 0): void {
    this.videoController.load(this.content.videoUrl);

    if (startPosition > 0) {
      this.videoController.seek(startPosition);
    }
    this.videoController.play();
  }

  /**
   * Handle content time update
   */
  private handleContentTimeUpdate(time: number): void {
    this.currentTime = time;
    this.notifySubscribers();

    // Check for midroll triggers
    if (this.playbackPhase === 'content') {
      const nextBreak = this.adBreakManager.shouldStartAdBreak(this.content.adBreaks, time);

      if (nextBreak) {
        this.videoController.pause();
        this.playbackPhase = 'ad';
        this.adController.startAdBreak(nextBreak);
        this.notifySubscribers();
      }
    }
  }

  /**
   * Handle ad break completion
   */
  private handleAdBreakComplete(): void {
    this.playbackPhase = 'content';

    // Resume or start content
    if (this.playbackState === 'not_started') {
      this.videoController.load(this.content.videoUrl);
      this.videoController.play(); // Play after load - player will wait until ready
    } else {
      this.videoController.play(); // Resume
    }

    this.notifySubscribers();
  }

  /**
   * Update playback state
   */
  private updatePlaybackState(state: PlaybackState): void {
    this.playbackState = state;
    this.notifySubscribers();
  }

  /**
   * Handle seek
   */
  private handleSeek(seekDelta: number): void {
    const newTime = Math.max(0, Math.min(this.duration, this.currentTime + seekDelta));
    this.videoController.seek(newTime);
  }

  /**
   * Register seek from remote control
   */
  registerSeek(direction: 'forward' | 'backward'): void {
    // Only allow seeking during content
    if (this.playbackPhase === 'content') {
      this.seekAccumulator.registerSeek(direction);
    }
  }

  /**
   * Complete current ad
   */
  completeAd(): void {
    this.adController.completeAd();
  }

  /**
   * Handle AD_FREE_POD event
   */
  handleAdFreePod(): void {
    this.adController.handleAdFreePod();
  }

  /**
   * Play content
   */
  play(): void {
    this.videoController.play();
  }

  /**
   * Pause content
   */
  pause(): void {
    this.videoController.pause();
  }

  /**
   * Get video player instance for surface binding
   */
  getVideoPlayer(): VideoPlayer | null {
    return this.videoController.getPlayer();
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(): void {
    const context = this.getPlaybackContext();
    this.subscribers.forEach((callback) => callback(context));
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.videoController.dispose();
    this.adController.dispose();
    this.seekAccumulator.destroy();
    this.subscribers.clear();
  }
}
