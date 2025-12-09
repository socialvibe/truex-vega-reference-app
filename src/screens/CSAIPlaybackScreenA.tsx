import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StackScreenProps } from '@amazon-devices/react-navigation__stack';
import { KeplerVideoSurfaceView } from '@amazon-devices/react-native-w3cmedia';
import { TruexAd, TruexAdEvent, TruexAdEventType } from '@truex/ad-renderer-vega';
import { ScreenParamsList, Screens } from '../ScreenTypes';
import { useCSAIPlayback } from '../csai/hooks/useCSAIPlayback';
import { ProgressBar } from '../components/ProgressBar';
import { AdBadge } from '../components/AdBadge';
import { parseAdParametersAsJson } from '../csai/utils';

export function CSAIPlaybackScreenA({
  navigation,
  route,
}: StackScreenProps<ScreenParamsList, Screens.CSAI_PLAYBACK_SCREEN>) {
  const { content } = route.params;

  const {
    playbackContext,
    onSurfaceViewCreated,
    completeAd,
    handleAdFreePod,
  } = useCSAIPlayback({
    content,
    seekConfig: { seekDelta: 5, accumulationWindow: 2000 },
  });

  const handleAdEvent = useCallback(
    (event: TruexAdEvent) => {
      console.log('TrueX Ad Event:', event);

      switch (event.type) {
        case TruexAdEventType.AD_COMPLETED:
          completeAd();
          break;
        case TruexAdEventType.AD_FREE_POD:
          handleAdFreePod();
          break;
        case TruexAdEventType.AD_ERROR:
        case TruexAdEventType.NO_ADS_AVAILABLE:
          // Skip this ad
          completeAd();
          break;
      }
    },
    [completeAd, handleAdFreePod]
  );

  return (
    <View style={styles.container}>
      {/* Video Surface */}
      {playbackContext.showVideoSurface && (
        <KeplerVideoSurfaceView
          onSurfaceViewCreated={onSurfaceViewCreated}
          style={styles.videoSurface}
        />
      )}

      {/* TrueX/IDVx Ad */}
      {playbackContext.showTruexAd && playbackContext.currentAd && (
        <TruexAd
          adParameters={parseAdParametersAsJson(playbackContext.currentAd.adParameters)}
          onAdEvent={handleAdEvent}
        />
      )}

      {/* Progress Bar - shown during content */}
      {playbackContext.phase === 'content' && (
        <ProgressBar
          currentTime={playbackContext.currentTime}
          duration={playbackContext.duration}
        />
      )}

      {/* Ad Badge - shown during ads */}
      {playbackContext.phase === 'ad' && playbackContext.currentAd && (
        <AdBadge
          adIndex={playbackContext.currentAdIndex}
          countdown={playbackContext.adCountdown}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoSurface: {
    width: '100%',
    height: '100%',
  },
});
