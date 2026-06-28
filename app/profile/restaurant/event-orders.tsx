import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

type EventOrder = {
  id: string;
  eventName: string;
  items: { name: string; qty: number }[];
  date: string;
  total: string;
  status: string;
  statusColor: string;
  manager: string;
  address: string;
};

export default function EventOrdersScreen() {
  const orders: EventOrder[] = [
    {
      id: "EVT-ORD-482",
      eventName: "Wedding Sangeet Buffet",
      items: [
        { name: "Butter Chicken (Buffet Servings)", qty: 4 },
        { name: "Dal Makhani (Buffet Servings)", qty: 4 },
        { name: "Paneer Tikka (Bulk Platter)", qty: 6 },
        { name: "Tandoori Roti & Garlic Naan Set", qty: 250 },
      ],
      date: "Today, 6:00 PM (Scheduled)",
      total: "₹45,280",
      status: "Prep in Progress",
      statusColor: colors.gold,
      manager: "Vipul (Chef-in-Charge)",
      address: "Mapple Gold Banquet, Sector 15, Gurugram",
    },
    {
      id: "EVT-ORD-204",
      eventName: "Corporate Lunch Box delivery",
      items: [
        { name: "Standard Veg Lunch Box Combo", qty: 60 },
        { name: "Sweet Lassi Bottles", qty: 60 },
      ],
      date: "10 Jun 2025",
      total: "₹18,400",
      status: "Delivered",
      statusColor: colors.success,
      manager: "Aakash (Logistics Coord.)",
      address: "DLF Cyber City, Building 10, Gurugram",
    },
  ];

  return (
    <ScreenHeader title="Event Food Orders" backHref="/(tabs)/profile">
      <Text style={styles.sectionLabel}>{orders.length} Bulk Orders Registered</Text>
      {orders.map((o) => (
        <View key={o.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{o.eventName}</Text>
              <Text style={styles.orderId}>Order #{o.id} • {o.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${o.statusColor}18` }]}>
              <Text style={[styles.statusText, { color: o.statusColor }]}>{o.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          
          <Text style={styles.itemTitle}>Food Quantities:</Text>
          <View style={styles.itemsBox}>
            {o.items.map((it, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Ionicons name="basket-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.itemText}>{it.name} x {it.qty}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={colors.gold} />
            <Text style={styles.metaText}>Manager: {o.manager}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.gold} />
            <Text style={styles.metaText}>Address: {o.address}</Text>
          </View>
          
          <View style={styles.footerRow}>
            <Text style={styles.totalLabel}>Total Value: <Text style={styles.totalValue}>{o.total}</Text></Text>
            <TouchableOpacity style={styles.helpBtn} onPress={() => alert(`Contacting Coordinator for order #${o.id}`)}>
              <Ionicons name="chatbubbles-outline" size={14} color="#000" />
              <Text style={styles.helpBtnText}>Chat Coordinator</Text>
            </TouchableOpacity>
          </View>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  orderId: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  itemsBox: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 10,
    padding: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalValue: {
    color: colors.gold,
    fontWeight: "800",
    fontSize: 14,
  },
  helpBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  helpBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 11,
  },
});
