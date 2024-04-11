import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@amzn/react-navigation__native';
import { createStackNavigator } from '@amzn/react-navigation__stack';
import HomeScreen from './HomeScreen';
import PlaybackScreen from './PlaybackScreen';

const Stack = createStackNavigator();

export const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Playback" component={PlaybackScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
