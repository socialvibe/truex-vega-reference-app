export interface SeekAccumulatorConfig {
  seekDelta: number; // seconds per press
  accumulationWindow: number; // milliseconds
}

/**
 * Accumulates seek commands within a time window.
 * Example: 3 right arrow presses within 2s = 15s total seek
 */
export class SeekAccumulator {
  private accumulatedSeek: number = 0;
  private lastSeekTime: number = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private config: SeekAccumulatorConfig,
    private onSeekReady: (seekAmount: number) => void
  ) {}

  /**
   * Register a seek press (forward or backward)
   */
  registerSeek(direction: 'forward' | 'backward'): void {
    const now = Date.now();
    const delta =
      direction === 'forward' ? this.config.seekDelta : -this.config.seekDelta;

    // Check if within accumulation window
    if (
      this.lastSeekTime > 0 &&
      now - this.lastSeekTime <= this.config.accumulationWindow
    ) {
      // Accumulate
      this.accumulatedSeek += delta;
    } else {
      // Start new accumulation
      this.accumulatedSeek = delta;
    }

    this.lastSeekTime = now;

    // Clear previous timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set new timeout to apply seek
    this.timeoutId = setTimeout(() => {
      this.applyAccumulatedSeek();
    }, this.config.accumulationWindow);
  }

  /**
   * Apply accumulated seek
   */
  private applyAccumulatedSeek(): void {
    if (this.accumulatedSeek !== 0) {
      this.onSeekReady(this.accumulatedSeek);
      this.reset();
    }
  }

  /**
   * Reset accumulator
   */
  reset(): void {
    this.accumulatedSeek = 0;
    this.lastSeekTime = 0;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get current accumulated amount (for display)
   */
  getAccumulated(): number {
    return this.accumulatedSeek;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.reset();
  }
}
