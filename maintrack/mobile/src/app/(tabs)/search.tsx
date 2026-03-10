import { View, Text, StyleSheet, useColorScheme, TextInput } from "react-native";
import { useState } from "react";
import { colors, spacing, fontSize, borderRadius } from "@/lib/theme";

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [query, setQuery] = useState("");

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background.dark : colors.background.light },
      ]}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? colors.card.dark : colors.card.light,
              color: isDark ? colors.text.dark : colors.text.light,
              borderColor: isDark ? colors.border.dark : colors.border.light,
            },
          ]}
          placeholder="Search tasks, assets, notes..."
          placeholderTextColor={isDark ? colors.muted.dark : colors.muted.light}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <View style={styles.emptyState}>
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? colors.muted.dark : colors.muted.light },
          ]}
        >
          Search across all your assets and tasks
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    borderWidth: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSize.base,
  },
});
