import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DeviceInfo from '@amzn/react-native-device-info';
import {
  AdEventData,
  AdEventHandler,
  isCompletionEvent,
  signalAdError,
  signalAdEvent,
  TruexAdEvent
} from './TruexAdEvent';
import { WebView } from '@amzn/webview';
import { TruexAdOptions } from './TruexAdOptions';
import {
  WebViewErrorEvent,
  WebViewMessageEvent,
  WebViewMethods,
  WebViewNavigationEvent
} from '@amzn/webview/dist/types/WebViewTypes';

export interface TruexAdProps {
  vastConfigUrl?: string;
  options?: TruexAdOptions;
  onAdEvent: AdEventHandler;
}

/**
 * The main TruexAd component, implemented with a web view that loads the TAR HTML implementation,
 * i.e. the web-based choice card and ad engagement.
 */
export function TruexAd(adProps: TruexAdProps) {
  const { vastConfigUrl, options, onAdEvent } = adProps;

  const webSource = useMemo(() => {
    const prodUrl = "https://ctv.truex.com/android/bridge/v2/release/index.html";
    const qaUrl = "https://ctv.truex.com/android/bridge/v2/qa/index.html";
    const isProduction = vastConfigUrl ? vastConfigUrl.indexOf(".truex.com") >= 0 && vastConfigUrl.indexOf("qa-") < 0 : false;
    const url = isProduction ? prodUrl : qaUrl;
    //const url = "https://qa-media.truex.com/container/3.x/current/ctv.html#creative_json_url=https%3A%2F%2Fqa-ee.truex.com%2Fstudio%2Fdrafts%2F5179%2Fconfig_json&session_id=100cfe41-7638-4e32-9383-4f0a1e6eebde&multivariate%5Bctv_footer_test%5D=T0&multivariate%5Bctv_relevance_enabled%5D=true";
    return { uri: url }
  }, []);

  const webRef = useRef<WebViewMethods | null>(null);
  const webViewLoaded = useRef(false);

  const adEventWrapper = useCallback<AdEventHandler>((event, data) => {
    onAdEvent(event, data);
  }, [onAdEvent]);

  useEffect(() => {
    if (!vastConfigUrl || webViewLoaded.current) return;
    console.log(`TruexAd: using vast config url: ${vastConfigUrl}`);
    injectInitialStyles(webRef.current, onAdEvent);
  }, [onAdEvent, adEventWrapper, vastConfigUrl]);

  const onWebViewMessage = useCallback((msgEvent: WebViewMessageEvent) => {
    const message = JSON.parse(msgEvent.nativeEvent.data);
    switch (message.type) {
      case 'signalAdEvent': {
        const adEventJson: any = JSON.parse(message.data);
        const adEvent = adEventJson.type as TruexAdEvent;
        const adEventData = adEventJson.data as AdEventData;
        signalAdEvent(adEvent, adEventWrapper, adEventData);
        break;
      }

      case 'log':
      case 'info':
      case 'error':
      case 'warn': {
        console.log(`TruexAd: WebView ${message.type}: ${message.data}`);
        break;
      }

      default:
        console.warn(`TruexAd: unknown web view message: ${message.type}: ${message.data}`);
        break;
    }
  }, [adEventWrapper]);

  const onWebViewError = useCallback((event: WebViewErrorEvent) => {
    const e = event.nativeEvent;
    console.log(`TruexAd: onWebViewError: ${e.code} - ${e.description} - ${e.url}`);
  }, []);

  const onWebViewLoad = useCallback((event: WebViewNavigationEvent) => {
    console.log(`TruexAd: onWebViewLoad: ${event.nativeEvent.url}`);
    if (webViewLoaded.current) return;
    webViewLoaded.current = true;
    injectAdParameters(webRef.current, adProps, onAdEvent); // Start the TAR web view running.
  }, [adProps, onAdEvent]);

  return (
      <WebView ref={webRef} style={styles.fullSize}
               source={webSource}
               javaScriptEnabled={true}
               allowSystemKeyEvents={true}
               mediaPlaybackRequiresUserAction={false}
               hasTVPreferredFocus={true}
               onMessage={onWebViewMessage}
               onError={onWebViewError}
               onLoad={onWebViewLoad}
      />
  );
}

export default TruexAd;

const styles = StyleSheet.create({
  fullSize: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black'
  }
});

function injectInitialStyles(webView: any, onAdEvent: AdEventHandler) {
  const jsCode = `
(function() {
  const html = document.documentElement;
  html.style.width = '1920px';
  html.style.height = '1080px';
  html.style.backgroundColor = 'black';

  const body = document.body;
  body.style.backgroundColor = 'black';
  body.style.width = '100%';
  body.style.height = '100%';
})();
`;
  injectJS('initial styles', jsCode, webView, onAdEvent);
}

function injectAdParameters(webView: any, { vastConfigUrl, options }: TruexAdProps, onAdEvent: AdEventHandler) {
  const userId = options?.userAdvertisingId || DeviceInfo.getInstanceIdSync();
  const appId = options?.appId || DeviceInfo.getBundleId();
  //const debugWebView = options?.enableWebViewDebugging /* || config.buildEnv != 'prod' */ || false; // TODO
  const debugWebView = true;
  const jsCode = `
function postTarMessage(type, data) {
  setTimeout(() => window.ReactNativeWebView?.postMessage(JSON.stringify({ type, data })), 0);
}

try {
  postTarMessage('log', 'constructing hostApp');

  // TAR Web Bridge expects a hostApp functional interface:
  const hostApp = {
    signalAdEvent(eventJSONString) {
      postTarMessage('signalAdEvent', eventJSONString);
    },

    getAdParametersJSON() {
      const params = {};

      function addParam(name, value) {
        if (value) params[name] = value;
      }

      addParam('vastConfigUrl', ${JSON.stringify(vastConfigUrl)});
      addParam('userAdvertisingId', ${JSON.stringify(userId)});
      addParam('appId', ${JSON.stringify(appId)});
      addParam('useIntegration', {name: "TAR Kepler", version: "0.0.1"}); // TODO: get proper version
      return JSON.stringify(params);
    }
  };

  // Forward console logs to the host.
  if (${debugWebView}) {
    (function() {
      const actions = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console)
      };

      function logAction(kind) {
          return function(...args) {
              const msg = args.join(' ');
              actions[kind].apply(console, args);
              postTarMessage(kind, msg);
          };
      }

      console.log = logAction('log');
      console.info = logAction('info');
      console.warn = logAction('warn');
      console.error = logAction('error');
    })();
  }

  window.hostApp = hostApp;
  if (window.initializeApplication) {
    window.initializeApplication();
  } else {
    postTarMessage('log', 'initializeApplication not present at injection');
  }
} catch (err) {
  postTarMessage('log', 'injection error: ' + err);
  throw err;
}
`;
  injectJS("ad parameters", jsCode, webView, onAdEvent);
}

function injectJS(context: string, jsCode: string, webView: any, onAdEvent: AdEventHandler) {
  if (!webView) {
    reportError('no webView present to inject code with');
    return;
  }
  try {
    console.log(`TruexAd: injecting ${context}`);
    webView.injectJavaScript(jsCode);
  } catch (err: any) {
    reportError('could not inject webview code: ' + err);
  }

  function reportError(errMsg: string) {
    console.error(`TruexAd: ${errMsg}`);
    signalAdError(errMsg, onAdEvent);
  }
}
