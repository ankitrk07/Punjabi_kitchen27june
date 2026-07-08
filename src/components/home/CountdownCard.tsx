import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Reservation } from "../../context/AppContext";

const GOLD = "#C9A84C";
const WHITE = "#FFFFFF";

// Ranchi coordinates
const LATITUDE = 23.3441;
const LONGITUDE = 85.3096;

// Weather cache to avoid redundant fetching
const weatherCache: Record<string, { message: string; timestamp: number }> = {};
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseDateStr(resDate: string, resSlot: string): Date | null {
  try {
    // resDate: "July 12, 2026"
    // resSlot: "07:30 PM"
    const dateParts = resDate.replace(/,/g, "").trim().split(/\s+/);
    if (dateParts.length < 3) return null;

    const monthName = dateParts[0];
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    const monthIdx = MONTH_NAMES.indexOf(monthName);
    if (monthIdx === -1 || isNaN(day) || isNaN(year)) return null;

    const slotParts = resSlot.trim().split(/\s+/);
    if (slotParts.length < 2) return null;

    const timeParts = slotParts[0].split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const ampm = slotParts[1].toUpperCase();

    if (isNaN(hours) || isNaN(minutes)) return null;

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    return new Date(year, monthIdx, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

function formatDateToYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CountdownCard({
  reservations,
  onPressCard,
}: {
  reservations: Reservation[];
  onPressCard?: () => void;
}) {
  const [activeRes, setActiveRes] = useState<Reservation | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [countdownText, setCountdownText] = useState("");
  const [weatherText, setWeatherText] = useState<string | null>(null);

  // Reanimated opacities for the gradients
  const opacitySlate = useSharedValue(0);
  const opacityGray = useSharedValue(0);
  const opacityAmber = useSharedValue(0);
  const opacityGold = useSharedValue(0);

  // Candlelight flicker animation for Day-of
  const flickerVal = useSharedValue(0.75);

  // Find the next upcoming active reservation
  useEffect(() => {
    const active = reservations.filter((r) => r.status === "Active");
    if (active.length === 0) {
      setActiveRes(null);
      return;
    }

    const now = new Date();
    const upcoming = active
      .map((r) => {
        const parsedDate = parseDateStr(r.reservationDate, r.reservationSlot);
        return { reservation: r, parsedDate };
      })
      .filter((item) => item.parsedDate !== null && item.parsedDate.getTime() > now.getTime())
      .sort((a, b) => (a.parsedDate as Date).getTime() - (b.parsedDate as Date).getTime());

    if (upcoming.length > 0) {
      const next = upcoming[0];
      setActiveRes(next.reservation);

      const target = next.parsedDate as Date;
      const diffMs = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Calculate exact day difference
      const todayYMD = formatDateToYMD(now);
      const targetYMD = formatDateToYMD(target);

      if (todayYMD === targetYMD) {
        setDaysRemaining(0);
        setCountdownText("Today — see you tonight!");
      } else {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (formatDateToYMD(tomorrow) === targetYMD) {
          setDaysRemaining(1);
          setCountdownText("Tomorrow");
        } else {
          setDaysRemaining(diffDays);
          setCountdownText(`${diffDays} days until your table is ready`);
        }
      }
    } else {
      setActiveRes(null);
    }
  }, [reservations]);

  // Handle gradient opacities based on daysRemaining
  useEffect(() => {
    if (daysRemaining === null) return;

    // Cross-fade gradients using springs or smooth timing
    opacitySlate.value = withTiming(daysRemaining >= 7 ? 1 : 0, { duration: 600 });
    opacityGray.value = withTiming(daysRemaining >= 3 && daysRemaining < 7 ? 1 : 0, { duration: 600 });
    opacityAmber.value = withTiming(daysRemaining >= 1 && daysRemaining < 3 ? 1 : 0, { duration: 600 });
    opacityGold.value = withTiming(daysRemaining === 0 ? 1 : 0, { duration: 600 });

    // Looping candle flicker on day-of
    if (daysRemaining === 0) {
      flickerVal.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 300 }),
          withTiming(0.65, { duration: 200 }),
          withTiming(0.85, { duration: 250 }),
          withTiming(0.55, { duration: 350 })
        ),
        -1,
        true
      );
    } else {
      flickerVal.value = 1;
    }
  }, [daysRemaining]);

  // Fetch forecast weather using Open-Meteo
  useEffect(() => {
    if (!activeRes || daysRemaining === null) {
      setWeatherText(null);
      return;
    }

    // Only forecast within 7-10 days
    if (daysRemaining > 9) {
      setWeatherText(null);
      return;
    }

    const parsedDate = parseDateStr(activeRes.reservationDate, activeRes.reservationSlot);
    if (!parsedDate) return;

    const ymd = formatDateToYMD(parsedDate);
    const cached = weatherCache[ymd];
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
      setWeatherText(cached.message);
      return;
    }

    // Query weather API
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max&timezone=Asia%2FKolkata&forecast_days=10`
        );
        const data = await res.json();
        if (!data || !data.daily) return;

        const timeArr: string[] = data.daily.time;
        const dateIdx = timeArr.indexOf(ymd);
        if (dateIdx !== -1) {
          const temp = Math.round(data.daily.temperature_2m_max[dateIdx]);
          const code = data.daily.weather_code[dateIdx];

          let message = `Expect around ${temp}°C at your reservation time`;
          if (code === 0 || code === 1) {
            message = `Clear skies, ${temp}°C expected — lovely night for dining.`;
          } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
            message = `Rain expected around your reservation time — we'll keep you warm and cozy.`;
          } else if ([2, 3, 45, 48].includes(code)) {
            message = `Overcast skies, ${temp}°C expected — dining in cozy warmth.`;
          } else if ([71, 73, 75, 77, 85, 86, 95, 96, 99].includes(code)) {
            message = `Thunderstorms expected — safe & warm inside with us.`;
          }

          weatherCache[ymd] = { message, timestamp: Date.now() };
          if (isMounted) {
            setWeatherText(message);
          }
        }
      } catch (e) {
        console.log("Failed to fetch weather forecast:", e);
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [activeRes, daysRemaining]);

  // Animated style for gradients crossfade
  const styleSlate = useAnimatedStyle(() => ({ opacity: opacitySlate.value }));
  const styleGray = useAnimatedStyle(() => ({ opacity: opacityGray.value }));
  const styleAmber = useAnimatedStyle(() => ({ opacity: opacityAmber.value }));
  const styleGold = useAnimatedStyle(() => ({ opacity: opacityGold.value }));

  // Candlelight pulsing effect style
  const styleFlicker = useAnimatedStyle(() => ({
    opacity: flickerVal.value * opacityGold.value,
  }));

  const getWeatherLottie = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("rain")) return require("../../../assets/rainy.json");
    if (lower.includes("clear") || lower.includes("sunny")) return require("../../../assets/sunny.json");
    if (lower.includes("overcast") || lower.includes("cloudy")) return require("../../../assets/cloudy.json");
    if (lower.includes("thunderstorm")) return require("../../../assets/stormy.json");
    return require("../../../assets/sunny.json");
  };

  if (!activeRes) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPressCard}
      style={styles.cardContainer}
    >
      {/* Background sheets overlay */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* 1. Slate blue (7+ days) */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styleSlate]}>
          <LinearGradient colors={["#0B0E14", "#1A2332"]} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        {/* 2. Transitional gray-gold (3-6 days) */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styleGray]}>
          <LinearGradient colors={["#18181A", "#2D281E"]} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        {/* 3. Warm amber (1-2 days) */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styleAmber]}>
          <LinearGradient colors={["#1E120A", "#42220F"]} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        {/* 4. Day-of gold/candlelight (0 days) */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styleGold]}>
          <LinearGradient colors={["#2E1B05", "#7A4A0A"]} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        {/* Flickering glow layer */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styleFlicker, styles.flickerLayer]} />
      </View>

      {/* Content wrapper */}
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Ionicons name="calendar" size={12} color={GOLD} />
            <Text style={styles.badgeText}>UPCOMING RESERVATION</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={WHITE} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <LottieView
            source={require("../../../assets/cittie.json")}
            autoPlay
            loop
            style={{ width: 56, height: 56 }}
          />
          <Text style={[styles.countdownTitle, { flex: 1 }]}>{countdownText}</Text>
        </View>

        <Text style={[styles.detailsText, { marginTop: 4 }]}>
          {activeRes.guests} Guests  ·  {activeRes.reservationDate}  ·  {activeRes.reservationSlot}
          {activeRes.occasion && activeRes.occasion !== "None" ? `  ·  ${activeRes.occasion}` : ""}
        </Text>

        {weatherText && (
          <View style={styles.weatherBox}>
            <View style={styles.weatherHeader}>
              <Text style={styles.weatherHeaderTitle}>LOCAL WEATHER ADVISORY</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
              <LottieView
                source={getWeatherLottie(weatherText)}
                autoPlay
                loop
                style={{ width: 34, height: 34 }}
              />
              <Text style={[styles.weatherText, { flex: 1 }]}>{weatherText}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.22)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  flickerLayer: {
    backgroundColor: "rgba(255, 180, 50, 0.15)",
  },
  cardContent: {
    padding: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  badgeText: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  countdownTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  detailsText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
    fontWeight: "500",
  },
  weatherBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.15)",
    gap: 6,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherHeaderTitle: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  weatherText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11.5,
    fontWeight: "600",
    lineHeight: 16,
  },
});
