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
  public contentTime: number;

  // The raw video timestamps are filled in when the ad playlist is set in the video controller.
  public startTime: number;
  public endTime: number;

  constructor(vmapJson: any) {
    this.id = vmapJson.breakId;
    this.duration = parseFloat(vmapJson.videoAdDuration);

    this.vastUrl = vmapJson.vastUrl;

    this.started = false;
    this.completed = false;

    this.contentTime = parseTimeLabel(vmapJson.timeOffset);
    this.startTime = 0;
    this.endTime = 0;
  }

  includesTime(streamTime: number): boolean {
    return this.startTime <= streamTime && streamTime <= this.endTime;
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
    adBreak.startTime = adBreak.contentTime + totalAdsDuration;
    adBreak.endTime = adBreak.startTime + adBreak.duration;
    totalAdsDuration += adBreak.duration;
  });

  return adPlaylist;
}

export function hasAdBreakAt(streamTime: number, adPlaylist: AdBreak[]) {
  const adBreak = getAdBreakAt(streamTime, adPlaylist);
  return !!adBreak;
}

export function getAdBreakAt(streamTime: number, adPlaylist: AdBreak[]) {
  if (adPlaylist) {
    for (const index in adPlaylist) {
      const adBreak = adPlaylist[index];
      if (adBreak.startTime <= streamTime && streamTime <= adBreak.endTime) {
        return adBreak;
      }
    }
  }
  return undefined;
}

export function getNextAdBreak(streamTime: number, adPlaylist: AdBreak[]) {
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
export function getVideoContentTimeAt(streamTime: number, adPlaylist: AdBreak[]): number {
  let result = streamTime;
  if (adPlaylist) {
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
  }
  return result;
}

export function getVideoStreamTimeAt(contentTime: number, adPlaylist: AdBreak[]): number {
  let result = contentTime;
  if (adPlaylist) {
    for (const index in adPlaylist) {
      const adBreak = adPlaylist[index];
      if (contentTime < adBreak.contentTime) break; // future ads don't affect things
      if (adBreak.contentTime < contentTime) {
        //The previous ad's duration is included in the stream time.
        result += adBreak.duration;
      }
    }
  }
  return result;
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

export function timeDebug(streamTime: number, adPlaylist: AdBreak[]) {
  const contentTime = getVideoContentTimeAt(streamTime, adPlaylist);
  return `${timeLabel(contentTime)} [${timeLabel(streamTime)}]`;
}
