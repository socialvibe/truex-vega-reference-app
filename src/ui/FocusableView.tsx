import React, { forwardRef, Ref, useImperativeHandle, useRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface FocusableViewProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  onFocusChanged?: (hasFocus: boolean) => void;
  hasTVPreferredFocus?: boolean;
  focusableRef?: Ref<TouchableOpacity>;
  onPress?: () => void;
}

export type FocusableRef = {
  focus: () => void;
  blur: () => void;
};

export const FocusableView = forwardRef<FocusableRef, FocusableViewProps>((props, ref) => {
  const { children, onPress, onFocusChanged, style, hasTVPreferredFocus, ...otherProps }: FocusableViewProps = props;

  const touchableRef = useRef<TouchableOpacity | null>(null);

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
      onFocus={() => onFocusChanged?.(true)}
      onBlur={() => onFocusChanged?.(false)}
      onPress={onPress}
      style={style}
      {...otherProps}
    >
      {children}
    </TouchableOpacity>
  );
});

export default FocusableView;
