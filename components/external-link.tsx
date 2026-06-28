import React from 'react';
import { TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(href)}
      style={styles.link}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: {
    alignItems: 'center',
  },
});
