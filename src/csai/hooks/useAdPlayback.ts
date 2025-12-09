import { useState, useRef, useEffect } from 'react';
import { AdBreakConfig, AdConfig } from '../../ExampleData';
import { AdBreakManager } from '../AdBreakManager';

interface UseAdPlaybackConfig {
  adBreakManager: AdBreakManager;
  onAdBreakComplete: () => void;
}

export function useAdPlayback({ adBreakManager, onAdBreakComplete }: UseAdPlaybackConfig) {
  const [currentAd, setCurrentAd] = useState<AdConfig | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adCountdown, setAdCountdown] = useState(0);

  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  function startAdBreak(adBreak: AdBreakConfig) {
    adBreakManager.startAdBreak(adBreak);
    const firstAd = adBreakManager.getCurrentAd();

    if (firstAd) {
      playAd(firstAd);
    } else {
      // No ads in break
      onAdBreakComplete();
    }
  }

  function playAd(ad: AdConfig) {
    setCurrentAd(ad);
    setCurrentAdIndex(adBreakManager.getCurrentAdDisplayIndex());
    setAdCountdown(ad.duration);

    // Start countdown
    startCountdown(ad.duration);
  }

  function startCountdown(duration: number) {
    // Clear existing countdown
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }

    let remaining = duration;
    countdownInterval.current = setInterval(() => {
      remaining--;
      setAdCountdown(remaining);

      if (remaining <= 0) {
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }
        // Auto-advance to next ad
        completeAd();
      }
    }, 1000);
  }

  function completeAd() {
    // Clear countdown
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    // Move to next ad
    const nextAd = adBreakManager.advanceToNextAd();

    if (nextAd) {
      playAd(nextAd);
    } else {
      // Break complete
      setCurrentAd(null);
      onAdBreakComplete();
    }
  }

  function handleAdFreePod() {
    adBreakManager.handleAdFreePod();
    // Complete current ad, which will skip remaining
    completeAd();
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  return {
    currentAd,
    currentAdIndex,
    adCountdown,
    startAdBreak,
    completeAd,
    handleAdFreePod,
  };
}
