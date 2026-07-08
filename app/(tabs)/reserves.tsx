/**
 * Reserves.tsx
 *
 * Booking widget:
 *  - ALL TextInput fields replaced with custom tappable inputs that use
 *    a floating bottom-sheet style keyboard — no system rectangular box.
 *  - Name / Phone: tappable pill that opens a full-width bottom input row
 *    pinned above the keyboard (KeyboardAvoidingView) — styled completely.
 *  - Date: REAL-TIME FULL CALENDAR with month/year navigation
 *  - Guests: tappable pill selector (unchanged).
 *  - Time slots: chip grid (unchanged).
 */

import GoldDustLayer from "@/src/components/ui/GoldDustLayer";
import { useApp } from "@/src/context/AppContext";
import { useTabBarAnimation } from "@/src/context/TabBarAnimationContext";
import { useTabBarScrollHandler } from "@/src/hooks/useTabBarScrollHandler";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import Reanimated, { runOnUI, scrollTo, useAnimatedRef } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const GOLD_DIM = "rgba(201,168,76,0.12)";
const GOLD_SOFT = "rgba(201,168,76,0.08)";
const DARK_BG = "#080808";
const SURFACE = "#111111";
const SURFACE2 = "#161616";
const SURFACE3 = "#1e1e1e";
const MUTED = "#555555";
const WHITE = "#FFFFFF";

// ─── Animation-once flag (persists across tab switches, resets on hot reload) ─
let hasAnimatedOnce = false;


// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateTimeSlots(year: number, month: number, day: number): string[] {
  const now = new Date();
  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month &&
    now.getDate() === day;
  const nowHour = isToday ? now.getHours() + 1 : 0;

  const slots: string[] = [];
  for (let h = 11; h <= 14; h++) {
    if (h >= nowHour) {
      const label = h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
      const label2 = h < 12 ? `${h}:30 AM` : h === 12 ? "12:30 PM" : `${h - 12}:30 PM`;
      slots.push(label, label2);
    }
  }
  for (let h = 19; h <= 22; h++) {
    if (h >= nowHour) {
      slots.push(`${h - 12}:00 PM`);
      if (h < 22) slots.push(`${h - 12}:30 PM`);
    }
  }
  return slots;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const GUEST_OPTIONS = ["1", "2", "3", "4", "5", "6+"];

// Dummy pre-booked reservations for demo — key: "YYYY-MM-DD", value: booked slot strings
const DUMMY_RESERVATIONS: Record<string, string[]> = {
  // Current month
  [`2026-06-28`]: ["12:00 PM", "7:00 PM"],
  [`2026-06-29`]: ["1:00 PM", "8:00 PM", "9:00 PM"],
  [`2026-06-30`]: ["12:30 PM"],
  // Next month
  [`2026-07-01`]: ["11:00 AM", "7:30 PM"],
  [`2026-07-04`]: ["12:30 PM", "1:00 PM", "7:00 PM", "8:00 PM"],
  [`2026-07-05`]: ["11:30 AM", "9:00 PM", "9:30 PM"],
  [`2026-07-08`]: ["7:00 PM", "7:30 PM", "8:00 PM"],
  [`2026-07-10`]: ["12:00 PM", "1:00 PM", "8:30 PM"],
  [`2026-07-12`]: ["11:00 AM", "11:30 AM", "7:00 PM"],
  [`2026-07-15`]: ["1:00 PM", "8:00 PM", "9:00 PM", "9:30 PM"],
};

function getBookedSlots(year: number, month: number, day: number): string[] {
  const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return DUMMY_RESERVATIONS[key] ?? [];
}

function getBookedSlotsForDate(year: number, month: number, day: number, activeReservations: any[]): string[] {
  const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dateStr = `${MONTH_NAMES[month]} ${day}, ${year}`;
  const dummyBooked = DUMMY_RESERVATIONS[key] ?? [];

  const slots = generateTimeSlots(year, month, day);
  const fullyBookedFromApp = slots.filter(slot => {
    const tableCount = activeReservations.filter(
      r => r.status === "Active" && r.reservationDate === dateStr && r.reservationSlot === slot
    ).length;
    return tableCount >= 8;
  });

  return Array.from(new Set([...dummyBooked, ...fullyBookedFromApp]));
}

function getReservationToken(order: any, index: number) {
  const idSource = (order.id ?? `local-${index}`).toString();
  return `#${idSource.slice(-6).toUpperCase()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// InputModal — bottom-sheet style modal with a styled TextInput
// Appears when user taps a name/phone field pill
// ─────────────────────────────────────────────────────────────────────────────
function InputModal({
  visible,
  label,
  placeholder,
  value,
  keyboardType,
  maxLength,
  onClose,
  onChange,
}: {
  visible: boolean;
  label: string;
  placeholder: string;
  value: string;
  keyboardType?: any;
  maxLength?: number;
  onClose: () => void;
  onChange: (v: string) => void;
}) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0, friction: 9, tension: 70, useNativeDriver: true,
      }).start(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: 300, duration: 220, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1, justifyContent: "flex-end" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={modal.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[modal.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={modal.handle} />

          <Text style={modal.sheetLabel}>{label}</Text>

          {/* Styled input row — no visible system border */}
          <View style={modal.inputRow}>
            <TextInput
              ref={inputRef}
              style={modal.textInput}
              placeholder={placeholder}
              placeholderTextColor="#3a3a3a"
              value={value}
              onChangeText={onChange}
              keyboardType={keyboardType ?? "default"}
              maxLength={maxLength}
              returnKeyType="done"
              onSubmitEditing={onClose}
              underlineColorAndroid="transparent"
              selectionColor={GOLD}
              cursorColor={GOLD}
            />
            {value.length > 0 && (
              <TouchableOpacity onPress={() => onChange("")} style={modal.clearBtn}>
                <Ionicons name="close-circle" size={18} color={MUTED} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={modal.doneBtn} onPress={onClose}>
            <Text style={modal.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  sheet: {
    backgroundColor: SURFACE2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: `${GOLD}25`,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 20,
    paddingTop: 14,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: `${GOLD}30`,
    alignSelf: "center", marginBottom: 18,
  },
  sheetLabel: {
    color: GOLD, fontSize: 9, fontWeight: "800",
    letterSpacing: 2.5, marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${GOLD}30`,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    color: WHITE,
    fontSize: 16,
    fontWeight: "500",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  clearBtn: { padding: 4 },
  doneBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneBtnText: { color: "#1a0d0a", fontWeight: "900", fontSize: 14 },
});

// ─────────────────────────────────────────────────────────────────────────────
// TappableField — pill that shows current value, opens InputModal on tap
// ─────────────────────────────────────────────────────────────────────────────
function TappableField({
  label,
  value,
  placeholder,
  icon,
  error,
  modalLabel,
  modalPlaceholder,
  keyboardType,
  maxLength,
  onChange,
  inline,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  error?: string;
  modalLabel?: string;
  modalPlaceholder?: string;
  keyboardType?: any;
  maxLength?: number;
  onChange: (v: string) => void;
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pressAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  const onIn = () => Animated.spring(pressAnim, { toValue: 0.96, useNativeDriver: true, speed: 80 }).start();
  const onOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 80 }).start();

  return (
    <>
      {!inline && (
        <InputModal
          visible={open}
          label={modalLabel ?? label}
          placeholder={modalPlaceholder ?? placeholder}
          value={value}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onClose={() => setOpen(false)}
          onChange={onChange}
        />
      )}

      <View style={tf.wrap}>
        <Text style={tf.label}>{label}</Text>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          {inline ? (
            <TouchableOpacity
              onPressIn={onIn}
              onPressOut={onOut}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
              style={[tf.pill, error ? tf.pillError : null]}
            >
              <Ionicons name={icon as any} size={14} color={GOLD} />
              <TextInput
                ref={inputRef}
                style={[tf.pillText, !value && tf.pillPlaceholder]}
                placeholder={placeholder}
                placeholderTextColor="#888888"
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType ?? "default"}
                maxLength={maxLength}
                returnKeyType="done"
                onSubmitEditing={() => inputRef.current?.blur()}
                underlineColorAndroid="transparent"
                selectionColor={GOLD}
                cursorColor={GOLD}
              />
              {value.length > 0 && (
                <TouchableOpacity onPress={() => onChange("")} style={tf.clearBtn}>
                  <Ionicons name="close-circle" size={14} color={MUTED} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPressIn={onIn}
              onPressOut={onOut}
              onPress={() => setOpen(true)}
              activeOpacity={1}
              style={[tf.pill, error ? tf.pillError : null]}
            >
              <Ionicons name={icon as any} size={14} color={GOLD} />
              <Text style={[tf.pillText, !value && tf.pillPlaceholder]} numberOfLines={1}>
                {value || placeholder}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={`${GOLD}50`} />
            </TouchableOpacity>
          )}
        </Animated.View>
        {error ? <Text style={tf.errText}>{error}</Text> : null}
      </View>
    </>
  );
}

const tf = StyleSheet.create({
  wrap: { flex: 1 },
  label: {
    color: "#C9A84C", fontSize: 9, fontWeight: "800",
    letterSpacing: 1.5, marginBottom: 4,
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(201, 168, 76, 0.15)",
    paddingHorizontal: 8, paddingVertical: 5,
  },
  pillError: { borderColor: "#e85555" },
  pillText: {
    flex: 1, color: WHITE, fontSize: 11, fontWeight: "500",
  },
  pillPlaceholder: { color: "#888888" },
  errText: { color: "#e85555", fontSize: 10, marginTop: 4, letterSpacing: 0.3 },
  clearBtn: {
    padding: 2,
    marginLeft: 4,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME FULL CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
const CALENDAR_IMAGES = [
  require("../../assets/images/Jan.png"),
  require("../../assets/images/Feb.png"),
  require("../../assets/images/Mar.png"),
];

function FullCalendar({
  selected,
  onSelect,
  error,
}: {
  selected: { year: number; month: number; day: number } | null;
  onSelect: (d: { year: number; month: number; day: number }) => void;
  error?: string;
}) {
  const today = new Date();
  const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const bgImageSource = CALENDAR_IMAGES[weekIndex % 3];

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  const totalCells = 42;
  const offset = firstDayOfMonth;

  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < offset; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  const isPastDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayDate;
  };

  const isWithinLimit = (year: number, month: number) => {
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    const checkDate = new Date(year, month, 1);
    return checkDate <= maxDate;
  };

  const goToPreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newYear < today.getFullYear() || (newYear === today.getFullYear() && newMonth < today.getMonth())) {
      return;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    if (!isWithinLimit(newYear, newMonth)) {
      return;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleDateSelect = (day: number) => {
    if (!isPastDate(currentYear, currentMonth, day)) {
      onSelect({ year: currentYear, month: currentMonth, day });
    }
  };

  const isSelectedDate = (day: number) => {
    return selected?.year === currentYear &&
      selected?.month === currentMonth &&
      selected?.day === day;
  };

  const isToday = (day: number) => {
    return today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day;
  };

  const isPast = (day: number) => {
    return isPastDate(currentYear, currentMonth, day);
  };

  const canGoPrev = !(currentYear === today.getFullYear() && currentMonth === today.getMonth());

  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const rows: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    rows.push(calendarDays.slice(i, i + 7));
  }

  return (
    <View style={calendar.card}>
      <Image
        source={bgImageSource}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />
      {/* Dark overlay to adjust calendar background image darkness */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.45)", // Change 0.45 to adjust darkness (0.0 = transparent, 1.0 = solid black)
        }}
      />
      <Image
        source={require("../../assets/images/date.png")}
        style={calendar.dateTab}
        resizeMode="contain"
      />

      <View style={calendar.headerRow}>
        <View style={{ width: 85, height: 26 }} />

        <View style={calendar.headerHintRow}>
          <Text style={calendar.headerHint}>Pick your reservation day</Text>
          <Ionicons name="sparkles" size={12} color="#C9A84C" />
        </View>
      </View>

      <View style={calendar.navRow}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={[calendar.navBtn, !canGoPrev && calendar.navBtnDisabled]}
          disabled={!canGoPrev}
        >
          <Ionicons name="chevron-back" size={14} color={canGoPrev ? "#C9A84C" : "rgba(201,168,76,0.2)"} />
        </TouchableOpacity>

        <View style={calendar.monthYearContainer}>
          <Text style={calendar.monthYear}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>
          <Image
            source={require("../../assets/images/designBar.png")}
            style={calendar.designBar}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity onPress={goToNextMonth} style={calendar.navBtn}>
          <Ionicons name="chevron-forward" size={14} color="#C9A84C" />
        </TouchableOpacity>
      </View>

      <View style={calendar.weekdayRow}>
        {weekdays.map((day, index) => (
          <Text key={index} style={calendar.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={calendar.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={calendar.row}>
            {row.map((day, colIndex) => (
              <View key={colIndex} style={calendar.dayCell}>
                {day !== null ? (
                  <TouchableOpacity
                    onPress={() => handleDateSelect(day)}
                    disabled={isPast(day)}
                    style={[
                      calendar.dayBtn,
                      isPast(day) && calendar.dayBtnDisabled,
                    ]}
                  >
                    {isSelectedDate(day) && (
                      <Image
                        source={require("../../assets/images/ring.png")}
                        style={calendar.selectedRing}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={[
                      calendar.dayText,
                      isSelectedDate(day) && calendar.dayTextSelected,
                      isToday(day) && !isSelectedDate(day) && calendar.dayTextToday,
                      isPast(day) && calendar.dayTextDisabled,
                    ]}>
                      {day}
                    </Text>
                    {isSelectedDate(day) && (
                      <View style={calendar.selectedDot} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={calendar.dayPlaceholder} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {selected && (
        <Text style={calendar.selectedLabel}>
          Selected: {MONTH_NAMES[selected.month]} {selected.day}, {selected.year}
        </Text>
      )}
      {error ? <Text style={calendar.errText}>{error}</Text> : null}
    </View>
  );
}

const calendar = StyleSheet.create({
  card: {
    backgroundColor: "rgba(12, 12, 12, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    padding: 14,
    overflow: "hidden",
    position: "relative",
  },
  dateTab: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 106,
    height: 106 * (711 / 1523),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerHint: {
    color: "#C9A84C",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.35)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnDisabled: {
    borderColor: "rgba(201, 168, 76, 0.1)",
  },
  monthYearContainer: {
    alignItems: "center",
  },
  monthYear: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Palatino", android: "serif" }),
  },
  designBar: {
    width: 110,
    height: 110 * (219 / 1508),
    marginTop: 4,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    color: "#C9A84C",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBtn: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  selectedRing: {
    position: "absolute",
    width: "115%",
    height: "115%",
    alignSelf: "center",
  },
  selectedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#C9A84C",
    position: "absolute",
    bottom: 4,
  },
  dayBtnDisabled: {
    opacity: 0.55,
  },
  dayText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  dayTextSelected: {
    color: WHITE,
    fontWeight: "700",
  },
  dayTextToday: {
    color: "#C9A84C",
    fontWeight: "700",
  },
  dayTextDisabled: {
    color: "#888888",
  },
  dayPlaceholder: {
    flex: 1,
  },
  selectedLabel: {
    color: "#C9A84C",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
  errText: {
    color: "#e85555",
    fontSize: 10,
    marginTop: 6,
  },
});




// ─────────────────────────────────────────────────────────────────────────────
// BookingWidget
// ─────────────────────────────────────────────────────────────────────────────
function BookingWidget({ onSuccess, onValidationError }: { onSuccess: (data: any) => void, onValidationError?: () => void }) {
  const { reservations } = useApp();
  const fadeAnim = useRef(new Animated.Value(hasAnimatedOnce ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(hasAnimatedOnce ? 0 : 20)).current;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("2");
  const [customGuestCount, setCustomGuestCount] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Set selectedDate initially to null so slots do not appear on load
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const [selectedSlot, setSlot] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!hasAnimatedOnce) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 100, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate.year, selectedDate.month, selectedDate.day);
      setTimeSlots(slots);

      const booked = getBookedSlotsForDate(selectedDate.year, selectedDate.month, selectedDate.day, reservations);
      setBookedSlots(booked);
    } else {
      setTimeSlots([]);
      setBookedSlots([]);
    }
  }, [selectedDate, reservations]);

  const handleDateSelect = (d: { year: number; month: number; day: number }) => {
    setSelectedDate(d);
    setSlot(null);
    setSelectedTable(null);
    setErrors(p => ({ ...p, date: "", slot: "", table: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim() || phone.length < 10) e.phone = "Valid 10-digit phone required";
    if (!selectedDate) e.date = "Please pick a date";
    if (!selectedSlot) e.slot = "Please pick a time slot";
    if (!selectedTable) e.table = "Please select a table";
    setErrors(e);

    const hasError = !name.trim() || !phone.trim() || phone.length < 10 || !selectedDate || !selectedSlot || !selectedTable;
    if (hasError && onValidationError) {
      onValidationError();
    }
    return !hasError;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setSubmitted(true);
    const dateStr = selectedDate
      ? `${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`
      : "";

    setTimeout(() => {
      onSuccess({ name, phone, date: dateStr, guests, slot: selectedSlot, tableNumber: selectedTable });
      setSubmitted(false);
      setName(""); setPhone(""); setGuests("2");
      setSelectedDate(null); setSlot(null); setSelectedTable(null); setTimeSlots([]);
    }, 800);
  };

  return (
    <View style={{ width: "100%" }}>
      <Animated.View style={[widget.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Image
          source={require("../../assets/images/statsTopBG.png")}
          style={{
            position: "absolute",
            top: 0,
            left: 40,
            right: 0,
            width: "100%",
            height: 200,
            borderTopRightRadius: 24,
          }}
          resizeMode="cover"
        />
        <Image
          source={require("../../assets/images/statsBG.png")}
          style={{
            position: "absolute",
            left: 20,
            right: 0,
            bottom: 0,
            width: "100%",
            height: 100,
            borderBottomRightRadius: 24,
          }}
          resizeMode="cover"
        />
        {/* Title (Legend overlaying the top border) */}
        <View style={widget.titleRow}>
          <View style={widget.titleTextWrap}>
            <Text style={widget.title}>Book a Table</Text>
          </View>
        </View>



        {/* ── Name + Phone ── */}
        <View style={widget.row}>
          <TappableField
            label="YOUR NAME"
            value={name}
            placeholder="Full name"
            icon="person-outline"
            error={errors.name}
            modalLabel="YOUR NAME"
            modalPlaceholder="Enter your full name"
            inline
            onChange={(v) => { setName(v); setErrors(p => ({ ...p, name: "" })); }}
          />
          <TappableField
            label="PHONE"
            value={phone}
            placeholder="10-digit"
            icon="call-outline"
            error={errors.phone}
            modalLabel="PHONE NUMBER"
            modalPlaceholder="Enter 10-digit number"
            inline
            keyboardType="phone-pad"
            maxLength={10}
            onChange={(v) => { setPhone(v); setErrors(p => ({ ...p, phone: "" })); }}
          />
        </View>

        {/* ── Guests ── */}
        <View style={widget.sectionPad}>
          <Text style={widget.sectionLabel}>GUESTS</Text>
          <View style={widget.guestRow}>
            {GUEST_OPTIONS.map((g) => {
              const isSelected = guests === g || (g === "6+" && Number(guests) > 6);
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => {
                    if (g === "6+") {
                      setShowGuestModal(true);
                    } else {
                      setGuests(g);
                      setCustomGuestCount("");
                    }
                  }}
                  style={[widget.guestChip, isSelected && widget.guestChipActive]}
                >
                  <Text style={[widget.guestChipText, isSelected && widget.guestChipTextActive]}>
                    {g === "6+" && Number(guests) > 6 ? `${guests}` : g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {Number(guests) > 6 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
              <Ionicons name="information-circle-outline" size={13} color={GOLD} />
              <Text style={{ color: GOLD, fontSize: 10, fontWeight: "600" }}>Large party — we'll arrange extended seating for your group.</Text>
            </View>
          )}
        </View>

        {/* 6+ Guest Modal */}
        <InputModal
          visible={showGuestModal}
          label="NUMBER OF GUESTS"
          placeholder="Enter number (7-30)"
          value={customGuestCount}
          keyboardType="number-pad"
          maxLength={2}
          onClose={() => {
            setShowGuestModal(false);
            const num = parseInt(customGuestCount, 10);
            if (num && num >= 7 && num <= 30) {
              setGuests(String(num));
            } else if (customGuestCount) {
              setCustomGuestCount("");
            }
          }}
          onChange={setCustomGuestCount}
        />



        {/* ── Full Calendar Date Picker ── */}
        <View style={[widget.sectionPad, { borderTopWidth: 1, borderTopColor: "rgba(201,168,76,0.08)", paddingTop: 16 }]}>
          <FullCalendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            error={errors.date}
          />
        </View>

        {/* ── Time Slots ── */}
        {selectedDate && (
          <View style={[widget.sectionPad, { borderTopWidth: 1, borderTopColor: "rgba(201,168,76,0.08)", paddingTop: 16 }]}>
            <View style={widget.slotTitleRow}>
              <Ionicons name="time-outline" size={15} color={GOLD} />
              <Text style={widget.slotTitle}>SELECT TIME SLOT</Text>
            </View>

            {timeSlots.length === 0 ? (
              <View style={widget.slotHintWrap}>
                <Ionicons name="moon-outline" size={14} color={MUTED} />
                <Text style={widget.slotHint}>No slots available for this date</Text>
              </View>
            ) : (
              <>
                {/* Lunch slots */}
                {timeSlots.filter(s => s.includes("AM") || s.startsWith("12")).length > 0 && (
                  <>
                    <Text style={widget.slotSubLabel}>LUNCH SESSION  ·  11 AM – 3 PM</Text>
                    <View style={widget.slotsGrid}>
                      {timeSlots
                        .filter(s => s.includes("AM") || ["12:", "1:", "2:", "3:"].some(x => s.startsWith(x)))
                        .map((slot) => {
                          const isSel = selectedSlot === slot;
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <TouchableOpacity
                              key={slot}
                              onPress={() => { if (!isBooked) { setSlot(slot); setErrors(p => ({ ...p, slot: "" })); } }}
                              disabled={isBooked}
                              style={[widget.slotChip, isSel && widget.slotChipActive, isBooked && widget.slotChipBooked]}
                            >
                              <Text style={[widget.slotChipText, isSel && widget.slotChipTextActive, isBooked && widget.slotChipTextBooked]}>{slot}</Text>
                              {isSel && <Ionicons name="checkmark" size={11} color="#1a0d0a" style={{ marginLeft: 3 }} />}
                              {isBooked && <Text style={widget.bookedTag}>BOOKED</Text>}
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </>
                )}

                {/* Dinner slots */}
                {timeSlots.filter(s => s.includes("PM") && !["12:", "1:", "2:", "3:"].some(x => s.startsWith(x))).length > 0 && (
                  <>
                    <Text style={[widget.slotSubLabel, { marginTop: 22 }]}>DINNER SESSION  ·  7 PM – 10:30 PM</Text>
                    <View style={widget.slotsGrid}>
                      {timeSlots
                        .filter(s => s.includes("PM") && !["12:", "1:", "2:", "3:"].some(x => s.startsWith(x)))
                        .map((slot) => {
                          const isSel = selectedSlot === slot;
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <TouchableOpacity
                              key={slot}
                              onPress={() => { if (!isBooked) { setSlot(slot); setErrors(p => ({ ...p, slot: "" })); } }}
                              disabled={isBooked}
                              style={[widget.slotChip, isSel && widget.slotChipActive, isBooked && widget.slotChipBooked]}
                            >
                              <Text style={[widget.slotChipText, isSel && widget.slotChipTextActive, isBooked && widget.slotChipTextBooked]}>{slot}</Text>
                              {isSel && <Ionicons name="checkmark" size={11} color="#1a0d0a" style={{ marginLeft: 3 }} />}
                              {isBooked && <Text style={widget.bookedTag}>BOOKED</Text>}
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </>
                )}
              </>
            )}
            {errors.slot ? <Text style={widget.errText}>{errors.slot}</Text> : null}
          </View>
        )}

        {/* ── Table Selection Grid ── */}
        {selectedDate && selectedSlot && (
          <View style={[widget.sectionPad, { borderTopWidth: 1, borderTopColor: "rgba(201,168,76,0.08)", paddingTop: 16 }]}>
            <View style={widget.slotTitleRow}>
              <Ionicons name="grid-outline" size={15} color={GOLD} />
              <Text style={widget.slotTitle}>SELECT TABLE</Text>
            </View>
            <Text style={widget.slotSubLabel}>CHOOSE AN AVAILABLE TABLE SEAT</Text>

            <View style={tableStyle.tablesGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((tNum) => {
                const dateStr = selectedDate ? `${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}` : "";
                const dateKey = selectedDate ? `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}` : "";
                const isDummyBooked = DUMMY_RESERVATIONS[dateKey]?.includes(selectedSlot);
                const isBooked = isDummyBooked || reservations.some(
                  (r) => r.status === "Active" && r.reservationDate === dateStr && r.reservationSlot === selectedSlot && Number(r.tableNumber) === tNum
                );
                const isSel = selectedTable === tNum;

                return (
                  <TouchableOpacity
                    key={tNum}
                    disabled={isBooked}
                    onPress={() => {
                      setSelectedTable(tNum);
                      setErrors((p) => ({ ...p, table: "" }));
                    }}
                    style={[
                      tableStyle.tablePill,
                      isSel && tableStyle.tablePillActive,
                      isBooked && tableStyle.tablePillBooked
                    ]}
                  >
                    <Ionicons
                      name={isBooked ? "close-circle-outline" : isSel ? "checkmark-circle-outline" : "restaurant-outline"}
                      size={13}
                      color={isBooked ? "#ff8e8e" : isSel ? "#000" : GOLD}
                    />
                    <Text style={[
                      tableStyle.tablePillText,
                      isSel && tableStyle.tablePillTextActive,
                      isBooked && tableStyle.tablePillTextBooked
                    ]}>
                      Table {tNum}
                    </Text>
                    {isBooked ? (
                      <Text style={tableStyle.tableStatusTextBooked}>BOOKED</Text>
                    ) : (
                      <Text style={[tableStyle.tableStatusTextAvail, isSel && { color: "#000" }]}>VACANT</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.table ? <Text style={widget.errText}>{errors.table}</Text> : null}
          </View>
        )}

        {/* Confirm Booking Button (Positioned absolutely on the bottom border) */}
        <TouchableOpacity
          style={widget.confirmBtn}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#72571D", "#C5A03A", "#72571D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={widget.confirmBtnGradient}
          >
            <Text style={widget.confirmBtnText}>CONFIRM RESERVATION</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const confirmSheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#0d0d0d",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    paddingTop: 14,
    paddingHorizontal: 20,
    maxHeight: height * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(201, 168, 76, 0.3)",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    fontFamily: Platform.select({ ios: "Palatino", android: "serif" }),
    textAlign: "center",
  },
  sub: {
    color: "#C9A84C",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  scroll: {
    marginBottom: 10,
  },
  section: {
    marginBottom: 16,
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(201, 168, 76, 0.12)",
    backgroundColor: "#0d0d0d",
  },
  confirmBtn: {
    backgroundColor: "#C9A84C",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    backgroundColor: "rgba(201, 168, 76, 0.35)",
  },
  confirmBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
});

const widget = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.35)",
    marginTop: 40,
    marginBottom: 40, // Increased to provide spacing for bottom-overlapping button
    overflow: "visible", // Set to visible so top/bottom overlapping elements render correctly
    position: "relative",
    paddingTop: 70, // Keeps all form contents exactly in their original place
    paddingHorizontal: 16,
    paddingBottom: 45,
    ...Platform.select({
      ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 18 },
      android: { elevation: 8 },
    }),
  },
  titleRow: {
    position: "absolute",
    top: -22, // Places text exactly centered on the top border line
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100, // Highest zIndex
  },
  titleTextWrap: {
    backgroundColor: "#000000", // Black background covers the border line underneath
    paddingHorizontal: 24, // Increased padding
    paddingVertical: 6, // Increased padding
    borderRadius: 12, // Smoother rounded borders
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.4)",
  },
  title: {
    color: GOLD, // Gold text color
    fontSize: 26,
    fontFamily: Platform.select({ ios: "Snell Roundhand", android: "cursive" }),
    textAlign: "center",
  },
  titleUnderline: {
    width: 42,
    height: 2,
    backgroundColor: "#C9A84C",
    marginVertical: 4,
    alignSelf: "center",
  },
  titleSub: {
    color: "#C9A84C",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  confirmBtn: {
    position: "absolute",
    bottom: -21, // Center on bottom border (half of height 42)
    zIndex: 100, // Float over bottom border
    width: "80%", // Slightly larger width
    alignSelf: "center",
    borderRadius: 21, // Adjusted border radius
    height: 42, // Slightly larger height
    overflow: "hidden",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#000000",
    fontSize: 13.5, // Slightly larger font size
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  row: { flexDirection: "row", gap: 10, paddingHorizontal: 4, marginBottom: 8 },
  sectionPad: { paddingHorizontal: 4, marginBottom: 8 },
  sectionLabel: {
    color: "#C9A84C", fontSize: 9, fontWeight: "800",
    letterSpacing: 1.5, marginBottom: 4,
  },
  guestRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  guestChip: {
    flex: 1,
    height: 30, // Reduced from 42
    borderRadius: 6,
    backgroundColor: "rgba(14, 14, 14, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  guestChipActive: {
    backgroundColor: "#C9A84C",
    borderColor: "#C9A84C",
  },
  guestChipText: {
    color: "#777",
    fontSize: 11.5, // Reduced from 14
    fontWeight: "600",
  },
  guestChipTextActive: {
    color: "#000",
    fontWeight: "800",
  },
  slotTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  slotTitle: { color: GOLD, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  slotSubLabel: { color: WHITE, fontSize: 10.5, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  slotHintWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: GOLD_SOFT, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: `${GOLD}12`,
  },
  slotHint: { color: MUTED, fontSize: 10, flex: 1, lineHeight: 15 },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  slotChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: SURFACE2, borderRadius: 8,
    borderWidth: 1, borderColor: `${GOLD}20`,
    paddingHorizontal: 11, paddingVertical: 6.5,
  },
  slotChipActive: { backgroundColor: GOLD, borderColor: GOLD },
  slotChipBooked: { backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)", opacity: 0.5 },
  slotChipText: { color: MUTED, fontSize: 11, fontWeight: "600" },
  slotChipTextActive: { color: "#1a0d0a", fontWeight: "800" },
  slotChipTextBooked: { color: "#555", textDecorationLine: "line-through" as const },
  bookedTag: { fontSize: 7, fontWeight: "800" as const, color: "#e85555", letterSpacing: 1, marginLeft: 4 },
  errText: { color: "#e85555", fontSize: 10, marginTop: 6, letterSpacing: 0.3 },
});

// ─── Success Toast ────────────────────────────────────────────────────────────
function SuccessToast({ booking, onDismiss }: { booking: any; onDismiss: () => void }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start();
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={[toast.wrap, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
    }]}>
      <View style={toast.iconWrap}>
        <Ionicons name="checkmark-circle" size={22} color={GOLD} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={toast.heading}>Reservation Confirmed!</Text>
        <Text style={toast.sub}>
          {booking.guests} guest{booking.guests !== "1" ? "s" : ""} · {booking.slot} · {booking.date}
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={16} color={MUTED} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const toast = StyleSheet.create({
  wrap: {
    position: "absolute", top: 0, left: 16, right: 16,
    backgroundColor: "#161616",
    borderRadius: 14, borderWidth: 1, borderColor: `${GOLD}35`,
    padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
    zIndex: 999,
    ...Platform.select({
      ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 14 },
      android: { elevation: 10 },
    }),
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: GOLD_DIM, alignItems: "center", justifyContent: "center",
  },
  heading: { color: WHITE, fontSize: 13, fontWeight: "800", marginBottom: 2 },
  sub: { color: MUTED, fontSize: 11, letterSpacing: 0.2 },
});

function TokenDetailsModal({
  visible,
  token,
  customerName,
  onClose,
}: {
  visible: boolean;
  token: string;
  customerName: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tokenModal.backdrop} />
      </TouchableWithoutFeedback>

      <View style={tokenModal.centerWrap} pointerEvents="box-none">
        <View style={tokenModal.card}>
          <Text style={tokenModal.kicker}>RESERVATION TOKEN</Text>
          <Text style={tokenModal.name} numberOfLines={1}>{customerName}</Text>
          <Text style={tokenModal.tokenValue}>{token}</Text>
          <TouchableOpacity style={tokenModal.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={tokenModal.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const tokenModal = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}30`,
    padding: 20,
    alignItems: "center",
  },
  kicker: {
    color: `${GOLD}CC`,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },
  name: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
    fontFamily: Platform.select({ ios: "Palatino", android: "serif" }),
  },
  tokenValue: {
    color: GOLD_LIGHT,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 18,
  },
  closeBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  closeText: {
    color: "#1a0d0a",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});

function CancelReservationModal({
  visible,
  customerName,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  customerName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={cancelModal.backdrop} />
      </TouchableWithoutFeedback>

      <View style={cancelModal.centerWrap} pointerEvents="box-none">
        <View style={cancelModal.card}>
          <Text style={cancelModal.kicker}>CANCEL RESERVATION</Text>
          <Text style={cancelModal.name} numberOfLines={1}>{customerName}</Text>
          <Text style={cancelModal.message}>Are you sure you want to cancel this reservation?</Text>

          <View style={cancelModal.actionsRow}>
            <TouchableOpacity style={cancelModal.secondaryBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={cancelModal.secondaryText}>Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cancelModal.dangerBtn} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={cancelModal.dangerText}>Yes, Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const cancelModal = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}30`,
    padding: 20,
  },
  kicker: {
    color: "#ff9f9f",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 10,
  },
  name: {
    color: WHITE,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 10,
    fontFamily: Platform.select({ ios: "Palatino", android: "serif" }),
    fontStyle: "italic",
  },
  message: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${GOLD}25`,
    backgroundColor: SURFACE2,
    paddingVertical: 11,
    alignItems: "center",
  },
  secondaryText: {
    color: `${GOLD}CC`,
    fontSize: 13,
    fontWeight: "700",
  },
  dangerBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,110,110,0.35)",
    backgroundColor: "rgba(255,110,110,0.12)",
    paddingVertical: 11,
    alignItems: "center",
  },
  dangerText: {
    color: "#ff9f9f",
    fontSize: 13,
    fontWeight: "800",
  },
});

// ─── ReserveCard ──────────────────────────────────────────────────────────────
function ReserveCard({
  order,
  index,
  onViewDetails,
  onCancel,
}: {
  order: any;
  index: number;
  onViewDetails: (order: any, index: number) => void;
  onCancel: (order: any) => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 7, tension: 60, delay: index * 100, useNativeDriver: true }).start();
  }, []);

  const onIn = () => Animated.spring(press, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  const onOut = () => Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 60 }).start();

  const dateObj = new Date(order.createdAt ?? Date.now());
  const dateLine =
    order.reservationDate ??
    dateObj.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeLine =
    order.reservationSlot ??
    dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const customerName = order.customerName ?? order.name ?? "Guest";
  const guestCount =
    order.guestCount ??
    (Array.isArray(order.items) ? order.items.length : Number.parseInt(order.guests ?? "1", 10) || 1);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) },
        { scale: press },
      ],
      marginBottom: 14,
    }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onViewDetails(order, index)}
        onPressIn={onIn} onPressOut={onOut}
        activeOpacity={1}
        testID={`reserve-${order.id}`}
      >
        <View style={[styles.bracket, styles.bTL]} />
        <View style={[styles.bracket, styles.bTR]} />
        <View style={[styles.bracket, styles.bBL]} />
        <View style={[styles.bracket, styles.bBR]} />
        <View style={styles.cardTopBar} />
        <View style={styles.cardHead}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="calendar" size={16} color={GOLD} />
          </View>
          <View style={styles.cardIdentity}>
            <Text style={styles.cardTitle}>Reservation Details</Text>
            <Text style={styles.cardName} numberOfLines={1}>{customerName}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>CONFIRMED</Text>
          </View>
        </View>
        <View style={styles.tearRow}>
          <View style={styles.tearNotchL} />
          <View style={styles.tearLine} />
          <View style={styles.tearNotchR} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{dateLine}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>TIME & TABLE</Text>
            <Text style={styles.infoValue}>{timeLine}  ·  Table {order.tableNumber || 1}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>GUESTS</Text>
            <View style={styles.guestRow}>
              {Array.from({ length: Math.min(guestCount, 5) }).map((_, i) => (
                <Ionicons key={i} name="person" size={12} color={GOLD} style={{ marginRight: 2 }} />
              ))}
              {guestCount > 5 && <Text style={styles.guestExtra}>+{guestCount - 5}</Text>}
              <Text style={styles.guestCount}>{guestCount}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>₹{order.total ?? 0}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => onViewDetails(order, index)}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={18} color={`${GOLD}CC`} />
            <Text style={styles.detailsBtnText}>Tap to view details</Text>
            <Ionicons name="chevron-forward" size={14} color={`${GOLD}80`} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => onCancel(order)}
            activeOpacity={0.85}
          >
            <Ionicons name="close-circle-outline" size={14} color="#ff8e8e" />
            <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(hasAnimatedOnce ? 1 : 0)).current;

  useEffect(() => {
    if (!hasAnimatedOnce) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }).start();
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 1600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[styles.emptyWrap, { opacity: fadeAnim }]}>
      <View style={styles.emptyRing3} />
      <View style={styles.emptyRing2} />
      <Animated.View style={[styles.emptyRing1, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.emptyIconCenter}>
          <Ionicons name="restaurant-outline" size={36} color={GOLD} />
        </View>
      </Animated.View>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <View key={i} style={[styles.emptyOrbitDot, { transform: [{ rotate: `${i * 45}deg` }, { translateY: -72 }] }]} />
      ))}
      <Text style={styles.emptyHeading}>No Reservations Yet</Text>
      <Text style={styles.emptySub}>
        Use the form above to book your table{"\n"}and dine with us in style
      </Text>
      <View style={styles.emptyFooterRow}>
        <View style={styles.emptyFooterLine} />
        <Text style={styles.emptyFooterLabel}>WALK-INS ALSO WELCOME</Text>
        <View style={styles.emptyFooterLine} />
      </View>
    </Animated.View>
  );
}

// ─── Text Particles behind Reservations text ───────────────────────────────
function TextParticles() {
  const particles = useRef(
    Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 260 - 130, // spread horizontally around the title
      y: Math.random() * 80 - 40,   // spread vertically
      size: Math.random() * 4 + 2,   // sizes between 2px and 6px
      delay: Math.random() * 2000,
      duration: Math.random() * 2500 + 1500,
      anim: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const runAnimation = () => {
        p.anim.setValue(0);
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
        }).start(() => {
          runAnimation();
        });
      };
      runAnimation();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p, idx) => {
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.4, 0.6, 1],
          outputRange: [0, 0.8, 0.8, 0],
        });
        const scale = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.5],
        });
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.y + 15, p.y - 25], // float upwards slightly
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.x, p.x + (Math.random() * 20 - 10)], // drift sideways slightly
        });

        return (
          <Animated.View
            key={idx}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: GOLD,
              shadowColor: GOLD,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              opacity,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Reserves() {
  const { reservations, bookTable, cancelReservation } = useApp();
  const { animatedTranslateY, hiddenOffset } = useTabBarAnimation();
  const { onScroll } = useTabBarScrollHandler(animatedTranslateY, hiddenOffset);

  const router = useRouter();
  const scrollRef = useAnimatedRef<Reanimated.ScrollView>();
  const heroFade = useRef(new Animated.Value(hasAnimatedOnce ? 1 : 0)).current;
  const heroSlide = useRef(new Animated.Value(hasAnimatedOnce ? 0 : -16)).current;
  const [latestBooking, setLatestBooking] = useState<any | null>(null);
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [activeToken, setActiveToken] = useState("");
  const [activeTokenName, setActiveTokenName] = useState("Guest");
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [pendingCancelReservation, setPendingCancelReservation] = useState<any | null>(null);

  const displayedReservations = reservations.filter((r) => r.status !== "Cancelled");
  const [showBookingForm, setShowBookingForm] = useState(displayedReservations.length === 0);

  useEffect(() => {
    if (!hasAnimatedOnce) {
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]).start(() => {
        hasAnimatedOnce = true;
      });
    }
  }, []);

  useEffect(() => {
    if (displayedReservations.length === 0) {
      setShowBookingForm(true);
    }
  }, [displayedReservations.length]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <GoldDustLayer width={width} height={height} zIndex={0} />
      <View style={styles.ambientBlob1} />
      <View style={styles.ambientBlob2} />

      {latestBooking && (
        <SuccessToast booking={latestBooking} onDismiss={() => setLatestBooking(null)} />
      )}

      <TokenDetailsModal
        visible={tokenModalVisible}
        token={activeToken}
        customerName={activeTokenName}
        onClose={() => setTokenModalVisible(false)}
      />

      <CancelReservationModal
        visible={cancelModalVisible}
        customerName={pendingCancelReservation?.customerName ?? pendingCancelReservation?.name ?? "Guest"}
        onClose={() => {
          setCancelModalVisible(false);
          setPendingCancelReservation(null);
        }}
        onConfirm={() => {
          const resObj = pendingCancelReservation;
          if (!resObj) return;

          cancelReservation(resObj.id);

          setCancelModalVisible(false);
          setPendingCancelReservation(null);
        }}
      />

      <Reanimated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={require("../../assets/images/reservationBG.png")}
          style={styles.bgImage}
          imageStyle={styles.bgImageStyle}
          resizeMode="cover"
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#C9A84C" />
          </TouchableOpacity>

          {/* Hero */}
          <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
            <Text style={styles.kicker}>YOUR</Text>
            <View style={{ position: "relative", alignSelf: "flex-start" }}>
              <TextParticles />
              <Text style={styles.heroTitle}>Reservations</Text>
            </View>
            <Text style={styles.heroSub}>Book a table and dine with us in style</Text>
            {displayedReservations.length > 0 && (
              <View style={styles.countChip}>
                <View style={styles.countDot} />
                <Text style={styles.countText}>
                  {displayedReservations.length} active reservation{displayedReservations.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Case 1: Booking form is shown */}
          {showBookingForm ? (
            <View>
              {displayedReservations.length > 0 && (
                <TouchableOpacity
                  style={styles.backToListBtn}
                  onPress={() => setShowBookingForm(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={14} color={GOLD} />
                  <Text style={styles.backToListText}>View Active Reservations</Text>
                </TouchableOpacity>
              )}
              <BookingWidget
                onSuccess={(data) => {
                  setLatestBooking(data);
                  bookTable({
                    customerName: data.name,
                    customerPhone: data.phone,
                    reservationDate: data.date,
                    reservationSlot: data.slot,
                    guests: data.guests,
                    guestCount: Number.parseInt(data.guests, 10) || 1,
                    tableNumber: data.tableNumber,
                  });
                  setShowBookingForm(false);
                }}
                onValidationError={() => {
                  runOnUI(() => {
                    scrollTo(scrollRef, 0, 0, true);
                  })();
                }}
              />
            </View>
          ) : (
            /* Case 2: Booking form is hidden (only possible if displayedReservations.length > 0) */
            <View>
              <TouchableOpacity
                style={styles.bookMoreBox}
                onPress={() => setShowBookingForm(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["rgba(201, 168, 76, 0.15)", "rgba(17, 17, 17, 0)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bookMoreBoxGradient}
                >
                  <View style={styles.bookMoreLeft}>
                    <Ionicons name="add-circle-outline" size={24} color={GOLD} />
                  </View>
                  <View style={styles.bookMoreContent}>
                    <Text style={styles.bookMoreTitle}>Book Another Table</Text>
                    <Text style={styles.bookMoreSub}>Dine with us again or reserve for another event</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={`${GOLD}80`} />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.sectionDivider}>
                <View style={styles.sectionLine} />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="calendar" size={11} color={GOLD} />
                  <Text style={styles.sectionLabel}>UPCOMING BOOKINGS</Text>
                </View>
                <View style={styles.sectionLine} />
              </View>

              <View style={styles.cardList}>
                {displayedReservations.map((o, i) => (
                  <ReserveCard
                    key={o.id}
                    order={o}
                    index={i}
                    onViewDetails={(order, itemIndex) => {
                      const token = getReservationToken(order, itemIndex);
                      const name = order.customerName ?? order.name ?? "Guest";
                      setActiveToken(token);
                      setActiveTokenName(name);
                      setTokenModalVisible(true);
                    }}
                    onCancel={(order) => {
                      setPendingCancelReservation(order);
                      setCancelModalVisible(true);
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        </ImageBackground>
      </Reanimated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  bgImage: {
    width: width,
    minHeight: height + 180,
    padding: 16,
    paddingBottom: 60,
  },
  bgImageStyle: {
    top: -42,
    height: height + 180,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.3)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  scroll: { flexGrow: 1 },
  backToListBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backToListText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
  },
  bookMoreBox: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${GOLD}20`,
    marginBottom: 20,
    overflow: "hidden",
  },
  bookMoreBoxGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  bookMoreLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GOLD_DIM,
    alignItems: "center",
    justifyContent: "center",
  },
  bookMoreContent: {
    flex: 1,
  },
  bookMoreTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
  },
  bookMoreSub: {
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },

  ambientBlob1: {
    position: "absolute", top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(201,168,76,0.055)",
  },
  ambientBlob2: {
    position: "absolute", bottom: 120, left: -100,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: "rgba(201,168,76,0.04)",
  },

  hero: { marginBottom: 22, paddingTop: 4 },
  kicker: { color: GOLD, fontSize: 10, fontWeight: "800", letterSpacing: 5, opacity: 0.75 },
  heroTitle: {
    color: WHITE,
    fontSize: 40,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Palatino", android: "serif" }),
    marginTop: 2,
  },
  heroSub: { color: MUTED, fontSize: 13, lineHeight: 19 },
  countChip: {
    flexDirection: "row", alignItems: "center",
    marginTop: 12, gap: 7, backgroundColor: GOLD_DIM,
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: `${GOLD}30`,
  },
  countDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD },
  countText: { color: GOLD, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  sectionDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 4 },
  sectionLine: { flex: 1, height: 1, backgroundColor: `${GOLD}18` },
  sectionLabel: { color: `${GOLD}80`, fontSize: 8, fontWeight: "800", letterSpacing: 2.2 },

  card: {
    backgroundColor: SURFACE, borderRadius: 20,
    borderWidth: 1, borderColor: `${GOLD}20`,
    overflow: "hidden", position: "relative",
    ...Platform.select({
      ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14 },
      android: { elevation: 6 },
    }),
  },
  bracket: { position: "absolute", width: 14, height: 14, zIndex: 1 },
  bTL: { top: 10, left: 10, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: GOLD, borderTopLeftRadius: 3 },
  bTR: { top: 10, right: 10, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: GOLD, borderTopRightRadius: 3 },
  bBL: { bottom: 10, left: 10, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: GOLD, borderBottomLeftRadius: 3 },
  bBR: { bottom: 10, right: 10, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: GOLD, borderBottomRightRadius: 3 },
  cardTopBar: { height: 3, backgroundColor: GOLD },
  cardHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, gap: 10 },
  cardIconWrap: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: GOLD_DIM,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${GOLD}25`,
  },
  cardIdentity: { flex: 1 },
  cardTitle: { color: WHITE, fontSize: 13, fontWeight: "700", letterSpacing: 0.8 },
  cardName: {
    color: `${GOLD}CC`,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: "Palatino", android: "serif" }),
    fontStyle: "italic",
  },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(76,217,123,0.12)",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(76,217,123,0.25)",
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#4CD97B" },
  statusText: { color: "#4CD97B", fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  tearRow: { flexDirection: "row", alignItems: "center" },
  tearNotchL: { width: 14, height: 14, borderRadius: 7, backgroundColor: DARK_BG, borderWidth: 1, borderColor: `${GOLD}20`, marginLeft: -7 },
  tearLine: { flex: 1, height: 1, borderWidth: 0.5, borderColor: `${GOLD}20`, borderStyle: "dashed" },
  tearNotchR: { width: 14, height: 14, borderRadius: 7, backgroundColor: DARK_BG, borderWidth: 1, borderColor: `${GOLD}20`, marginRight: -7 },
  cardBody: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, gap: 16 },
  infoCol: { flex: 1 },
  infoLabel: { color: MUTED, fontSize: 8, fontWeight: "800", letterSpacing: 2.5, marginBottom: 5 },
  infoValue: { color: WHITE, fontSize: 12, fontWeight: "600", letterSpacing: 0.2 },
  guestRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  guestExtra: { color: GOLD, fontSize: 10, fontWeight: "700", marginLeft: 2 },
  guestCount: { color: GOLD, fontSize: 12, fontWeight: "700", marginLeft: 4 },
  totalValue: { color: GOLD, fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  cardFooter: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginTop: 16, marginBottom: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: `${GOLD}15`,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GOLD_SOFT,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${GOLD}25`,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  detailsBtnText: { flex: 1, color: `${GOLD}CC`, fontSize: 11, letterSpacing: 0.3 },
  footerHint: { flex: 1, color: MUTED, fontSize: 11, letterSpacing: 0.3 },
  cardActionsRow: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,110,110,0.35)",
    backgroundColor: "rgba(255,110,110,0.08)",
    paddingVertical: 10,
  },
  cancelBtnText: { color: "#ff9f9f", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  cardList: { marginTop: 4 },
  addMoreBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 4, paddingVertical: 14,
    backgroundColor: GOLD_DIM, borderRadius: 16, borderWidth: 1, borderColor: `${GOLD}28`,
  },
  addMoreText: { color: GOLD, fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },

  emptyWrap: { alignItems: "center", paddingVertical: 20, paddingTop: 28, position: "relative" },
  emptyRing3: {
    width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: `${GOLD}10`,
    position: "absolute", top: 10, alignSelf: "center",
  },
  emptyRing2: {
    width: 148, height: 148, borderRadius: 74, borderWidth: 1, borderColor: `${GOLD}18`,
    position: "absolute", top: 26, alignSelf: "center",
  },
  emptyRing1: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 1.5, borderColor: `${GOLD}40`,
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  emptyIconCenter: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: GOLD_DIM,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${GOLD}30`,
  },
  emptyOrbitDot: {
    position: "absolute", top: "50%", left: "50%",
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: `${GOLD}40`, marginLeft: -2.5, marginTop: -2.5,
  },
  emptyHeading: { color: WHITE, fontSize: 20, fontWeight: "800", letterSpacing: 0.5, marginBottom: 8 },
  emptySub: { color: MUTED, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  emptyFooterRow: { flexDirection: "row", alignItems: "center", gap: 10, width: "70%" },
  emptyFooterLine: { flex: 1, height: 1, backgroundColor: `${GOLD}22` },
  emptyFooterLabel: { color: `${GOLD}55`, fontSize: 8, fontWeight: "800", letterSpacing: 2 },
});

const tableStyle = StyleSheet.create({
  tablesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, marginTop: 8 },
  tablePill: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${GOLD}20`,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  tablePillActive: { backgroundColor: GOLD, borderColor: GOLD_LIGHT },
  tablePillBooked: { backgroundColor: "rgba(255,255,255,0.015)", borderColor: "rgba(255,110,110,0.15)", opacity: 0.5 },
  tablePillText: { color: WHITE, fontSize: 12, fontWeight: "700" },
  tablePillTextActive: { color: "#1a0d0a", fontWeight: "800" },
  tablePillTextBooked: { color: "#555" },
  tableStatusTextBooked: { fontSize: 8, fontWeight: "800", color: "#ff8e8e", letterSpacing: 0.5, marginLeft: "auto" },
  tableStatusTextAvail: { fontSize: 8, fontWeight: "800", color: "#4CD97B", letterSpacing: 0.5, marginLeft: "auto" },
});