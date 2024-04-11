// Parsed from JSON

export interface AdBreakConfig {
  breakId: string;
  contentTime: string; // e.g. HH:MM:SS
  duration: number; // seconds
  vastUrl: string;
}

export interface VideoStreamConfig {
  title: string;
  description: string;
  cover: string; // image url
  preview: string; // short video url
  stream: string; // main video url
  adBreaks: AdBreakConfig[];
}
