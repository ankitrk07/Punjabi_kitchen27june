import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const NOTIFS = [
  { id: "1", title: "🎉 Diwali Special – 40% OFF", body: "Celebrate with our festive Thali specials. Valid 22–29 Jun only!", time: "2h ago", read: false },
  { id: "2", title: "🏷️ Flash Sale – 30% OFF Dal Makhani", body: "Today only! Order before 10 PM for 30% off on Dal Makhani.", time: "Yesterday", read: false },
  { id: "3", title: "💰 Paytm Cashback Extended", body: "Get ₹75 cashback on orders via Paytm. Valid for 3 more days!", time: "2 days ago", read: true },
  { id: "4", title: "🎁 Birthday Month Surprise", body: "As a Gold Member, your birthday month offer is now active: 50% OFF on 1 order!", time: "5 days ago", read: true },
];

export default function OffersNotificationsScreen() {
  return (
    <ScreenHeader title="Offers & Deals" backHref="/(tabs)/profile">
      <Text style={s.label}>{NOTIFS.filter(n => !n.read).length} new offers for you</Text>
      {NOTIFS.map((n) => (
        <View key={n.id} style={[s.card, !n.read && s.unreadCard]}>
          {!n.read && <View style={s.unreadDot} />}
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{n.title}</Text>
            <Text style={s.body}>{n.body}</Text>
            <Text style={s.time}>{n.time}</Text>
          </View>
          <TouchableOpacity style={s.claimBtn} onPress={() => alert("Offer Claimed!")}><Text style={s.claimText}>{n.read ? "View" : "Claim"}</Text></TouchableOpacity>
        </View>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border, position: "relative" },
  unreadCard: { backgroundColor: "rgba(212,175,55,0.04)", borderRadius: 12 },
  unreadDot: { position: "absolute", top: 16, left: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  title: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 3 },
  body: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginBottom: 5 },
  time: { fontSize: 10, color: colors.textSecondary },
  claimBtn: { backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 4 },
  claimText: { fontSize: 11, fontWeight: "700", color: "#000" },
});
