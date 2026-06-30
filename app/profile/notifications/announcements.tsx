import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";

export default function AnnouncementsScreen() {
  const { notifications } = useApp();
  
  // Filter for Announcements
  const announcements = notifications.filter(n => n.type === "Announcement");

  return (
    <ScreenHeader title="Announcements" backHref="/(tabs)/profile">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.container}>
        <Text style={s.label}>{announcements.length} announcement{announcements.length !== 1 ? "s" : ""} from restaurant</Text>
        
        {announcements.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="notifications-off-outline" size={32} color={colors.textSecondary} />
            <Text style={s.emptyText}>No recent announcements from management.</Text>
          </View>
        ) : (
          announcements.map((n) => {
            const formattedDate = new Date(n.createdAt).toLocaleDateString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
            return (
              <View key={n.id} style={s.card}>
                <View style={s.headerRow}>
                  <View style={s.iconBadge}>
                    <Ionicons name="megaphone-outline" size={16} color={colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.title}>{n.title}</Text>
                    <Text style={s.time}>{formattedDate}</Text>
                  </View>
                </View>
                <Text style={s.body}>{n.message}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  container: { paddingBottom: 20 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
  iconBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(212,175,55,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(212,175,55,0.2)" },
  title: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  time: { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  body: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  emptyCard: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: colors.textSecondary, fontSize: 12, textAlign: "center" },
});
