import { StackScreenProps } from "@amazon-devices/react-navigation__stack";
import { ScreenParamsList, Screens } from "../ScreenTypes";
import { StyleSheet, View, Text, Button } from "react-native";
import React from "react";
import AppButton from "../ui/AppButton";

export function TestPlaybackScreen({ navigation, route }: StackScreenProps<ScreenParamsList, Screens.CSAI_PLAYBACK_SCREEN>) {
  const content = route.params.content;

  console.log(` ----- truex -- content: ${JSON.stringify(content)}`);

  return (
    <View style={styles.playerContainer}>
      <Text style={styles.playerPlaceholder}>{content?.videoUrl}</Text>
      <View style={styles.buttonContainer}>
        <AppButton label="Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: 100,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  playerPlaceholder: {
    color: 'white',
    fontSize: 30,
  },
});
