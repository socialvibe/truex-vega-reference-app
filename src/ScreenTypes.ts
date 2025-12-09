import { ExampleConfig } from "./ExampleData"

export enum Screens {
  DEFAULT_SCREEN = 'Home',
  CSAI_PLAYBACK_SCREEN = 'PlaybackCSAI',
  CSAI_PLAYBACK_SCREEN_A = 'PlaybackCSAI_A',
  CSAI_PLAYBACK_SCREEN_B = 'PlaybackCSAI_B',
  SSAI_PLAYBACk_SCREEN = 'PlaybackSSAI',
}

export type ScreenParamsList = {
  [Screens.DEFAULT_SCREEN]: { examples: ExampleConfig[] },
  [Screens.CSAI_PLAYBACK_SCREEN]: { content: ExampleConfig },
  [Screens.CSAI_PLAYBACK_SCREEN_A]: { content: ExampleConfig },
  [Screens.CSAI_PLAYBACK_SCREEN_B]: { content: ExampleConfig },
  [Screens.SSAI_PLAYBACk_SCREEN]: { content: ExampleConfig },
};

// declare global {
//   namespace ReactNavigation {
//     interface RootParamList extends ScreenParamsList {}
//   }
// }
