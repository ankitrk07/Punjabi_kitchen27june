import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function IconSymbol({
  name,
  size = 24,
  color = '#000',
  style,
}: IconSymbolProps) {
  return (
    <Ionicons
      name={name as any}
      size={size}
      color={color}
      style={style}
    />
  );
}
