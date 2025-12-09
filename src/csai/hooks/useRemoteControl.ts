import { useEffect, useRef } from 'react';
import { useTVEventHandler } from '@amazon-devices/react-native-kepler';
import { SeekConfig } from '../types';
import { SeekAccumulator } from '../SeekAccumulator';

interface UseRemoteControlConfig {
  enabled: boolean;
  seekConfig: SeekConfig;
  onSeek: (seekDelta: number) => void;
}

export function useRemoteControl({ enabled, seekConfig, onSeek }: UseRemoteControlConfig) {
  const seekAccumulator = useRef<SeekAccumulator | null>(null);

  useEffect(() => {
    // Initialize seek accumulator
    seekAccumulator.current = new SeekAccumulator(
      {
        seekDelta: seekConfig.seekDelta,
        accumulationWindow: seekConfig.accumulationWindow,
      },
      onSeek
    );

    return () => {
      seekAccumulator.current?.destroy();
    };
  }, [seekConfig.seekDelta, seekConfig.accumulationWindow, onSeek]);

  // Use TV event handler from Amazon Kepler
  useTVEventHandler((evt: any) => {
    if (!enabled) return;

    const { eventType } = evt;

    // Handle arrow key presses
    switch (eventType) {
      case 'right':
        seekAccumulator.current?.registerSeek('forward');
        break;
      case 'left':
        seekAccumulator.current?.registerSeek('backward');
        break;
    }
  });

  function registerSeek(direction: 'forward' | 'backward') {
    if (enabled) {
      seekAccumulator.current?.registerSeek(direction);
    }
  }

  return {
    registerSeek,
  };
}
