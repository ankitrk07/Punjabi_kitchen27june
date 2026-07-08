import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import type { Reservation } from "../../context/AppContext";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const WHITE = "#FFFFFF";

interface AnniversaryBannerProps {
  reservations: Reservation[];
  onPrefill: (pastRes: Reservation) => void;
}

export function AnniversaryBanner({ reservations, onPrefill }: AnniversaryBannerProps) {
  const router = useRouter();
  const [matchingRes, setMatchingRes] = useState<Reservation | null>(null);
  const [mode, setMode] = useState<"exact" | "upcoming" | null>(null);
  const [hasBookedAlready, setHasBookedAlready] = useState(false);
  const [daysCount, setDaysCount] = useState(0);

  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function parseSimpleDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.replace(/,/g, "").trim().split(/\s+/);
      if (parts.length < 3) return null;
      const monthIdx = MONTH_NAMES.indexOf(parts[0]);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (monthIdx === -1 || isNaN(day) || isNaN(year)) return null;
      return new Date(year, monthIdx, day);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find past reservations with occasion equal to Anniversary or Birthday
    const pastCelebrations = reservations.filter(
      (r) => r.occasion === "Anniversary" || r.occasion === "Birthday"
    );

    if (pastCelebrations.length === 0) {
      setMatchingRes(null);
      setMode(null);
      setHasBookedAlready(false);
      return;
    }

    // Sort by chronological day of year so we find the closest matching past celebration
    for (const r of pastCelebrations) {
      const d = parseSimpleDate(r.reservationDate);
      if (!d) continue;

      const isSameMonth = d.getMonth() === today.getMonth();
      const isSameDay = d.getDate() === today.getDate();

      let targetMode: "exact" | "upcoming" | null = null;
      let diffDays = 0;

      if (isSameMonth && isSameDay) {
        targetMode = "exact";
      } else {
        // Check if anniversary/birthday is within the next 3 days
        const targetThisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());
        const diffMs = targetThisYear.getTime() - today.getTime();
        const calculatedDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (calculatedDays > 0 && calculatedDays <= 3) {
          targetMode = "upcoming";
          diffDays = calculatedDays;
        }
      }

      if (targetMode) {
        // 2. Check if the user already has an active reservation for this exact celebration date/occasion this year
        const activeCelebrationRes = reservations.find((ar) => {
          if (ar.status !== "Active" || ar.occasion !== r.occasion) return false;
          const ad = parseSimpleDate(ar.reservationDate);
          return (
            ad !== null &&
            ad.getFullYear() === today.getFullYear() &&
            ad.getMonth() === d.getMonth() &&
            ad.getDate() === d.getDate()
          );
        });

        setMatchingRes(r);
        setMode(targetMode);
        setDaysCount(diffDays);
        setHasBookedAlready(!!activeCelebrationRes);
        return;
      }
    }

    // No celebration matches found in the date window
    setMatchingRes(null);
    setMode(null);
    setHasBookedAlready(false);
  }, [reservations]);

  if (!matchingRes || !mode) return null;

  const occasion = matchingRes.occasion || "Anniversary";
  const formattedDate = matchingRes.reservationDate;

  // Determine Title and Message based on occasion, mode and booking state
  let title = "";
  let message = "";

  if (hasBookedAlready) {
    title = mode === "exact" ? `HAPPY ${occasion.toUpperCase()}!` : `UPCOMING ${occasion.toUpperCase()}`;
    if (occasion === "Anniversary") {
      message = mode === "exact"
        ? "Happy Anniversary! We are excited to host your celebration tonight!"
        : "Happy Anniversary! We look forward to hosting your celebration soon.";
    } else {
      message = mode === "exact"
        ? "Happy Birthday! We are excited to host your celebration tonight!"
        : "Happy Birthday! We look forward to hosting your celebration soon.";
    }
  } else {
    title = mode === "exact" ? `HAPPY ${occasion.toUpperCase()}!` : `${occasion.toUpperCase()} REMINDER`;
    if (occasion === "Anniversary") {
      message = mode === "exact"
        ? "Happy Anniversary! Book a table for your anniversary tonight."
        : `Upcoming Anniversary! Book a table to celebrate in ${daysCount} days.`;
    } else {
      message = mode === "exact"
        ? "Happy Birthday! Book a table for your birthday tonight."
        : `Upcoming Birthday! Book a table to celebrate in ${daysCount} days.`;
    }
  }

  const handlePress = () => {
    if (hasBookedAlready) {
      router.push("/(tabs)/reserves");
    } else {
      onPrefill(matchingRes);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.bannerContainer}
    >
      <LinearGradient
        colors={["rgba(201, 168, 76, 0.15)", "rgba(15, 11, 8, 0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.glowLayer, glowStyle]} />

      <View style={styles.content}>
        <View style={styles.leftCol}>
          <View style={styles.iconCircle}>
            <Ionicons name={occasion === "Anniversary" ? "gift" : "wine"} size={16} color="#000" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>

        {!hasBookedAlready && (
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>BOOK NOW</Text>
            <Ionicons name="arrow-forward" size={10} color="#000" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "rgba(201, 168, 76, 0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  glowLayer: {
    backgroundColor: "rgba(201, 168, 76, 0.04)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 12,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    color: GOLD,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  messageText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaBtnText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
