import { AppProvider } from "@/src/context/AppContext";
import { TabBarAnimationProvider } from "@/src/context/TabBarAnimationContext";
import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

// Keep the splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {});

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.gold,
    background: colors.bg,
    card: colors.bg,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.error,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
        <AppProvider>
          <ThemeProvider value={CustomDarkTheme}>
            <StatusBar style="light" backgroundColor={colors.bg} />
            <RootLayoutInner />
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutInner() {
  const insets = useSafeAreaInsets();
  const animatedTranslateY = useSharedValue(0);
  // Capsule height: 68, bottom offset: max(insets.bottom, 10) + 14, margin padding: 20
  const hiddenOffset = useSharedValue(68 + Math.max(insets.bottom, 10) + 14 + 20);

  useEffect(() => {
    hiddenOffset.value = 68 + Math.max(insets.bottom, 10) + 14 + 20;
  }, [insets.bottom]);

  return (
    <TabBarAnimationProvider value={{ animatedTranslateY, hiddenOffset }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: Platform.OS === "android" ? "fade" : "default",
          animationDuration: 150,
          gestureEnabled: Platform.OS === "ios" ? true : false,
          freezeOnBlur: true,
        }}
      />
    </TabBarAnimationProvider>
  );
}
