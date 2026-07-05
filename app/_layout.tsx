import { AppProvider } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";

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
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
