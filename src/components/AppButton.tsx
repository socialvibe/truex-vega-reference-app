/*
 * Copyright (c) 2022 Amazon.com, Inc. or its affiliates.  All rights reserved.
 *
 * PROPRIETARY/CONFIDENTIAL.  USE IS SUBJECT TO LICENSE TERMS.
 */

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
    if (!touchable) console.log('*** setDefaultFocus: NO touchable: ' + label)
    else console.log('*** setDefaultFocus: HAS touchable: ' + label)

    const handle = findNodeHandle(touchable);
    if (defaultFocus && focused === undefined && touchable && handle) {
      // Only set the focus if not set yet. This way for competing defaultFocus=true props, the first one wins.
      console.log('*** setDefaultFocus: SET focus: ' + label);
      setFocused(true);
      FocusManager.focus(null);
      FocusManager.focus(handle);
    }
  }, [defaultFocus, setFocused, focused]);

  return (
    <View hasTVPreferredFocus={undefined}>
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
    </View>
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
