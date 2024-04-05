import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import PlayIcon from '../assets/play.png';
import PauseIcon from '../assets/pause.png';
import seekBackwardIcon from '../assets/seekBackward.png.png';
import seekForwardIcon from '../assets/seekForward.png.png';
import PlayerButton from './PlayerButton';
import {VideoPlayer} from '@amzn/react-native-w3cmedia';

export type VideoPlayerRef = React.MutableRefObject<VideoPlayer | null>;

export interface PlaybackControlProps {
  videoRef: VideoPlayerRef;
}

const PlayPauseButton = ({ videoRef }: PlaybackControlProps) => {
  const initalPlayingState = !videoRef.current?.paused && !videoRef.current?.ended;
  const [playing, setPlaying] = useState(initalPlayingState);

  useEffect(() => {
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);

    videoRef.current?.addEventListener('play', onPlay);
    videoRef.current?.addEventListener('pause', onPause);
    return () => {
      videoRef.current?.removeEventListener('play', onPlay);
      videoRef.current?.removeEventListener('pause', onPause);
    };
  });

  const pause = () => {
    videoRef?.current?.pause();
  };

  const play = () => {
    videoRef?.current?.play();
  };

  if (playing) {
    return <PlayerButton onPress={pause} icon={PauseIcon} size={70} />;
  } else {
    return <PlayerButton onPress={play} icon={PlayIcon} size={70} />;
  }
};

export function seek(seekSeconds: number, videoRef: VideoPlayerRef) {
  const video = videoRef.current;
  if (!video) return;
  if (video.currentTime >= 0) {
    const { currentTime, duration } = video;
    let newTime = currentTime + seekSeconds;
    if (newTime > duration) {
      newTime = duration;
    } else if (newTime < 0) {
      newTime = 0;
    }
    video.currentTime = newTime;
  }
}

export function seekForward(videoRef: VideoPlayerRef) {
  seek(10, videoRef);
}

export function seekBackward(videoRef: VideoPlayerRef) {
  seek(-10, videoRef);
}

export const PlaybackControls = ({ videoRef }: PlaybackControlProps) => {
  return (
    <View style={styles.playbackControls}>
      <PlayerButton onPress={() => seekBackward(videoRef)} icon={seekBackwardIcon} size={70}/>
      <PlayPauseButton videoRef={videoRef} />
      <PlayerButton onPress={() => seekForward(videoRef)} icon={seekForwardIcon} size={70}/>
    </View>
  );
};

const styles = StyleSheet.create({
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default PlaybackControls;
