
import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import {findNodeHandle, FocusManager, TouchableHighlight} from "@amzn/react-native-kepler";

interface AppButtonProps {
  label: string;
  onPress: Function;
  defaultFocus?: boolean;
  style?: StyleProp<ViewStyle> | undefined;
}

export function AppButton({label, onPress, style, defaultFocus}: AppButtonProps) {
  const [focused, setFocused] = useState<boolean | undefined>();

  const setDefaultFocus = useCallback((touchable: TouchableHighlight) => {
    if (defaultFocus && focused === undefined && touchable && !FocusManager.getFocused()) {
      // Only set the focus if not set yet. This way for competing defaultFocus=true props, the first one wins.
      const handle = findNodeHandle(touchable);
      setFocused(true);
      FocusManager.focus(handle);
    }
  }, [defaultFocus, setFocused, focused]);

  return (
    <TouchableHighlight
      ref={setDefaultFocus}
      style={[styles.buttonContainer, style]}
      underlayColor='white'
      onPress={() => onPress()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}>
      <View style={styles.contentLayout}>
        <Text style={[styles.label, focused && styles.focusedLabel]}>{label}</Text>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 300,
    height: 80,
    lineHeight: 80,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#9EA3A3',
    opacity: 1
  },
  contentLayout: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  label: {
    color: 'white',
    fontSize: 45,
  },
  focusedLabel: {
    color: 'black',
  }
});

export default AppButton;
