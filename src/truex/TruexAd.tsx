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

  const [adComplete, setAdComplete] = useState(false);

  const webSource = useMemo(() => {
    // For testing key events:
    return { uri: 'http://ctv.truex.com.s3.amazonaws.com/kepler/test/test-page.html?cb=' + Date.now() };
    //return { uri: `https://ctv.truex.com/android/bridge/v2/branch-test/task_pi-2692_support-tar-kepler-webview/index.html` };
  }, []);

  const adContainerRef = useRef<View|null>(null);
  const webRef = useRef<typeof WebView | null>(null);
  const didInjectionRef = useRef(false);

  // Use a user agent the clearly reports this as a Kepler device.
  const userAgent = useMemo<string>(() => {
    const osName = DeviceInfo.getSystemName();
    const osVersion = DeviceInfo.getSystemVersion();
    const osBuild = DeviceInfo.getBuildIdSync();
    const model = DeviceInfo.getModel();
    const display = DeviceInfo.getDisplaySync();
    const appId = DeviceInfo.getBundleId();
    if (osName == 'unknown') {
      return DeviceInfo.getUserAgentSync();
    } else {
      return `Kepler Webview (${osName}; ${osVersion}-${osBuild}; ${display}) ${model} ${appId}`;
    }
  }, []);

  const adEventWrapper = useCallback<AdEventHandler>((event, data) => {
    if (isCompletionEvent(event)) {
      // Ensure the truex ad ux is no longer visible.
      setAdComplete(true);
      adContainerRef.current?.focus(); // take the focus away from the web view.
      adContainerRef.current?.blur(); // and clear it
    }
    onAdEvent(event, data);
  }, [onAdEvent]);

  useEffect(() => {
    if (vastConfigUrl) console.log(`TruexAd: using vast config url: ${vastConfigUrl}`);
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
    if (!didInjectionRef.current) {
      didInjectionRef.current = true;
      injectAdParameters(webRef.current, adProps, onAdEvent); // Start the TAR web view running.
    }
  }, [adProps, onAdEvent]);

  // Show nothing if the ad is complete. Clients are supposed to remove the TruexAd view themselves,
  // but this serves as a backup.
  if (adComplete) return <></>;

  return (
    <View style={styles.adContainer} ref={adContainerRef}>
      <WebView ref={webRef} style={styles.webView} source={webSource}
               javaScriptEnabled={true} allowSystemKeyEvents={true}
               mediaPlaybackRequiresUserAction={false} userAgent={userAgent}
               // hasTVPreferredFocus={true}
               onMessage={onWebViewMessage}
               onError={onWebViewError}
               onLoad={onWebViewLoad}
      />
    </View>
  );
}

export default TruexAd;

const styles = StyleSheet.create({
  adContainer: {
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
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
  //const debugWebView = options?.enableWebViewDebugging /* || config.buildEnv != 'prod' */ || false;
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
    report('no webView present to inject code with');
    return;
  }
  try {
    console.log(`TruexAd: injecting ${context}`);
    webView.injectJavaScript(jsCode);
  } catch (err: any) {
    report('could not inject webview code: ' + err);
  }

  function report(errMsg: string) {
    console.error(`TruexAd: ${errMsg}`);
    signalAdError(errMsg, onAdEvent);
  }
}
