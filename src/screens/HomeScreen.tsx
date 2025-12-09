import React, { useCallback, useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Image } from '@amazon-devices/react-native-kepler';
import { AppButton } from '../ui/AppButton';
import { StackScreenProps } from '@amazon-devices/react-navigation__stack';
import { ScreenParamsList, Screens } from '../ScreenTypes';

import background from '../assets/background.png';
import logo from '../assets/truex-vision-logo.png';

export function HomeScreen({ navigation, route }: StackScreenProps<ScreenParamsList, Screens.DEFAULT_SCREEN>) {
  function repeatRender(count: number, callback: (index: number) => React.ReactNode) {
    return Array(count).fill(null).map((value, index) => callback(index));
  }
  const examples = route.params.examples;

  console.log(` ----- truex -- contentList: ${JSON.stringify(examples)}`);

  useEffect(() => {
    console.log('*** home page mounted');
    return () => {
      console.log('*** home page unmounted');
    };
  }, []);


  return (
    <ImageBackground source={background} style={styles.background}>
      <View style={styles.backgroundOverlay} />
      <View style={styles.container}>
        <View>
          <Image source={logo} />
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>The true[X] Employee Experience</Text>
          <Text style={styles.subHeaderText}>
            Our mission is to provide the best advertising experience for consumers, the best monetization for
            premium publishers, and the best return for brand advertisers. Learn about our team and employee
            experience.
          </Text>
        </View>
        <AppButton
          onPress={() => navigation.navigate(Screens.CSAI_PLAYBACK_SCREEN, { content: examples?.[0] } )}
          label={'Play (Test Screen)'}
          style={styles.playButtonRow}
        />
        <View style={styles.movieTray}>
          <View style={[styles.tile, styles.selectedTile]}>
            <Image
              style={styles.selectedTile}
              source={{
                uri: 'https://stash.truex.com/reference-apps/scratch/truex_cover_placeholder_spaceneedle.png'
              }}
            />
          </View>
          {repeatRender(6, index => (
            <View key={index} style={styles.tile} />
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    color: 'black',
    flex: 1,
    flexDirection: 'column'
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
    flexDirection: 'column'
  },
  headerContainer: {
    marginTop: 40,
    width: '90%'
  },
  headerText: {
    color: 'white',
    fontSize: 60,
    marginBottom: 10
  },
  subHeaderText: {
    color: 'white',
    fontSize: 30
  },
  playButtonRow: {
    marginTop: 20
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
    height: 331
  },
  selectedTile: {
    width: 375,
    height: 526,
    marginLeft: 0
  }
});
