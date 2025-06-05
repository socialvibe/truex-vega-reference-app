import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const App = () => {
  useEffect(() => {
    console.log("*** test log: this should show only once");
    console.info("*** test info: this should show only once");
    console.warn("*** test warn: this should show only once");
    console.error("*** test error: this should show only once");
  }, []);

  return (
    <View style={styles.app}>
      <Text style={styles.text}>Hello world!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#444444',
    display: 'flex',
    flex: 1
  },
  text: {
    fontSize: 22,
    color: 'white'
  }
});
