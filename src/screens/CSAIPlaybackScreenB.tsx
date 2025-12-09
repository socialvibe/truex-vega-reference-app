import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { View, StyleSheet } from 'react-native';
import { StackScreenProps } from '@amazon-devices/react-navigation__stack';
import { KeplerVideoSurfaceView } from '@amazon-devices/react-native-w3cmedia';
import { TruexAd, TruexAdEvent, TruexAdEventType } from '@truex/ad-renderer-vega';
import { useTVEventHandler } from '@amazon-devices/react-native-kepler';
import { ScreenParamsList, Screens } from '../ScreenTypes';
import { CSAIPlaybackViewModel } from '../csai/viewmodel/CSAIPlaybackViewModel';
import { ProgressBar } from '../components/ProgressBar';
import { AdBadge } from '../components/AdBadge';
import { parseAdParametersAsJson } from '../csai/utils';

export function CSAIPlaybackScreenB({
  navigation,
  route,
}: StackScreenProps<ScreenParamsList, Screens.CSAI_PLAYBACK_SCREEN>) {
  const { content } = route.params;

  // Create ViewModel instance (only once)
  const viewModel = useMemo(
    () => new CSAIPlaybackViewModel(content, { seekDelta: 5, accumulationWindow: 2000 }),
    [content]
  );

  // Subscribe to ViewModel state using useSyncExternalStore
  const playbackContext = useSyncExternalStore(
    (callback) => viewModel.subscribe(callback),
    () => viewModel.getPlaybackContext()
  );

  // Handle surface view creation
  const handleSurfaceViewCreated = useCallback(
    (handle: string) => {
      viewModel.setSurfaceHandle(handle);
    },
    [viewModel]
  );

  // Initialize on mount
  useEffect(() => {
    viewModel.initialize();

    return () => {
      viewModel.dispose();
    };
  }, [viewModel]);

  // Handle remote control events
  useTVEventHandler((evt: any) => {
    const { eventType } = evt;

    switch (eventType) {
      case 'right':
        viewModel.registerSeek('forward');
        break;
      case 'left':
        viewModel.registerSeek('backward');
        break;
    }
  });

  const handleAdEvent = useCallback(
    (event: TruexAdEvent) => {
      console.log('TrueX Ad Event:', event);

      switch (event.type) {
        case TruexAdEventType.AD_COMPLETED:
          viewModel.completeAd();
          break;
        case TruexAdEventType.AD_FREE_POD:
          viewModel.handleAdFreePod();
          break;
        case TruexAdEventType.AD_ERROR:
        case TruexAdEventType.NO_ADS_AVAILABLE:
          viewModel.completeAd();
          break;
      }
    },
    [viewModel]
  );

  return (
    <View style={styles.container}>
      {/* Video Surface */}
      {playbackContext.showVideoSurface && (
        <KeplerVideoSurfaceView
          onSurfaceViewCreated={handleSurfaceViewCreated}
          style={styles.videoSurface}
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

      {/* TrueX/IDVx Ad */}
      {playbackContext.showTruexAd && playbackContext.currentAd && (
        <TruexAd
          adParameters={parseAdParametersAsJson(playbackContext.currentAd.adParameters)}
          onAdEvent={handleAdEvent}
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
