import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import FocusableView from './FocusableView';

interface AppButtonProps {
  label: string;
  onPress: Function;
  hasTVPreferredFocus?: boolean;
  style?: StyleProp<ViewStyle> | undefined;
}

export function AppButton({ label, onPress, style, hasTVPreferredFocus }: AppButtonProps) {
  const [focused, setFocused] = useState<boolean | undefined>();
  return (
    <FocusableView
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[styles.button, focused && styles.focusedButton]}
      onPress={() => onPress()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <View style={styles.contentLayout}>
        <Text style={[styles.label, focused && styles.focusedLabel]}>{label}</Text>
      </View>
    </FocusableView>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 300,
    height: 80,
    lineHeight: 80,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#9EA3A3',
    opacity: 1
  },
  focusedButton: {
    backgroundColor: 'white'
  },
  contentLayout: {
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  label: {
    color: 'white',
    fontSize: 45
  },
  focusedLabel: {
    color: 'black'
  }
});

export default AppButton;
