import React from 'react';
import { ScrollView, View, ViewStyle, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ParallaxScrollViewProps {
  headerBackgroundColor?: { light: string; dark: string };
  headerImage?: React.ReactNode;
  children?: React.ReactNode;
}

export default function ParallaxScrollView({
  headerBackgroundColor,
  headerImage,
  children,
}: ParallaxScrollViewProps) {
  const colorScheme = useColorScheme();
  const headerBg =
    headerBackgroundColor?.[colorScheme ?? 'light'] ?? '#f5f5f5';

  return (
    <ScrollView style={[styles.container, { backgroundColor: headerBg }]}>
      {headerImage && (
        <View style={styles.headerImageContainer}>
          {headerImage}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImageContainer: {
    height: 200,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
