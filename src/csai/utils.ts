import { AdBreakConfig, AdConfig } from '../ExampleData';

/**
 * Find the next ad break that should play based on current time
 */
export function findNextAdBreak(
  adBreaks: AdBreakConfig[],
  currentTime: number,
  completedBreakIds: string[]
): AdBreakConfig | null {
  return (
    adBreaks.find(
      (breakConfig) =>
        !completedBreakIds.includes(breakConfig.breakId) &&
        currentTime >= breakConfig.startTime
    ) || null
  );
}

/**
 * Check if ad break should be triggered at current time
 */
export function shouldTriggerAdBreak(
  adBreak: AdBreakConfig,
  currentTime: number,
  completedBreakIds: string[]
): boolean {
  if (completedBreakIds.includes(adBreak.breakId)) {
    return false;
  }

  // Trigger if we've reached or passed the start time
  return currentTime >= adBreak.startTime;
}

/**
 * Parse adParameters JSON string into TruexAdParameters object
 * Returns empty object on parse failure, which will trigger TruexAd error
 */
export function parseAdParametersAsJson(adParameters: string): any {
  try {
    return JSON.parse(adParameters);
  } catch {
    return {};
  }
}

/**
 * Check if an ad is an interactive ad (TrueX/IDVx)
 */
export function isInteractiveAd(ad: AdConfig): boolean {
  const adSystem = ad.adSystem?.toLowerCase();

  return adSystem === 'truex' || adSystem === 'idvx';
}
