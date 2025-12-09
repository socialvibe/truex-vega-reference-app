import React, { useEffect, useState } from 'react';
// import 'react-native-gesture-handler';
import { NavigationContainer } from '@amazon-devices/react-navigation__native';
import { createStackNavigator } from '@amazon-devices/react-navigation__stack';
import { HomeScreen } from './screens/HomeScreen';
import { ScreenParamsList, Screens } from './ScreenTypes';
import { loadExampleConfigurations } from './ExampleData';
import { CSAIPlaybackScreenA } from './screens/CSAIPlaybackScreenA';

const Stack = createStackNavigator<ScreenParamsList>();
const examples = loadExampleConfigurations();

export const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={Screens.DEFAULT_SCREEN}
          component={HomeScreen}
          initialParams={{ examples }}
        />
        <Stack.Screen
          name={Screens.CSAI_PLAYBACK_SCREEN}
          component={CSAIPlaybackScreenA}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
