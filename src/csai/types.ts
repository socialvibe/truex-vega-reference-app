import { AdBreakConfig, AdConfig } from '../ExampleData';

// Playback states
export type PlaybackState = 'not_started' | 'playing' | 'paused';

// Current playback phase
export type PlaybackPhase = 'content' | 'ad';

// Ad system types
export type AdSystem = 'trueX' | 'IDVx' | 'mp4';

// Current playback context
export interface PlaybackContext {
  phase: PlaybackPhase;
  state: PlaybackState;
  currentTime: number;
  duration: number;
  seeking: boolean;
  buffering: boolean;

  // Ad-specific context
  currentAdBreak: AdBreakConfig | null;
  currentAd: AdConfig | null;
  currentAdIndex: number; // 1-based index within break
  adCountdown: number; // seconds remaining in current ad

  // Video surface visibility
  showVideoSurface: boolean;
  showTruexAd: boolean;
}

// Seek configuration
export interface SeekConfig {
  seekDelta: number; // seconds per press (default: 5)
  accumulationWindow: number; // milliseconds (default: 2000)
}

// Remote control events
export type RemoteControlAction = 'seek_forward' | 'seek_backward' | 'play_pause';

// Ad break tracking
export interface AdBreakState {
  break: AdBreakConfig;
  currentAdIndex: number;
  skippedAds: string[]; // IDs of ads skipped due to AD_FREE_POD
  completed: boolean;
  adFreePodReceived: boolean; // Track if AD_FREE_POD was received
}
