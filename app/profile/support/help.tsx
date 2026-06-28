import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

const FAQS = [
  { q: "How long does delivery take?", a: "Most orders are delivered within 30–45 minutes. Scheduled orders follow your chosen time slot." },
  { q: "Can I cancel or modify my order?", a: "You can cancel within 2 minutes of placing an order. Modifications are not supported post-confirmation." },
  { q: "How do I request a refund?", a: "Go to Order History → Select Order → Raise Issue. Refunds are processed in 3–5 business days." },
  { q: "How does the referral program work?", a: "Share your code with friends. Get ₹100 cashback when they place their first order of ₹199+." },
];

export default function HelpScreen() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (label: string) => {
    if (label === "Live Chat") {
      router.push("/profile/support/live-chat");
    } else if (label === "Call Us") {
      router.push("/profile/support/call");
    } else if (label === "Email") {
      Linking.openURL("mailto:support@punjabikitchen.com");
    }
  };

  return (
    <ScreenHeader title="Help Center" backHref="/(tabs)/profile">
      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
        <TextInput style={s.searchInput} placeholder="Search help topics..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} />
      </View>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.quickRow}>
        {[
          { icon: "chatbubble-ellipses-outline", label: "Live Chat", color: "#34d399" },
          { icon: "call-outline", label: "Call Us", color: colors.gold },
          { icon: "mail-outline", label: "Email", color: "#a78bfa" },
        ].map((a, i) => (
          <TouchableOpacity key={i} style={s.quickCard} onPress={() => handleAction(a.label)}>
            <View style={[s.quickIcon, { backgroundColor: `${a.color}18` }]}>
              <Ionicons name={a.icon as any} size={22} color={a.color} />
            </View>
            <Text style={s.quickLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQs */}
      <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
      {filtered.map((faq, i) => (
        <TouchableOpacity key={i} style={s.faqCard} onPress={() => setOpen(open === i ? null : i)}>
          <View style={s.faqHeader}>
            <Text style={s.faqQ}>{faq.q}</Text>
            <Ionicons name={open === i ? "chevron-up" : "chevron-down"} size={16} color={colors.gold} />
          </View>
          {open === i && <Text style={s.faqA}>{faq.a}</Text>}
        </TouchableOpacity>
      ))}
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20 },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 13 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  quickRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  quickCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center", gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11, color: colors.textPrimary, fontWeight: "600" },
  faqCard: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10 },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQ: { fontSize: 13, fontWeight: "600", color: colors.textPrimary, flex: 1, paddingRight: 12 },
  faqA: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
});
