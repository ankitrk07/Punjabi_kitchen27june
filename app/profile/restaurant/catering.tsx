import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";

type CateringItem = {
  id: string;
  isOrder: boolean; // true for active food orders, false for submitted requests
  eventName: string;
  guests: number;
  date: string;
  status: string;
  statusColor: string;
  details?: string;
  items?: { name: string; qty: number }[];
  total?: string;
  manager?: string;
  address?: string;
};

import { useApp } from "@/src/context/AppContext";

export default function CateringOrdersScreen() {
  const { cateringRequests, createCateringRequest } = useApp();
  const [activeTab, setActiveTab] = useState<"book" | "orders">("orders");

  // Packages references
  const packages = [
    { name: "Silver Celebration", price: "₹799/guest", min: 20, color: "#9ca3af" },
    { name: "Gold Royal Banquet", price: "₹999/guest", min: 25, color: colors.gold },
    { name: "Platinum Maharaja Buffet", price: "₹1,299/guest", min: 30, color: "#a78bfa" },
  ];

  // Form states
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedPkg, setSelectedPkg] = useState("Gold Royal Banquet");
  const [details, setDetails] = useState("");

  const handleSubmit = async () => {
    if (!eventType || !guestCount || !date || !phone || !address) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await createCateringRequest({
        eventType: `${eventType} (${selectedPkg})`,
        guests: parseInt(guestCount) || 0,
        date: date,
        phone: phone,
        address: address,
        package: selectedPkg,
        details: details || "No additional requirements provided.",
      });

      setEventType("");
      setGuestCount("");
      setDate("");
      setPhone("");
      setAddress("");
      setDetails("");
      setActiveTab("orders");
      alert("Catering Request Submitted successfully!");
    } catch (e) {
      alert("Failed to submit request.");
    }
  };

  return (
    <ScreenHeader title="Catering Orders" backHref="/(tabs)/profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.container}>

        {/* Banner */}
        <LinearGradient
          colors={["rgba(212, 175, 55, 0.12)", "rgba(20, 20, 20, 0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroLeft}>
            <LinearGradient
              colors={[colors.goldBright, colors.gold]}
              style={s.heroIconContainer}
            >
              <Ionicons name="people-circle" size={20} color={colors.bg} />
            </LinearGradient>
          </View>
          <View style={s.heroContent}>
            <Text style={s.heroTitle}>Royal Catering Services</Text>
            <Text style={s.heroSubtitle}>Professional dining catering, buffet set-ups, and custom food packages for your special events.</Text>
          </View>
        </LinearGradient>

        {/* Tab Buttons */}
        <View style={s.tabContainer}>
          <TouchableOpacity
            style={[s.tabBtn, activeTab === "orders" && s.tabBtnActive]}
            onPress={() => setActiveTab("orders")}
          >
            <Text style={[s.tabText, activeTab === "orders" && s.tabTextActive]}>My Bookings & Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, activeTab === "book" && s.tabBtnActive]}
            onPress={() => setActiveTab("book")}
          >
            <Text style={[s.tabText, activeTab === "book" && s.tabTextActive]}>Request Catering</Text>
          </TouchableOpacity>
        </View>

        {/* Tab: Orders feed */}
        {activeTab === "orders" && (
          <View>
            <Text style={s.sectionHeader}>{cateringRequests.length} Total Bookings</Text>
            {cateringRequests.map((item) => {
              const statusColor = item.status === "Approved" ? colors.success : item.status === "Denied" ? colors.error : colors.gold;
              const badgeBg = statusColor === colors.success ? "rgba(16, 185, 129, 0.08)" : "rgba(212, 175, 55, 0.08)";
              const badgeBorder = statusColor === colors.success ? "rgba(16, 185, 129, 0.2)" : "rgba(212, 175, 55, 0.2)";

              return (
                <View key={item.id} style={s.card}>
                  <View style={s.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cardTitle}>{item.eventType || item.eventName}</Text>
                      <Text style={s.cardId}>{item.isOrder ? "Order" : "Request"} #{item.id.slice(-6).toUpperCase()}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                      <Text style={[s.statusText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={s.divider} />

                  {/* Details block */}
                  <View style={s.detailsBlock}>
                    <View style={s.detailRow}>
                      <Ionicons name="calendar-outline" size={13} color={colors.gold} />
                      <Text style={s.detailText}>Date: {item.date}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Ionicons name="people-outline" size={13} color={colors.gold} />
                      <Text style={s.detailText}>Guests: {item.guests} People</Text>
                    </View>
                    {item.address && (
                      <View style={s.detailRow}>
                        <Ionicons name="location-outline" size={13} color={colors.gold} />
                        <Text style={s.detailText} numberOfLines={1}>Venue: {item.address}</Text>
                      </View>
                    )}
                  </View>

                  {/* Bulk Food quantities / Menu requirements */}
                  {item.items && item.items.length > 0 ? (
                    <View style={s.menuSection}>
                      <Text style={s.menuHeader}>Catering Menu Quantities:</Text>
                      <View style={s.menuList}>
                        {item.items.map((food, fIdx) => (
                          <View key={fIdx} style={s.menuItemRow}>
                            <Ionicons name="restaurant-outline" size={12} color={colors.textSecondary} />
                            <Text style={s.menuItemText}>{food.name} x {food.qty}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : (
                    item.details && (
                      <View style={s.menuSection}>
                        <Text style={s.menuHeader}>Special Requests & Menu requirements:</Text>
                        <View style={s.menuList}>
                          <Text style={s.requirementText}>"{item.details}"</Text>
                        </View>
                      </View>
                    )
                  )}

                  {/* Footer metadata & actions */}
                  {(item.manager || item.total) && (
                    <View style={s.cardFooter}>
                      <View style={s.footerInfo}>
                        {item.manager && (
                          <Text style={s.managerText}>Coordinator: {item.manager}</Text>
                        )}
                        {item.total && (
                          <Text style={s.totalText}>Estimate: <Text style={s.totalAmt}>{item.total}</Text></Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={s.chatBtn}
                        onPress={() => alert(`Connecting with coordinator for booking #${item.id}`)}
                      >
                        <LinearGradient
                          colors={[colors.goldBright, colors.gold]}
                          style={s.chatBtnGradient}
                        >
                          <Ionicons name="chatbubbles-outline" size={12} color={colors.textInverse} />
                          <Text style={s.chatBtnText}>Chat Coordinator</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tab: Book Catering form */}
        {activeTab === "book" && (
          <View>
            <Text style={s.sectionHeader}>Party Booking Packages</Text>

            {/* Packages presets horizontal scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.packageScroll}>
              {packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.name}
                  style={[s.packagePresetCard, selectedPkg === pkg.name && s.packagePresetActive]}
                  onPress={() => setSelectedPkg(pkg.name)}
                >
                  <Ionicons name="gift-outline" size={24} color={selectedPkg === pkg.name ? colors.textInverse : colors.gold} />
                  <Text style={[s.packagePresetName, selectedPkg === pkg.name && s.packagePresetTextActive]}>{pkg.name}</Text>
                  <Text style={[s.packagePresetPrice, selectedPkg === pkg.name && s.packagePresetTextActive]}>{pkg.price}</Text>
                  <Text style={[s.packagePresetMin, selectedPkg === pkg.name && s.packagePresetMinActive]}>Min: {pkg.min} guests</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.sectionHeader}>Event Details Form</Text>
            <View style={s.formCard}>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Event Type / Occasion *</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="e.g. Wedding Sangeet, Corporate Dinner, Birthday"
                  placeholderTextColor={colors.textSecondary}
                  value={eventType}
                  onChangeText={setEventType}
                />
              </View>

              <View style={s.inputRow}>
                <View style={[s.inputGroup, { flex: 1 }]}>
                  <Text style={s.inputLabel}>Expected Guests *</Text>
                  <TextInput
                    style={s.textInput}
                    placeholder="e.g. 50"
                    keyboardType="number-pad"
                    placeholderTextColor={colors.textSecondary}
                    value={guestCount}
                    onChangeText={setGuestCount}
                  />
                </View>
                <View style={[s.inputGroup, { flex: 1.2 }]}>
                  <Text style={s.inputLabel}>Event Date *</Text>
                  <TextInput
                    style={s.textInput}
                    placeholder="e.g. 15 Oct 2025"
                    placeholderTextColor={colors.textSecondary}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Contact Phone Number *</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="e.g. +91 98765 43210"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Venue Address *</Text>
                <TextInput
                  style={[s.textInput, s.textAreaSingle]}
                  placeholder="Flat/House, Banquet Hall Name, Area, Landmark"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={2}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Selected Package Preference</Text>
                <View style={s.pkgLockedRow}>
                  <Ionicons name="checkmark-done" size={14} color={colors.gold} />
                  <Text style={s.pkgLockedText}>{selectedPkg}</Text>
                </View>
              </View>

              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Special Menu Customization & Details</Text>
                <TextInput
                  style={[s.textInput, s.textArea]}
                  placeholder="e.g., Live Counters, specific dishes from menu, Jain/Veg only requirements..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={details}
                  onChangeText={setDetails}
                />
              </View>

              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
                <LinearGradient
                  colors={[colors.goldBright, colors.gold]}
                  style={s.submitBtnGradient}
                >
                  <Text style={s.submitBtnText}>Submit Catering Request</Text>
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>
        )}

      </ScrollView>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  heroCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  heroLeft: {
    marginRight: 14,
  },
  heroIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: colors.surface2,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: colors.gold,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  cardId: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: "700",
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  detailsBlock: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  menuSection: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    padding: 12,
    marginTop: 12,
  },
  menuHeader: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "800",
    marginBottom: 8,
  },
  menuList: {
    gap: 6,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  requirementText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInfo: {
    gap: 2,
  },
  managerText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  totalText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  totalAmt: {
    color: colors.goldBright,
    fontWeight: "800",
  },
  chatBtn: {
    borderRadius: 8,
    overflow: "hidden",
  },
  chatBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chatBtnText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 10,
  },
  packageScroll: {
    gap: 12,
    paddingBottom: 20,
  },
  packagePresetCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  packagePresetActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  packagePresetName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  packagePresetTextActive: {
    color: colors.textInverse,
  },
  packagePresetPrice: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  packagePresetMin: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 6,
    fontWeight: "600",
  },
  packagePresetMinActive: {
    color: "rgba(0, 0, 0, 0.6)",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  textAreaSingle: {
    height: 52,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  pkgLockedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  pkgLockedText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
  },
  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  submitBtnGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  submitBtnText: {
    color: colors.textInverse,
    fontWeight: "800",
    fontSize: 13,
  },
});
