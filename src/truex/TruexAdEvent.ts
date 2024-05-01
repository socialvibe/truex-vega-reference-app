/**
 * Describes events emitted from the truex ad renderer as the interactive ad progresses through its life cycle.
 */
export enum TruexAdEvent {
  AdStarted = 'adStarted',
  AdDisplayed = 'adDisplayed',
  AdCompleted = 'adCompleted',
  AdError = 'adError',
  NoAdsAvailable = 'noAdsAvailable',
  AdFreePod = 'adFreePod',
  AdFetchCompleted = 'adFetchCompleted',
  UserCancelStream = 'userCancelStream',
  OptIn = 'optIn',
  OptOut = 'optOut',
  SkipCardShown = 'skipCardShown',
  UserCancel = 'userCancel',
  XtendedViewStarted = 'xtendedViewStarted',
  PopupWebsite = "popupWebsite"
}

export type AdEventData = undefined | null | Record<string, null | boolean | number | string>;
export type AdEventHandler = (event: TruexAdEvent, data?: AdEventData) => void;

export function isCompletionEvent(event: TruexAdEvent) {
  switch (event) {
    case TruexAdEvent.NoAdsAvailable:
    case TruexAdEvent.AdCompleted:
    case TruexAdEvent.AdError:
    case TruexAdEvent.UserCancelStream:
      return true;
  }
  return false;
}

export function getErrorMessage(err: Error | string) {
  // Just take the message from simple exceptions, otherwise we want the class name included in the message.
  // Or we could be given a simple error string, for which a string conversion works in either case.
  return err && err.constructor == Error ? err.message : '' + err;
}

export function signalAdError(error: string | Error, handler: AdEventHandler) {
  signalAdEvent(TruexAdEvent.AdError, handler, { errorMessage: getErrorMessage(error) });
}

export function signalAdEvent(event: TruexAdEvent, handler: AdEventHandler, data?: AdEventData) {
  let msg = `TruexAd: ${event}`;
  if (data !== undefined) msg += ': ' + data;
  if (event == TruexAdEvent.AdError) {
    console.error(msg);
  } else {
    console.log(msg);
  }
  handler?.(event, data);
}

