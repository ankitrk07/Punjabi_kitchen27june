import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type FilterItem = { id: string; name: string; icon: string };

type Props = {
  filters: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const getPageTitle = (id: string) => {
  switch (id) {
    case "page_1": return "Pg 1";
    case "page_2": return "Pg 2";
    case "page_3": return "Pg 3";
    case "page_4": return "Pg 4";
    case "page_5": return "Pg 5";
    default: return "";
  }
};

const getPageSub = (id: string) => {
  switch (id) {
    case "page_1": return "Breads";
    case "page_2": return "Curries";
    case "page_3": return "Starters";
    case "page_4": return "Beverages";
    case "page_5": return "Desserts";
    default: return "";
  }
};

const CategoryFilterBar = React.memo(function CategoryFilterBar({ filters, selectedId, onSelect }: Props) {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.row}>
        {filters.map((filter) => {
          const selected = selectedId === filter.id;
          const isAll = filter.id === "all";
          
          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => onSelect(filter.id)}
              style={[
                styles.chip,
                selected && styles.chipSelected
              ]}
              activeOpacity={0.85}
              testID={`filter-${filter.id}`}
            >
              {isAll ? (
                <View style={styles.allContent}>
                  <Ionicons name="grid" size={14} color={selected ? "#000000" : colors.gold} />
                  <Text style={[styles.allText, selected && styles.textSelected]}>All</Text>
                </View>
              ) : (
                <View style={styles.pageContent}>
                  <View style={styles.pageTopRow}>
                    <Ionicons name="book" size={10} color={selected ? "#000000" : colors.gold} />
                    <Text style={[styles.pageTitleText, selected && styles.textSelected]}>
                      {getPageTitle(filter.id)}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.pageSubText, 
                      selected ? styles.subTextSelected : styles.subTextUnselected
                    ]}
                    numberOfLines={1}
                  >
                    {getPageSub(filter.id)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

export default CategoryFilterBar;

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "#0D0B08",
    borderWidth: 1.5,
    borderColor: "rgba(201, 168, 76, 0.22)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  row: { 
    flexDirection: "row",
    gap: 4,
    width: "100%",
  },
  chip: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070605",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 2,
  },
  chipSelected: { 
    backgroundColor: colors.gold, 
    borderColor: colors.gold, 
  },
  allContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  allText: { 
    color: "#FFFFFF", 
    fontSize: 11, 
    fontWeight: "800",
  },
  pageContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  pageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 1,
  },
  pageTitleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  pageSubText: {
    fontSize: 8.5,
    fontWeight: "600",
    textAlign: "center",
  },
  textSelected: { 
    color: "#0A0A0A", 
  },
  subTextSelected: {
    color: "rgba(0, 0, 0, 0.8)",
  },
  subTextUnselected: {
    color: "rgba(255, 255, 255, 0.45)",
  },
});
