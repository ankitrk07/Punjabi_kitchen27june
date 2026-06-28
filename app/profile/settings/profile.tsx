import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";

export default function EditProfileScreen() {
  const [name, setName] = useState("Sudip Sen");
  const [email, setEmail] = useState("sudip@dineout.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [dob, setDob] = useState("15 March 1995");

  const fields = [
    { label: "Full Name", value: name, setter: setName, icon: "person-outline", keyboardType: "default" as const },
    { label: "Email Address", value: email, setter: setEmail, icon: "mail-outline", keyboardType: "email-address" as const },
    { label: "Mobile Number", value: phone, setter: setPhone, icon: "call-outline", keyboardType: "phone-pad" as const },
    { label: "Date of Birth", value: dob, setter: setDob, icon: "calendar-outline", keyboardType: "default" as const },
  ];

  return (
    <ScreenHeader title="Edit Profile" backHref="/(tabs)/profile">
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>SS</Text>
        </View>
        <TouchableOpacity style={s.changePhotoBtn} onPress={() => alert("Choose photo")}>
          <Ionicons name="camera-outline" size={14} color={colors.gold} />
          <Text style={s.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Fields */}
      {fields.map((f, i) => (
        <View key={i} style={s.fieldContainer}>
          <Text style={s.fieldLabel}>{f.label}</Text>
          <View style={s.inputRow}>
            <Ionicons name={f.icon as any} size={16} color={colors.textSecondary} />
            <TextInput style={s.input} value={f.value} onChangeText={f.setter} keyboardType={f.keyboardType} placeholderTextColor={colors.textSecondary} />
          </View>
        </View>
      ))}

      {/* Preferences */}
      <Text style={s.sectionTitle}>Food Preferences</Text>
      <View style={s.prefRow}>
        {["Vegetarian", "Non-Veg", "Jain", "Vegan"].map((p, i) => (
          <TouchableOpacity key={i} style={[s.prefChip, i === 1 && s.prefChipActive]}>
            <Text style={[s.prefChipText, i === 1 && s.prefChipActiveText]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={s.saveBtn} onPress={() => alert("Profile Updated!")}>
        <Text style={s.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#000" },
  changePhotoBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  changePhotoText: { fontSize: 12, color: colors.gold, fontWeight: "600" },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.gold, marginBottom: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  prefRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  prefChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  prefChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  prefChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  prefChipActiveText: { color: "#000" },
  saveBtn: { backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 25, alignItems: "center" },
  saveBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
