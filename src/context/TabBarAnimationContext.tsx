import React, { createContext, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";

type TabBarAnimationContextValue = {
  animatedTranslateY: SharedValue<number>;
  hiddenOffset: SharedValue<number>;
};

const TabBarAnimationContext = createContext<TabBarAnimationContextValue | null>(null);

type TabBarAnimationProviderProps = {
  value: TabBarAnimationContextValue;
  children: React.ReactNode;
};

export function TabBarAnimationProvider({ value, children }: TabBarAnimationProviderProps) {
  return <TabBarAnimationContext.Provider value={value}>{children}</TabBarAnimationContext.Provider>;
}

export function useTabBarAnimation() {
  const ctx = useContext(TabBarAnimationContext);
  if (!ctx) {
    throw new Error("useTabBarAnimation must be used inside TabBarAnimationProvider");
  }
  return ctx;
}
