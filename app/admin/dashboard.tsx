import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator, Dimensions, Image, RefreshControl, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useApp } from "@/src/context/AppContext";
import { colors } from "@/src/theme";
import { apiClient, resolveImageUrl } from "@/src/utils/apiClient";
import * as ImagePicker from "expo-image-picker";
import { Category } from "@/src/data/menu";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const router = useRouter();
  const {
    signOut,
    dishes,
    categories,
    addDish,
    updateDish,
    deleteDish,
    addCategory,
    updateCategory,
    deleteCategory,
    orders,
    updateOrderStatus,
    processRefund,
    reservations,
    cateringRequests,
    updateCateringStatus,
    supportTickets,
    updateTicketStatus,
    broadcastNotification,
    refreshAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "orders" | "bookings" | "support" | "broadcast">("overview");
  
  // Overview state
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } catch (e) {
      console.log("Failed to refresh admin data:", e);
    } finally {
      setRefreshing(false);
    }
  };

  // Menu editor states
  const [editingDish, setEditingDish] = useState<any>(null);
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [dishImage, setDishImage] = useState("");
  const [dishVeg, setDishVeg] = useState(true);
  const [dishCategory, setDishCategory] = useState("main-course");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDishFormMinimized, setIsDishFormMinimized] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Heading/Category editor states
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryParentId, setCategoryParentId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isCategoryFormMinimized, setIsCategoryFormMinimized] = useState(false);
  const [expandedCats, setExpandedCats] = useState<{[key: string]: boolean}>({
    page_1: true,
    page_2: true,
    page_3: true,
    page_4: true,
    page_5: true,
  });

  const [activeActionNode, setActiveActionNode] = useState<{ type: "category" | "dish"; id: string; name: string; data?: any } | null>(null);

  // Ticket reply states
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReply, setTicketReply] = useState("");

  // Broadcast state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifType, setNotifType] = useState<"Announcement" | "Offer">("Announcement");

  const loadAdminMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const data = await apiClient.getAdminMetrics();
      setMetrics(data);
      const userList = await apiClient.getAdminUsers();
      setUsers(userList);
    } catch (e) {
      console.log("Failed to fetch admin metrics:", e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
    refreshAllData();
  }, [activeTab]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/login");
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to upload images!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (!asset.base64) {
          alert("Could not read image base64 data.");
          return;
        }

        setUploadingImage(true);
        const originalName = asset.uri.split("/").pop() || "upload.jpg";
        const response = await apiClient.uploadImage(originalName, asset.base64);
        
        if (response && response.imageUrl) {
          setDishImage(response.imageUrl);
        } else {
          alert("Failed to get image URL from server.");
        }
      }
    } catch (error) {
      console.error("Image pick & upload error:", error);
      alert("Error picking/uploading image. Make sure backend is running.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Heading name is required.");
      return;
    }

    const payload = {
      name: categoryName.trim(),
      parentId: categoryParentId,
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
      alert("Heading updated successfully!");
    } else {
      const generatedId = `cat_${categoryName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;
      await addCategory({
        id: generatedId,
        ...payload,
        icon: "restaurant",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
      });
      if (categoryParentId) {
        setExpandedCats((prev) => ({ ...prev, [categoryParentId]: true }));
      }
      alert("Heading created successfully!");
    }

    setEditingCategory(null);
    setCategoryName("");
    setCategoryParentId(null);
    setIsAddingCategory(false);
    setIsCategoryFormMinimized(false);
  };

  const handleDeleteCategorySelect = async (catId: string) => {
    if (confirm("Are you sure you want to delete this heading? This will delete all subcategories and dishes under it!")) {
      await deleteCategory(catId);
      alert("Heading deleted!");
    }
  };

  // Menu CRUD actions
  const handleSaveDish = async () => {
    if (!dishName.trim() || !dishPrice.trim()) {
      alert("Name and Price are required.");
      return;
    }

    const dishPayload = {
      name: dishName.trim(),
      price: parseFloat(dishPrice) || 0,
      description: dishDesc.trim(),
      image: dishImage.trim() || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
      veg: dishVeg,
      category: dishCategory,
    };

    if (editingDish) {
      await updateDish(editingDish.id, dishPayload);
      alert("Dish updated successfully!");
    } else {
      const newId = `d-${dishCategory.slice(0, 3)}-${Date.now()}`;
      await addDish({ id: newId, ...dishPayload });
      alert("Dish created successfully!");
    }

    // Reset form
    setEditingDish(null);
    setDishName("");
    setDishPrice("");
    setDishDesc("");
    setDishImage("");
    setDishVeg(true);
    setIsAddingNew(false);
    setIsDishFormMinimized(false);
  };

  const handleEditDishSelect = (dish: any) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishPrice(dish.price.toString());
    setDishDesc(dish.description || "");
    setDishImage(dish.image || "");
    setDishVeg(dish.veg);
    setDishCategory(dish.category);
    setIsAddingNew(true);
    setIsDishFormMinimized(false);
  };

  const handleDeleteDishSelect = async (dishId: string) => {
    if (confirm("Are you sure you want to delete this dish?")) {
      await deleteDish(dishId);
      alert("Dish deleted!");
    }
  };

  // Support ticket actions
  const handleReplyTicket = async () => {
    if (!ticketReply.trim() || !selectedTicket) return;
    await updateTicketStatus(selectedTicket.id, {
      status: "Resolved",
      lastUpdate: ticketReply.trim(),
    });
    alert("Reply sent! Ticket marked as Resolved.");
    setTicketReply("");
    setSelectedTicket(null);
  };

  // Broadcast actions
  const handleBroadcast = async () => {
    if (!notifTitle.trim() || !notifMsg.trim()) {
      alert("Title and message are required.");
      return;
    }
    await broadcastNotification({
      title: notifTitle.trim(),
      message: notifMsg.trim(),
      type: notifType,
    });
    alert("Notification broadcasted successfully!");
    setNotifTitle("");
    setNotifMsg("");
  };

  const renderCategoryNode = (cat: Category, level: number = 0): React.ReactNode => {
    const isExpanded = !!expandedCats[cat.id];
    const subcats = categories.filter((c) => c.parentId === cat.id);
    const catDishes = dishes.filter((d) => d.category === cat.id);
    const hasChildren = subcats.length > 0 || catDishes.length > 0;

    return (
      <View key={cat.id} style={{ marginLeft: level > 0 ? 10 : 0, marginBottom: 6 }}>
        <View style={s.treeNode}>
          <TouchableOpacity
            style={s.treeNodeClickable}
            onPress={() => {
              if (hasChildren) {
                setExpandedCats((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }));
              }
            }}
          >
            {hasChildren ? (
              <Ionicons
                name={isExpanded ? "chevron-down" : "chevron-forward"}
                size={16}
                color={colors.gold}
                style={{ marginRight: 6 }}
              />
            ) : (
              <View style={{ width: 22 }} />
            )}
            <Ionicons
              name={level === 0 ? "book-outline" : level === 1 ? "folder-open-outline" : "list-outline"}
              size={16}
              color={colors.goldBright}
              style={{ marginRight: 8 }}
            />
            <Text style={s.treeNodeName}>{cat.name}</Text>
          </TouchableOpacity>

          <View style={s.treeNodeActions}>
            <TouchableOpacity
              style={s.nodeActionBtn}
              onPress={() => setActiveActionNode({ type: "category", id: cat.id, name: cat.name, data: cat })}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={colors.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {isExpanded && (
          <View style={s.treeNodeChildren}>
            {subcats.map((subcat) => renderCategoryNode(subcat, level + 1))}
            {catDishes.map((dish) => (
              <View key={dish.id} style={s.dishNode}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <View style={[s.vegIndicator, { borderColor: dish.veg ? colors.success : colors.error, width: 12, height: 12, borderRadius: 2 }]}>
                    <View style={[s.vegIndicatorDot, { backgroundColor: dish.veg ? colors.success : colors.error, width: 6, height: 6, borderRadius: 3 }]} />
                  </View>
                  <Text style={s.dishNodeName}>{dish.name}</Text>
                  <Text style={s.dishNodePrice}>₹{dish.price}</Text>
                </View>
                <View style={s.actionGrid}>
                  <TouchableOpacity
                    style={s.nodeActionBtn}
                    onPress={() => setActiveActionNode({ type: "dish", id: dish.id, name: dish.name, data: dish })}
                  >
                    <Ionicons name="ellipsis-vertical" size={14} color={colors.gold} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <LinearGradient colors={["#000", "#080808", "#120800"]} style={StyleSheet.absoluteFill} />

      {/* Header bar */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Manager Panel</Text>
          <Text style={s.headerSubtitle}>Punjabi Kitchen Operations</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={s.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontally scrollable Tabs navigation */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
          {[
            { id: "overview", label: "Overview", icon: "analytics-outline" },
            { id: "menu", label: "Menu CRUD", icon: "restaurant-outline" },
            { id: "orders", label: "Orders", icon: "cart-outline" },
            { id: "bookings", label: "Bookings", icon: "calendar-outline" },
            { id: "support", label: "Queries", icon: "help-buoy-outline" },
            { id: "broadcast", label: "Broadcast", icon: "megaphone-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[s.tabBtn, activeTab === tab.id && s.tabBtnActive]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Ionicons name={tab.icon as any} size={15} color={activeTab === tab.id ? "#000" : colors.gold} />
              <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
            progressBackgroundColor={colors.surface}
          />
        }
      >

        {/* 1. OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <View>
            <Text style={s.sectionHeader}>Business Performance</Text>
            {loadingMetrics ? (
              <ActivityIndicator color={colors.gold} size="large" />
            ) : metrics ? (
              <View style={s.metricsGrid}>
                {[
                  { label: "Total Revenue", val: `₹${metrics.totalSales}`, icon: "cash-outline", color: colors.success },
                  { label: "Active Bookings", val: metrics.totalReservations, icon: "people-outline", color: colors.gold },
                  { label: "Total Orders", val: metrics.totalOrders, icon: "receipt-outline", color: "#a78bfa" },
                  { label: "Pending Catering", val: metrics.totalCatering, icon: "restaurant-outline", color: colors.goldBright },
                  { label: "Open Tickets", val: metrics.openTickets, icon: "alert-circle-outline", color: colors.error },
                  { label: "Total Customers", val: metrics.totalUsers, icon: "person-outline", color: "#60a5fa" },
                ].map((m, i) => (
                  <View key={i} style={s.metricCard}>
                    <Ionicons name={m.icon as any} size={22} color={m.color} />
                    <Text style={s.metricVal}>{m.val}</Text>
                    <Text style={s.metricLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={[s.sectionHeader, { marginTop: 24 }]}>Customer Register ({users.length})</Text>
            {users.map((usr) => (
              <View key={usr.email} style={s.userCard}>
                <View style={s.userHeader}>
                  <Text style={s.userName}>{usr.name}</Text>
                  <Text style={s.userGender}>{usr.gender === "male" ? "♂" : "♀"}</Text>
                </View>
                <Text style={s.userEmail}>{usr.email}</Text>
                {usr.phone && <Text style={s.userPhone}>Phone: {usr.phone}</Text>}
                <View style={s.userStatRow}>
                  <Text style={s.userStatText}>{usr.orders?.length || 0} Orders</Text>
                  <Text style={s.userStatText}>{usr.reservations?.length || 0} Bookings</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 2. MENU EDITOR CRUD */}
        {activeTab === "menu" && (
          <View>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionHeader}>Menu Explorer & Editor</Text>
              <TouchableOpacity
                style={s.addNewBtn}
                onPress={() => {
                  setCategoryParentId(null);
                  setEditingCategory(null);
                  setCategoryName("");
                  setIsAddingCategory(true);
                  setIsCategoryFormMinimized(false);
                }}
              >
                <Ionicons name="add" size={16} color="#000" />
                <Text style={s.addNewText}>Create Page</Text>
              </TouchableOpacity>
            </View>

            {isAddingCategory && isCategoryFormMinimized && (
              <View style={s.minimizedBar}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <Ionicons name="folder-open-outline" size={16} color={colors.gold} />
                  <Text style={s.minimizedText} numberOfLines={1}>
                    {editingCategory ? `Editing Heading: ${categoryName || 'Unnamed'}` : `Creating Heading: ${categoryName || 'Unnamed'}`}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity style={s.minimizedBtn} onPress={() => setIsCategoryFormMinimized(false)}>
                    <Text style={s.minimizedBtnText}>Expand</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.minimizedBtn, { borderColor: colors.error }]} onPress={() => {
                    setIsAddingCategory(false);
                    setIsCategoryFormMinimized(false);
                  }}>
                    <Text style={[s.minimizedBtnText, { color: colors.error }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isAddingCategory && !isCategoryFormMinimized && (
              <View style={s.formCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={[s.formTitle, { marginBottom: 0 }]}>{editingCategory ? "Rename / Edit Menu Heading" : "Add New Menu Heading"}</Text>
                  <TouchableOpacity onPress={() => setIsCategoryFormMinimized(true)} style={{ padding: 4 }}>
                    <Ionicons name="remove-circle-outline" size={20} color={colors.gold} />
                  </TouchableOpacity>
                </View>
                {categoryParentId && (
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 8 }}>
                    Adding subheading under: "{categories.find(c => c.id === categoryParentId)?.name || categoryParentId}"
                  </Text>
                )}
                <TextInput
                  style={s.input}
                  placeholder="Heading Name (e.g. DAL or Veg)"
                  placeholderTextColor={colors.textSecondary}
                  value={categoryName}
                  onChangeText={setCategoryName}
                />
                <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                  <TouchableOpacity style={[s.saveBtn, { flex: 1, backgroundColor: colors.gold, marginTop: 0 }]} onPress={handleSaveCategory}>
                    <Text style={s.saveBtnText}>Save Heading</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.saveBtn, { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, marginTop: 0 }]}
                    onPress={() => setIsAddingCategory(false)}
                  >
                    <Text style={[s.saveBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Dish CRUD Form Card */}
            {isAddingNew && isDishFormMinimized && (
              <View style={s.minimizedBar}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <Ionicons name="create-outline" size={16} color={colors.gold} />
                  <Text style={s.minimizedText} numberOfLines={1}>
                    {editingDish ? `Editing: ${dishName || 'Unnamed'}` : `Creating: ${dishName || 'Unnamed'}`}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity style={s.minimizedBtn} onPress={() => setIsDishFormMinimized(false)}>
                    <Text style={s.minimizedBtnText}>Expand</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.minimizedBtn, { borderColor: colors.error }]} onPress={() => {
                    setIsAddingNew(false);
                    setIsDishFormMinimized(false);
                  }}>
                    <Text style={[s.minimizedBtnText, { color: colors.error }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isAddingNew && !isDishFormMinimized && (
              <View style={s.formCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={[s.formTitle, { marginBottom: 0 }]}>{editingDish ? "Modify Dish Attributes" : "Add New Dish to Menu"}</Text>
                  <TouchableOpacity onPress={() => setIsDishFormMinimized(true)} style={{ padding: 4 }}>
                    <Ionicons name="remove-circle-outline" size={20} color={colors.gold} />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 8 }}>
                  Category Slot: "{categories.find(c => c.id === dishCategory)?.name || dishCategory}"
                </Text>
                <TextInput style={s.input} placeholder="Dish Name (e.g. Kadai Chicken)" placeholderTextColor={colors.textSecondary} value={dishName} onChangeText={setDishName} />
                <TextInput style={s.input} placeholder="Price (INR)" placeholderTextColor={colors.textSecondary} keyboardType="numeric" value={dishPrice} onChangeText={setDishPrice} />
                <TextInput style={s.input} placeholder="Description details..." placeholderTextColor={colors.textSecondary} multiline numberOfLines={3} value={dishDesc} onChangeText={setDishDesc} />
                
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <TextInput
                    style={[s.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Image URL link"
                    placeholderTextColor={colors.textSecondary}
                    value={dishImage}
                    onChangeText={setDishImage}
                  />
                  <TouchableOpacity
                    style={[s.addNewBtn, { backgroundColor: colors.gold, paddingVertical: 14, height: 48, justifyContent: "center" }]}
                    onPress={handlePickImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <>
                        <Ionicons name="image" size={16} color="#000" />
                        <Text style={s.addNewText}>Upload</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {!!dishImage && (
                  <View style={{ position: "relative", marginBottom: 12, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
                    <Image source={{ uri: resolveImageUrl(dishImage) }} style={{ width: "100%", height: 160 }} />
                    <TouchableOpacity
                      style={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 15, width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
                      onPress={() => setDishImage("")}
                    >
                      <Ionicons name="trash" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={s.switchRow}>
                  <Text style={s.switchLabel}>Pure Vegetarian (Veg)</Text>
                  <Switch trackColor={{ false: "#333", true: colors.success }} thumbColor={dishVeg ? colors.success : "#999"} value={dishVeg} onValueChange={setDishVeg} />
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={[s.saveBtn, { flex: 1, backgroundColor: colors.gold, marginTop: 0 }]} onPress={handleSaveDish}>
                    <Text style={s.saveBtnText}>{editingDish ? "Save Changes" : "Submit Dish"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.saveBtn, { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, marginTop: 0 }]}
                    onPress={() => setIsAddingNew(false)}
                  >
                    <Text style={[s.saveBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Tree Nodes List */}
            <View style={{ marginTop: 10 }}>
              {categories
                .filter((c) => c.parentId === null) // Start with root level (Pages 1 to 5)
                .map((page) => renderCategoryNode(page, 0))}
            </View>
          </View>
        )}

        {/* 3. ORDERS MANAGER */}
        {activeTab === "orders" && (
          <View>
            <Text style={s.sectionHeader}>Customer Orders Feed ({orders.length})</Text>
            {orders.length === 0 ? (
              <Text style={s.emptyMsg}>No active orders found.</Text>
            ) : (
              orders.map((o) => (
                <View key={o.id} style={s.orderCard}>
                  <View style={s.orderHeader}>
                    <Text style={s.orderId}>{o.id}</Text>
                    <Text style={s.orderTime}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={s.orderTotal}>Total Estimate: ₹{o.total} ({o.mode})</Text>
                  <Text style={s.orderUser}>Customer: {o.userEmail || "Guest"}</Text>

                  {/* Items list */}
                  <View style={s.itemBoxes}>
                    {o.items?.map((it: any, idx: number) => (
                      <Text key={idx} style={s.itemBoxText}>• {it.name} x {it.qty} (₹{it.price})</Text>
                    ))}
                  </View>

                  {/* Order Status updates */}
                  <Text style={s.statusSelectLabel}>Update Delivery Status:</Text>
                  <View style={s.statusButtons}>
                    {["Placed", "Preparing", "Ready", "On the Way", "Delivered", "Cancelled"].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[s.statusBtn, o.status === st && { backgroundColor: st === "Cancelled" ? colors.error : colors.gold }]}
                        onPress={() => updateOrderStatus(o.id, st as any)}
                      >
                        <Text style={[s.statusBtnText, o.status === st && { color: "#000" }]}>{st}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Refund options if cancelled */}
                  {o.status === "Cancelled" && (
                    <View style={s.refundRow}>
                      <Text style={s.refundStatusText}>Refund: {o.refund?.status || "None"}</Text>
                      {o.refund?.status === "Pending" && (
                        <TouchableOpacity style={s.refundBtn} onPress={() => processRefund(o.id)}>
                          <Text style={s.refundBtnText}>Approve & Process Refund (₹{o.refund.amount})</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* 4. RESERVATIONS CALENDAR & CATERING */}
        {activeTab === "bookings" && (
          <View>
            <Text style={s.sectionHeader}>Active Reservations ({reservations.length})</Text>
            {reservations.length === 0 ? (
              <Text style={s.emptyMsg}>No seat bookings found.</Text>
            ) : (
              reservations.map((res) => (
                <View key={res.id} style={s.resCard}>
                  <View style={s.resHeader}>
                    <Text style={s.resName}>{res.customerName}</Text>
                    <View style={s.resTableBadge}>
                      <Text style={s.resTableText}>Table #{res.tableNumber}</Text>
                    </View>
                  </View>
                  <Text style={s.resDate}>Date: {res.reservationDate} • Slot: {res.reservationSlot}</Text>
                  <Text style={s.resGuests}>Guests: {res.guests} ({res.customerPhone})</Text>
                  <Text style={[s.resStatus, { color: res.status === "Cancelled" ? colors.error : colors.success }]}>
                    Status: {res.status}
                  </Text>
                </View>
              ))
            )}

            <Text style={[s.sectionHeader, { marginTop: 24 }]}>Catering Requests ({cateringRequests.length})</Text>
            {cateringRequests.length === 0 ? (
              <Text style={s.emptyMsg}>No catering inquiries submitted.</Text>
            ) : (
              cateringRequests.map((c) => (
                <View key={c.id} style={s.cateringCard}>
                  <View style={s.cateringHeader}>
                    <Text style={s.cateringOccasion}>{c.eventType}</Text>
                    <View style={[s.cateringStatusPill, { backgroundColor: c.status === "Approved" ? "rgba(16,185,129,0.12)" : c.status === "Denied" ? "rgba(239,68,68,0.12)" : "rgba(212,175,55,0.12)" }]}>
                      <Text style={[s.cateringStatusText, { color: c.status === "Approved" ? colors.success : c.status === "Denied" ? colors.error : colors.gold }]}>{c.status}</Text>
                    </View>
                  </View>
                  <Text style={s.cateringDate}>Guests: {c.guests} | Date: {c.date}</Text>
                  <Text style={s.cateringAddress}>Venue: {c.address}</Text>
                  <Text style={s.cateringPhone}>Phone: {c.phone} | Pkg: {c.package}</Text>
                  {c.details && <Text style={s.cateringDetails}>"{c.details}"</Text>}

                  {c.status === "Pending" && (
                    <View style={s.cateringActions}>
                      <TouchableOpacity style={s.cateringApprove} onPress={() => updateCateringStatus(c.id, "Approved")}>
                        <Ionicons name="checkmark-outline" size={14} color="#000" />
                        <Text style={s.cateringApproveText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.cateringDeny} onPress={() => updateCateringStatus(c.id, "Denied")}>
                        <Ionicons name="close-outline" size={14} color="#FFF" />
                        <Text style={s.cateringDenyText}>Deny</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* 5. CUSTOMER SUPPORT TICKETS */}
        {activeTab === "support" && (
          <View>
            <Text style={s.sectionHeader}>Customer Helpdesk Tickets ({supportTickets.length})</Text>
            {supportTickets.length === 0 ? (
              <Text style={s.emptyMsg}>No customer queries raised.</Text>
            ) : (
              supportTickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={[s.ticketCard, selectedTicket?.id === ticket.id && s.ticketCardActive]}
                  onPress={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                >
                  <View style={s.ticketTop}>
                    <Text style={s.ticketSubject}>{ticket.subject}</Text>
                    <View style={[s.ticketPriorityPill, { backgroundColor: ticket.priority === "High" ? "rgba(239,68,68,0.12)" : "rgba(212,175,55,0.12)" }]}>
                      <Text style={[s.ticketPriorityText, { color: ticket.priority === "High" ? colors.error : colors.gold }]}>{ticket.priority}</Text>
                    </View>
                  </View>
                  <Text style={s.ticketDesc}>{ticket.description}</Text>
                  <Text style={s.ticketUser}>Sender: {ticket.userEmail}</Text>
                  <Text style={s.ticketStatusText}>Status: {ticket.status} • Last Update: "{ticket.lastUpdate}"</Text>

                  {selectedTicket?.id === ticket.id && ticket.status !== "Resolved" && (
                    <View style={s.replyBox}>
                      <TextInput
                        style={s.replyInput}
                        placeholder="Write resolution response..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        value={ticketReply}
                        onChangeText={setTicketReply}
                      />
                      <TouchableOpacity style={s.replySubmitBtn} onPress={handleReplyTicket}>
                        <Text style={s.replySubmitBtnText}>Reply & Resolve Ticket</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* 6. BROADCAST NOTIFICATIONS */}
        {activeTab === "broadcast" && (
          <View>
            <Text style={s.sectionHeader}>Push Announcements</Text>
            <View style={s.formCard}>
              <Text style={s.formTitle}>Send Notification Broadcast</Text>
              
              <TextInput
                style={s.input}
                placeholder="Notification Title (e.g. 🎉 Midweek Feast Promo!)"
                placeholderTextColor={colors.textSecondary}
                value={notifTitle}
                onChangeText={setNotifTitle}
              />
              <TextInput
                style={[s.input, { height: 80, textAlignVertical: "top" }]}
                placeholder="Notification Message contents..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={notifMsg}
                onChangeText={setNotifMsg}
              />

              <Text style={s.dropdownLabel}>Select Notification Channel Type</Text>
              <View style={s.typeGrid}>
                {(["Announcement", "Offer"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[s.typeGridBtn, notifType === type && s.typeGridBtnActive]}
                    onPress={() => setNotifType(type)}
                  >
                    <Text style={[s.typeGridText, notifType === type && { color: "#000" }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={s.broadcastSubmitBtn} onPress={handleBroadcast}>
                <Ionicons name="send" size={16} color="#000" style={{ marginRight: 6 }} />
                <Text style={s.broadcastSubmitBtnText}>Broadcast Live Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Action Sheet Modal */}
      {activeActionNode && (
        <Modal
          transparent
          visible={!!activeActionNode}
          animationType="slide"
          onRequestClose={() => setActiveActionNode(null)}
        >
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setActiveActionNode(null)}>
            <View style={s.actionSheetCard}>
              <Text style={s.actionSheetTitle} numberOfLines={1}>
                {activeActionNode.name}
              </Text>
              <Text style={s.actionSheetSub}>Choose an action to perform</Text>

              {activeActionNode.type === "category" ? (
                <>
                  <TouchableOpacity
                    style={s.actionSheetBtn}
                    onPress={() => {
                      const cat = activeActionNode.data;
                      setCategoryParentId(cat.id);
                      setEditingCategory(null);
                      setCategoryName("");
                      setIsAddingCategory(true);
                      setIsCategoryFormMinimized(false);
                      setActiveActionNode(null);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={colors.gold} />
                    <Text style={s.actionSheetBtnText}>Add Sub-Heading</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.actionSheetBtn}
                    onPress={() => {
                      const cat = activeActionNode.data;
                      setEditingDish(null);
                      setDishName("");
                      setDishPrice("");
                      setDishDesc("");
                      setDishImage("");
                      setDishVeg(true);
                      setDishCategory(cat.id);
                      setIsAddingNew(true);
                      setIsDishFormMinimized(false);
                      setActiveActionNode(null);
                    }}
                  >
                    <Ionicons name="fast-food-outline" size={18} color={colors.success} />
                    <Text style={s.actionSheetBtnText}>Add Dish</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.actionSheetBtn}
                    onPress={() => {
                      const cat = activeActionNode.data;
                      setEditingCategory(cat);
                      setCategoryName(cat.name);
                      setCategoryParentId(cat.parentId || null);
                      setIsAddingCategory(true);
                      setIsCategoryFormMinimized(false);
                      setActiveActionNode(null);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#60a5fa" />
                    <Text style={s.actionSheetBtnText}>Rename Heading</Text>
                  </TouchableOpacity>

                  {activeActionNode.data.parentId !== null && (
                    <TouchableOpacity
                      style={[s.actionSheetBtn, s.actionSheetBtnDelete]}
                      onPress={() => {
                        const catId = activeActionNode.id;
                        setActiveActionNode(null);
                        handleDeleteCategorySelect(catId);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                      <Text style={[s.actionSheetBtnText, { color: colors.error }]}>Delete Heading</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={s.actionSheetBtn}
                    onPress={() => {
                      const dish = activeActionNode.data;
                      handleEditDishSelect(dish);
                      setActiveActionNode(null);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={18} color={colors.gold} />
                    <Text style={s.actionSheetBtnText}>Edit Dish Attributes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.actionSheetBtn, s.actionSheetBtnDelete]}
                    onPress={() => {
                      const dishId = activeActionNode.id;
                      setActiveActionNode(null);
                      handleDeleteDishSelect(dishId);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[s.actionSheetBtnText, { color: colors.error }]}>Delete Dish</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={s.actionSheetCancel} onPress={() => setActiveActionNode(null)}>
                <Text style={s.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  minimizedBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderStyle: "dashed", borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: 12, marginBottom: 16 },
  minimizedText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
  minimizedBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: colors.gold },
  minimizedBtnText: { fontSize: 10, fontWeight: "800", color: colors.gold },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.gold },
  headerSubtitle: { fontSize: 10, color: colors.textSecondary, marginTop: 2, letterSpacing: 0.5 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  logoutText: { fontSize: 11, color: colors.error, fontWeight: "700" },
  
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  tabBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  tabBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: "#000" },
  
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: { fontSize: 12, fontWeight: "800", color: colors.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  emptyMsg: { color: colors.textSecondary, fontSize: 12, textAlign: "center", marginVertical: 20 },
  
  // Overview Tab
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: (width - 42) / 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, gap: 6 },
  metricVal: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  metricLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: "600" },
  userCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 10 },
  userHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  userGender: { fontSize: 12, color: colors.gold },
  userEmail: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  userPhone: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  userStatRow: { flexDirection: "row", gap: 10, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.03)" },
  userStatText: { fontSize: 10, color: colors.goldBright, fontWeight: "600" },
  
  // Menu Editor Tab
  addNewBtn: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addNewText: { fontSize: 10, fontWeight: "800", color: "#000" },
  formCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(212,175,55,0.2)", borderRadius: 16, padding: 14, marginBottom: 16 },
  formTitle: { fontSize: 13, fontWeight: "800", color: colors.textPrimary, marginBottom: 12 },
  input: { backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: 10, borderRadius: 10, fontSize: 12, marginBottom: 10 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  switchLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  dropdownLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: "800", textTransform: "uppercase", marginVertical: 8 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  catGridBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  catGridBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  catGridText: { fontSize: 10, color: colors.textSecondary, fontWeight: "700" },
  saveBtn: { backgroundColor: colors.gold, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 6 },
  saveBtnText: { color: "#000", fontWeight: "800", fontSize: 12 },
  dishRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12, paddingHorizontal: 6 },
  vegIndicator: { width: 14, height: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  vegIndicatorDot: { width: 6, height: 6, borderRadius: 3 },
  dishNameText: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  dishPriceText: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  actionGrid: { flexDirection: "row", gap: 8 },
  editAction: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.08)", alignItems: "center", justifyContent: "center" },
  deleteAction: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.08)", alignItems: "center", justifyContent: "center" },

  // Tree Explorer Styles
  treeNode: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 4 },
  treeNodeClickable: { flexDirection: "row", alignItems: "center", flex: 1 },
  treeNodeName: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  treeNodeActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  nodeActionBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", justifyContent: "center", borderWidth: 0.5, borderColor: colors.border },
  treeNodeChildren: { paddingLeft: 6, borderLeftWidth: 1, borderLeftColor: colors.border, marginLeft: 6, marginBottom: 8 },
  dishNode: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.01)", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 0.5, borderColor: colors.border, marginBottom: 3 },
  dishNodeName: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  dishNodePrice: { fontSize: 11, color: colors.goldBright, marginLeft: 6 },

  // Orders Tab
  orderCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 14 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontSize: 12, fontWeight: "800", color: colors.gold },
  orderTime: { fontSize: 10, color: colors.textSecondary },
  orderTotal: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, marginTop: 6 },
  orderUser: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  itemBoxes: { backgroundColor: "rgba(255,255,255,0.01)", padding: 10, borderRadius: 10, marginVertical: 10, gap: 4 },
  itemBoxText: { fontSize: 11, color: colors.textSecondary },
  statusSelectLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: "800", textTransform: "uppercase", marginBottom: 8 },
  statusButtons: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  statusBtn: { backgroundColor: colors.surface2, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  statusBtnText: { fontSize: 9, color: colors.textSecondary, fontWeight: "700" },
  refundRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  refundStatusText: { fontSize: 11, color: colors.goldBright, fontWeight: "700" },
  refundBtn: { backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  refundBtnText: { fontSize: 10, color: "#000", fontWeight: "800" },

  // Bookings Tab
  resCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10 },
  resHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resName: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  resTableBadge: { backgroundColor: "rgba(212,175,55,0.12)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  resTableText: { fontSize: 9, color: colors.gold, fontWeight: "800" },
  resDate: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  resGuests: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  resStatus: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  cateringCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 12 },
  cateringHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cateringOccasion: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  cateringStatusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  cateringStatusText: { fontSize: 9, fontWeight: "800" },
  cateringDate: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  cateringAddress: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  cateringPhone: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  cateringDetails: { fontSize: 11, color: colors.textSecondary, fontStyle: "italic", backgroundColor: "rgba(255,255,255,0.02)", padding: 8, borderRadius: 8, marginBottom: 10 },
  cateringActions: { flexDirection: "row", gap: 8 },
  cateringApprove: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cateringApproveText: { fontSize: 10, fontWeight: "800", color: "#000" },
  cateringDeny: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: colors.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cateringDenyText: { fontSize: 10, fontWeight: "800", color: "#FFF" },

  // Support Tab
  ticketCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 12 },
  ticketCardActive: { borderColor: colors.gold },
  ticketTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  ticketSubject: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, flex: 1, paddingRight: 10 },
  ticketPriorityPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ticketPriorityText: { fontSize: 8, fontWeight: "800" },
  ticketDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16, marginBottom: 6 },
  ticketUser: { fontSize: 10, color: colors.textSecondary, marginBottom: 4 },
  ticketStatusText: { fontSize: 10, color: colors.goldBright, fontWeight: "600" },
  replyBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  replyInput: { backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: 10, borderRadius: 10, fontSize: 12, height: 60, textAlignVertical: "top", marginBottom: 8 },
  replySubmitBtn: { backgroundColor: colors.gold, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  replySubmitBtnText: { color: "#000", fontWeight: "800", fontSize: 11 },

  // Broadcast Tab
  typeGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  typeGridBtn: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  typeGridBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  typeGridText: { fontSize: 11, color: colors.textSecondary, fontWeight: "700" },
  broadcastSubmitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.gold, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  broadcastSubmitBtnText: { color: "#000", fontWeight: "800", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  actionSheetCard: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: colors.border },
  actionSheetTitle: { fontSize: 15, fontWeight: "800", color: "#FFF", textAlign: "center" },
  actionSheetSub: { fontSize: 11, color: colors.textSecondary, textAlign: "center", marginTop: 4, marginBottom: 20 },
  actionSheetBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  actionSheetBtnText: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  actionSheetBtnDelete: { borderColor: "rgba(239,68,68,0.2)" },
  actionSheetCancel: { alignItems: "center", justifyContent: "center", paddingVertical: 12, marginTop: 12 },
  actionSheetCancelText: { fontSize: 13, fontWeight: "800", color: colors.textSecondary },
});
