import React from 'react';
import {Image, ImageSourcePropType, StyleProp, StyleSheet, ViewStyle,} from 'react-native';
import FocusableView from './FocusableView';

interface PlayerButtonProps {
  onPress: () => void;
  icon: ImageSourcePropType;
  size: number;
  overrideStyle?: StyleProp<ViewStyle>;
}

export const PlayerButton = ({
  onPress,
  icon,
  size,
  overrideStyle,
}: PlayerButtonProps) => {
  return (
    <FocusableView
      style={[styles.buttonContainer, overrideStyle]}
      focusedStyle={[styles.buttonFocus, { borderRadius: size }]}
      onPress={onPress}>
      <Image
        style={[styles.button, { height: size, width: size }]}
        source={icon}
      />
    </FocusableView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 25,
    alignItems: 'center',
    flexDirection: 'row',
  },

  button: {
    resizeMode: 'contain',
    tintColor: 'white',
  },

  buttonFocus: {
    backgroundColor: 'darkgray'
  },
});

export default PlayerButton;
