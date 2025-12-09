/**
 * Load example CSAI configurations for testing.
 *
 * Note: The `adBreaks` structure represents a parsed VAST/VMAP response from a publisher's ad server.
 * In production applications, you would parse actual VAST/VMAP responses from your ad server.
 * The structure and content will vary between different publishers and their ad delivery systems.
 */
export function loadExampleConfigurations(): ExampleConfig[] {
  return [ csaiExample ];
}

const csaiExample = {
  id: "truex-vega-csai-example-1",
  type: "csai",
  title: "The true[X] Employee Experience",
  description: "This example demonstrates how TrueX and IDVx may be integrated within a channel that has CSAI. The app then creates TrueX and skips the rest of the ads if the user successfully completes the experience.",
  cover: "https://stash.truex.com/reference-apps/scratch/truex_cover_placeholder_spaceneedle.png",
  videoUrl: "http://ctv.truex.com/assets/reference-app-stream-no-ads-720p.mp4",
  adBreaks: [
    {
      breakId: "preroll",
      breakType: "preroll",
      startTime: 0,
      duration: 92,
      ads: [
        {
          adId: "truex-ad-1-0",
          adSystem: "trueX",
          duration: 2,
          adParameters: JSON.stringify({
            vast_config_url: "https://qa-get.truex.com/c39e2b60633fcda48cbbc60b9628af64cf23ff9d/vast/config?dimension_1=PI-2447-C3-ctv-ad"
          })
        } satisfies AdConfig,
        {
          adId: 'video-ad-1-1',
          adTitle: 'Sample Coffee Video Ad',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/coffee-720p.mp4'
        },
        {
          adId: 'video-ad-1-2',
          adTitle: 'Sample Airline Video Ad',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/airline-720p.mp4'
        },
        {
          adId: 'video-ad-1-3',
          adTitle: 'Sample Petcare Video Ad<',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/petcare-720p.mp4'
        },
      ],
    } satisfies AdBreakConfig,
    {
      breakId: "midroll-1",
      breakType: "midroll",
      startTime: 60 * 8 + 5, // "00:08:05",
      duration: 92,
      ads: [
        {
          adId: "midroll-1-1",
          adSystem: "trueX",
          adParameters: JSON.stringify({
            vast_config_url: "https://qa-get.truex.com/15c7f5269a09bd8c5007ba98263571dd80c458e5/vast/config?dimension_2=0&dimension_5=hilton&stream_position=preroll&stream_id=1234"
          }),
          duration: 2,
        },
        {
          adId: 'video-ad-2-1',
          adTitle: 'Sample Coffee Video Ad',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/coffee-720p.mp4'
        },
        {
          adId: "midroll-2-2",
          adSystem: "IDVx",
          adParameters: JSON.stringify({
            vast_config_url: "https://qa-get.truex.com/15c7f5269a09bd8c5007ba98263571dd80c458e5/vast/config?dimension_2=0&dimension_5=hilton&stream_position=preroll&stream_id=1234"
          }),
          duration: 2,
        },
        {
          adId: 'video-ad-2-3',
          adTitle: 'Sample Petcare Video Ad<',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/petcare-720p.mp4'
        },
      ],
    } satisfies AdBreakConfig,
  ],
} satisfies ExampleConfig;

const ssaiExample = {
  id: "truex-vega-ssai-example-1",
  type: "ssai",
  title: "The true[X] Employee Experience",
  description: "Our mission is to provide the best advertising experience for consumers, the best monetization for premium publishers, and the best return for brand advertisers. Learn about our team and employee experience.",
  cover: "https://stash.truex.com/reference-apps/scratch/truex_cover_placeholder_spaceneedle.png",
  videoUrl: "https://media.truex.com/videos/reference-app/reference-app-stream-no-cards-720p.mp4",
  adBreaks: [
    {
      breakId: "preroll",
      breakType: "preroll",
      startTime: 0,
      duration: 92,
      ads: [
        {
          adId: "truex-ad-1-0",
          adSystem: "trueX",
          duration: 2,
          adParameters: JSON.stringify({
            vast_config_url: "https://qa-get.truex.com/c39e2b60633fcda48cbbc60b9628af64cf23ff9d/vast/config?dimension_1=PI-2447-C3-ctv-ad"
          })
        } satisfies AdConfig,
        {
          adId: 'video-ad-1-1',
          adTitle: 'Sample Coffee Video Ad',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/coffee-720p.mp4'
        },
        {
          adId: 'video-ad-1-2',
          adTitle: 'Sample Airline Video Ad',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/airline-720p.mp4'
        },
        {
          adId: 'video-ad-1-3',
          adTitle: 'Sample Petcare Video Ad<',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/petcare-720p.mp4'
        },
      ],
    } satisfies AdBreakConfig,
    {
      breakId: "midroll-1",
      breakType: "midroll",
      startTime: 60 * 8 + 5, // "00:08:05",
      duration: 92,
      ads: [
        {
          adId: "midroll-1-1",
          adSystem: "trueX",
          adParameters: JSON.stringify({
            vast_config_url: "https://qa-get.truex.com/15c7f5269a09bd8c5007ba98263571dd80c458e5/vast/config?dimension_2=0&dimension_5=hilton&stream_position=preroll&stream_id=1234"
          }),
          duration: 2,
        },
        {
          adId: 'video-ad-2-1',
          adTitle: 'Sample Coffee Video Ad',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/coffee-720p.mp4'
        },
        {
          adId: "midroll-2-2",
          adSystem: "IDVx",
          adParameters: JSON.stringify({
            vast_config_url: "https://qa-get.truex.com/15c7f5269a09bd8c5007ba98263571dd80c458e5/vast/config?dimension_2=0&dimension_5=hilton&stream_position=preroll&stream_id=1234"
          }),
          duration: 2,
        },
        {
          adId: 'video-ad-2-3',
          adTitle: 'Sample Petcare Video Ad<',
          adSystem: 'mp4',
          adParameters: '',
          duration: 30,
          videoUrl: 'https://ctv.truex.com/assets/petcare-720p.mp4'
        },
      ],
    } satisfies AdBreakConfig,
  ],
} satisfies ExampleConfig;

export type AdBreakConfig = {
  breakId: string;
  breakType: "preroll" | "midroll"
  ads: AdConfig[],
  duration: number,  // seconds
  startTime: number, // seconds
  completed?: boolean,
  started?: boolean,
};

export type AdConfig = {
  adId: string,
  adTitle?: string,
  adSystem: string,
  adParameters: string,
  duration: number,
  videoUrl?: string,
};

export type ExampleConfig = {
  id: string,
  type: 'csai' | 'ssai',
  title: string;
  description: string;
  cover: string;
  videoUrl: string;
  adBreaks: AdBreakConfig[];
};
