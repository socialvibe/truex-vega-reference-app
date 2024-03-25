/*
 * Copyright (c) 2022 Amazon.com, Inc. or its affiliates.  All rights reserved.
 *
 * PROPRIETARY/CONFIDENTIAL.  USE IS SUBJECT TO LICENSE TERMS.
 */

import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

interface AppButtonProps {
  label: string;
  onPress: Function;
  style?: StyleProp<ViewStyle> | undefined;
}

export const AppButton = ({label, onPress, style}: AppButtonProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.buttonContainer, focused && styles.focusedContainer, style]}
        onPress={() => onPress()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}>
        <View style={styles.contentLayout}>
          <Text style={[styles.label, focused && styles.focusedLabel]}>{label}</Text>
        </View>
      </TouchableOpacity>
    </>
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
  focusedContainer: {
    backgroundColor: 'white'
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
