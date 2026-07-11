import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../src/theme";
import CustomTabBar, { TAB_BAR_HEIGHT } from "../../src/components/CustomTabBar";
import { TabBarAnimationProvider } from "../../src/context/TabBarAnimationContext";

import { useTabBarAnimation } from "../../src/context/TabBarAnimationContext";

export default function TabsLayout() {
  const { animatedTranslateY } = useTabBarAnimation();

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} animatedTranslateY={animatedTranslateY} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        lazy: true,
        freezeOnBlur: true,
        animation: "none",
      }}
    >
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menu",
            tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reserves"
          options={{
            title: "Reserves",
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
  );
}
