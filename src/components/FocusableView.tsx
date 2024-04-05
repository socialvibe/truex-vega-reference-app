import React, {forwardRef, Ref, useImperativeHandle, useRef, useState} from 'react';
import {StyleProp, TouchableOpacity, TouchableOpacityProps, ViewStyle,} from 'react-native';

interface FocusableViewProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  onFocusChanged?: (hasFocus: boolean) => void;
  focusedStyle?: StyleProp<ViewStyle>;
  hasTVPreferredFocus?: boolean;
  focusableRef?: Ref<TouchableOpacity>;
  onPress?: () => void;
}

export type FocusableRef = {
  focus: () => void;
  blur: () => void;
};

export const FocusableView = forwardRef<FocusableRef, FocusableViewProps>((props, ref) => {
  const {children,
    onPress,
    onFocusChanged,
    style,
    focusedStyle,
    hasTVPreferredFocus,
    ...otherProps
  }: FocusableViewProps = props;

  const [hasFocus, setHasFocus] = useState(false);

  const focusHandler = (hasFocus: boolean) => {
    setHasFocus(hasFocus);
    onFocusChanged?.(hasFocus);
  };

  const touchableRef = useRef<TouchableOpacity|null>(null);

  // Expose focus/blur ability to callers
  useImperativeHandle(ref, () => ({
    focus: () => touchableRef.current?.focus(),
    blur: () => touchableRef.current?.blur()
  }));

  return (
    <TouchableOpacity
      ref={touchableRef}
      activeOpacity={1}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={() => focusHandler(true)}
      onBlur={() => focusHandler(false)}
      onPress={onPress}
      style={[style, hasFocus ? focusedStyle : undefined]}
      {...otherProps}>
      {children}
    </TouchableOpacity>
  );
});

export default FocusableView;
