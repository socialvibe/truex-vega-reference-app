import React, { useCallback, useEffect, useMemo, useState } from 'react';
import 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { BackHandler } from '@amzn/react-native-kepler';
import uuid from 'react-native-uuid';
import { TruexAdOptions } from './truex/TruexAdOptions';
import { VideoStreamConfig } from './video/VideoStreamConfig';
import videoStreamJson from './data/video-stream.json';
import { AdEventHandler, TruexAdEvent } from './truex/TruexAdEvent';
import TruexAd from './truex/TruexAd';

const videoStream = videoStreamJson as VideoStreamConfig;

export const App = () => {
  const [showTruexAd, setShowTruexAd] = useState(true);

  const onAdEvent: AdEventHandler = useCallback<AdEventHandler>(
    (event, data) => {
      console.log(`*** truex event: ${event}`);
      switch (event) {
        case TruexAdEvent.AdFreePod:
          // Remember for later that we have the ad credit.
          //hasAdCredit.current = true;
          break;

        case TruexAdEvent.AdCompleted:
        case TruexAdEvent.AdError:
        case TruexAdEvent.NoAdsAvailable:
          // Resume playback.
          //play();
          // if (hasAdCredit.current && afterAdResumeTarget.current !== undefined) {
          //   // Skip over the fallback ads.
          //   seekTo(afterAdResumeTarget.current);
          // }
          setShowTruexAd(false);

          // ensure our page has the focus again
          // @TODO does not seem to work however, we are still losing keyboard focus after webview unmounts
          //pageRef.current?.focus();
          break;
      }
    },
    []
  );

  useEffect(() => {
    const onBackHandler = () => {
      if (showTruexAd) return false; // let the truex ad handle the back action
      BackHandler.exitApp();
      return true; // handled
    };
    BackHandler.addEventListener('hardwareBackPress', onBackHandler);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackHandler);
  }, [showTruexAd]);

  const tarOptions = useMemo<TruexAdOptions>(() => {
    const options: TruexAdOptions = {
      // Ensure a unique user id to minimize no ads available
      userAdvertisingId: uuid.v4() as string
    };
    return options;
  }, []);

  return (
    <View style={styles.app}>
      {showTruexAd && (
        <TruexAd vastConfigUrl={videoStream.adBreaks[0].vastUrl} options={tarOptions} onAdEvent={onAdEvent} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#2222CC',
    display: 'flex',
    flex: 1
  }
});
