import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/src/components/ScreenHeader";
import { colors } from "@/src/theme";
import { useApp } from "@/src/context/AppContext";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const { user, updateUser } = useApp();
  const [name, setName] = useState(user?.name || "Sudip Sen");
  const [email, setEmail] = useState(user?.email || "sudip@dineout.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [dob, setDob] = useState("15 March 1995");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const handlePickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photos is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      await updateUser({ name, email, phone, avatar });
      alert("Profile Updated successfully!");
    } catch (e) {
      alert("Failed to update profile.");
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const fields = [
    { label: "Full Name", value: name, setter: setName, icon: "person-outline", keyboardType: "default" as const },
    { label: "Email Address", value: email, setter: setEmail, icon: "mail-outline", keyboardType: "email-address" as const },
    { label: "Mobile Number", value: phone, setter: setPhone, icon: "call-outline", keyboardType: "phone-pad" as const },
    { label: "Date of Birth", value: dob, setter: setDob, icon: "calendar-outline", keyboardType: "default" as const },
  ];

  return (
    <ScreenHeader title="Edit Profile" backHref="/profile/settings">
      {/* Avatar Section */}
      <View style={s.avatarSection}>
        <TouchableOpacity style={s.avatarContainer} onPress={handlePickImage} activeOpacity={0.9}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={s.avatarImage} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{getInitials(name)}</Text>
            </View>
          )}
          <View style={s.cameraBadge}>
            <Ionicons name="camera" size={12} color="#000" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.changePhotoBtn} onPress={handlePickImage}>
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
            <TextInput 
              style={s.input} 
              value={f.value} 
              onChangeText={f.setter} 
              keyboardType={f.keyboardType} 
              placeholderTextColor={colors.textSecondary} 
            />
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

      <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
        <Text style={s.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </ScreenHeader>
  );
}

const s = StyleSheet.create({
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#000" },
  cameraBadge: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg },
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
