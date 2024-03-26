import {StyleSheet, Text, View} from "react-native";
import React from "react";
import {StackScreenProps} from "@amzn/react-navigation__stack";

export function PlaybackScreen({ navigation, route }: StackScreenProps<any>) {
  return (
    <View style={styles.playbackPage}>
      <Text style={styles.text}>This is the playback screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  playbackPage: {
    width: '100%',
    backgroundColor: 'black'
  },
  text: {
    fontSize: 30,
    color: 'white',
    marginLeft: 40,
    marginTop: 40
  }
});

export default PlaybackScreen;
