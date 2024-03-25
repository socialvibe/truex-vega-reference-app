
import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import {AppButton} from "./components/AppButton";

export const App = () => {
  const playMainVideo = () => {
  };

  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
      <View style={styles.backgroundOverlay}/>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>The true[X] Employee Experience</Text>
          <Text style={styles.subHeaderText}>
            Our mission is to provide the best advertising experience for consumers, the best monetization for
            premium publishers, and the best return for brand advertisers. Learn about our team and employee
            experience.
          </Text>
        </View>
        <AppButton onPress={playMainVideo} label={'Play'} style={styles.playButtonRow} defaultFocus={true}/>
        <AppButton onPress={() => {console.log('other pressed')}} label={'Other'} style={styles.playButtonRow}/>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    color: 'black',
    flex: 1,
    flexDirection: 'column',
  },
  backgroundOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    opacity: 0.2
  },
  container: {
    position: 'absolute',
    marginTop: 146,
    marginLeft: 60,
    flex: 6,
    flexDirection: 'column',
  },
  headerContainer: {
    width: '90%',
  },
  headerText: {
    color: 'white',
    fontSize: 60,
    marginBottom: 10,
  },
  subHeaderText: {
    color: 'white',
    fontSize: 30,
  },
  playButtonRow: {
    marginTop: 20,
  },
});
