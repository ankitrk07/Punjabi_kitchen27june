import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const DARK_BG = "#080808";
const SURFACE = "#121212";
const WHITE = "#FFFFFF";

interface ReservationSuccessModalProps {
  visible: boolean;
  booking: {
    name: string;
    phone: string;
    date: string;
    guests: string;
    slot: string | null;
    tableNumber: number | null;
    occasion: string;
    specialRequests?: string;
  } | null;
  onClose: () => void;
}

export function ReservationSuccessModal({ visible, booking, onClose }: ReservationSuccessModalProps) {
  if (!booking) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.ticketContainer}>
          {/* Top Border Bar */}
          <View style={styles.topBar} />

          {/* Brackets */}
          <View style={[styles.bracket, styles.bTL]} />
          <View style={[styles.bracket, styles.bTR]} />
          <View style={[styles.bracket, styles.bBL]} />
          <View style={[styles.bracket, styles.bBR]} />

          {/* Ticket Header */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Ionicons name="checkmark-circle-sharp" size={32} color={GOLD} />
            </View>
            <Text style={styles.heading}>RESERVATION TICKET</Text>
            <Text style={styles.subheading}>Punjab Kitchen, Ranchi</Text>
          </View>

          {/* Tear Line Notch */}
          <View style={styles.tearRow}>
            <View style={styles.tearNotchL} />
            <View style={styles.tearLine} />
            <View style={styles.tearNotchR} />
          </View>

          {/* Ticket Body / Details */}
          <View style={styles.detailsBody}>
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <Text style={styles.label}>GUEST NAME</Text>
                <Text style={styles.value} numberOfLines={1}>{booking.name}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.label}>PHONE NUMBER</Text>
                <Text style={styles.value}>{booking.phone}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <Text style={styles.label}>DATE</Text>
                <Text style={styles.value}>{booking.date}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.label}>TIME SLOT</Text>
                <Text style={styles.value}>{booking.slot}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <Text style={styles.label}>TABLE NUMBER</Text>
                <Text style={styles.value}>
                  Table {booking.tableNumber || 1}
                </Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.label}>PARTY SIZE</Text>
                <Text style={styles.value}>
                  {booking.guests} Guest{Number(booking.guests) > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {booking.occasion && booking.occasion !== "None" && (
              <View style={styles.singleRow}>
                <Text style={styles.label}>OCCASION</Text>
                <Text style={[styles.value, { color: GOLD }]}>{booking.occasion}</Text>
              </View>
            )}

            {booking.specialRequests ? (
              <View style={styles.singleRow}>
                <Text style={styles.label}>SPECIAL REQUESTS</Text>
                <Text style={styles.valueItalic}>{booking.specialRequests}</Text>
              </View>
            ) : null}
          </View>

          {/* OK Action Button */}
          <TouchableOpacity
            style={styles.okBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[GOLD_LIGHT, GOLD]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.okBtnText}>OK — DINE WITH PK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  ticketContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: SURFACE,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(201, 168, 76, 0.25)",
    overflow: "hidden",
    paddingBottom: 24,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  topBar: {
    height: 4,
    backgroundColor: GOLD,
  },
  bracket: {
    position: "absolute",
    width: 14,
    height: 14,
    zIndex: 2,
  },
  bTL: { top: 12, left: 12, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: GOLD, borderTopLeftRadius: 3 },
  bTR: { top: 12, right: 12, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: GOLD, borderTopRightRadius: 3 },
  bBL: { bottom: 12, left: 12, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: GOLD, borderBottomLeftRadius: 3 },
  bBR: { bottom: 12, right: 12, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: GOLD, borderBottomRightRadius: 3 },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(201, 168, 76, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.15)",
  },
  heading: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  subheading: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  tearRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tearNotchL: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DARK_BG,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    marginLeft: -8,
  },
  tearLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: "rgba(201, 168, 76, 0.25)",
    borderStyle: "dashed",
  },
  tearNotchR: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DARK_BG,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    marginRight: -8,
  },
  detailsBody: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailCol: {
    width: "48%",
  },
  singleRow: {
    width: "100%",
  },
  label: {
    color: "#555",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  value: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "700",
  },
  valueItalic: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12.5,
    fontWeight: "600",
    fontStyle: "italic",
    lineHeight: 18,
  },
  okBtn: {
    marginHorizontal: 22,
    borderRadius: 12,
    height: 46,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  okBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
