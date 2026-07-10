import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  onScroll?: any;
  scrollable?: boolean;
};

const ScreenHeader = memo(function ScreenHeader({ title, children, backHref, onScroll, scrollable = true }: Props) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }
    if (backHref) {
      router.replace(backHref as any);
      return;
    }
    router.replace("/(tabs)/home");
  }, [router, backHref]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconBtn}
          testID="back-btn"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.gold} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      {scrollable ? (
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          alwaysBounceVertical={true}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          overScrollMode="always"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </Animated.ScrollView>
      ) : (
        <View style={styles.scrollView}>{children}</View>
      )}
    </SafeAreaView>
  );
});

export default ScreenHeader;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollView: { flex: 1, backgroundColor: colors.bg },
  header: { height: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderGold },
  title: { flex: 1, color: "#FFF", fontSize: 18, fontWeight: "700", textAlign: "center" },
  scrollView: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: 16, paddingBottom: 160, backgroundColor: colors.bg },
});


