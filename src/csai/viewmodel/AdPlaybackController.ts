import { AdBreakConfig, AdConfig } from '../../ExampleData';
import { AdBreakManager } from '../AdBreakManager';

interface AdPlaybackCallbacks {
  adBreakManager: AdBreakManager;
  onAdBreakComplete: () => void;
  onAdStateChange: () => void;
}

interface AdState {
  currentAd: AdConfig | null;
  currentAdIndex: number;
  countdown: number;
}

/**
 * AdPlaybackController - Manages ad playback and countdown
 * Pure TypeScript class with no React dependencies
 */
export class AdPlaybackController {
  private currentAd: AdConfig | null = null;
  private currentAdIndex: number = 0;
  private countdown: number = 0;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private callbacks: AdPlaybackCallbacks) {}

  getCurrentState(): AdState {
    return {
      currentAd: this.currentAd,
      currentAdIndex: this.currentAdIndex,
      countdown: this.countdown,
    };
  }

  startAdBreak(adBreak: AdBreakConfig): void {
    this.callbacks.adBreakManager.startAdBreak(adBreak);
    const firstAd = this.callbacks.adBreakManager.getCurrentAd();

    if (firstAd) {
      this.playAd(firstAd);
    } else {
      this.callbacks.onAdBreakComplete();
    }
  }

  private playAd(ad: AdConfig): void {
    this.currentAd = ad;
    this.currentAdIndex = this.callbacks.adBreakManager.getCurrentAdDisplayIndex();
    this.countdown = ad.duration;

    this.callbacks.onAdStateChange();

    // Start countdown
    this.startCountdown(ad.duration);
  }

  private startCountdown(duration: number): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    let remaining = duration;
    this.countdownInterval = setInterval(() => {
      remaining--;
      this.countdown = remaining;
      this.callbacks.onAdStateChange();

      if (remaining <= 0) {
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
        this.completeAd();
      }
    }, 1000);
  }

  completeAd(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    const nextAd = this.callbacks.adBreakManager.advanceToNextAd();

    if (nextAd) {
      this.playAd(nextAd);
    } else {
      this.currentAd = null;
      this.callbacks.onAdBreakComplete();
    }
  }

  handleAdFreePod(): void {
    this.callbacks.adBreakManager.handleAdFreePod();
    this.completeAd();
  }

  dispose(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
