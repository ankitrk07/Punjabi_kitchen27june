import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'link';
}

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  let textStyle: any = styles.default;
  if (type === 'title') {
    textStyle = [styles.default, styles.title];
  } else if (type === 'defaultSemiBold') {
    textStyle = [styles.default, styles.defaultSemiBold];
  } else if (type === 'link') {
    textStyle = [styles.default, styles.link];
  }

  const color = isDark ? '#fff' : '#000';

  return (
    <Text
      {...rest}
      style={[textStyle, { color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 14,
    lineHeight: 21,
  },
  defaultSemiBold: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
