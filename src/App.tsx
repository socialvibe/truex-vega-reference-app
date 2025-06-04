import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { WebView } from '@amzn/webview';
import { BackHandler } from '@amzn/react-native-kepler';
import { WebViewMessageEvent, WebViewMethods } from '@amzn/webview/dist/types/WebViewTypes';
import { AdEventData, signalAdEvent, TruexAdEvent } from './truex/TruexAdEvent';

export const App = () => {
  const [showWebView, setShowWebView] = useState(true);

  const webRef = useRef<WebViewMethods | null>(null);

  const webSource = useMemo(() => {
    //const url = 'https://ctv.truex.com/kepler/test/test-page.html?cb=' + Date.now();
    //const url = "https://qa-media.truex.com/container/3.x/current/ctv.html#creative_json_url=https%3A%2F%2Fqa-ee.truex.com%2Fstudio%2Fdrafts%2F5179%2Fconfig_json&session_id=100cfe41-7638-4e32-9383-4f0a1e6eebde&multivariate%5Bctv_footer_test%5D=T0&multivariate%5Bctv_relevance_enabled%5D=true";
    //const url = "https://ctv.truex.com/android/bridge/v2/release/index.html?test=1";
    const url = "https://ctv.truex.com/android/bridge/v2/qa/index.html?test_vast_config_url=qa-get.truex.com%2Fc39e2b60633fcda48cbbc60b9628af64cf23ff9d%2Fvast%2Fconfig%3Fdimension_1%3DPI-2447-C3-ctv-ad";
    return { uri: url }
  }, []);

  const onCloseWindow = useCallback(() => {
    setShowWebView(false);
  }, [showWebView]);

  useEffect(() => {
    const onBackHandler = () => {
      webRef.current?.goBack();
      //BackHandler.exitApp();
      //setShowWebView(false);
      return true; // handled
    };
    BackHandler.addEventListener('hardwareBackPress', onBackHandler);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackHandler);
  });

  return (
    <View style={styles.app}>
      {showWebView && (
      <WebView
        ref={webRef}
        style={styles.webView}
        source={webSource}
        javaScriptEnabled={true}
        allowSystemKeyEvents={true}
        mediaPlaybackRequiresUserAction={false}
        hasTVPreferredFocus={true}
        onCloseWindow={onCloseWindow}
      />)}
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
  },
  webView: {
    backgroundColor: 'black',
    margin: 0,
    width: '100%',
    height: '100%'
  }
});
