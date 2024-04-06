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

export function getAdPlaylist(vmap: object[]) {
    const adPlaylist = vmap.map((vmapJson: any) => new AdBreak(vmapJson));

    // Correct ad display times into raw video times for the actual time in the overall video.
    let totalAdsDuration = 0;
    adPlaylist.forEach(adBreak => {
        adBreak.startTime = adBreak.displayTimeOffset + totalAdsDuration;
        adBreak.endTime = adBreak.startTime + adBreak.duration;
        totalAdsDuration += adBreak.duration;
    });

    return adPlaylist;
}

function parseTimeLabel(label: string):number {
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
    return seconds + minutes*60 + hours*60*60;
}
