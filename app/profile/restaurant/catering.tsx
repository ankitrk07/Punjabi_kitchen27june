import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

type Package = {
  name: string;
  price: string;
  minGuests: number;
  icon: string;
  color: string;
  items: string[];
};

export default function PartyBookingsScreen() {
  const packages: Package[] = [
    {
      name: "Silver Celebration",
      price: "₹799 / guest",
      minGuests: 20,
      icon: "trophy-outline",
      color: "#9ca3af",
      items: ["2 Starters", "3 Main Courses", "1 Rice & Assorted Breads", "1 Dessert", "Mocktail Welcome Drink"],
    },
    {
      name: "Gold Royal Banquet",
      price: "₹999 / guest",
      minGuests: 25,
      icon: "medal-outline",
      color: colors.gold,
      items: ["3 Starters (incl. Paneer Tikka)", "4 Main Courses", "Biryani & Breads", "2 Desserts", "Live Soft Drink Bar"],
    },
    {
      name: "Platinum Maharaja Buffet",
      price: "₹1,299 / guest",
      minGuests: 30,
      icon: "diamond-outline",
      color: "#a78bfa",
      items: ["4 Starters", "5 Main Courses (incl. Butter Chicken)", "Dum Biryani & Breads", "3 Desserts (incl. Hot Gulab Jamun)", "Live Mocktail Counter & Starters Bar"],
    },
  ];

  return (
    <ScreenHeader title="Party Bookings" backHref="/(tabs)/profile">
      {/* Existing Bookings */}
      <Text style={styles.sectionLabel}>Active Party Booking</Text>
      <View style={styles.activeBookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>Gold Royal Banquet – Birthday Celebration</Text>
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedText}>Confirmed</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.gold} />
          <Text style={styles.detailValue}>Date: 15 July 2025</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={14} color={colors.gold} />
          <Text style={styles.detailValue}>Guests: 35 People</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="home-outline" size={14} color={colors.gold} />
          <Text style={styles.detailValue}>Location: Connaught Place Banquet Hall</Text>
        </View>
      </View>

      {/* Available Packages */}
      <Text style={styles.sectionLabel}>Custom Party Packages</Text>
      {packages.map((pkg, idx) => (
        <View key={idx} style={styles.packageCard}>
          <View style={styles.packageHeader}>
            <View style={[styles.packageIcon, { backgroundColor: `${pkg.color}15` }]}>
              <Ionicons name={pkg.icon as any} size={22} color={pkg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              <Text style={styles.packageGuests}>Min. {pkg.minGuests} guests required</Text>
            </View>
            <Text style={[styles.packagePrice, { color: pkg.color }]}>{pkg.price}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.menuLabel}>Menu Includes:</Text>
          <View style={styles.itemsGrid}>
            {pkg.items.map((item, i) => (
              <View key={i} style={styles.menuItemRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.menuItemText}>{item}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: pkg.color }]}
            onPress={() => alert(`Initiating booking request for ${pkg.name}`)}
          >
            <Text style={styles.bookBtnText}>Select & Book</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  activeBookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    padding: 16,
    marginBottom: 20,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 10,
    lineHeight: 20,
  },
  confirmedBadge: {
    backgroundColor: "rgba(16,185,129,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmedText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detailValue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  packageCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  packageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  packageName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  packageGuests: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  itemsGrid: {
    marginBottom: 14,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  bookBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 13,
  },
});
