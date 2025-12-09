import { KeplerMediaControlHandler } from '@amazon-devices/react-native-w3cmedia';
import { IMediaSessionId, ITimeValue } from '@amazon-devices/kepler-media-controls';

/**
 * Provides a control handler that blocks all play/pause/seek user actions to the player.
 * This allows the PlaybackScreen to freely control the player on its own, with its own
 * custom seeks and timeline display.
 */
export class PlayerControlsBlocker extends KeplerMediaControlHandler {
  handleFastForward(sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handlePause(sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handlePlay(sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handleRewind(sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handleSeek(position: ITimeValue, sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handleSkipBackward(delta: ITimeValue, sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handleSkipForward(delta: ITimeValue, sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }

  handleTogglePlayPause(sessionId: IMediaSessionId | undefined): Promise<void> {
    return Promise.resolve(undefined);
  }
}

