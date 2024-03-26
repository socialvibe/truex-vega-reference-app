
import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import {AppButton} from "./components/AppButton";
import {Image} from "@amzn/react-native-kepler";

export const App = () => {
  const playMainVideo = () => {
  };
  return (
    <ImageBackground
      source={require('./assets/background.png')}
      style={styles.background}>
      <View style={styles.backgroundOverlay}/>
      <View style={styles.container}>
        <View>
          <Image source={require('./assets/truex-vision-logo.png')}/>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>The true[X] Employee Experience</Text>
          <Text style={styles.subHeaderText}>
            Our mission is to provide the best advertising experience for consumers, the best monetization for
            premium publishers, and the best return for brand advertisers. Learn about our team and employee
            experience.
          </Text>
        </View>
        <AppButton onPress={playMainVideo} label={'Play'} style={styles.playButtonRow} defaultFocus={true}/>
        <View style={styles.movieTray}>
          <View style={[styles.tile, styles.selectedTile]}>
            <Image style={styles.selectedTile}
              source={{uri: 'https://stash.truex.com/reference-apps/scratch/truex_cover_placeholder_spaceneedle.png'}}/>
          </View>
          {(() => {
            const tiles = [];
            for(var i = 0; i < 6; i++) {
              tiles.push((
                <View key={i} style={styles.tile}/>
              ));
            }
            return tiles;
          })()}
        </View>
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
    marginTop: 20,
    marginLeft: 60,
    flex: 6,
    flexDirection: 'column',
  },
  headerContainer: {
    marginTop: 40,
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
  movieTray: {
    marginTop: 80,
    flexDirection: 'row'
  },
  tile: {
    verticalAlign: 'top',
    backgroundColor: '#6B6B6B',
    marginLeft: 50,
    width: 220,
    height: 331,
  },
  selectedTile: {
    width: 375,
    height: 526,
    marginLeft: 0
  },
});
