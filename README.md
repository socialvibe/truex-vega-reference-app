# TrueX Vega Reference App

Reference implementation for integrating Infillion TrueX and IDVx interactive ads into Amazon Vega OS (Fire TV) applications using React Native.

## Overview

This application demonstrates how to integrate Infillion interactive ads (TrueX and IDVx) on Amazon's Vega platform using the `@truex/ad-renderer-vega` library. It showcases a complete CSAI (Client-Side Ad Insertion) implementation with ad break management, seek control, and proper event handling.

For complete integration documentation, see the [Infillion Vega Integration Guide](https://socialvibe.github.io/infillion-ads-integration-docs/platforms/vega/).

## What are Infillion Interactive Ads?

Infillion provides two interactive video advertising products for Connected TV platforms:

**TrueX** presents users with an interactive choice card where they choose between engaging with branded content or watching standard video ads. When users opt in and complete the interactive experience, they earn an ad credit that skips all remaining ads in the pod.

Key features include:
- Opt-in via choice card where users actively choose to engage
- Engagement requirements of 30 seconds with at least one interaction to earn credit
- Ability to skip entire ad breaks upon successful engagement

**IDVx** delivers interactive video ads that start automatically without requiring user opt-in. These ads maintain interactivity throughout their duration (typically 30 seconds) and play inline with other ads in the break sequence.

Key features include:
- Automatic start without opt-in
- Interactive capabilities during ad playback
- Inline playback that continues to the next ad after completion

## Prerequisites

- Node.js (v18 or higher) and npm
- Amazon Kepler CLI and Vega SDK - see [Amazon Kepler Developer Documentation](https://developer.amazon.com/docs/kepler-tv/)
- Fire TV device or Kepler Simulator

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

The project includes all necessary peer dependencies:
- `@amazon-devices/react-native-device-info`
- `@amazon-devices/webview`
- `@truex/ad-renderer-vega`

## Building & Running

### Build Commands

```bash
# Debug build
npm run build:debug

# Release build
npm run build:release
```

### Running in Kepler Simulator

```bash
# Start the Kepler simulator
npm run kepler-simulator-start

# Run the app (adjust paths as needed)
npm run kepler-simulator-debug

# Enable fast refresh
npm run kepler-fast-refresh
```

### Running on Fire TV Device

```bash
# Build and install debug version
npm run kepler-device-build-debug

# Or install separately
npm run kepler-install-debug
npm run kepler-start-app

# View logs
npm run kepler-log
```

## Implementation Flow

The integration process follows these steps:

1. **Library Import**: The app imports the `TruexAd` component from `@truex/ad-renderer-vega` during initialization
2. **Stream Playback**: Video content plays until reaching an ad break
3. **Ad Detection**: The app detects TrueX/IDVx ads via the `<AdSystem>` node in the VAST response
4. **Ad Parameters Extraction**: Decode `adParameters` from either `<AdParameters>` or base64-encoded `<CompanionAd>`
5. **Renderer Initialization**: Render `<TruexAd />` component with ad parameters
6. **Event Handling**: Process events to manage ad completion, errors, and interactions
7. **Resume Playback**: Skip remaining ads (TrueX with `adFreePod`) or continue to next ad (IDVx or TrueX opt-out)

## VAST Tag Types

Infillion uses two types of VAST tags for both products, differing in how the `adParameters` JSON payload is embedded:

**"Generic" Tag** embeds `adParameters` directly as a JSON string within the `<AdParameters>` node:
- TrueX: `https://get.truex.com/{placement_hash}/vast/generic?{ad_request_parameters}`
- IDVx: `https://get.truex.com/{placement_hash}/vast/idvx/generic?{ad_request_parameters}`

**"Companion" Tag** embeds `adParameters` in a companion ad's `<StaticResource>` node as a base64-encoded JSON string:
- TrueX: `https://get.truex.com/{placement_hash}/vast/companion?{ad_request_parameters}`
- IDVx: `https://get.truex.com/{placement_hash}/vast/idvx/companion?{ad_request_parameters}`

Both tag types (Generic and Companion) are compatible with both products.

### Generic Tag VAST Response

```xml
<VAST version="4.0">
  <Ad id="...">
    <InLine>
      <AdSystem>trueX</AdSystem> <!-- or "IDVx" for IDVx ads -->
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <AdParameters>
              <![CDATA[
                {
                  "user_id": "...",
                  "placement_hash": "...",
                  "vast_config_url": "..."
                }
              ]]>
            </AdParameters>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1280" height="720" apiFramework="truex">
                <![CDATA[https://qa-media.truex.com/m/video/truexloadingplaceholder-30s.mp4 ]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

### Companion Tag VAST Response

```xml
<VAST version="4.0">
  <Ad id="...">
    <InLine>
      <AdSystem>trueX</AdSystem> <!-- or "IDVx" for IDVx ads -->
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion id="super_tag" width="960" height="540" apiFramework="truex">
              <StaticResource creativeType="application/json">
                <![CDATA[ ...base64_encoded_json_string... ]]>
              </StaticResource>
            </Companion>
          </CompanionAds>
        </Creative>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1280" height="720">
                <![CDATA[https://qa-media.truex.com/m/video/truexloadingplaceholder-30s.mp4 ]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

### Ad Type Detection

The `<AdSystem>` node value in the VAST response identifies the ad type:
- TrueX ads use: `<AdSystem>trueX</AdSystem>`
- IDVx ads use: `<AdSystem>IDVx</AdSystem>`

## CSAI Implementation

This reference app includes a CSAI playback screen (`CSAIPlaybackScreenA.tsx`) that demonstrates the recommended integration pattern using React hooks.

**Note:** The `adBreaks` configuration in `src/ExampleData.ts` represents a parsed VAST/VMAP response from the publisher's ad server. The structure and content of ad breaks will vary between different publishers and their ad delivery systems. In a production application, you would parse the VAST/VMAP response from your ad server and construct a similar structure.

### Architecture

The implementation uses a hook-based architecture with these key components:

- **`useCSAIPlayback`** - Main orchestration hook managing playback state
- **`KeplerVideoSurfaceView`** - Video playback surface for content and video ads
- **`<TruexAd />`** - Interactive ad renderer for TrueX/IDVx ads
- **`ProgressBar`** - Content playback progress display
- **`AdBadge`** - Ad countdown indicator

#### File References

- [`src/screens/CSAIPlaybackScreenA.tsx`](src/screens/CSAIPlaybackScreenA.tsx) - Main screen implementation
- [`src/csai/hooks/useCSAIPlayback.ts`](src/csai/hooks/useCSAIPlayback.ts) - Playback orchestration hook
- [`src/csai/AdBreakManager.ts`](src/csai/AdBreakManager.ts) - Ad break state management
- [`src/csai/components/`](src/csai/components/) - Shared UI components (ProgressBar, AdBadge)


### Key Integration Points

#### 1. Instantiating the TruexAd Component

```tsx
import { TruexAd, TruexAdEventType, TruexAdEvent } from '@truex/ad-renderer-vega';

// Get adParameters from VAST/VMAP response <AdParameters> element
// Parse as JSON and pass to TruexAd
const adParameters = JSON.parse(adParametersString);

<TruexAd
  adParameters={adParameters}
  onAdEvent={handleAdEvent}
  options={{}}
/>
```

#### 2. Handling TrueX Events

**Important:** You must handle all terminal events to properly resume playback.

```tsx
const handleAdEvent = (event: TruexAdEvent) => {
  console.log('TrueX event:', event.type);

  switch (event.type) {
    // Terminal events - must handle to resume playback
    case TruexAdEventType.AD_COMPLETED:
      // Ad finished successfully
      completeAd(); // Move to next ad or resume content
      break;

    case TruexAdEventType.AD_ERROR:
      // Error occurred during ad playback
      console.error('Ad error:', event.errorMessage);
      completeAd(); // Skip this ad
      break;

    case TruexAdEventType.NO_ADS_AVAILABLE:
      // No ads available for this user
      completeAd(); // Resume content
      break;

    // Credit event (TrueX only, see notes below)
    case TruexAdEventType.AD_FREE_POD:
      // User earned credit to skip ads
      handleAdFreePod(); // Skip remaining ads in current break
      break;

    // Informational events
    case TruexAdEventType.AD_STARTED:
      // Ad UI construction has begun
      break;

    case TruexAdEventType.AD_DISPLAYED:
      // Ad UI is fully loaded and visible
      break;
  }
};
```

#### 3. Conditional Rendering

```tsx
return (
  <View style={styles.container}>
    {/* Show video surface for content and video ads */}
    {showVideoSurface && (
      <KeplerVideoSurfaceView
        onSurfaceViewCreated={onSurfaceViewCreated}
        style={styles.videoSurface}
      />
    )}

    {/* Show TrueX ad for interactive ads (hide video surface) */}
    {showTruexAd && currentAd && (
      <TruexAd
        adParameters={parseAdPArametersAsJson(currentAd.adParameters)}
        onAdEvent={handleAdEvent}
        options={{}}
      />
    )}

    {/* Show progress bar during content playback */}
    {phase === 'content' && (
      <ProgressBar currentTime={currentTime} duration={duration} />
    )}

    {/* Show ad badge during ad breaks */}
    {phase === 'ad' && currentAd && (
      <AdBadge adIndex={currentAdIndex} countdown={adCountdown} />
    )}
  </View>
);
```

