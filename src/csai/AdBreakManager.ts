import { AdBreakConfig, AdConfig } from '../ExampleData';
import { AdBreakState } from './types';

/**
 * Manages ad break state and transitions
 */
export class AdBreakManager {
  private completedBreakIds: string[] = [];
  private currentBreakState: AdBreakState | null = null;

  /**
   * Check if should transition to an ad break
   */
  shouldStartAdBreak(
    adBreaks: AdBreakConfig[],
    currentTime: number
  ): AdBreakConfig | null {
    // Find first incomplete break that should play
    for (const adBreak of adBreaks) {
      if (this.completedBreakIds.includes(adBreak.breakId)) {
        continue;
      }

      // For preroll (startTime = 0), trigger immediately
      // For midrolls, trigger when we reach the time
      if (adBreak.breakType === 'preroll' && currentTime === 0) {
        return adBreak;
      }

      if (adBreak.breakType === 'midroll' && currentTime >= adBreak.startTime) {
        // Only trigger if we haven't already started this break
        if (
          !this.currentBreakState ||
          this.currentBreakState.break.breakId !== adBreak.breakId
        ) {
          return adBreak;
        }
      }
    }

    return null;
  }

  /**
   * Start a new ad break
   */
  startAdBreak(adBreak: AdBreakConfig): AdBreakState {
    this.currentBreakState = {
      break: adBreak,
      currentAdIndex: 0,
      skippedAds: [],
      completed: false,
      adFreePodReceived: false,
    };
    return this.currentBreakState;
  }

  /**
   * Get current ad in the break
   */
  getCurrentAd(): AdConfig | null {
    if (!this.currentBreakState) return null;

    const { break: adBreak, currentAdIndex, skippedAds } = this.currentBreakState;
    const ad = adBreak.ads[currentAdIndex];

    if (!ad) return null;

    // Skip if this ad was marked for skipping
    if (skippedAds.includes(ad.adId)) {
      return this.advanceToNextAd();
    }

    return ad;
  }

  /**
   * Move to next ad in break, returns the next ad or null if break is complete
   */
  advanceToNextAd(): AdConfig | null {
    if (!this.currentBreakState) return null;

    const { break: adBreak, currentAdIndex, skippedAds } = this.currentBreakState;

    // Find next non-skipped ad
    for (let i = currentAdIndex + 1; i < adBreak.ads.length; i++) {
      const ad = adBreak.ads[i];
      if (!skippedAds.includes(ad.adId)) {
        this.currentBreakState.currentAdIndex = i;
        return ad;
      }
    }

    // No more ads, break is complete
    this.completeCurrentBreak();
    return null;
  }

  /**
   * Handle AD_FREE_POD event - skip all remaining ads in current break
   */
  handleAdFreePod(): void {
    if (!this.currentBreakState) return;

    const { break: adBreak, currentAdIndex } = this.currentBreakState;

    // Mark that we received AD_FREE_POD
    this.currentBreakState.adFreePodReceived = true;

    // Mark all remaining ads as skipped
    for (let i = currentAdIndex + 1; i < adBreak.ads.length; i++) {
      this.currentBreakState.skippedAds.push(adBreak.ads[i].adId);
    }
  }

  /**
   * Complete current ad break
   */
  completeCurrentBreak(): void {
    if (!this.currentBreakState) return;

    this.completedBreakIds.push(this.currentBreakState.break.breakId);
    this.currentBreakState.completed = true;
    this.currentBreakState = null;
  }

  /**
   * Get current break state
   */
  getCurrentBreakState(): AdBreakState | null {
    return this.currentBreakState;
  }

  /**
   * Get 1-based ad index for display
   */
  getCurrentAdDisplayIndex(): number {
    if (!this.currentBreakState) return 0;
    return this.currentBreakState.currentAdIndex + 1;
  }

  /**
   * Check if in ad break
   */
  isInAdBreak(): boolean {
    return this.currentBreakState !== null && !this.currentBreakState.completed;
  }

  /**
   * Check if AD_FREE_POD was received in current break
   */
  hasAdFreePod(): boolean {
    return this.currentBreakState?.adFreePodReceived || false;
  }

  /**
   * Reset manager (for starting over)
   */
  reset(): void {
    this.completedBreakIds = [];
    this.currentBreakState = null;
  }
}
