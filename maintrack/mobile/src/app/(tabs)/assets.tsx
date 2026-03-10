import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { colors, spacing, fontSize } from "@/lib/theme";

export default function AssetsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background.dark : colors.background.light },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isDark ? colors.text.dark : colors.text.light },
        ]}
      >
        Assets Screen
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: isDark ? colors.muted.dark : colors.muted.light },
        ]}
      >
        TODO: Implement asset list with API integration
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  text: {
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: fontSize.base,
    marginTop: spacing.sm,
  },
});
