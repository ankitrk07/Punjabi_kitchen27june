import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ThemedView(props: ViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';

  return (
    <View
      {...props}
      style={[
        { backgroundColor },
        props.style,
      ]}
    />
  );
}
