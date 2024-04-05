import React from 'react';
import { Image, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import FocusableView from './FocusableView';
import backArrow from '../assets/back-arrow.png';

interface BackButtonProps {
  onPress: () => void;
  overrideStyle?: StyleProp<ViewStyle>;
  hasTVPreferredFocus: boolean
}

const BackButton = ({ onPress, overrideStyle, hasTVPreferredFocus }: BackButtonProps) => {
  return (
    <FocusableView
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[styles.backButtonContainer, overrideStyle]}
      focusedStyle={styles.backButtonFocus}
      onPress={onPress}>
      <Image source={backArrow} style={styles.backButtonImage} />
    </FocusableView>
  );
};

const styles = StyleSheet.create({
  backButtonImage: {
    height: 70,
    width: 70,
    resizeMode: 'contain',
    tintColor: 'white',
  },
  backButtonContainer: {
    padding: 25,
    alignItems: 'center',
    flexDirection: 'row',
    width: 125,
  },
  backButtonFocus: {
    backgroundColor: 'darkgray',
    borderRadius: 70,
  },
});

export default BackButton;
