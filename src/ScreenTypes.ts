import { ExampleConfig } from "./ExampleData"

export enum Screens {
  DEFAULT_SCREEN = 'Home',
  CSAI_PLAYBACK_SCREEN = 'PlaybackCSAI',
  SSAI_PLAYBACk_SCREEN = 'PlaybackSSAI',
}

export type ScreenParamsList = {
  [Screens.DEFAULT_SCREEN]: { examples: ExampleConfig[] },
  [Screens.CSAI_PLAYBACK_SCREEN]: { content: ExampleConfig },
  [Screens.SSAI_PLAYBACk_SCREEN]: { content: ExampleConfig },
};

