/**
 * Describes a single ad break that maps to 1 or more fallback ad videos in the main video
 * (ads are assumed to be sitched in), that furthermore describes a true[X] interactive ad to show
 * over top of the main video when the ad break is encountered during playback.
 */

export class AdBreak {
  public id: string;
  public duration: number;
  public vastUrl: string;

  public started: boolean;
  public completed: boolean;

  // The main video time the ad break is to be shown
  public displayTimeOffset: number;

  // The raw video timestamps are filled in when the ad playlist is set in the video controller.
  public startTime: number;
  public endTime: number;

  constructor(vmapJson: any) {
    this.id = vmapJson.breakId;
    this.duration = parseFloat(vmapJson.videoAdDuration);

    this.vastUrl = vmapJson.vastUrl;

    this.started = false;
    this.completed = false;

    this.displayTimeOffset = parseTimeLabel(vmapJson.timeOffset);
    this.startTime = 0;
    this.endTime = 0;
  }
}

function parseTimeLabel(label: string): number {
  if (!label) return 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  const parts = label.split(':');
  if (parts.length >= 3) {
    hours = parseFloat(parts[0]);
    minutes = parseFloat(parts[1]);
    seconds = parseFloat(parts[2]);
  } else if (parts.length == 2) {
    minutes = parseFloat(parts[0]);
    seconds = parseFloat(parts[1]);
  } else {
    seconds = parseFloat(parts[0]);
  }
  return seconds + minutes * 60 + hours * 60 * 60;
}

export function getAdPlaylist(vmap: object[]) {
  const adPlaylist = vmap?.map((vmapJson: any) => new AdBreak(vmapJson)) || [];

  // Correct ad display times into raw video times for the actual time in the overall video.
  let totalAdsDuration = 0;
  adPlaylist.forEach(adBreak => {
    adBreak.startTime = adBreak.displayTimeOffset + totalAdsDuration;
    adBreak.endTime = adBreak.startTime + adBreak.duration;
    totalAdsDuration += adBreak.duration;
  });

  return adPlaylist;
}

export function hasAdBreakAt(rawVideoTime: number, adPlaylist: AdBreak[]) {
  const adBreak = getAdBreakAt(rawVideoTime, adPlaylist);
  return !!adBreak;
}

export function getAdBreakAt(streamTime: number, adPlaylist: AdBreak[]) {
  if (adPlaylist) {
    for (const index in adPlaylist) {
      const adBreak = adPlaylist[index];
      if (adBreak.startTime <= streamTime && streamTime < adBreak.endTime) {
        return adBreak;
      }
    }
  }
  return undefined;
}

export function getNextAdBreakAfter(streamTime: number, adPlaylist: AdBreak[]) {
  if (adPlaylist) {
    for (const index in adPlaylist) {
      const adBreak = adPlaylist[index];
      if (adBreak.endTime < streamTime) continue; // ad break is before
      if (streamTime <= adBreak.startTime) return adBreak;
    }
  }
  return undefined;
}

// We assume ad videos are stitched into the main video.
export function getContentVideoTimeAt(streamTime: number, adPlaylist: AdBreak[]) {
  let result = streamTime;
  for (const index in adPlaylist) {
    const adBreak = adPlaylist[index];
    if (streamTime < adBreak.startTime) break; // future ads don't affect things
    if (adBreak.startTime <= streamTime && streamTime <= adBreak.endTime) {
      // We are within the ad, show the ad time.
      return streamTime - adBreak.startTime;
    } else if (adBreak.endTime <= streamTime) {
      // Discount the ad duration.
      result -= adBreak.duration;
    }
  }
  return result;
}

export function timeDebugDisplay(streamTime: number, adPlaylist: AdBreak[]) {
  const displayTime = getContentVideoTimeAt(streamTime, adPlaylist);
  return `${timeLabel(displayTime)} (raw: ${timeLabel(streamTime)})`;
}

export function timeLabel(time: number): string {
  if (time < 0) return "-1";

  const seconds = time % 60;
  time /= 60;
  const minutes = time % 60;
  time /= 60;
  const hours = time;

  const result = pad(minutes) + ':' + pad(seconds);
  if (hours >= 1) return Math.floor(hours) + ':' + result;
  return result;
}

export function pad(value: number): string {
  value = Math.floor(value || 0);
  return value < 10 ? '0' + value : value.toString();
}

export function percentageSize(time: number, duration: number): `${number}%` {
  const result = duration > 0 ? (time / duration) * 100 : 0;
  return `${result}%`;
}
