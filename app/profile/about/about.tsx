import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function AboutScreen() {
  return (
    <ScreenHeader title="About Us" backHref="/(tabs)/profile">
      {/* Logo Section */}
      <View style={s.logoSection}>
        <View style={s.logo}><Text style={s.logoText}>PK</Text></View>
        <Text style={s.appName}>Punjabi Kitchen</Text>
        <Text style={s.tagline}>"Authenticity on every plate"</Text>
      </View>

      {/* Story */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Our Story</Text>
        <Text style={s.cardBody}>
          Punjabi Kitchen started in 2018 as a single clay-tandoor outlet in Connaught Place, New Delhi. With an unwavering commitment to serving authentic Punjabi cuisine — from slow-simmered Dal Makhani to hand-rolled Amritsari Kulchas — we've grown to 12 locations across Delhi-NCR and proudly serve over 10,000 orders daily.
        </Text>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[{ value: "12+", label: "Outlets" }, { value: "10K+", label: "Daily Orders" }, { value: "4.9★", label: "Avg Rating" }, { value: "2018", label: "Founded" }].map((st, i) => (
          <View key={i} style={s.statBox}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Values */}
      <Text style={s.sectionTitle}>Our Values</Text>
      {[
        { icon: "leaf-outline", label: "Farm Fresh Ingredients", color: "#34d399" },
        { icon: "flame-outline", label: "Traditional Clay Tandoor Cooking", color: "#f87171" },
        { icon: "heart-outline", label: "Made with Love, No Shortcuts", color: "#a78bfa" },
        { icon: "earth-outline", label: "Sustainable & Eco-Friendly Packaging", color: colors.gold },
      ].map((v, i) => (
        <View key={i} style={s.valueRow}>
          <View style={[s.valueIcon, { backgroundColor: `${v.color}18` }]}><Ionicons name={v.icon as any} size={20} color={v.color} /></View>
          <Text style={s.valueLabel}>{v.label}</Text>
        </View>
      ))}

      {/* Social */}
      <Text style={s.sectionTitle}>Follow Us</Text>
      <View style={s.socialRow}>
        {[{ icon: "logo-instagram", label: "@punjabikitchen" }, { icon: "logo-twitter", label: "@pk_official" }].map((soc, i) => (
          <TouchableOpacity key={i} style={s.socialCard} onPress={() => alert(`Follow us on ${soc.label}`)}>
            <Ionicons name={soc.icon as any} size={20} color={colors.gold} />
            <Text style={s.socialLabel}>{soc.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  logoSection: { alignItems: "center", marginBottom: 22 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { fontSize: 28, fontWeight: "900", color: "#000" },
  appName: { fontSize: 22, fontWeight: "900", color: colors.textPrimary, marginBottom: 4 },
  tagline: { fontSize: 13, color: colors.textSecondary, fontStyle: "italic" },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 18 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  cardBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 22 },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "900", color: colors.gold, marginBottom: 2 },
  statLabel: { fontSize: 9, color: colors.textSecondary, textAlign: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  valueIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  valueLabel: { fontSize: 13, color: colors.textPrimary, fontWeight: "500" },
  socialRow: { flexDirection: "row", gap: 12, marginTop: 2 },
  socialCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center", gap: 8, flexDirection: "row", justifyContent: "center" },
  socialLabel: { fontSize: 12, color: colors.textPrimary, fontWeight: "600" },
});
